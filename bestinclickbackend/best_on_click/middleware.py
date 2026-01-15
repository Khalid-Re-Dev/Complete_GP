"""
Custom middleware for Best on Click project.
"""

import mimetypes
from django.http import HttpResponse
from django.utils.deprecation import MiddlewareMixin


class MimeTypeMiddleware(MiddlewareMixin):
    """
    Middleware to ensure correct MIME types are set for static files.
    This fixes issues with ES6 modules not loading due to incorrect MIME types.
    """
    
    def process_response(self, request, response):
        # Only process static file requests
        if request.path.startswith('/static/') or request.path.startswith('/js/'):
            # Get the file extension
            path = request.path.lower()
            
            # Set correct MIME types for JavaScript files
            if path.endswith('.js'):
                response['Content-Type'] = 'application/javascript; charset=utf-8'
            elif path.endswith('.mjs'):
                response['Content-Type'] = 'application/javascript; charset=utf-8'
            elif path.endswith('.css'):
                response['Content-Type'] = 'text/css; charset=utf-8'
            elif path.endswith('.json'):
                response['Content-Type'] = 'application/json; charset=utf-8'
            elif path.endswith('.svg'):
                response['Content-Type'] = 'image/svg+xml; charset=utf-8'
            elif path.endswith('.html'):
                response['Content-Type'] = 'text/html; charset=utf-8'
            elif path.endswith('.woff2'):
                response['Content-Type'] = 'font/woff2'
            elif path.endswith('.woff'):
                response['Content-Type'] = 'font/woff'
            elif path.endswith('.ttf'):
                response['Content-Type'] = 'font/ttf'
            elif path.endswith('.eot'):
                response['Content-Type'] = 'application/vnd.ms-fontobject'
        
        return response


class CorsMiddleware(MiddlewareMixin):
    """
    Custom CORS middleware to handle preflight requests and set proper headers.
    """
    
    def process_response(self, request, response):
        # Add CORS headers for all responses
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
        response['Access-Control-Allow-Headers'] = (
            'Accept, Accept-Encoding, Authorization, Content-Type, '
            'DNT, Origin, User-Agent, X-CSRFToken, X-Requested-With'
        )
        response['Access-Control-Allow-Credentials'] = 'true'
        response['Access-Control-Max-Age'] = '86400'
        
        return response
    
    def process_request(self, request):
        # Handle preflight OPTIONS requests
        if request.method == 'OPTIONS':
            response = HttpResponse()
            response['Access-Control-Allow-Origin'] = '*'
            response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
            response['Access-Control-Allow-Headers'] = (
                'Accept, Accept-Encoding, Authorization, Content-Type, '
                'DNT, Origin, User-Agent, X-CSRFToken, X-Requested-With'
            )
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Access-Control-Max-Age'] = '86400'
            return response
        
        return None


class SecurityHeadersMiddleware(MiddlewareMixin):
    """
    Middleware to add security headers to responses.
    """
    
    def process_response(self, request, response):
        # Add security headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'SAMEORIGIN'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # Add CSP header for development (more permissive)
        if hasattr(request, 'META') and 'localhost' in request.META.get('HTTP_HOST', ''):
            response['Content-Security-Policy'] = (
                "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; "
                "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; "
                "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; "
                "img-src 'self' data: blob: https:; "
                "connect-src 'self' ws: wss: https:;"
            )
        
        return response