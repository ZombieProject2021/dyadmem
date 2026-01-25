@echo off
REM Quick Test Script for PHP and MySQL
REM Tests PHP configuration and optionally MySQL connection

set PHP_DIR=%~dp0

echo ========================================
echo   Quick PHP and MySQL Test
echo ========================================
echo.

REM Test 1: PHP Configuration
echo Running PHP configuration test...
echo.
"%PHP_DIR%php.exe" "%PHP_DIR%test-config.php"
set CONFIG_RESULT=%errorlevel%
echo.

if %CONFIG_RESULT% neq 0 (
    echo [ERROR] PHP configuration test failed!
    echo Run setup-php.bat to fix configuration issues.
    echo.
    pause
    exit /b 1
)

echo ========================================
echo   PHP Configuration: OK
echo ========================================
echo.

REM Test 2: MySQL Connection (optional)
echo.
echo Do you want to test MySQL connection? (Y/N)
set /p TEST_MYSQL="> "

if /i "%TEST_MYSQL%"=="Y" (
    echo.
    echo Enter MySQL connection details:
    echo.
    
    set /p MYSQL_HOST="Host (default: localhost): "
    if "%MYSQL_HOST%"=="" set MYSQL_HOST=localhost
    
    set /p MYSQL_USER="User (default: root): "
    if "%MYSQL_USER%"=="" set MYSQL_USER=root
    
    set /p MYSQL_PASS="Password: "
    
    set /p MYSQL_DB="Database (optional): "
    
    set /p MYSQL_PORT="Port (default: 3306): "
    if "%MYSQL_PORT%"=="" set MYSQL_PORT=3306
    
    echo.
    echo Testing MySQL connection...
    echo.
    
    "%PHP_DIR%php.exe" "%PHP_DIR%test-mysql.php" "%MYSQL_HOST%" "%MYSQL_USER%" "%MYSQL_PASS%" "%MYSQL_DB%" "%MYSQL_PORT%"
    set MYSQL_RESULT=%errorlevel%
    
    if %MYSQL_RESULT% neq 0 (
        echo.
        echo [ERROR] MySQL connection test failed!
        echo Please check your MySQL server and credentials.
        echo.
        pause
        exit /b 1
    )
    
    echo.
    echo ========================================
    echo   MySQL Connection: OK
    echo ========================================
)

echo.
echo ========================================
echo   All Tests Passed!
echo ========================================
echo.
echo Your PHP and MySQL setup is ready to use with Dyad.
echo.
pause
