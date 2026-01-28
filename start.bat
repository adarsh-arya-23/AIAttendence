@echo off
echo ========================================
echo AI Attendance System - Starting...
echo ========================================
echo.
echo This will open 3 terminal windows:
echo   1. Backend Server (Port 5000)
echo   2. AI Engine (Port 5001)
echo   3. Frontend (Port 5173)
echo.
echo Press any key to start all services...
pause >nul

REM Start Backend
echo Starting Backend Server...
start "AI Attendance - Backend" cmd /k "cd backend && npm run dev"
timeout /t 2 >nul

REM Start AI Engine
echo Starting AI Engine...
start "AI Attendance - AI Engine" cmd /k "cd ai-engine && python face_processor.py"
timeout /t 2 >nul

REM Start Frontend
echo Starting Frontend...
start "AI Attendance - Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 3 >nul

echo.
echo ========================================
echo All services started!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo AI Engine: http://localhost:5001
echo Frontend:  http://localhost:5173
echo.
echo Login with:
echo   Username: admin
echo   Password: admin123
echo.
echo Opening browser in 5 seconds...
timeout /t 5 >nul
start http://localhost:5173
echo.
echo To stop all services, close the terminal windows.
echo.
pause
