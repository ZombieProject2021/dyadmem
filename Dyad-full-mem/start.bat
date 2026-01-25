@echo off
color 0A
echo.
echo ================================================================
echo.
echo          DYAD WITH INFINITE MEMORY - STARTING
echo.
echo   Dyad AI App Builder + EverMemOS Memory System
echo.
echo ================================================================
echo.

REM Check if Python is installed
echo [1/4] Checking Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found! Please install Python 3.10+
    echo         Download: https://www.python.org/downloads/
    pause
    exit /b 1
)
echo [OK] Python found

REM Check if Node.js is installed
echo.
echo [2/4] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found! Please install Node.js 20+
    echo         Download: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js found

REM Install Python dependencies if needed
echo.
echo [3/4] Checking Python dependencies...
if not exist "memory_service\requirements.txt" (
    echo [ERROR] requirements.txt not found!
    pause
    exit /b 1
)

cd memory_service
if not exist "data" mkdir data
if not exist "logs" mkdir logs

echo Installing Python dependencies...
pip install --upgrade pip wheel
pip install -q fastapi==0.110.1 uvicorn==0.25.0 pydantic==2.4.2 python-dotenv==1.0.1 aiosqlite==0.19.0 rank-bm25==0.2.2 python-multipart==0.0.9
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install Python dependencies
    cd ..
    pause
    exit /b 1
)
echo [OK] Python dependencies installed
cd ..

REM Check Dyad dependencies
echo.
echo [4/4] Checking Dyad dependencies...
cd dyad
if not exist "node_modules" (
    echo Installing Dyad dependencies (this may take a few minutes)...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install Dyad dependencies
        cd ..
        pause
        exit /b 1
    )
)
echo [OK] Dyad dependencies ready
cd ..

echo.
echo ================================================================
echo.
echo STARTING SERVICES...
echo.
echo ================================================================
echo.

REM Start Memory Service in a new window
echo [1/2] Starting Memory Service on port 8002...
start "Memory Service" cmd /k "cd memory_service && python server.py"

REM Wait a bit for Memory Service to start
echo Waiting for Memory Service to start (5 seconds)...
timeout /t 5 /nobreak > nul

REM Check if Memory Service is running
curl -s http://localhost:8002/health > nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Memory Service started successfully!
) else (
    echo [WARN] Memory Service may still be starting, check the service window
)

echo.
echo [2/2] Starting Dyad...
echo.

REM Start Dyad
cd dyad
start "Dyad Application" cmd /k "npm start"
cd ..

echo.
echo ================================================================
echo.
echo [SUCCESS] ALL SERVICES STARTED!
echo.
echo Status:
echo    - Memory Service: http://localhost:8002
echo    - Dyad: Will open automatically
echo.
echo Tips:
echo    - All chats are automatically saved to long-term memory
echo    - To stop: close Memory Service and Dyad windows
echo    - Memory Service logs: memory_service/logs/
echo.
echo ================================================================
echo.
echo Press any key to exit...
pause > nul
