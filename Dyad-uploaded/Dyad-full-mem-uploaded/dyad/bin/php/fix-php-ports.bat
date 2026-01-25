@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   PHP Port Fixer for Dyad
echo ========================================
echo.
echo Этот скрипт поможет заменить неправильные пути к PHP 
echo на корректный URL http://localhost:8000
echo.

set /p TARGET_FILE="Введите путь к файлу, который нужно исправить (например, src/pages/Index.tsx): "

if not exist "%TARGET_FILE%" (
    echo [ERROR] Файл не найден!
    pause
    exit /b 1
)

echo Исправление файла %TARGET_FILE%...

REM Используем PowerShell для замены путей
powershell -Command "(Get-Content '%TARGET_FILE%') -replace 'http://localhost:\d+/hello.php', 'http://localhost:8000/hello.php' -replace 'fetch\(\''/hello.php\''\)', 'fetch(''http://localhost:8000/hello.php'')' | Set-Content '%TARGET_FILE%'"

echo [OK] Файл обновлен. Попробуйте перезапустить приложение.
echo.
pause
