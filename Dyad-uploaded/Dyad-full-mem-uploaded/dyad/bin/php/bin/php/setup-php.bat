@echo off
REM Setup PHP Configuration Script
REM This script ensures PHP is properly configured for Dyad

echo ========================================
echo   PHP Configuration Setup for Dyad
echo ========================================
echo.

REM Get the directory where this script is located
set PHP_DIR=%~dp0
set PHP_INI=%PHP_DIR%php.ini

echo PHP Directory: %PHP_DIR%
echo PHP INI File: %PHP_INI%
echo.

REM Check if php.ini exists
if not exist "%PHP_INI%" (
    echo [ERROR] php.ini not found!
    echo Copying from php.ini-development...
    copy "%PHP_DIR%php.ini-development" "%PHP_INI%"
)

echo [1/4] Checking PHP configuration...

REM Check if extension_dir is set correctly
findstr /C:"extension_dir" "%PHP_INI%" | findstr /C:"E:\vertrigo" >nul
if %errorlevel% equ 0 (
    echo [WARNING] Found old Vertrigo paths in php.ini
    echo [FIXING] Updating extension_dir to relative path...
    
    REM Create a temporary file with corrected paths
    powershell -Command "(Get-Content '%PHP_INI%') -replace 'extension_dir=\"E:\\\\vertrigo\\\\php\\\\ext\"', 'extension_dir = \"ext\"' | Set-Content '%PHP_INI%.tmp'"
    move /Y "%PHP_INI%.tmp" "%PHP_INI%" >nul
    echo [OK] extension_dir fixed
) else (
    echo [OK] extension_dir is correct
)

REM Remove old include_path if exists
findstr /C:"include_path" "%PHP_INI%" | findstr /C:"E:\vertrigo" >nul
if %errorlevel% equ 0 (
    echo [FIXING] Removing old include_path...
    powershell -Command "(Get-Content '%PHP_INI%') -replace 'include_path=\".;E:\\\\vertrigo\\\\Smarty\"', ';include_path = \".\"' | Set-Content '%PHP_INI%.tmp'"
    move /Y "%PHP_INI%.tmp" "%PHP_INI%" >nul
    echo [OK] include_path removed
)

REM Comment out xdebug if it has wrong path
findstr /C:"zend_extension" "%PHP_INI%" | findstr /C:"E:\vertrigo" >nul
if %errorlevel% equ 0 (
    echo [FIXING] Commenting out old xdebug path...
    powershell -Command "(Get-Content '%PHP_INI%') -replace 'zend_extension=\"E:\\\\vertrigo\\\\php\\\\ext\\\\php_xdebug-2.6.1-7.1-vc14.dll\"', ';zend_extension = \"ext/php_xdebug-2.6.1-7.1-vc14.dll\"' | Set-Content '%PHP_INI%.tmp'"
    move /Y "%PHP_INI%.tmp" "%PHP_INI%" >nul
    echo [OK] xdebug path fixed
)

echo.
echo [2/4] Testing PHP executable...
"%PHP_DIR%php.exe" -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] PHP executable test failed!
    echo Please check if all DLL files are present.
    pause
    exit /b 1
) else (
    echo [OK] PHP executable works
)

echo.
echo [3/4] Checking PHP extensions...
"%PHP_DIR%php.exe" -m | findstr /C:"mysqli" >nul
if %errorlevel% neq 0 (
    echo [WARNING] mysqli extension not loaded
) else (
    echo [OK] mysqli extension loaded
)

"%PHP_DIR%php.exe" -m | findstr /C:"pdo_mysql" >nul
if %errorlevel% neq 0 (
    echo [WARNING] pdo_mysql extension not loaded
) else (
    echo [OK] pdo_mysql extension loaded
)

echo.
echo [4/4] Configuration summary:
"%PHP_DIR%php.exe" -i | findstr /C:"extension_dir"
echo.

echo ========================================
echo   PHP Configuration Complete!
echo ========================================
echo.
echo You can now use PHP with Dyad.
echo.
echo To test PHP manually:
echo   cd bin\php
echo   php.exe -v
echo.

pause
