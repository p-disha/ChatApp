@echo off
echo ========================================
echo   Installing Chat System Dependencies
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo After installation, run this script again.
    echo.
    pause
    exit /b 1
)

echo Node.js found!
echo.

REM Navigate to project directory
cd /d "%~dp0"

echo Installing dependencies...
call npm install

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   Installation Complete!
    echo ========================================
    echo.
    echo To start the server, run:
    echo   npm start
    echo.
    echo Or double-click: START.bat
    echo.
) else (
    echo.
    echo ========================================
    echo   Installation Failed!
    echo ========================================
    echo.
    echo Please check the error messages above.
    echo.
)

pause

