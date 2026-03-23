@echo off
setlocal enabledelayedexpansion

REM Set up proper PATH with Node.js
set "NODE_PATH=C:\Program Files\nodejs"
set "PATH=!NODE_PATH!;C:\Users\caleb\AppData\Roaming\npm;%PATH%"

echo.
echo ================================
echo Sunflower Land - Dev Server
echo ================================
echo.
echo Checking Node.js installation...
"!NODE_PATH!\node.exe" --version
if errorlevel 1 (
    echo ERROR: Node.js not found!
    pause
    exit /b 1
)

echo Development server starting on http://localhost:3000
echo.

REM Start development server with proper NODE_ENV
set NODE_ENV=development
"!NODE_PATH!\node.exe" "!NODE_PATH!\node_modules\vite\bin\vite.js" --port 3000 --host

pause
