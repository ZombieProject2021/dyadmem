@echo off
color 0A
echo ================================================================
echo.
echo   DYAD WITH PYTHON 3.11 - STARTING
echo.
echo ================================================================
echo.

REM Check Python 3.11
echo [1/3] Checking Python 3.11...
py -3.11 --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python 3.11 not found!
    echo Install from: https://www.python.org/downloads/release/python-3119/
    pause
    exit /b 1
)
py -3.11 --version

REM Check Node.js
echo.
echo [2/3] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found!
    pause
    exit /b 1
)
echo [OK] Node.js found

REM Check if packages installed
echo.
echo [3/3] Checking packages...
py -3.11 -c "import fastapi" >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Packages not installed! Run install_py311.bat first
    pause
    exit /b 1
)
echo [OK] Packages ready

echo.
echo ================================================================
echo STARTING SERVICES...
echo ================================================================
echo.

echo [1/2] Starting Memory Service...
start "Memory Service" cmd /k "cd memory_service && py -3.11 server.py"

echo Waiting 5 seconds...
timeout /t 5 /nobreak > nul

echo [2/2] Starting Dyad...
cd dyad
if not exist "node_modules" (
    echo Installing Dyad dependencies...
    call npm install
)
start "Dyad" cmd /k "npm start"
cd ..

echo.
echo ================================================================
echo [SUCCESS] All started!
echo Memory Service: http://localhost:8002
echo ================================================================
pause
