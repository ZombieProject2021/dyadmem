@echo off
echo ================================================================
echo   ALTERNATIVE INSTALL - No Rust/Compilation Required
echo ================================================================
echo.

echo Installing minimal Python dependencies...
echo This version avoids packages that require compilation.
echo.

cd memory_service

REM Upgrade pip and wheel
python -m pip install --upgrade pip wheel

REM Install core packages one by one
echo [1/7] Installing FastAPI...
pip install fastapi==0.110.1

echo [2/7] Installing Uvicorn...
pip install uvicorn==0.25.0

echo [3/7] Installing Pydantic (old version - no Rust)...
pip install pydantic==2.4.2

echo [4/7] Installing python-dotenv...
pip install python-dotenv==1.0.1

echo [5/7] Installing aiosqlite...
pip install aiosqlite==0.19.0

echo [6/7] Installing rank-bm25...
pip install rank-bm25==0.2.2

echo [7/7] Installing python-multipart...
pip install python-multipart==0.0.9

cd ..

echo.
echo ================================================================
echo [SUCCESS] Minimal dependencies installed!
echo.
echo You can now run: start.bat
echo ================================================================
pause
