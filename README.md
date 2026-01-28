# 🎓 AI-Driven Facial Recognition Attendance System

## 📋 Problem Statement

Traditional attendance marking in schools and colleges wastes 5-10 minutes per class, leading to:
- ⏳ Significant time wasted daily
- 🧮 Human errors & proxy attendance
- 📑 Delayed or inaccurate records
- 😓 Teacher workload and administrative effort

## 🚀 Solution

An AI-based attendance system that allows teachers to simply click a photo of the classroom. The system automatically:
- Detects all student faces in the image
- Matches them with stored database embeddings
- Identifies each student present
- Generates session-wise attendance records
- Provides an interactive dashboard for teachers & admins

## ⚙️ How It Works

1. **Image Capture**: Teacher clicks a classroom photo via mobile app
2. **AI Processing**: Face detection → Embedding generation → Recognition matching
3. **Attendance Logic**: Recognized faces marked present, unknown faces flagged
4. **Dashboard**: View summary, override entries, approve unknown cases

## 🧩 Technology Stack (100% Free & Open-Source)

- **Frontend**: React + Vite
- **Backend API**: Node.js + Express
- **AI Engine**: Python 3.14.2 + OpenCV + face_recognition
- **Database**: SQLite (zero-cost, no setup required)
- **Image Processing**: Pillow, NumPy

## 🎛️ Core Features

✅ Automatic face-based attendance  
✅ Session-wise attendance tracking  
✅ Unknown face alert & review mode  
✅ Manual override option for teachers  
✅ Attendance analytics dashboard  
✅ Supports classroom sizes of 40-50 students  
✅ High-accuracy recognition workflow  
✅ Ethical & responsible data handling  

## 📁 Project Structure

```
ai-attendance-system/
├── backend/                 # Node.js API Server
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Business logic
│   │   ├── models/         # Database models
│   │   └── middleware/     # Auth & validation
│   ├── database/           # SQLite database
│   └── uploads/            # Temporary image storage
├── ai-engine/              # Python AI Processing
│   ├── face_processor.py   # Face detection & recognition
│   ├── embeddings/         # Stored face embeddings
│   └── requirements.txt    # Python dependencies
├── frontend/               # React Web App
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Application pages
│   │   └── services/       # API integration
│   └── public/
└── docs/                   # Documentation
```

## 🚀 Installation & Setup

### Prerequisites
- Python 3.14.2
- Node.js v22.20.0
- npm or yarn

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 2: Initialize Database

```bash
npm run init-db
```

### Step 3: Install AI Engine Dependencies

```bash
cd ../ai-engine
pip install -r requirements.txt
```

**Note for Windows users**: Installing `face_recognition` and `dlib` on Windows can be tricky. If you encounter issues:

```bash
# Install dlib from wheel (recommended for Windows)
pip install cmake
pip install dlib
pip install face_recognition
```

### Step 4: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## 🏃 Running the Application

### Start Backend Server (Terminal 1)
```bash
cd backend
npm run dev
```
Server runs on: `http://localhost:5000`

### Start AI Engine (Terminal 2)
```bash
cd ai-engine
python face_processor.py
```
AI Engine runs on: `http://localhost:5001`

### Start Frontend (Terminal 3)
```bash
cd frontend
npm run dev
```
Frontend runs on: `http://localhost:5173`

## 📱 Usage Guide

### For Teachers:
1. **Login** with your credentials
2. **Create Session** - Select class, subject, date
3. **Capture Photo** - Click classroom photo or upload
4. **Review Results** - System shows detected students
5. **Confirm/Override** - Approve or manually adjust
6. **Submit** - Attendance saved automatically

### For Admins:
1. **Manage Students** - Add/edit student profiles with photos
2. **View Analytics** - Session-wise and student-wise reports
3. **Review Flags** - Check unknown faces and anomalies
4. **Export Data** - Download attendance reports (CSV/PDF)

## 🔒 Security & Privacy

- All face data stored locally (no cloud dependency)
- Encrypted database connections
- Role-based access control (Admin/Teacher/Student)
- GDPR-compliant data handling
- Secure image upload validation

## 🌍 Real-World Impact

⏱ Saves cumulative teaching hours  
🎓 Ensures fair and transparent attendance  
🧾 Provides reliable digital records  
🏫 Enables institutions to modernize without cost  
💡 Encourages responsible AI adoption in education  

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📄 License

MIT License - Free to use for educational institutions

## 👥 Authors

Built with ❤️ for the education community

---

**Made with 100% free and open-source tools** 🎉
