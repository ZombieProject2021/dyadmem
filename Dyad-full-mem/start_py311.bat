@echo off
color 0A
echo ================================================================
echo.
echo   DYAD WITH PYTHON 3.11 + PHP - STARTING
echo.
echo ================================================================
echo.

REM Check Python 3.11
echo [1/4] Checking Python 3.11...
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
echo [2/4] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found!
    pause
    exit /b 1
)
echo [OK] Node.js found

REM Check PHP
echo.
echo [3/4] Checking PHP...
if exist "dyad\bin\php\php.exe" (
    echo [OK] PHP found in dyad\bin\php\
    set PHP_PATH=%CD%\dyad\bin\php
) else (
    echo [WARN] PHP not found in dyad\bin\php\
    echo PHP server will not start
    set PHP_PATH=
)

REM Check if packages installed
echo.
echo [4/4] Checking packages...
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

REM Start Memory Service (Python)
echo [1/3] Starting Memory Service (Python)...
start "Memory Service" cmd /k "cd memory_service && py -3.11 server.py"

echo Waiting 3 seconds...
timeout /t 3 /nobreak > nul

REM Start PHP Server (if available)
if defined PHP_PATH (
    echo [2/3] Starting PHP Server...
    start "PHP Server" cmd /k "cd dyad\bin\php && php.exe -S localhost:8080 -t ..\..\public"
    echo [OK] PHP Server starting on http://localhost:8080
) else (
    echo [2/3] Skipping PHP Server (not found)
)

echo Waiting 2 seconds...
timeout /t 2 /nobreak > nul

REM Start Dyad (Electron)
echo [3/3] Starting Dyad...
cd dyad
if not exist "node_modules" (
    echo Installing Dyad dependencies...
    call npm install --force --ignore-scripts
)
start "Dyad" cmd /k "npm start"
cd ..

echo.
echo ================================================================
echo [SUCCESS] All services started!
echo.
echo Services:
echo    - Memory Service: http://localhost:8002
if defined PHP_PATH (
    echo    - PHP Server:     http://localhost:8080
)
echo    - Dyad:           (Electron app)
echo.
echo To stop: Close all service windows
echo ================================================================
pause
