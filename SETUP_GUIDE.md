# 🚀 Quick Start Guide

## Prerequisites Check

Before starting, ensure you have:
- ✅ Python 3.14.2 installed
- ✅ Node.js v22.20.0 installed
- ✅ npm or yarn package manager

## Installation Steps

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Initialize database and create admin user
npm run init-db
```

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

### 2. AI Engine Setup

```bash
# Navigate to AI engine directory
cd ../ai-engine

# Install Python dependencies
pip install -r requirements.txt
```

**Note for Windows Users:**

If you encounter issues installing `face_recognition` or `dlib`:

```bash
# Option 1: Install via pip (may require Visual Studio Build Tools)
pip install cmake
pip install dlib
pip install face_recognition

# Option 2: Use pre-built wheels (recommended for Windows)
# Download dlib wheel from: https://github.com/z-mahmud22/Dlib_Windows_Python3.x
# Then install:
pip install dlib-19.24.0-cp314-cp314-win_amd64.whl
pip install face_recognition
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install
```

## Running the Application

You need to run **three separate terminals**:

### Terminal 1: Backend Server

```bash
cd backend
npm run dev
```

Server will run on: `http://localhost:5000`

### Terminal 2: AI Engine

```bash
cd ai-engine
python face_processor.py
```

AI Engine will run on: `http://localhost:5001`

### Terminal 3: Frontend

```bash
cd frontend
npm run dev
```

Frontend will run on: `http://localhost:5173`

## First Time Setup

1. **Login** with admin credentials (admin/admin123)
2. **Add Students**: Go to Students → Add Student
   - Upload student photo (clear face photo recommended)
   - Fill in roll number, class, section
3. **Take Attendance**: Go to Take Attendance
   - Select class and subject
   - Upload classroom photo
   - AI will process and mark attendance automatically

## Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Change PORT in backend/.env file
PORT=5001
```

**Database errors:**
```bash
# Re-initialize database
cd backend
npm run init-db
```

### AI Engine Issues

**face_recognition not installing:**
- Install Visual Studio Build Tools
- Or use pre-built wheels (see Windows note above)

**No faces detected:**
- Ensure photos have clear, front-facing faces
- Good lighting in classroom photos
- Minimum face size: 50x50 pixels

**Low accuracy:**
- Use high-quality student photos
- Ensure consistent lighting
- Re-capture student photos if needed

### Frontend Issues

**API connection errors:**
- Ensure backend is running on port 5000
- Check CORS settings in backend

**Build errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Production Deployment

### Backend

```bash
cd backend
npm start
```

### AI Engine

```bash
cd ai-engine
# Use production WSGI server
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5001 face_processor:app
```

### Frontend

```bash
cd frontend
npm run build
# Serve the dist folder with any static server
```

## Environment Variables

### Backend (.env)

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-secure-secret-key
AI_ENGINE_URL=http://localhost:5001
```

### Frontend

Create `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

## Security Recommendations

1. **Change default admin password** immediately after first login
2. **Use strong JWT_SECRET** in production
3. **Enable HTTPS** for production deployment
4. **Implement rate limiting** on API endpoints
5. **Regular database backups**

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review error logs in terminal
3. Ensure all dependencies are correctly installed

---

**Happy Attendance Tracking! 🎓**
