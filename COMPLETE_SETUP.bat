@echo off
title Best on Click - Complete Setup
color 0A

echo.
echo ========================================
echo    Best on Click - Complete Setup
echo ========================================
echo.

cd /d "d:\GP"

echo 🔍 Step 1: Checking file structure...
python check_files.py

echo.
echo 🔧 Step 2: Creating missing files...
python create_missing_files.py

echo.
echo 🧪 Step 3: Testing MIME configuration...
python diagnose_mime.py

echo.
echo 🚀 Step 4: Starting optimized server...
echo.
echo 💡 Server will be available at:
echo    - http://localhost:3000
echo    - http://192.168.1.116:3000
echo.
echo 🧪 Test pages:
echo    - http://localhost:3000/test-mime.html
echo    - http://localhost:3000/index.html
echo.
echo 📱 Main application:
echo    - http://localhost:3000/
echo.

python simple_server.py

pause