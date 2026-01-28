import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import axios from 'axios';
import db from '../database/db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for classroom image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads/images');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = `session-${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB for classroom photos
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, JPG, and PNG images are allowed'));
        }
    }
});

// Create new attendance session and process image
router.post('/session', authenticateToken, authorizeRoles('teacher', 'admin'), upload.single('image'), async (req, res) => {
    const { class: className, section, subject, session_date, session_time } = req.body;

    if (!className || !subject || !session_date || !session_time || !req.file) {
        return res.status(400).json({ error: 'Class, subject, date, time, and image are required' });
    }

    const imagePath = `/uploads/images/${req.file.filename}`;
    const fullImagePath = path.join(__dirname, '../../uploads/images', req.file.filename);

    try {
        // Get all students in this class
        let studentsQuery = 'SELECT * FROM students WHERE class = ?';
        const params = [className];

        if (section) {
            studentsQuery += ' AND section = ?';
            params.push(section);
        }

        const students = db.prepare(studentsQuery).all(...params);

        if (students.length === 0) {
            return res.status(404).json({ error: 'No students found for this class' });
        }

        // Create attendance session
        const sessionStmt = db.prepare(`
      INSERT INTO attendance_sessions 
      (teacher_id, class, section, subject, session_date, session_time, image_path, total_students)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

        const sessionResult = sessionStmt.run(
            req.user.id,
            className,
            section || null,
            subject,
            session_date,
            session_time,
            imagePath,
            students.length
        );

        const sessionId = sessionResult.lastInsertRowid;

        // Send image to AI engine for face recognition
        console.log('🤖 Sending image to AI engine for processing...');

        try {
            const aiResponse = await axios.post(
                `${process.env.AI_ENGINE_URL}/recognize-faces`,
                {
                    image_path: fullImagePath,
                    students: students.map(s => ({
                        id: s.id,
                        roll_number: s.roll_number,
                        embedding_path: s.embedding_path
                    }))
                },
                { timeout: 60000 } // 60 second timeout for processing
            );

            if (!aiResponse.data.success) {
                throw new Error('AI processing failed');
            }

            const { recognized_students, unknown_faces, total_faces } = aiResponse.data;

            console.log(`✅ AI Processing complete: ${recognized_students.length} recognized, ${unknown_faces.length} unknown`);

            // Insert attendance records for recognized students
            const recordStmt = db.prepare(`
        INSERT INTO attendance_records (session_id, student_id, status, confidence)
        VALUES (?, ?, 'present', ?)
      `);

            const insertRecords = db.transaction((records) => {
                for (const record of records) {
                    recordStmt.run(sessionId, record.student_id, record.confidence);
                }
            });

            insertRecords(recognized_students);

            // Mark absent students
            const presentIds = recognized_students.map(r => r.student_id);
            const absentStudents = students.filter(s => !presentIds.includes(s.id));

            const absentStmt = db.prepare(`
        INSERT INTO attendance_records (session_id, student_id, status)
        VALUES (?, ?, 'absent')
      `);

            const insertAbsent = db.transaction((absentList) => {
                for (const student of absentList) {
                    absentStmt.run(sessionId, student.id);
                }
            });

            insertAbsent(absentStudents);

            // Save unknown faces
            if (unknown_faces.length > 0) {
                const unknownStmt = db.prepare(`
          INSERT INTO unknown_faces (session_id, face_image_path, embedding_path)
          VALUES (?, ?, ?)
        `);

                const insertUnknown = db.transaction((unknownList) => {
                    for (const face of unknownList) {
                        unknownStmt.run(sessionId, face.face_image_path, face.embedding_path);
                    }
                });

                insertUnknown(unknown_faces);
            }

            // Update session statistics
            db.prepare(`
        UPDATE attendance_sessions
        SET present_count = ?, unknown_count = ?, status = 'pending'
        WHERE id = ?
      `).run(recognized_students.length, unknown_faces.length, sessionId);

            res.status(201).json({
                message: 'Attendance session created successfully',
                sessionId,
                summary: {
                    total_students: students.length,
                    present: recognized_students.length,
                    absent: absentStudents.length,
                    unknown: unknown_faces.length,
                    total_faces_detected: total_faces
                },
                recognized_students,
                unknown_faces: unknown_faces.map(f => ({ face_image_path: f.face_image_path }))
            });

        } catch (aiError) {
            console.error('AI Engine error:', aiError.message);

            // Update session status to failed
            db.prepare('UPDATE attendance_sessions SET status = "rejected" WHERE id = ?').run(sessionId);

            return res.status(500).json({
                error: 'Face recognition processing failed',
                message: aiError.message,
                sessionId,
                note: 'Session created but processing failed. You can manually mark attendance.'
            });
        }

    } catch (error) {
        console.error('Create session error:', error);

        // Clean up uploaded file on error
        if (req.file) {
            fs.unlink(req.file.path, () => { });
        }

        res.status(500).json({ error: 'Failed to create attendance session' });
    }
});

// Get all sessions (with filters)
router.get('/sessions', authenticateToken, (req, res) => {
    const { class: className, date, teacher_id, status } = req.query;

    try {
        let query = `
      SELECT s.*, u.full_name as teacher_name
      FROM attendance_sessions s
      LEFT JOIN users u ON s.teacher_id = u.id
      WHERE 1=1
    `;
        const params = [];

        // Teachers can only see their own sessions
        if (req.user.role === 'teacher') {
            query += ' AND s.teacher_id = ?';
            params.push(req.user.id);
        } else if (teacher_id) {
            query += ' AND s.teacher_id = ?';
            params.push(teacher_id);
        }

        if (className) {
            query += ' AND s.class = ?';
            params.push(className);
        }

        if (date) {
            query += ' AND s.session_date = ?';
            params.push(date);
        }

        if (status) {
            query += ' AND s.status = ?';
            params.push(status);
        }

        query += ' ORDER BY s.session_date DESC, s.session_time DESC';

        const sessions = db.prepare(query).all(...params);

        res.json({ sessions, count: sessions.length });
    } catch (error) {
        console.error('Fetch sessions error:', error);
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
});

// Get session details with attendance records
router.get('/sessions/:id', authenticateToken, (req, res) => {
    try {
        const session = db.prepare(`
      SELECT s.*, u.full_name as teacher_name
      FROM attendance_sessions s
      LEFT JOIN users u ON s.teacher_id = u.id
      WHERE s.id = ?
    `).get(req.params.id);

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Get attendance records
        const records = db.prepare(`
      SELECT ar.*, s.roll_number, s.class, s.section, s.photo_path
      FROM attendance_records ar
      LEFT JOIN students s ON ar.student_id = s.id
      WHERE ar.session_id = ?
      ORDER BY s.roll_number
    `).all(req.params.id);

        // Get unknown faces
        const unknownFaces = db.prepare(`
      SELECT * FROM unknown_faces
      WHERE session_id = ?
    `).all(req.params.id);

        res.json({
            session,
            records,
            unknownFaces
        });
    } catch (error) {
        console.error('Fetch session details error:', error);
        res.status(500).json({ error: 'Failed to fetch session details' });
    }
});

// Update attendance record (manual override)
router.put('/records/:id', authenticateToken, authorizeRoles('teacher', 'admin'), (req, res) => {
    const { status } = req.body;

    if (!['present', 'absent'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        const record = db.prepare('SELECT * FROM attendance_records WHERE id = ?').get(req.params.id);

        if (!record) {
            return res.status(404).json({ error: 'Record not found' });
        }

        db.prepare(`
      UPDATE attendance_records
      SET status = ?, manually_marked = 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, req.params.id);

        // Update session counts
        const sessionId = record.session_id;
        const presentCount = db.prepare('SELECT COUNT(*) as count FROM attendance_records WHERE session_id = ? AND status = "present"').get(sessionId).count;

        db.prepare('UPDATE attendance_sessions SET present_count = ? WHERE id = ?').run(presentCount, sessionId);

        res.json({ message: 'Attendance record updated successfully' });
    } catch (error) {
        console.error('Update record error:', error);
        res.status(500).json({ error: 'Failed to update record' });
    }
});

// Approve session
router.put('/sessions/:id/approve', authenticateToken, authorizeRoles('teacher', 'admin'), (req, res) => {
    try {
        const session = db.prepare('SELECT * FROM attendance_sessions WHERE id = ?').get(req.params.id);

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        db.prepare('UPDATE attendance_sessions SET status = "approved", updated_at = CURRENT_TIMESTAMP WHERE id = ?')
            .run(req.params.id);

        res.json({ message: 'Session approved successfully' });
    } catch (error) {
        console.error('Approve session error:', error);
        res.status(500).json({ error: 'Failed to approve session' });
    }
});

// Delete session
router.delete('/sessions/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
    try {
        const session = db.prepare('SELECT image_path FROM attendance_sessions WHERE id = ?').get(req.params.id);

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Delete image file
        if (session.image_path) {
            const imagePath = path.join(__dirname, '../..', session.image_path);
            fs.unlink(imagePath, () => { });
        }

        // Delete session (cascade will delete records)
        db.prepare('DELETE FROM attendance_sessions WHERE id = ?').run(req.params.id);

        res.json({ message: 'Session deleted successfully' });
    } catch (error) {
        console.error('Delete session error:', error);
        res.status(500).json({ error: 'Failed to delete session' });
    }
});

export default router;
