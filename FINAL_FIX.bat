@echo off
title Best on Click - Final Import Fix
color 0A

echo.
echo ========================================
echo    Best on Click - Final Import Fix
echo ========================================
echo.

cd /d "d:\GP"

echo 🔍 Step 1: Checking file structure...
python check_files.py

echo.
echo 🔧 Step 2: Creating missing files...
python create_missing_files.py

echo.
echo 📋 Step 3: Checking JavaScript exports...
python check_exports.py

echo.
echo 🧪 Step 4: Testing MIME configuration...
python diagnose_mime.py

echo.
echo 🚀 Step 5: Starting server with all fixes...
echo.
echo 💡 Server will be available at:
echo    - http://localhost:3000
echo    - http://192.168.1.116:3000
echo.
echo 🧪 Test pages:
echo    - http://localhost:3000/test-mime.html (MIME types)
echo    - http://localhost:3000/test-imports.html (Import tests)
echo    - http://localhost:3000/index.html (Main app)
echo.
echo 📱 Store system:
echo    - http://localhost:3000/store/apply
echo    - http://localhost:3000/store/dashboard
echo.
echo 🔧 Debug in browser console:
echo    - testStoreSystem.runAllTests()
echo    - authService.mockLogin('customer')
echo    - showSuccess('Test message')
echo.

python simple_server.py

pause