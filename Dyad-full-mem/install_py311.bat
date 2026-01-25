@echo off
echo ================================================================
echo   Installing with Python 3.11 (py launcher)
echo ================================================================
echo.

REM Check if Python 3.11 is available
py -3.11 --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python 3.11 not found!
    echo.
    echo Please install Python 3.11 from:
    echo https://www.python.org/downloads/release/python-3119/
    echo.
    pause
    exit /b 1
)

echo Using Python 3.11...
py -3.11 --version

cd memory_service

echo.
echo Installing packages with Python 3.11...
echo.

echo [1/7] FastAPI...
py -3.11 -m pip install --only-binary :all: fastapi==0.109.0 --quiet

echo [2/7] Uvicorn...
py -3.11 -m pip install --only-binary :all: uvicorn==0.27.0 --quiet

echo [3/7] Pydantic v1 (no Rust)...
py -3.11 -m pip install --only-binary :all: pydantic==1.10.13 --quiet

echo [4/7] Python-dotenv...
py -3.11 -m pip install --only-binary :all: python-dotenv==1.0.0 --quiet

echo [5/7] Aiosqlite...
py -3.11 -m pip install --only-binary :all: aiosqlite==0.19.0 --quiet

echo [6/7] Rank-BM25...
py -3.11 -m pip install --only-binary :all: rank-bm25==0.2.2 --quiet

echo [7/7] Python-multipart...
py -3.11 -m pip install --only-binary :all: python-multipart==0.0.6 --quiet

cd ..

echo.
echo ================================================================
echo [SUCCESS] Packages installed with Python 3.11!
echo.
echo Testing...
py -3.11 -c "import fastapi, uvicorn, pydantic; print(f'OK! Pydantic {pydantic.__version__}')"
echo.
echo Now run: start_py311.bat
echo ================================================================
pause
