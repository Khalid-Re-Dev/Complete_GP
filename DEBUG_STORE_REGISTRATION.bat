@echo off
title Best on Click - DEBUG STORE REGISTRATION
color 0E

echo.
echo ========================================
echo   DEBUG STORE REGISTRATION FLOW
echo   Enhanced Debugging + Problem Solving
echo ========================================
echo.

cd /d "d:\GP"

echo 🔧 DEBUG FEATURES ENABLED:
echo    🐛 Router debugging with detailed logs
echo    🐛 Store check debugging with step tracking
echo    🐛 Behavior tracking temporarily disabled
echo    🐛 Enhanced error messages and logging
echo.
echo 📋 TESTING STEPS:
echo.
echo    1️⃣ REGISTER NEW STORE OWNER:
echo       - Go to http://localhost:3000/register
echo       - Fill form with store_owner role
echo       - Submit and watch console logs
echo.
echo    2️⃣ WATCH CONSOLE LOGS:
echo       - 🏪 Store owner registered, checking for existing store...
echo       - 🔍 Checking store for user: [username]
echo       - 🔑 Token available: true/false
echo       - 📡 Checking for existing store via API...
echo       - 📊 API Response status: [status]
echo       - 🆕 No store found (404), redirecting to application
echo.
echo    3️⃣ VERIFY ROUTER BEHAVIOR:
echo       - 🔄 Loading route: /store/apply
echo       - 📄 Route handler result: [DOM element]
echo       - 🔍 Element type: object
echo       - 🏷️ Node type: 1
echo       - ✅ Valid DOM element, appending to container
echo.
echo    4️⃣ CHECK STORE APPLICATION:
echo       - Page should load properly
echo       - Form should be functional
echo       - No "Route handler returned invalid element" errors
echo.
echo 🎯 EXPECTED BEHAVIOR:
echo    ✅ Registration completes successfully
echo    ✅ User is auto-logged in
echo    ✅ System checks for existing store
echo    ✅ Redirects to /store/apply (new user)
echo    ✅ Store application page loads properly
echo    ✅ No console errors or warnings
echo.
echo 🚨 COMMON ISSUES TO WATCH FOR:
echo    ❌ "Route handler returned invalid element"
echo    ❌ "No token available for store check"
echo    ❌ "API Error fetching /user-behavior/log/"
echo    ❌ Multiple initialization calls
echo.
echo 🔍 DEBUGGING COMMANDS:
echo    - Open browser console (F12)
echo    - Watch for colored debug messages
echo    - Check Network tab for API calls
echo    - Verify localStorage for tokens
echo.
echo 🌐 STARTING SERVER WITH DEBUG MODE...
echo    Platform will be available at: http://localhost:3000
echo    Registration page: http://localhost:3000/register
echo.

python simple_server.py

pause