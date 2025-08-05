"""
Custom views for serving static files with correct MIME types.
"""

import os
import mimetypes
from django.http import HttpResponse, Http404, FileResponse
from django.conf import settings
from django.views.decorators.cache import cache_control
from django.views.decorators.http import require_GET
from django.utils.decorators import method_decorator
from django.views import View


class StaticFileView(View):
    """
    Custom view to serve static files with correct MIME types.
    This ensures JavaScript modules load correctly.
    """
    
    @method_decorator(cache_control(max_age=3600))  # Cache for 1 hour
    @method_decorator(require_GET)
    def get(self, request, file_path):
        # Security check: prevent directory traversal
        if '..' in file_path or file_path.startswith('/'):
            raise Http404("File not found")
        
        # Construct full file path
        if file_path.startswith('js/'):
            # Serve from public directory
            full_path = os.path.join(settings.BASE_DIR.parent, 'public', file_path)
        else:
            # Serve from static directory
            full_path = os.path.join(settings.STATIC_ROOT or settings.STATICFILES_DIRS[0], file_path)
        
        # Check if file exists
        if not os.path.exists(full_path) or not os.path.isfile(full_path):
            raise Http404("File not found")
        
        # Determine MIME type
        mime_type, encoding = mimetypes.guess_type(full_path)
        
        # Override MIME types for specific extensions
        file_ext = os.path.splitext(file_path)[1].lower()
        if file_ext == '.js':
            mime_type = 'application/javascript'
        elif file_ext == '.mjs':
            mime_type = 'application/javascript'
        elif file_ext == '.css':
            mime_type = 'text/css'
        elif file_ext == '.json':
            mime_type = 'application/json'
        elif file_ext == '.svg':
            mime_type = 'image/svg+xml'
        
        # Set default if MIME type couldn't be determined
        if not mime_type:
            mime_type = 'application/octet-stream'
        
        # Create response
        try:
            response = FileResponse(
                open(full_path, 'rb'),
                content_type=f"{mime_type}; charset=utf-8" if mime_type.startswith('text/') or mime_type.startswith('application/') else mime_type
            )
            
            # Add additional headers for JavaScript files
            if file_ext in ['.js', '.mjs']:
                response['X-Content-Type-Options'] = 'nosniff'
                response['Cache-Control'] = 'public, max-age=3600'
            
            return response
            
        except IOError:
            raise Http404("File not found")


@require_GET
@cache_control(max_age=3600)
def serve_js_file(request, file_path):
    """
    Simple function-based view to serve JavaScript files.
    """
    # Security check
    if '..' in file_path or file_path.startswith('/'):
        raise Http404("File not found")
    
    # Construct full path to public directory
    full_path = os.path.join(settings.BASE_DIR.parent, 'public', 'js', file_path)
    
    # Check if file exists
    if not os.path.exists(full_path) or not os.path.isfile(full_path):
        raise Http404("File not found")
    
    try:
        # Read file content
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Create response with correct MIME type
        response = HttpResponse(content, content_type='application/javascript; charset=utf-8')
        response['X-Content-Type-Options'] = 'nosniff'
        response['Cache-Control'] = 'public, max-age=3600'
        
        return response
        
    except IOError:
        raise Http404("File not found")


@require_GET
@cache_control(max_age=3600)
def serve_css_file(request, file_path):
    """
    Simple function-based view to serve CSS files.
    """
    # Security check
    if '..' in file_path or file_path.startswith('/'):
        raise Http404("File not found")
    
    # Construct full path
    full_path = os.path.join(settings.BASE_DIR.parent, 'public', 'css', file_path)
    
    # Check if file exists
    if not os.path.exists(full_path) or not os.path.isfile(full_path):
        raise Http404("File not found")
    
    try:
        # Read file content
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Create response with correct MIME type
        response = HttpResponse(content, content_type='text/css; charset=utf-8')
        response['X-Content-Type-Options'] = 'nosniff'
        response['Cache-Control'] = 'public, max-age=3600'
        
        return response
        
    except IOError:
        raise Http404("File not found")


@require_GET
def health_check(request):
    """
    Simple health check endpoint.
    """
    return HttpResponse("OK", content_type='text/plain')