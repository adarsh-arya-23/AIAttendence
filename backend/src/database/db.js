import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcryptjs from 'bcryptjs';
const bcrypt = bcryptjs.default || bcryptjs;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'attendance.db');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initializeDatabase() {
  console.log('🗄️  Initializing database...');

  // Users table (Teachers, Admins, Students)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'teacher', 'student')),
      full_name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Students table (Extended profile)
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE,
      roll_number TEXT UNIQUE NOT NULL,
      class TEXT NOT NULL,
      section TEXT,
      department TEXT,
      photo_path TEXT,
      embedding_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Attendance Sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS attendance_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teacher_id INTEGER NOT NULL,
      class TEXT NOT NULL,
      section TEXT,
      subject TEXT NOT NULL,
      session_date DATE NOT NULL,
      session_time TIME NOT NULL,
      image_path TEXT NOT NULL,
      total_students INTEGER DEFAULT 0,
      present_count INTEGER DEFAULT 0,
      unknown_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Attendance Records table
  db.exec(`
    CREATE TABLE IF NOT EXISTS attendance_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('present', 'absent', 'unknown')),
      confidence REAL,
      manually_marked BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      UNIQUE(session_id, student_id)
    )
  `);

  // Unknown Faces table (for review)
  db.exec(`
    CREATE TABLE IF NOT EXISTS unknown_faces (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      face_image_path TEXT NOT NULL,
      embedding_path TEXT,
      reviewed BOOLEAN DEFAULT 0,
      matched_student_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (matched_student_id) REFERENCES students(id) ON DELETE SET NULL
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_students_roll ON students(roll_number);
    CREATE INDEX IF NOT EXISTS idx_students_class ON students(class, section);
    CREATE INDEX IF NOT EXISTS idx_sessions_date ON attendance_sessions(session_date);
    CREATE INDEX IF NOT EXISTS idx_sessions_teacher ON attendance_sessions(teacher_id);
    CREATE INDEX IF NOT EXISTS idx_records_session ON attendance_records(session_id);
    CREATE INDEX IF NOT EXISTS idx_records_student ON attendance_records(student_id);
  `);

  console.log('✅ Database initialized successfully!');
}

// Seed initial admin user
export async function seedAdminUser() {
  const hashedPassword = bcrypt.hashSync('admin123', 10);

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO users (username, email, password, role, full_name)
    VALUES (?, ?, ?, ?, ?)
  `);

  try {
    stmt.run('admin', 'admin@attendance.edu', hashedPassword, 'admin', 'System Administrator');
    console.log('✅ Admin user created (username: admin, password: admin123)');
  } catch (error) {
    console.log('ℹ️  Admin user already exists');
  }
}

export default db;
