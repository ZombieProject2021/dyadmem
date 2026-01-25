@echo off
REM Russian version - save with Windows-1251 encoding if you see gibberish

echo ================================================================
echo.
echo          DYAD - ZAPUSK (Russian version)
echo.
echo ================================================================
echo.

echo [1/4] Proverka Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [OSHIBKA] Python ne nayden! Ustanovite Python 3.10+
    pause
    exit /b 1
)
echo [OK] Python nayden

echo.
echo [2/4] Proverka Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [OSHIBKA] Node.js ne nayden! Ustanovite Node.js 20+
    pause
    exit /b 1
)
echo [OK] Node.js nayden

echo.
echo [3/4] Ustanovka Python zavisimostey...
cd memory_service
if not exist "data" mkdir data
if not exist "logs" mkdir logs
pip install -q -r requirements.txt
cd ..
echo [OK] Zavisimosti ustanovleny

echo.
echo [4/4] Proverka Dyad zavisimostey...
cd dyad
if not exist "node_modules" (
    echo Ustanovka npm paketov...
    call npm install
)
cd ..
echo [OK] Gotovo

echo.
echo ================================================================
echo ZAPUSK SERVISOV...
echo ================================================================
echo.

echo [1/2] Zapusk Memory Service...
start "Memory Service" cmd /k "cd memory_service && python server.py"
timeout /t 5 /nobreak > nul

echo [2/2] Zapusk Dyad...
cd dyad
start "Dyad" cmd /k "npm start"
cd ..

echo.
echo ================================================================
echo [OK] VSE ZAPUSHCHENO!
echo.
echo Memory Service: http://localhost:8002
echo Dyad: otkroetsya avtomaticheski
echo.
echo Dlya ostanovki: zakroyte okna servisov
echo ================================================================
echo.
pause
