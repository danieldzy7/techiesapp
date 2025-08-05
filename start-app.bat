@echo off
title Techies App - Starting...
color 0A

echo.
echo ========================================
echo    Techies App - Quick Start
echo ========================================
echo.

echo Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Checking if npm is installed...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed or not in PATH
    echo Please install npm or reinstall Node.js
    echo.
    pause
    exit /b 1
)

echo Checking if dependencies are installed...
if not exist "node_modules" (
    echo Installing Node.js dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install Node.js dependencies
        echo.
        pause
        exit /b 1
    )
)

if not exist "client\js\libs\angular.min.js" (
    echo Installing Bower dependencies...
    bower install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install Bower dependencies
        echo Please install Bower: npm install -g bower
        echo.
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo    Starting Techies App...
echo ========================================
echo.
echo The app will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

npm start

echo.
echo Server stopped.
pause 