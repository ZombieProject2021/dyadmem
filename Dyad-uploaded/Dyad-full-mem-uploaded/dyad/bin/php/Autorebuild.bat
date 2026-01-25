@echo off
setlocal enabledelayedexpansion

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

echo ========================================
echo   Dyad PHP + MySQL Auto-Setup
echo ========================================
echo.

REM Проверка PHP
if exist "bin\php\php.exe" (
    echo [OK] PHP найден.
    
    REM Проверка php.ini
    findstr /C:"E:\vertrigo" "bin\php\php.ini" >nul
    if !errorlevel! equ 0 (
        echo [!] Исправление путей в php.ini...
        call "bin\php\setup-php.bat"
    )
    
    REM Запуск PHP сервера в фоне (порт 8000)
    REM Используем %SCRIPT_DIR% как Document Root
    echo Запуск PHP сервера на порту 8000...
    start /b "" "bin\php\php.exe" -S localhost:8000 -t "%SCRIPT_DIR%" -c "bin\php\php.ini" > nul 2>&1
    echo [OK] PHP сервер запущен.
) else (
    echo [ERROR] PHP не найден в bin\php\
    pause
    exit /b 1
)

echo.
echo Запуск основного приложения (Vite)...
echo [INFO] Все запросы к *.php будут проксироваться на порт 8000.
echo.

REM Запуск Vite
npm run start:watch
