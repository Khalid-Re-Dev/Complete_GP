#!/usr/bin/env python3
"""
MIME Type Diagnosis Script for Best on Click
This script helps diagnose MIME type issues with static files.
"""

import os
import sys
import mimetypes
import requests
from pathlib import Path

def check_system_mime_types():
    """Check system MIME type configuration."""
    print("🔍 System MIME Types Check")
    print("=" * 40)
    
    # Check common file types
    test_files = [
        ('.js', 'application/javascript'),
        ('.mjs', 'application/javascript'),
        ('.css', 'text/css'),
        ('.json', 'application/json'),
        ('.svg', 'image/svg+xml'),
    ]
    
    for ext, expected in test_files:
        actual, encoding = mimetypes.guess_type(f"test{ext}")
        status = "✅" if actual == expected else "❌"
        print(f"{status} {ext}: {actual} (expected: {expected})")
    
    print()

def check_file_existence():
    """Check if JavaScript files exist."""
    print("📁 File Existence Check")
    print("=" * 40)
    
    base_path = Path(__file__).parent / "public"
    js_files = [
        "js/services/auth.js",
        "js/services/store.js", 
        "js/utils/toast.js",
        "js/pages/store-application.js",
        "js/components/Navbar.js",
        "js/router.js",
        "js/main.js"
    ]
    
    for js_file in js_files:
        file_path = base_path / js_file
        exists = file_path.exists()
        status = "✅" if exists else "❌"
        size = file_path.stat().st_size if exists else 0
        print(f"{status} {js_file}: {size} bytes")
    
    print()

def test_server_response(base_url="http://192.168.1.116:3000"):
    """Test server responses for JavaScript files."""
    print(f"🌐 Server Response Check ({base_url})")
    print("=" * 40)
    
    js_files = [
        "js/services/auth.js",
        "js/services/store.js",
        "js/utils/toast.js"
    ]
    
    for js_file in js_files:
        url = f"{base_url}/{js_file}"
        try:
            response = requests.get(url, timeout=5)
            content_type = response.headers.get('content-type', 'Not set')
            status_code = response.status_code
            
            if status_code == 200:
                if 'javascript' in content_type.lower():
                    print(f"✅ {js_file}: {status_code} - {content_type}")
                else:
                    print(f"❌ {js_file}: {status_code} - Wrong MIME type: {content_type}")
            else:
                print(f"❌ {js_file}: {status_code} - {response.reason}")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ {js_file}: Connection error - {e}")
    
    print()

def check_django_settings():
    """Check Django settings for MIME types."""
    print("⚙️ Django Settings Check")
    print("=" * 40)
    
    try:
        # Add Django project to path
        sys.path.append(str(Path(__file__).parent / "bestinclickbackend"))
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'best_on_click.settings')
        
        import django
        django.setup()
        
        from django.conf import settings
        
        # Check middleware
        middleware = getattr(settings, 'MIDDLEWARE', [])
        mime_middleware = any('MimeType' in m for m in middleware)
        cors_middleware = any('cors' in m.lower() for m in middleware)
        
        print(f"✅ MIME Type Middleware: {'Found' if mime_middleware else 'Not found'}")
        print(f"✅ CORS Middleware: {'Found' if cors_middleware else 'Not found'}")
        
        # Check CORS settings
        cors_origins = getattr(settings, 'CORS_ALLOWED_ORIGINS', [])
        cors_all = getattr(settings, 'CORS_ALLOW_ALL_ORIGINS', False)
        
        print(f"✅ CORS Allow All: {cors_all}")
        print(f"✅ CORS Origins: {len(cors_origins)} configured")
        
        # Check static files settings
        static_url = getattr(settings, 'STATIC_URL', '')
        static_root = getattr(settings, 'STATIC_ROOT', '')
        
        print(f"✅ Static URL: {static_url}")
        print(f"✅ Static Root: {static_root}")
        
    except Exception as e:
        print(f"❌ Django check failed: {e}")
    
    print()

def generate_fix_suggestions():
    """Generate suggestions to fix MIME type issues."""
    print("💡 Fix Suggestions")
    print("=" * 40)
    
    suggestions = [
        "1. Restart the Django development server",
        "2. Clear browser cache (Ctrl+F5 or Cmd+Shift+R)",
        "3. Check if middleware is properly configured",
        "4. Verify file paths are correct",
        "5. Test with different browser",
        "6. Check network/firewall settings",
        "7. Use browser developer tools to inspect requests",
        "8. Try accessing files directly in browser"
    ]
    
    for suggestion in suggestions:
        print(f"   {suggestion}")
    
    print()
    print("🔧 Quick Commands:")
    print("   - Test MIME page: http://192.168.1.116:3000/test-mime.html")
    print("   - Health check: http://192.168.1.116:8000/health/")
    print("   - Direct JS test: http://192.168.1.116:3000/js/services/auth.js")

def main():
    """Main diagnosis function."""
    print("🩺 Best on Click - MIME Type Diagnosis")
    print("=" * 50)
    print()
    
    check_system_mime_types()
    check_file_existence()
    test_server_response()
    check_django_settings()
    generate_fix_suggestions()
    
    print("✅ Diagnosis complete!")

if __name__ == "__main__":
    main()