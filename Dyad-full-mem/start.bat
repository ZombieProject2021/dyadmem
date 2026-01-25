@echo off
chcp 65001 > nul
color 0A
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║          DYAD WITH INFINITE MEMORY - STARTING                 ║
echo ║                                                               ║
echo ║   Dyad AI App Builder + EverMemOS Memory System               ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

REM Check if Python is installed
echo [1/4] Проверка Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python не найден! Установите Python 3.10 или выше.
    echo    Скачать: https://www.python.org/downloads/
    pause
    exit /b 1
)
echo ✅ Python найден

REM Check if Node.js is installed
echo.
echo [2/4] Проверка Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js не найден! Установите Node.js 20.x или выше.
    echo    Скачать: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js найден

REM Install Python dependencies if needed
echo.
echo [3/4] Проверка зависимостей Python...
if not exist "memory_service\requirements.txt" (
    echo ❌ Файл requirements.txt не найден!
    pause
    exit /b 1
)

cd memory_service
if not exist "data" mkdir data
if not exist "logs" mkdir logs

echo Установка зависимостей Python...
pip install -q -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Ошибка установки зависимостей Python
    cd ..
    pause
    exit /b 1
)
echo ✅ Зависимости Python установлены
cd ..

REM Check Dyad dependencies
echo.
echo [4/4] Проверка зависимостей Dyad...
cd dyad
if not exist "node_modules" (
    echo Установка зависимостей Dyad (это может занять несколько минут)...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Ошибка установки зависимостей Dyad
        cd ..
        pause
        exit /b 1
    )
)
echo ✅ Зависимости Dyad готовы
cd ..

echo.
echo ═══════════════════════════════════════════════════════════════
echo.
echo 🚀 ЗАПУСК СЕРВИСОВ...
echo.
echo ═══════════════════════════════════════════════════════════════
echo.

REM Start Memory Service in a new window
echo [1/2] Запуск Memory Service на порту 8002...
start "Memory Service" cmd /k "cd memory_service && python server.py"

REM Wait a bit for Memory Service to start
echo Ожидание запуска Memory Service (5 секунд)...
timeout /t 5 /nobreak > nul

REM Check if Memory Service is running
curl -s http://localhost:8002/health > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Memory Service запущен успешно!
) else (
    echo ⚠️  Memory Service может быть еще не запущен, проверьте окно сервиса
)

echo.
echo [2/2] Запуск Dyad...
echo.

REM Start Dyad
cd dyad
start "Dyad Application" cmd /k "npm start"
cd ..

echo.
echo ═══════════════════════════════════════════════════════════════
echo.
echo ✅ ВСЕ СЕРВИСЫ ЗАПУЩЕНЫ!
echo.
echo 📊 Статус:
echo    • Memory Service: http://localhost:8002
echo    • Dyad: Откроется автоматически
echo.
echo 💡 Подсказки:
echo    • Все чаты автоматически сохраняются в долговременную память
echo    • Для остановки закройте окна Memory Service и Dyad
echo    • Логи Memory Service: memory_service/logs/
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
echo Нажмите любую клавишу для выхода...
pause > nul