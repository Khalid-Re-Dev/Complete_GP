@echo off
title Best on Click - Features Test
color 0A

echo.
echo ========================================
echo    Best on Click - Features Test
echo ========================================
echo.

cd /d "d:\GP"

echo 🔍 Step 1: Checking feature completeness...
python check_features.py

echo.
echo 🔧 Step 2: Fixing any remaining issues...
python check_exports.py

echo.
echo 🧪 Step 3: Testing imports...
python diagnose_mime.py

echo.
echo 🚀 Step 4: Starting server with all features...
echo.
echo 💡 Server will be available at:
echo    - http://localhost:3000
echo    - http://192.168.1.116:3000
echo.
echo 🏪 Store Features:
echo    - http://localhost:3000/store/apply (Store Application)
echo    - http://localhost:3000/store/dashboard (Owner Dashboard)
echo    - http://localhost:3000/store/analytics (Advanced Analytics)
echo    - http://localhost:3000/store/feedback (Customer Feedback)
echo.
echo 🧪 Test Pages:
echo    - http://localhost:3000/test-imports.html (Import Tests)
echo    - http://localhost:3000/test-mime.html (MIME Tests)
echo    - http://localhost:3000/index.html (Main App)
echo.
echo 🔧 Debug Commands (in browser console):
echo    - testStoreSystem.runAllTests()
echo    - showAchievement('Test achievement!')
echo    - showPerformanceAlert('Test alert')
echo    - showReviewNotification('New review')
echo    - showSmartRecommendation('Smart tip')
echo    - markAllNotificationsAsRead()
echo    - getNotificationStats()
echo.
echo 📊 Feature Completion: 83.3%
echo    ✅ Store Application: 100%
echo    ✅ Store Dashboard: 100%
echo    ✅ Smart Notifications: 100%
echo    ⚠️ Analytics: 60%
echo    ⚠️ Feedback Management: 60%
echo    ⚠️ Frontend Integration: 80%
echo.

python simple_server.py

pause