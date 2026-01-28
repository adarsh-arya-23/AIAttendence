import jwt from 'jsonwebtoken';
import db from '../database/db.js';

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Access denied. Insufficient permissions.'
            });
        }

        next();
    };
};

// Middleware to check if user exists in database
export const validateUser = (req, res, next) => {
    const stmt = db.prepare('SELECT id, role FROM users WHERE id = ?');
    const user = stmt.get(req.user.id);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    req.dbUser = user;
    next();
};
