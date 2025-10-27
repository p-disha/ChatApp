@echo off
echo ========================================
echo   Real-Time Chat System - Startup
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo After installation, restart this script.
    echo.
    pause
    exit /b 1
)

echo Node.js found!
node --version
echo.

REM Navigate to project directory
cd /d "%~dp0"

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: npm install failed!
        pause
        exit /b 1
    )
    echo.
)

echo Starting server...
echo ========================================
echo.
echo   Chat Server: http://localhost:3000
echo.
echo   Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

REM Start the server
npm start

pause

