@echo off
echo ========================================
echo    Best on Click - Development Server
echo ========================================
echo.

cd /d "d:\GP\bestinclickbackend"

echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

echo 📦 Installing store requirements...
pip install -r requirements_stores.txt

echo 🗄️ Applying migrations...
python manage.py makemigrations
python manage.py migrate

echo 🏪 Creating store analytics...
python manage.py update_store_analytics

echo 🚀 Starting development server with analytics...
python run_with_analytics.py runserver 0.0.0.0:8000

pause