@echo off
echo ================================================================
echo   Installing Dyad Dependencies
echo ================================================================
echo.

cd dyad

echo Checking if node_modules exists...
if exist "node_modules" (
    echo node_modules folder exists, but packages may be incomplete.
    echo.
    choice /C YN /M "Do you want to reinstall? (Y/N)"
    if errorlevel 2 goto :skip_install
)

echo.
echo Installing Dyad dependencies...
echo This will take 5-10 minutes - please wait...
echo.

call npm install

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to install dependencies!
    echo.
    echo Try manually:
    echo   cd dyad
    echo   npm install
    pause
    exit /b 1
)

:skip_install
echo.
echo ================================================================
echo [SUCCESS] Dyad dependencies installed!
echo.
echo You can now run: start.bat
echo ================================================================
pause
