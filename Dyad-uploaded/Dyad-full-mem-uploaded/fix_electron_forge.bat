@echo off
echo ================================================================
echo   Fixing Electron Forge Installation
echo ================================================================
echo.

cd dyad

echo Installing @electron-forge packages...
echo This may take 2-3 minutes...
echo.

call npm install @electron-forge/cli@latest --save-dev --ignore-scripts
call npm install @electron-forge/core@latest --save-dev --ignore-scripts
call npm install @electron-forge/plugin-webpack@latest --save-dev --ignore-scripts

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to install Electron Forge!
    echo.
    echo Try manually:
    echo   cd dyad
    echo   npm install --force
    pause
    exit /b 1
)

echo.
echo ================================================================
echo [SUCCESS] Electron Forge installed!
echo.
echo Now try: npm start
echo ================================================================
pause
