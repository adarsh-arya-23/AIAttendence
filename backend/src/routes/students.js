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

// Configure multer for student photo uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads/photos');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
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

// Get all students (with optional filters)
router.get('/', authenticateToken, (req, res) => {
    const { class: className, section, search } = req.query;

    try {
        let query = `
      SELECT s.*, u.full_name, u.email
      FROM students s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE 1=1
    `;
        const params = [];

        if (className) {
            query += ' AND s.class = ?';
            params.push(className);
        }

        if (section) {
            query += ' AND s.section = ?';
            params.push(section);
        }

        if (search) {
            query += ' AND (s.roll_number LIKE ? OR u.full_name LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY s.class, s.section, s.roll_number';

        const students = db.prepare(query).all(...params);

        res.json({ students, count: students.length });
    } catch (error) {
        console.error('Fetch students error:', error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

// Get student by ID
router.get('/:id', authenticateToken, (req, res) => {
    try {
        const student = db.prepare(`
      SELECT s.*, u.full_name, u.email, u.username
      FROM students s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `).get(req.params.id);

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json({ student });
    } catch (error) {
        console.error('Fetch student error:', error);
        res.status(500).json({ error: 'Failed to fetch student' });
    }
});

// Add new student with photo
router.post('/', authenticateToken, authorizeRoles('admin', 'teacher'), upload.single('photo'), async (req, res) => {
    const { roll_number, class: className, section, department, full_name, email } = req.body;

    if (!roll_number || !className || !full_name) {
        return res.status(400).json({ error: 'Roll number, class, and full name are required' });
    }

    const photoPath = req.file ? `/uploads/photos/${req.file.filename}` : null;

    try {
        // Check if roll number already exists
        const existing = db.prepare('SELECT id FROM students WHERE roll_number = ?').get(roll_number);
        if (existing) {
            return res.status(409).json({ error: 'Roll number already exists' });
        }

        // If photo is provided, generate face embedding
        let embeddingPath = null;
        if (photoPath) {
            try {
                const aiResponse = await axios.post(`${process.env.AI_ENGINE_URL}/generate-embedding`, {
                    image_path: path.join(__dirname, '../../uploads/photos', req.file.filename)
                });

                if (aiResponse.data.success) {
                    embeddingPath = aiResponse.data.embedding_path;
                }
            } catch (aiError) {
                console.warn('Failed to generate embedding:', aiError.message);
                // Continue without embedding - can be generated later
            }
        }

        // Insert student
        const stmt = db.prepare(`
      INSERT INTO students (roll_number, class, section, department, photo_path, embedding_path)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

        const result = stmt.run(roll_number, className, section || null, department || null, photoPath, embeddingPath);

        res.status(201).json({
            message: 'Student added successfully',
            studentId: result.lastInsertRowid,
            embeddingGenerated: !!embeddingPath
        });
    } catch (error) {
        console.error('Add student error:', error);

        // Clean up uploaded file on error
        if (req.file) {
            fs.unlink(req.file.path, () => { });
        }

        res.status(500).json({ error: 'Failed to add student' });
    }
});

// Update student
router.put('/:id', authenticateToken, authorizeRoles('admin', 'teacher'), upload.single('photo'), async (req, res) => {
    const { roll_number, class: className, section, department } = req.body;

    try {
        const student = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        let photoPath = student.photo_path;
        let embeddingPath = student.embedding_path;

        // If new photo uploaded
        if (req.file) {
            // Delete old photo
            if (student.photo_path) {
                const oldPhotoPath = path.join(__dirname, '../..', student.photo_path);
                fs.unlink(oldPhotoPath, () => { });
            }

            photoPath = `/uploads/photos/${req.file.filename}`;

            // Generate new embedding
            try {
                const aiResponse = await axios.post(`${process.env.AI_ENGINE_URL}/generate-embedding`, {
                    image_path: path.join(__dirname, '../../uploads/photos', req.file.filename)
                });

                if (aiResponse.data.success) {
                    embeddingPath = aiResponse.data.embedding_path;
                }
            } catch (aiError) {
                console.warn('Failed to generate embedding:', aiError.message);
            }
        }

        // Update student
        const stmt = db.prepare(`
      UPDATE students
      SET roll_number = ?, class = ?, section = ?, department = ?,
          photo_path = ?, embedding_path = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

        stmt.run(
            roll_number || student.roll_number,
            className || student.class,
            section !== undefined ? section : student.section,
            department !== undefined ? department : student.department,
            photoPath,
            embeddingPath,
            req.params.id
        );

        res.json({ message: 'Student updated successfully' });
    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({ error: 'Failed to update student' });
    }
});

// Delete student
router.delete('/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
    try {
        const student = db.prepare('SELECT photo_path FROM students WHERE id = ?').get(req.params.id);

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Delete photo file
        if (student.photo_path) {
            const photoPath = path.join(__dirname, '../..', student.photo_path);
            fs.unlink(photoPath, () => { });
        }

        // Delete student record
        db.prepare('DELETE FROM students WHERE id = ?').run(req.params.id);

        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({ error: 'Failed to delete student' });
    }
});

// Get unique classes
router.get('/meta/classes', authenticateToken, (req, res) => {
    try {
        const classes = db.prepare('SELECT DISTINCT class FROM students ORDER BY class').all();
        res.json({ classes: classes.map(c => c.class) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch classes' });
    }
});

// Get sections for a class
router.get('/meta/sections/:class', authenticateToken, (req, res) => {
    try {
        const sections = db.prepare('SELECT DISTINCT section FROM students WHERE class = ? ORDER BY section').all(req.params.class);
        res.json({ sections: sections.map(s => s.section).filter(Boolean) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sections' });
    }
});

export default router;
