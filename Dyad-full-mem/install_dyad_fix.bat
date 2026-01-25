@echo off
echo ================================================================
echo   Installing Dyad - Ignoring Optional Dependencies
echo ================================================================
echo.
echo Note: ripgrep failed to download (GitHub API limit)
echo This is OK - Dyad will work without it.
echo.

cd dyad

echo Installing with --no-optional flag...
echo This will take 5-10 minutes...
echo.

call npm install --no-optional --legacy-peer-deps

if %errorlevel% neq 0 (
    echo.
    echo Still failed. Trying with --force...
    call npm install --force --no-optional
)

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Installation failed!
    echo.
    echo Try:
    echo   cd dyad
    echo   npm install --no-optional --legacy-peer-deps
    pause
    exit /b 1
)

echo.
echo ================================================================
echo [SUCCESS] Dyad installed!
echo.
echo Note: Some optional packages may be missing (ripgrep)
echo but Dyad should work fine.
echo.
echo Run: start.bat
echo ================================================================
pause
