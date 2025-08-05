@echo off
echo ========================================
echo    Best on Click - MIME Types Fix
echo ========================================
echo.

echo 🔧 Step 1: Installing Python requirements...
cd /d "d:\GP"
pip install requests

echo 🔍 Step 2: Running diagnosis...
python diagnose_mime.py

echo 🚀 Step 3: Restarting Django server...
cd /d "d:\GP\bestinclickbackend"
call venv\Scripts\activate.bat

echo 📦 Installing requirements...
pip install -r requirements.txt
pip install -r requirements_stores.txt

echo 🗄️ Applying migrations...
python manage.py migrate

echo 🌐 Starting server with MIME type fixes...
echo.
echo 💡 Server will start on: http://192.168.1.116:8000
echo 💡 Test page available at: http://192.168.1.116:3000/test-mime.html
echo.
echo Press Ctrl+C to stop the server
echo.

python manage.py runserver 0.0.0.0:8000

pause