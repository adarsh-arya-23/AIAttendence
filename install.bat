@echo off
echo ========================================
echo AI Attendance System - Installation
echo ========================================
echo.

REM Check Node.js
echo [1/5] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js v22.20.0 from https://nodejs.org
    pause
    exit /b 1
)
echo Node.js: OK

REM Check Python
echo [2/5] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed!
    echo Please install Python 3.14.2 from https://python.org
    pause
    exit /b 1
)
echo Python: OK
echo.

REM Install Backend
echo [3/5] Installing Backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Backend installation failed!
    pause
    exit /b 1
)
echo Backend: OK
echo.

REM Initialize Database
echo [4/5] Initializing database...
call npm run init-db
if %errorlevel% neq 0 (
    echo ERROR: Database initialization failed!
    pause
    exit /b 1
)
echo Database: OK
echo.

REM Install AI Engine
echo [5/5] Installing AI Engine dependencies...
cd ..\ai-engine
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo WARNING: AI Engine installation may have issues.
    echo You may need to install dlib manually.
    echo See SETUP_GUIDE.md for Windows-specific instructions.
)
echo AI Engine: Installation attempted
echo.

REM Install Frontend
echo [6/6] Installing Frontend dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Frontend installation failed!
    pause
    exit /b 1
)
echo Frontend: OK
echo.

cd ..

echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Default Admin Credentials:
echo   Username: admin
echo   Password: admin123
echo.
echo To start the system, run: start.bat
echo Or manually start each service:
echo   1. Backend:    cd backend ^&^& npm run dev
echo   2. AI Engine:  cd ai-engine ^&^& python face_processor.py
echo   3. Frontend:   cd frontend ^&^& npm run dev
echo.
echo Then open: http://localhost:5173
echo.
pause
