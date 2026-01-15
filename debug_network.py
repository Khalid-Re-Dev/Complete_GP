#!/usr/bin/env python3
"""
Network and MIME Type Debug Tool for Best on Click
Advanced debugging for module loading issues.
"""

import socket
import requests
import subprocess
import platform
import json
from pathlib import Path
import time

def get_network_info():
    """Get network configuration information."""
    print("🌐 Network Configuration")
    print("=" * 40)
    
    try:
        # Get hostname
        hostname = socket.gethostname()
        print(f"Hostname: {hostname}")
        
        # Get local IP
        local_ip = socket.gethostbyname(hostname)
        print(f"Local IP: {local_ip}")
        
        # Get all network interfaces (Windows)
        if platform.system() == "Windows":
            try:
                result = subprocess.run(['ipconfig'], capture_output=True, text=True)
                lines = result.stdout.split('\n')
                for line in lines:
                    if 'IPv4' in line and '192.168' in line:
                        ip = line.split(':')[1].strip()
                        print(f"Network IP: {ip}")
            except:
                pass
        
    except Exception as e:
        print(f"❌ Network info error: {e}")
    
    print()

def test_port_connectivity():
    """Test if ports are accessible."""
    print("🔌 Port Connectivity Test")
    print("=" * 40)
    
    test_ports = [3000, 8000, 8080]
    
    for port in test_ports:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(2)
            result = sock.connect_ex(('localhost', port))
            sock.close()
            
            if result == 0:
                print(f"✅ Port {port}: Open")
            else:
                print(f"❌ Port {port}: Closed")
                
        except Exception as e:
            print(f"❌ Port {port}: Error - {e}")
    
    print()

def test_http_requests():
    """Test HTTP requests to different servers."""
    print("📡 HTTP Request Test")
    print("=" * 40)
    
    test_urls = [
        "http://localhost:3000/js/services/auth.js",
        "http://127.0.0.1:3000/js/services/auth.js", 
        "http://192.168.1.116:3000/js/services/auth.js",
        "http://localhost:8000/health/",
        "http://127.0.0.1:8000/health/"
    ]
    
    for url in test_urls:
        try:
            response = requests.get(url, timeout=5)
            content_type = response.headers.get('content-type', 'Not set')
            print(f"✅ {url}")
            print(f"   Status: {response.status_code}")
            print(f"   Content-Type: {content_type}")
            print(f"   Size: {len(response.content)} bytes")
            
        except requests.exceptions.ConnectionError:
            print(f"❌ {url}: Connection refused")
        except requests.exceptions.Timeout:
            print(f"❌ {url}: Timeout")
        except Exception as e:
            print(f"❌ {url}: {e}")
    
    print()

def check_browser_compatibility():
    """Check browser compatibility information."""
    print("🌍 Browser Compatibility")
    print("=" * 40)
    
    compatibility_info = {
        "ES6 Modules": {
            "Chrome": "61+",
            "Firefox": "60+", 
            "Safari": "10.1+",
            "Edge": "16+"
        },
        "Dynamic Imports": {
            "Chrome": "63+",
            "Firefox": "67+",
            "Safari": "11.1+", 
            "Edge": "79+"
        },
        "MIME Type Requirements": {
            "JavaScript": "application/javascript",
            "Modules": "text/javascript or application/javascript",
            "Strict": "Some browsers require exact MIME types"
        }
    }
    
    for category, info in compatibility_info.items():
        print(f"📋 {category}:")
        for key, value in info.items():
            print(f"   {key}: {value}")
        print()

def generate_test_html():
    """Generate a comprehensive test HTML file."""
    print("📝 Generating Test HTML")
    print("=" * 40)
    
    html_content = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Advanced MIME Test - Best on Click</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .test { margin: 10px 0; padding: 10px; border: 1px solid #ccc; }
        .success { background: #d4edda; }
        .error { background: #f8d7da; }
        .info { background: #d1ecf1; }
    </style>
</head>
<body>
    <h1>🧪 Advanced MIME Type Test</h1>
    <div id="results"></div>
    
    <script>
        const results = document.getElementById('results');
        
        function addResult(test, status, message) {
            const div = document.createElement('div');
            div.className = `test ${status}`;
            div.innerHTML = `<strong>${test}:</strong> ${message}`;
            results.appendChild(div);
        }
        
        // Test 1: Basic fetch
        fetch('/js/services/auth.js')
            .then(response => {
                const contentType = response.headers.get('content-type');
                addResult('Fetch Test', 'success', `Status: ${response.status}, Type: ${contentType}`);
                return response.text();
            })
            .then(text => {
                addResult('Content Test', 'success', `Size: ${text.length} characters`);
            })
            .catch(error => {
                addResult('Fetch Test', 'error', error.message);
            });
        
        // Test 2: Dynamic import
        import('/js/services/auth.js')
            .then(module => {
                addResult('Dynamic Import', 'success', 'Module loaded successfully');
            })
            .catch(error => {
                addResult('Dynamic Import', 'error', error.message);
            });
        
        // Test 3: Script tag test
        const script = document.createElement('script');
        script.type = 'module';
        script.src = '/js/services/auth.js';
        script.onload = () => addResult('Script Tag', 'success', 'Script loaded');
        script.onerror = () => addResult('Script Tag', 'error', 'Script failed to load');
        document.head.appendChild(script);
        
        // Test 4: Browser info
        addResult('Browser Info', 'info', `${navigator.userAgent}`);
        addResult('Module Support', 'info', `Supports modules: ${'noModule' in HTMLScriptElement.prototype}`);
        
        // Test 5: Network info
        addResult('Current URL', 'info', window.location.href);
        addResult('Protocol', 'info', window.location.protocol);
        addResult('Host', 'info', window.location.host);
    </script>
</body>
</html>'''
    
    test_file = Path(__file__).parent / "public" / "advanced-test.html"
    test_file.write_text(html_content, encoding='utf-8')
    print(f"✅ Test file created: {test_file}")
    print(f"🌐 Access at: http://localhost:3000/advanced-test.html")
    print()

def check_firewall_settings():
    """Check Windows firewall settings."""
    print("🔥 Firewall Check")
    print("=" * 40)
    
    if platform.system() == "Windows":
        try:
            # Check if ports are blocked by firewall
            result = subprocess.run([
                'netsh', 'advfirewall', 'firewall', 'show', 'rule', 
                'name=all', 'dir=in', 'protocol=tcp'
            ], capture_output=True, text=True)
            
            if "3000" in result.stdout:
                print("✅ Port 3000 firewall rule found")
            else:
                print("⚠️ Port 3000 firewall rule not found")
                print("💡 You may need to add a firewall rule:")
                print("   netsh advfirewall firewall add rule name=\"Best on Click\" dir=in action=allow protocol=TCP localport=3000")
            
        except Exception as e:
            print(f"❌ Firewall check failed: {e}")
    else:
        print("ℹ️ Firewall check only available on Windows")
    
    print()

def run_comprehensive_test():
    """Run all diagnostic tests."""
    print("🔬 Best on Click - Comprehensive Network & MIME Diagnosis")
    print("=" * 60)
    print()
    
    get_network_info()
    test_port_connectivity()
    test_http_requests()
    check_browser_compatibility()
    generate_test_html()
    check_firewall_settings()
    
    print("🎯 Quick Fix Recommendations:")
    print("=" * 40)
    print("1. Use the simple server: python simple_server.py")
    print("2. Clear browser cache completely")
    print("3. Try different browser (Chrome, Firefox, Edge)")
    print("4. Check antivirus/firewall settings")
    print("5. Use localhost instead of IP address")
    print("6. Restart both servers (Django + Static)")
    print()
    print("🌐 Test URLs to try:")
    print("   http://localhost:3000/advanced-test.html")
    print("   http://localhost:3000/test-mime.html")
    print("   http://localhost:8000/health/")

if __name__ == "__main__":
    run_comprehensive_test()