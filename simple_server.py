#!/usr/bin/env python3
"""
Simple HTTP Server with correct MIME types for Best on Click
This server ensures JavaScript modules load with correct MIME types.
"""

import os
import sys
import time
import mimetypes
import socketserver
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import unquote
import threading
import webbrowser
from pathlib import Path

class MimeFixHTTPRequestHandler(SimpleHTTPRequestHandler):
    """Custom HTTP request handler with correct MIME types."""
    
    def __init__(self, *args, **kwargs):
        # Set up MIME types
        mimetypes.add_type('application/javascript', '.js')
        mimetypes.add_type('application/javascript', '.mjs')
        mimetypes.add_type('text/css', '.css')
        mimetypes.add_type('application/json', '.json')
        mimetypes.add_type('image/svg+xml', '.svg')
        super().__init__(*args, **kwargs)
    
    def end_headers(self):
        """Add CORS and security headers."""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 
                        'Accept, Accept-Encoding, Authorization, Content-Type, DNT, Origin, User-Agent, X-CSRFToken, X-Requested-With')
        self.send_header('Access-Control-Allow-Credentials', 'true')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'SAMEORIGIN')
        self.send_header('X-XSS-Protection', '1; mode=block')
        super().end_headers()
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests."""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers',
                        'Accept, Accept-Encoding, Authorization, Content-Type, DNT, Origin, User-Agent, X-CSRFToken, X-Requested-With')
        self.send_header('Access-Control-Max-Age', '86400')
        self.send_header('Content-Length', '0')
        self.end_headers()
    
    def guess_type(self, path):
        """Override guess_type to ensure correct MIME types."""
        mimetype, encoding = super().guess_type(path)
        
        # Force correct MIME types for JavaScript
        if path.endswith('.js') or path.endswith('.mjs'):
            mimetype = 'application/javascript'
        elif path.endswith('.css'):
            mimetype = 'text/css'
        elif path.endswith('.json'):
            mimetype = 'application/json'
        elif path.endswith('.svg'):
            mimetype = 'image/svg+xml'
        
        return mimetype, encoding
    
    def log_message(self, format, *args):
        """Custom logging with MIME type info."""
        path = args[1] if len(args) > 1 else ''
        status = args[0] if len(args) > 0 else ''
        
        # Enhanced logging for debugging
        if path.endswith('.js'):
            mimetype, _ = self.guess_type(path)
            if '404' in status:
                print(f"❌ {status} {path} -> File not found")
            else:
                print(f"📄 {status} {path} -> {mimetype}")
        elif '404' in status:
            print(f"❌ {status} {path} -> File not found")
        else:
            timestamp = time.strftime('[%a %b %d %Y %H:%M:%S %Z]', time.localtime())
            print(f'{timestamp} "{args[0]} {path}" "{args[2] if len(args) > 2 else ""}"')

class ThreadedHTTPServer(socketserver.ThreadingMixIn, HTTPServer):
    """Threaded HTTP server for better performance."""
    allow_reuse_address = True
    daemon_threads = True

def start_server(port=3000, directory=None):
    """Start the HTTP server."""
    if directory is None:
        directory = Path(__file__).parent / "public"
    
    # Change to the directory
    os.chdir(directory)
    
    # Create server
    server_address = ('', port)
    httpd = ThreadedHTTPServer(server_address, MimeFixHTTPRequestHandler)
    
    print(f"🚀 Starting Best on Click Development Server")
    print(f"📁 Serving directory: {directory}")
    print(f"🌐 Server running at: http://localhost:{port}")
    print(f"🌐 Network access: http://192.168.1.116:{port}")
    print(f"🧪 Test page: http://localhost:{port}/test-mime.html")
    print(f"📱 Main app: http://localhost:{port}/index.html")
    print()
    print("Press Ctrl+C to stop the server")
    print("=" * 50)
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        httpd.shutdown()

def test_mime_types():
    """Test MIME type configuration."""
    print("🧪 Testing MIME Types Configuration")
    print("=" * 40)
    
    test_files = [
        ('test.js', 'application/javascript'),
        ('test.mjs', 'application/javascript'),
        ('test.css', 'text/css'),
        ('test.json', 'application/json'),
        ('test.svg', 'image/svg+xml'),
    ]
    
    for filename, expected in test_files:
        actual, encoding = mimetypes.guess_type(filename)
        status = "✅" if actual == expected else "❌"
        print(f"{status} {filename}: {actual} (expected: {expected})")
    
    print()

def check_files():
    """Check if required files exist."""
    print("📁 Checking Required Files")
    print("=" * 40)
    
    base_path = Path(__file__).parent / "public"
    required_files = [
        "index.html",
        "js/main.js",
        "js/router.js",
        "js/services/auth.js",
        "js/services/store.js",
        "js/utils/toast.js",
        "test-mime.html"
    ]
    
    all_exist = True
    for file_path in required_files:
        full_path = base_path / file_path
        exists = full_path.exists()
        status = "✅" if exists else "❌"
        print(f"{status} {file_path}")
        if not exists:
            all_exist = False
    
    print()
    return all_exist

def open_browser(port=3000):
    """Open browser after a delay."""
    import time
    time.sleep(2)  # Wait for server to start
    webbrowser.open(f'http://localhost:{port}/test-mime.html')

def main():
    """Main function."""
    print("🌟 Best on Click - Development Server with MIME Fix")
    print("=" * 55)
    print()
    
    # Test MIME types
    test_mime_types()
    
    # Check files
    if not check_files():
        print("⚠️ Some required files are missing!")
        print("Make sure you're running this from the correct directory.")
        print()
    
    # Parse command line arguments
    port = 3000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print("❌ Invalid port number. Using default port 3000.")
    
    # Start browser in background
    browser_thread = threading.Thread(target=open_browser, args=(port,))
    browser_thread.daemon = True
    browser_thread.start()
    
    # Start server
    try:
        start_server(port)
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"❌ Port {port} is already in use!")
            print(f"💡 Try a different port: python simple_server.py {port + 1}")
        else:
            print(f"❌ Server error: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    main()