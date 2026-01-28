import express from 'express';
import db from '../database/db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get attendance statistics for a student
router.get('/student/:studentId', authenticateToken, (req, res) => {
    try {
        const student = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.studentId);

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Get total sessions for this student's class
        const totalSessions = db.prepare(`
      SELECT COUNT(*) as count
      FROM attendance_sessions
      WHERE class = ? AND (section = ? OR section IS NULL)
      AND status = 'approved'
    `).get(student.class, student.section).count;

        // Get attendance records
        const presentCount = db.prepare(`
      SELECT COUNT(*) as count
      FROM attendance_records ar
      JOIN attendance_sessions s ON ar.session_id = s.id
      WHERE ar.student_id = ? AND ar.status = 'present' AND s.status = 'approved'
    `).get(req.params.studentId).count;

        const absentCount = db.prepare(`
      SELECT COUNT(*) as count
      FROM attendance_records ar
      JOIN attendance_sessions s ON ar.session_id = s.id
      WHERE ar.student_id = ? AND ar.status = 'absent' AND s.status = 'approved'
    `).get(req.params.studentId).count;

        // Get recent attendance
        const recentAttendance = db.prepare(`
      SELECT ar.*, s.subject, s.session_date, s.session_time
      FROM attendance_records ar
      JOIN attendance_sessions s ON ar.session_id = s.id
      WHERE ar.student_id = ?
      ORDER BY s.session_date DESC, s.session_time DESC
      LIMIT 10
    `).all(req.params.studentId);

        const attendancePercentage = totalSessions > 0
            ? ((presentCount / totalSessions) * 100).toFixed(2)
            : 0;

        res.json({
            student,
            statistics: {
                total_sessions: totalSessions,
                present: presentCount,
                absent: absentCount,
                attendance_percentage: parseFloat(attendancePercentage)
            },
            recent_attendance: recentAttendance
        });
    } catch (error) {
        console.error('Student analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch student analytics' });
    }
});

// Get class-wise attendance statistics
router.get('/class/:className', authenticateToken, (req, res) => {
    const { section, date_from, date_to } = req.query;

    try {
        let sessionQuery = `
      SELECT COUNT(*) as total_sessions
      FROM attendance_sessions
      WHERE class = ? AND status = 'approved'
    `;
        const params = [req.params.className];

        if (section) {
            sessionQuery += ' AND section = ?';
            params.push(section);
        }

        if (date_from) {
            sessionQuery += ' AND session_date >= ?';
            params.push(date_from);
        }

        if (date_to) {
            sessionQuery += ' AND session_date <= ?';
            params.push(date_to);
        }

        const totalSessions = db.prepare(sessionQuery).get(...params).total_sessions;

        // Get student-wise attendance
        let studentsQuery = 'SELECT * FROM students WHERE class = ?';
        const studentParams = [req.params.className];

        if (section) {
            studentsQuery += ' AND section = ?';
            studentParams.push(section);
        }

        const students = db.prepare(studentsQuery).all(...studentParams);

        const studentStats = students.map(student => {
            let recordQuery = `
        SELECT 
          COUNT(CASE WHEN ar.status = 'present' THEN 1 END) as present,
          COUNT(CASE WHEN ar.status = 'absent' THEN 1 END) as absent
        FROM attendance_records ar
        JOIN attendance_sessions s ON ar.session_id = s.id
        WHERE ar.student_id = ? AND s.status = 'approved'
      `;
            const recordParams = [student.id];

            if (date_from) {
                recordQuery += ' AND s.session_date >= ?';
                recordParams.push(date_from);
            }

            if (date_to) {
                recordQuery += ' AND s.session_date <= ?';
                recordParams.push(date_to);
            }

            const stats = db.prepare(recordQuery).get(...recordParams);

            const percentage = totalSessions > 0
                ? ((stats.present / totalSessions) * 100).toFixed(2)
                : 0;

            return {
                student_id: student.id,
                roll_number: student.roll_number,
                present: stats.present,
                absent: stats.absent,
                percentage: parseFloat(percentage)
            };
        });

        // Calculate class average
        const classAverage = studentStats.length > 0
            ? (studentStats.reduce((sum, s) => sum + s.percentage, 0) / studentStats.length).toFixed(2)
            : 0;

        res.json({
            class: req.params.className,
            section: section || 'All',
            total_sessions: totalSessions,
            total_students: students.length,
            class_average: parseFloat(classAverage),
            student_statistics: studentStats
        });
    } catch (error) {
        console.error('Class analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch class analytics' });
    }
});

// Get subject-wise attendance
router.get('/subject/:subject', authenticateToken, authorizeRoles('teacher', 'admin'), (req, res) => {
    const { class: className, date_from, date_to } = req.query;

    try {
        let query = `
      SELECT 
        session_date,
        COUNT(*) as total_sessions,
        SUM(present_count) as total_present,
        SUM(total_students) as total_students
      FROM attendance_sessions
      WHERE subject = ? AND status = 'approved'
    `;
        const params = [req.params.subject];

        if (className) {
            query += ' AND class = ?';
            params.push(className);
        }

        if (date_from) {
            query += ' AND session_date >= ?';
            params.push(date_from);
        }

        if (date_to) {
            query += ' AND session_date <= ?';
            params.push(date_to);
        }

        query += ' GROUP BY session_date ORDER BY session_date DESC';

        const dailyStats = db.prepare(query).all(...params);

        const overallStats = dailyStats.reduce((acc, day) => ({
            total_sessions: acc.total_sessions + day.total_sessions,
            total_present: acc.total_present + day.total_present,
            total_students: acc.total_students + day.total_students
        }), { total_sessions: 0, total_present: 0, total_students: 0 });

        const averageAttendance = overallStats.total_students > 0
            ? ((overallStats.total_present / overallStats.total_students) * 100).toFixed(2)
            : 0;

        res.json({
            subject: req.params.subject,
            class: className || 'All',
            overall: {
                ...overallStats,
                average_attendance: parseFloat(averageAttendance)
            },
            daily_statistics: dailyStats
        });
    } catch (error) {
        console.error('Subject analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch subject analytics' });
    }
});

// Get dashboard overview
router.get('/dashboard', authenticateToken, (req, res) => {
    try {
        const stats = {};

        if (req.user.role === 'admin') {
            // Admin dashboard
            stats.total_students = db.prepare('SELECT COUNT(*) as count FROM students').get().count;
            stats.total_teachers = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = "teacher"').get().count;
            stats.total_sessions = db.prepare('SELECT COUNT(*) as count FROM attendance_sessions').get().count;
            stats.pending_sessions = db.prepare('SELECT COUNT(*) as count FROM attendance_sessions WHERE status = "pending"').get().count;

            // Today's sessions
            const today = new Date().toISOString().split('T')[0];
            stats.todays_sessions = db.prepare('SELECT COUNT(*) as count FROM attendance_sessions WHERE session_date = ?').get(today).count;

            // Recent sessions
            stats.recent_sessions = db.prepare(`
        SELECT s.*, u.full_name as teacher_name
        FROM attendance_sessions s
        LEFT JOIN users u ON s.teacher_id = u.id
        ORDER BY s.created_at DESC
        LIMIT 5
      `).all();

        } else if (req.user.role === 'teacher') {
            // Teacher dashboard
            stats.my_sessions = db.prepare('SELECT COUNT(*) as count FROM attendance_sessions WHERE teacher_id = ?').get(req.user.id).count;
            stats.pending_sessions = db.prepare('SELECT COUNT(*) as count FROM attendance_sessions WHERE teacher_id = ? AND status = "pending"').get(req.user.id).count;

            // Today's sessions
            const today = new Date().toISOString().split('T')[0];
            stats.todays_sessions = db.prepare('SELECT COUNT(*) as count FROM attendance_sessions WHERE teacher_id = ? AND session_date = ?').get(req.user.id, today).count;

            // Recent sessions
            stats.recent_sessions = db.prepare(`
        SELECT * FROM attendance_sessions
        WHERE teacher_id = ?
        ORDER BY created_at DESC
        LIMIT 5
      `).all(req.user.id);

            // Classes taught
            stats.classes = db.prepare(`
        SELECT DISTINCT class, section
        FROM attendance_sessions
        WHERE teacher_id = ?
      `).all(req.user.id);
        }

        res.json(stats);
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// Export attendance report (CSV format)
router.get('/export/csv', authenticateToken, authorizeRoles('teacher', 'admin'), (req, res) => {
    const { class: className, section, date_from, date_to } = req.query;

    try {
        let query = `
      SELECT 
        s.roll_number,
        s.class,
        s.section,
        sess.subject,
        sess.session_date,
        sess.session_time,
        ar.status,
        ar.confidence,
        ar.manually_marked
      FROM attendance_records ar
      JOIN students s ON ar.student_id = s.id
      JOIN attendance_sessions sess ON ar.session_id = sess.id
      WHERE sess.status = 'approved'
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

        if (date_from) {
            query += ' AND sess.session_date >= ?';
            params.push(date_from);
        }

        if (date_to) {
            query += ' AND sess.session_date <= ?';
            params.push(date_to);
        }

        query += ' ORDER BY sess.session_date DESC, s.roll_number';

        const records = db.prepare(query).all(...params);

        // Generate CSV
        const headers = ['Roll Number', 'Class', 'Section', 'Subject', 'Date', 'Time', 'Status', 'Confidence', 'Manual'];
        const csvRows = [headers.join(',')];

        records.forEach(record => {
            const row = [
                record.roll_number,
                record.class,
                record.section || '',
                record.subject,
                record.session_date,
                record.session_time,
                record.status,
                record.confidence || '',
                record.manually_marked ? 'Yes' : 'No'
            ];
            csvRows.push(row.join(','));
        });

        const csv = csvRows.join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=attendance-report-${Date.now()}.csv`);
        res.send(csv);
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Failed to export report' });
    }
});

export default router;
