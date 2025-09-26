@echo off
echo ========================================
echo   SDX Partners Intelligence Portal
echo   Startup Script - Issue Resolution
echo ========================================
echo.

REM Kill any existing processes on port 3001
echo [1/5] Checking for existing processes on port 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    echo Found process %%a on port 3001, terminating...
    taskkill /F /PID %%a >nul 2>&1
)
echo ✅ Port 3001 is now available

REM Check Node.js version
echo.
echo [2/5] Checking Node.js version...
node --version
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js is available

REM Install dependencies if needed
echo.
echo [3/5] Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
) else (
    echo ✅ Dependencies are installed
)

REM Start backend server
echo.
echo [4/5] Starting backend server on port 3001...
start "SDX Backend" cmd /c "npm run dev:server"
timeout /t 3 >nul

REM Start frontend client
echo.
echo [5/5] Starting frontend client on port 8080...
echo.
echo 🚀 Portal will be available at: http://localhost:8080
echo 🧪 Test suite available at: http://localhost:8080/debug/date-filter
echo 🔧 Debug tools available at: http://localhost:8080/debug
echo.
echo Press Ctrl+C to stop the servers
echo.
npm run dev:client

echo.
echo Portal stopped. Press any key to exit...
pause >nul
