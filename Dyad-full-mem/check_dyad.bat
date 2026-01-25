@echo off
echo ================================================================
echo   Checking Dyad Installation
echo ================================================================
echo.

cd dyad

echo Checking if critical packages are installed...
echo.

if exist "node_modules\electron" (
    echo [OK] Electron found
) else (
    echo [ERROR] Electron NOT found!
    goto :error
)

if exist "node_modules\react" (
    echo [OK] React found
) else (
    echo [ERROR] React NOT found!
    goto :error
)

if exist "node_modules\@electron-forge" (
    echo [OK] Electron Forge found
) else (
    echo [ERROR] Electron Forge NOT found!
    goto :error
)

if exist "node_modules\next" (
    echo [OK] Next.js found
) else (
    echo [WARN] Next.js not found (may not be critical)
)

echo.
echo ================================================================
echo [SUCCESS] Critical packages are installed!
echo.
echo ripgrep failed (403 error) but it's OPTIONAL.
echo Dyad should work without it.
echo.
echo Try running: npm start
echo ================================================================
pause
exit /b 0

:error
echo.
echo ================================================================
echo [ERROR] Some critical packages missing!
echo.
echo Try running:
echo   npm install --force --no-optional
echo ================================================================
pause
exit /b 1
