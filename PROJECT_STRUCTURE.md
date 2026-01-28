# 📁 Project Structure

```
ai-attendance-system/
│
├── 📄 README.md                          # Project overview
├── 📄 SETUP_GUIDE.md                     # Installation guide
├── 📄 ARCHITECTURE.md                    # Technical documentation
├── 📄 QUICK_REFERENCE.md                 # Common tasks
├── 📄 PROJECT_SUMMARY.md                 # Completion summary
├── 📄 .gitignore                         # Git ignore rules
│
├── 📁 backend/                           # Node.js API Server
│   ├── 📄 package.json                   # Dependencies & scripts
│   ├── 📄 .env                           # Environment variables
│   │
│   ├── 📁 src/
│   │   ├── 📄 server.js                  # Main Express server
│   │   │
│   │   ├── 📁 database/
│   │   │   ├── 📄 db.js                  # Database schema & connection
│   │   │   ├── 📄 init.js                # Database initialization script
│   │   │   └── 📄 attendance.db          # SQLite database (generated)
│   │   │
│   │   ├── 📁 middleware/
│   │   │   └── 📄 auth.js                # JWT authentication middleware
│   │   │
│   │   └── 📁 routes/
│   │       ├── 📄 auth.js                # Authentication routes
│   │       ├── 📄 students.js            # Student management routes
│   │       ├── 📄 attendance.js          # Attendance processing routes
│   │       └── 📄 analytics.js           # Analytics & reporting routes
│   │
│   └── 📁 uploads/                       # Uploaded files (generated)
│       ├── 📁 images/                    # Classroom photos
│       └── 📁 photos/                    # Student photos
│
├── 📁 ai-engine/                         # Python AI Processing
│   ├── 📄 requirements.txt               # Python dependencies
│   ├── 📄 face_processor.py              # Main AI engine (400+ lines)
│   │
│   ├── 📁 embeddings/                    # Face embeddings (generated)
│   │   └── 📄 student_*.pkl              # Stored face embeddings
│   │
│   └── 📁 unknown_faces/                 # Unknown faces (generated)
│       └── 📄 unknown_*.jpg              # Unrecognized face images
│
└── 📁 frontend/                          # React Web Application
    ├── 📄 package.json                   # Dependencies & scripts
    ├── 📄 vite.config.js                 # Vite build configuration
    ├── 📄 index.html                     # HTML template
    ├── 📄 .env                           # Environment variables
    │
    ├── 📁 public/                        # Static assets
    │   └── 📄 vite.svg                   # Vite logo
    │
    └── 📁 src/
        ├── 📄 main.jsx                   # React entry point
        ├── 📄 App.jsx                    # Main app component
        ├── 📄 index.css                  # Design system (500+ lines)
        │
        ├── 📁 components/                # Reusable components
        │   ├── 📄 Navbar.jsx             # Navigation bar
        │   ├── 📄 Navbar.css             # Navbar styles
        │   └── 📄 LoadingSpinner.jsx     # Loading spinner
        │
        ├── 📁 pages/                     # Application pages
        │   ├── 📄 Login.jsx              # Login page
        │   ├── 📄 Login.css              # Login styles
        │   ├── 📄 Dashboard.jsx          # Dashboard page
        │   ├── 📄 Dashboard.css          # Dashboard styles
        │   ├── 📄 TakeAttendance.jsx     # Take attendance page
        │   ├── 📄 TakeAttendance.css     # Take attendance styles
        │   ├── 📄 Students.jsx           # Students management
        │   ├── 📄 AttendanceSessions.jsx # Sessions list
        │   ├── 📄 SessionDetails.jsx     # Session details
        │   ├── 📄 Analytics.jsx          # Analytics page
        │   └── 📄 Profile.jsx            # User profile
        │
        ├── 📁 services/                  # API integration
        │   └── 📄 api.js                 # Axios API service
        │
        └── 📁 context/                   # React context
            └── 📄 AuthContext.jsx        # Authentication context

```

## 📊 File Statistics

### Backend (10 files)
- Configuration: 2 files
- Core: 2 files
- Middleware: 1 file
- Routes: 4 files
- Database: 1 file (generated)

### AI Engine (2 files)
- Configuration: 1 file
- Core Logic: 1 file (400+ lines)

### Frontend (19 files)
- Configuration: 3 files
- Core: 3 files
- Components: 3 files
- Pages: 9 files
- Services: 1 file
- Context: 1 file

### Documentation (6 files)
- README.md
- SETUP_GUIDE.md
- ARCHITECTURE.md
- QUICK_REFERENCE.md
- PROJECT_SUMMARY.md
- PROJECT_STRUCTURE.md

### Total: 37 files

## 🎯 Key Directories

### `/backend/src/routes/`
Contains all API endpoint definitions:
- **auth.js**: Login, register, profile
- **students.js**: CRUD operations for students
- **attendance.js**: Session creation, processing
- **analytics.js**: Reports and statistics

### `/ai-engine/`
AI processing engine:
- **face_processor.py**: Face detection, recognition, embedding generation
- **embeddings/**: Stores student face embeddings
- **unknown_faces/**: Stores unrecognized faces

### `/frontend/src/pages/`
All application pages:
- **Login**: Authentication
- **Dashboard**: Overview and stats
- **TakeAttendance**: Core feature - capture and process
- **Students**: Student management
- **AttendanceSessions**: View all sessions
- **SessionDetails**: Detailed session view
- **Analytics**: Reports and insights
- **Profile**: User settings

## 🔄 Data Flow

```
User Action → Frontend → API Service → Backend Routes → Database
                                    ↓
                              AI Engine (for face recognition)
                                    ↓
                              Backend Routes → Frontend → User
```

## 🚀 Getting Started

1. **Install Backend**: `cd backend && npm install`
2. **Install AI Engine**: `cd ai-engine && pip install -r requirements.txt`
3. **Install Frontend**: `cd frontend && npm install`
4. **Initialize Database**: `cd backend && npm run init-db`
5. **Run All Services**: See QUICK_REFERENCE.md

## 📝 Notes

- All generated files (database, uploads, embeddings) are gitignored
- Environment files (.env) should be configured before running
- Frontend builds to `/frontend/dist/` for production
- Database is created automatically on first run

---

**This structure provides a clean, organized, and scalable foundation for the AI attendance system.**
