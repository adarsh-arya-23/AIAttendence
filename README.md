# 🎓 AI-Driven Facial Recognition Attendance System

[![CI](https://github.com/adarsh-arya-23/AIAttendence/actions/workflows/ci.yml/badge.svg)](https://github.com/adarsh-arya-23/AIAttendence/actions/workflows/ci.yml)
[![Docker Build](https://github.com/adarsh-arya-23/AIAttendence/actions/workflows/docker-build.yml/badge.svg)](https://github.com/adarsh-arya-23/AIAttendence/actions/workflows/docker-build.yml)


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
- **AI Engine**: Python 3.11 + OpenCV + face_recognition
- **Database**: SQLite (zero-cost, no setup required)
- **Image Processing**: Pillow, NumPy, Dlib
- **Containerization**: Docker & Docker Compose

## 🎛️ Core Features

✅ Automatic face-based attendance  
✅ Session-wise attendance tracking  
✅ Unknown face alert & review mode  
✅ Manual override option for teachers  
✅ Attendance analytics dashboard  
✅ Supports classroom sizes of 40-50 students  
✅ High-accuracy recognition workflow  

## 📁 Project Structure

```
ai-attendance-system/
├── backend/                 # Node.js API Server
├── ai-engine/              # Python AI Processing
├── frontend/               # React Web App
├── docker-compose.yml      # Docker orchestration
└── docs/                   # Documentation
```

## 🚀 Quick Start (Using Docker) - Recommended

The easiest way to run this project on any system (Windows, Mac, Linux) without installing Python or Node.js locally is using Docker.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### Installation & Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/adarsh-arya-23/AIAttendence.git
   cd AIAttendence
   ```

2. **Set up Environment Variables**:
   Create a `.env` file in the `backend` folder (you can use `.env.example` as a template).

3. **Build and Start with Docker**:
   ```bash
   docker-compose up --build -d
   ```

4. **Initialize the Database** (Required for first-time setup):
   ```bash
   docker-compose exec backend npm run init-db
   ```

5. **Access the App**:
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Login: `admin` / `admin123`

### Accessing the Application
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **AI Engine**: [http://localhost:5001](http://localhost:5001)

---

## 🛠️ Manual Installation (Advanced)

If you prefer to run the components locally without Docker:

### Prerequisites
- Python 3.11+
- Node.js v22+
- C++ Build Tools (Required for `dlib`)

### Steps
1. **Backend**: `cd backend && npm install && npm run init-db && npm run dev`
2. **AI Engine**: `cd ai-engine && pip install -r requirements.txt && python face_processor.py`
3. **Frontend**: `cd frontend && npm install && npm run dev`

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

Contributions make the open-source community an amazing place to learn, inspire, and create. Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - Free to use for educational institutions

## 👥 Authors

Built with ❤️ for the education community
