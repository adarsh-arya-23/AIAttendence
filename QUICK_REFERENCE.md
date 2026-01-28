# 📋 Quick Reference - Common Tasks

## Starting the System

### Development Mode (3 Terminals)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - AI Engine:**
```bash
cd ai-engine
python face_processor.py
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

## Common Commands

### Backend

```bash
# Install dependencies
npm install

# Initialize database
npm run init-db

# Start development server
npm run dev

# Start production server
npm start
```

### AI Engine

```bash
# Install dependencies
pip install -r requirements.txt

# Start AI engine
python face_processor.py

# Update specific package
pip install --upgrade face_recognition
```

### Frontend

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Database Operations

### Reset Database
```bash
cd backend
# Delete existing database
rm database/attendance.db
# Reinitialize
npm run init-db
```

### Backup Database
```bash
cd backend/database
cp attendance.db attendance_backup_$(date +%Y%m%d).db
```

## Adding a New Student (Manual)

1. Go to **Students** page
2. Click **Add Student**
3. Fill in:
   - Roll Number (required, unique)
   - Class (required)
   - Section (optional)
   - Department (optional)
4. Upload clear face photo
5. Click **Save**

## Taking Attendance

1. Go to **Take Attendance**
2. Select:
   - Class
   - Section (if applicable)
   - Subject
   - Date & Time
3. Upload classroom photo
4. Click **Process Attendance**
5. Review results
6. Approve or make manual adjustments

## Viewing Reports

### Student-wise Report
1. Go to **Analytics**
2. Select **Student View**
3. Choose student
4. View attendance percentage and history

### Class-wise Report
1. Go to **Analytics**
2. Select **Class View**
3. Choose class and date range
4. View overall statistics

### Export Data
1. Go to **Analytics**
2. Click **Export CSV**
3. Select filters
4. Download report

## Troubleshooting Quick Fixes

### Backend won't start
```bash
# Check if port is in use
netstat -ano | findstr :5000

# Kill process (Windows)
taskkill /PID <PID> /F

# Or change port in .env
PORT=5001
```

### AI Engine errors
```bash
# Reinstall face_recognition
pip uninstall face_recognition dlib
pip install cmake
pip install dlib
pip install face_recognition
```

### Frontend build errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database locked error
```bash
# Close all connections
# Restart backend server
```

## User Management

### Create Admin User (via database init)
```bash
cd backend
npm run init-db
# Default: admin/admin123
```

### Create Teacher Account
1. Login as admin
2. Go to **Users** (if implemented)
3. Or use API:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "teacher1",
    "email": "teacher1@school.edu",
    "password": "password123",
    "role": "teacher",
    "full_name": "John Doe"
  }'
```

### Change Password
1. Go to **Profile**
2. Click **Change Password**
3. Enter current and new password
4. Click **Update**

## API Testing (with curl)

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Get Students (with auth)
```bash
curl -X GET http://localhost:5000/api/students \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Health Check
```bash
# Backend
curl http://localhost:5000/api/health

# AI Engine
curl http://localhost:5001/health
```

## Configuration

### Backend Environment (.env)
```env
NODE_ENV=development
PORT=5000
JWT_SECRET=your-secret-key
AI_ENGINE_URL=http://localhost:5001
DATABASE_PATH=./database/attendance.db
```

### Frontend Environment (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## Performance Tips

1. **Use high-quality photos** (1-3 MB, clear faces)
2. **Consistent lighting** in classroom
3. **Front-facing photos** for student registration
4. **Limit classroom size** to 40-50 students per photo
5. **Regular database cleanup** of old sessions

## Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS in production
- [ ] Regular database backups
- [ ] Limit file upload sizes
- [ ] Validate all user inputs
- [ ] Keep dependencies updated

## Keyboard Shortcuts (Frontend)

- `Ctrl + /` - Search (when implemented)
- `Esc` - Close modals
- `Tab` - Navigate form fields

## File Locations

```
ai-attendance-system/
├── backend/
│   ├── database/attendance.db        # SQLite database
│   ├── uploads/                      # Uploaded files
│   └── .env                          # Backend config
├── ai-engine/
│   ├── embeddings/                   # Face embeddings
│   ├── unknown_faces/                # Unknown faces
│   └── face_processor.py             # Main AI script
└── frontend/
    ├── dist/                         # Production build
    └── .env                          # Frontend config
```

## Getting Help

1. Check **SETUP_GUIDE.md** for detailed setup
2. Review **ARCHITECTURE.md** for system design
3. Check error logs in terminal
4. Verify all services are running
5. Check network connectivity between services

---

**Pro Tip:** Keep all three services running in separate terminal windows for smooth development experience!
