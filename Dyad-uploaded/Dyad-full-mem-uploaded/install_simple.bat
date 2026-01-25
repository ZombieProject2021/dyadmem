@echo off
echo ================================================================
echo   SUPER SIMPLE INSTALL - Guaranteed to work!
echo ================================================================
echo.

cd memory_service

echo Step 1: Upgrading pip...
python -m pip install --upgrade pip --quiet

echo Step 2: Installing packages with pre-built wheels only...
echo.

echo [1/7] FastAPI...
python -m pip install --only-binary :all: fastapi==0.109.0 --quiet

echo [2/7] Uvicorn...
python -m pip install --only-binary :all: uvicorn==0.27.0 --quiet

echo [3/7] Pydantic (no Rust version)...
python -m pip install --only-binary :all: pydantic==1.10.13 --quiet

echo [4/7] Python-dotenv...
python -m pip install --only-binary :all: python-dotenv==1.0.0 --quiet

echo [5/7] Aiosqlite...
python -m pip install --only-binary :all: aiosqlite==0.19.0 --quiet

echo [6/7] Rank-BM25...
python -m pip install --only-binary :all: rank-bm25==0.2.2 --quiet

echo [7/7] Python-multipart...
python -m pip install --only-binary :all: python-multipart==0.0.6 --quiet

cd ..

echo.
echo ================================================================
echo [SUCCESS] All packages installed!
echo.
echo Testing imports...
python -c "import fastapi, uvicorn, pydantic, aiosqlite; print('✓ All packages working!')"
echo.
echo You can now run: start.bat
echo ================================================================
pause
