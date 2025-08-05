"""
Store Management App Configuration
"""

from django.apps import AppConfig


class StoresConfig(AppConfig):
    """
    Configuration for the stores app.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'stores'
    verbose_name = 'Store Management'
    
    def ready(self):
        """
        Import signals when the app is ready.
        """
        try:
            import stores.signals
        except ImportError:
            pass