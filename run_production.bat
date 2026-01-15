@echo off
echo ========================================
echo    Best on Click - Production Server
echo ========================================
echo.

cd /d "d:\GP\bestinclickbackend"

echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

echo 📦 Installing requirements...
pip install -r requirements.txt
pip install -r requirements_stores.txt

echo 🗄️ Applying migrations...
python manage.py migrate --no-input

echo 📊 Collecting static files...
python manage.py collectstatic --no-input

echo 🏪 Updating store analytics...
python manage.py update_store_analytics

echo 🔔 Creating notifications...
python manage.py create_automated_notifications

echo 🚀 Starting production server...
python manage.py runserver 0.0.0.0:8000

pause