@echo off
REM Script to run PHP built-in web server for Dyad
set PHP_DIR=%~dp0
set PROJECT_ROOT=%PHP_DIR%..\..
set PORT=8000

echo ========================================
echo   PHP Built-in Server for Dyad
echo ========================================
echo.
echo PHP Directory: %PHP_DIR%
echo Project Root: %PROJECT_ROOT%
echo Port: %PORT%
echo.

REM Check if PHP exists
if not exist "%PHP_DIR%php.exe" (
    echo [ERROR] PHP executable not found!
    pause
    exit /b 1
)

echo Starting PHP server at http://localhost:%PORT%
echo Press Ctrl+C to stop the server.
echo.

REM Start PHP server
REM We use the project root as the document root so all PHP files are accessible
"%PHP_DIR%php.exe" -S localhost:%PORT% -t "%PROJECT_ROOT%" -c "%PHP_DIR%php.ini"

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] PHP server failed to start.
    echo Port %PORT% might be already in use.
    pause
)
