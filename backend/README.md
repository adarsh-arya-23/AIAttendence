# 📟 Backend API (Node.js)

The core logic and data management layer for the AI Attendance System.

## 🚀 Technologies
- **Node.js** (v22+)
- **Express.js** (Fast & minimalist web framework)
- **better-sqlite3** (High-performance SQLite wrapper)
- **jsonwebtoken** (Secure authentication)
- **bcryptjs** (Password hashing)

## 📁 Key Directories
- `/src/database/`: Database schema and initialization.
- `/src/routes/`: API endpoint definitions (Auth, Students, Attendance, Analytics).
- `/src/middleware/`: Authentication and error-handling middleware.
- `/uploads/`: Local storage for student photos and classroom images.

## 🛠️ Configuration
Environment variables are managed via `.env`. A template is provided in `.env.example`.

## 📦 Running Locally
```bash
npm install
npm run init-db
npm run dev
```

## 🐳 Dockerization
The backend is containerized in the root `docker-compose.yml`. It includes build tools required for native module compilation (`better-sqlite3`).
