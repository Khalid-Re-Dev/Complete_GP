@echo off
echo ========================================
echo    Best on Click - Store System Tests
echo ========================================
echo.

cd /d "d:\GP\bestinclickbackend"

echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

echo 🧪 Running Django tests...
python manage.py test stores --verbosity=2

echo 📊 Testing analytics updates...
python manage.py update_store_analytics --force

echo 🔔 Testing notification creation...
python manage.py create_automated_notifications

echo ✅ All tests completed!
echo.
echo 💡 To test frontend features:
echo    1. Start the development server: run_development.bat
echo    2. Open browser to http://localhost:8000
echo    3. Open browser console and run: testStoreSystem.runAllTests()
echo.

pause