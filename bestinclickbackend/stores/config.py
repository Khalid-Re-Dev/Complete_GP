"""
Store Management Configuration
Settings and constants for the store management system.
"""

# Store Application Settings
STORE_APPLICATION_SETTINGS = {
    'MAX_BUSINESS_LICENSE_SIZE': 5 * 1024 * 1024,  # 5MB
    'MAX_IDENTITY_DOCUMENT_SIZE': 5 * 1024 * 1024,  # 5MB
    'ALLOWED_DOCUMENT_TYPES': ['pdf', 'jpg', 'jpeg', 'png'],
    'AUTO_APPROVE_THRESHOLD': 0.8,  # Auto-approve if confidence > 80%
    'REVIEW_TIMEOUT_DAYS': 7,  # Days before application expires
}

# Analytics Settings
ANALYTICS_SETTINGS = {
    'UPDATE_INTERVAL_MINUTES': 30,
    'BATCH_SIZE': 100,
    'RETENTION_DAYS': 365,
    'CACHE_TIMEOUT': 300,  # 5 minutes
    'PERFORMANCE_THRESHOLDS': {
        'LOW_PERFORMANCE': 30,
        'GOOD_PERFORMANCE': 70,
        'EXCELLENT_PERFORMANCE': 90,
    }
}

# Notification Settings
NOTIFICATION_SETTINGS = {
    'MAX_NOTIFICATIONS_PER_STORE': 50,
    'NOTIFICATION_RETENTION_DAYS': 30,
    'AUTO_MARK_READ_DAYS': 7,
    'BATCH_NOTIFICATION_SIZE': 20,
    'NOTIFICATION_TYPES': {
        'new_review': {
            'title': 'مراجعة جديدة',
            'icon': 'fa-star',
            'color': 'blue'
        },
        'low_stock': {
            'title': 'مخزون منخفض',
            'icon': 'fa-exclamation-triangle',
            'color': 'orange'
        },
        'high_engagement': {
            'title': 'تفاعل عالي',
            'icon': 'fa-chart-line',
            'color': 'green'
        },
        'performance_milestone': {
            'title': 'إنجاز جديد',
            'icon': 'fa-trophy',
            'color': 'gold'
        },
        'system_update': {
            'title': 'تحديث النظام',
            'icon': 'fa-info-circle',
            'color': 'blue'
        }
    }
}

# Feedback Settings
FEEDBACK_SETTINGS = {
    'MIN_RATING': 1,
    'MAX_RATING': 5,
    'MAX_COMMENT_LENGTH': 1000,
    'MAX_TITLE_LENGTH': 100,
    'REQUIRE_VERIFICATION': False,
    'AUTO_FEATURE_THRESHOLD': 4.5,  # Auto-feature reviews with rating >= 4.5
    'RESPONSE_TIMEOUT_DAYS': 14,  # Days to respond to feedback
}

# File Upload Settings
FILE_UPLOAD_SETTINGS = {
    'UPLOAD_PATH': 'store_documents/',
    'ALLOWED_EXTENSIONS': ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
    'MAX_FILE_SIZE': 10 * 1024 * 1024,  # 10MB
    'VIRUS_SCAN_ENABLED': False,  # Enable in production
    'COMPRESS_IMAGES': True,
    'IMAGE_QUALITY': 85,
}

# Performance Monitoring
PERFORMANCE_SETTINGS = {
    'TRACK_VIEW_DURATION': True,
    'TRACK_USER_AGENT': True,
    'TRACK_REFERRER': True,
    'ANONYMIZE_IP': True,
    'SESSION_TIMEOUT_MINUTES': 30,
    'MAX_VIEWS_PER_SESSION': 100,
}

# Email Settings for Store Notifications
EMAIL_SETTINGS = {
    'SEND_APPLICATION_EMAILS': True,
    'SEND_REVIEW_EMAILS': True,
    'SEND_MILESTONE_EMAILS': True,
    'EMAIL_TEMPLATES': {
        'application_received': 'stores/emails/application_received.html',
        'application_approved': 'stores/emails/application_approved.html',
        'application_rejected': 'stores/emails/application_rejected.html',
        'new_review': 'stores/emails/new_review.html',
        'milestone_achieved': 'stores/emails/milestone_achieved.html',
    }
}

# Security Settings
SECURITY_SETTINGS = {
    'RATE_LIMIT_APPLICATIONS': '5/hour',
    'RATE_LIMIT_FEEDBACK': '10/hour',
    'RATE_LIMIT_VIEWS': '1000/hour',
    'REQUIRE_CSRF_TOKEN': True,
    'SANITIZE_HTML': True,
    'VALIDATE_FILE_CONTENT': True,
}

# Cache Keys
CACHE_KEYS = {
    'STORE_ANALYTICS': 'store_analytics_{store_id}',
    'PRODUCT_ANALYTICS': 'product_analytics_{product_id}',
    'STORE_NOTIFICATIONS': 'store_notifications_{store_id}',
    'STORE_FEEDBACK': 'store_feedback_{store_id}',
    'DASHBOARD_DATA': 'dashboard_data_{store_id}',
}

# Default Values
DEFAULTS = {
    'ANALYTICS': {
        'total_views': 0,
        'unique_visitors': 0,
        'total_likes': 0,
        'total_comments': 0,
        'total_shares': 0,
        'total_orders': 0,
        'total_revenue': 0,
        'average_rating': 0.0,
        'total_reviews': 0,
        'popularity_score': 0,
        'engagement_score': 0,
        'quality_score': 0,
    },
    'PRODUCT_ANALYTICS': {
        'total_views': 0,
        'unique_views': 0,
        'total_likes': 0,
        'total_comments': 0,
        'total_shares': 0,
        'add_to_cart_count': 0,
        'purchase_count': 0,
        'conversion_rate': 0.0,
        'engagement_rate': 0.0,
        'performance_trend': 'stable',
    }
}

# Business Rules
BUSINESS_RULES = {
    'MIN_PRODUCTS_FOR_ANALYTICS': 1,
    'MIN_VIEWS_FOR_TRENDING': 100,
    'MIN_RATING_FOR_FEATURED': 4.0,
    'MAX_FEATURED_PRODUCTS': 10,
    'TRENDING_CALCULATION_DAYS': 7,
    'POPULAR_THRESHOLD_PERCENTILE': 80,
}

# API Settings
API_SETTINGS = {
    'PAGINATION_SIZE': 20,
    'MAX_PAGINATION_SIZE': 100,
    'API_VERSION': 'v1',
    'THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
        'store_owner': '2000/hour',
        'admin': '5000/hour',
    }
}

# Logging Configuration
LOGGING_CONFIG = {
    'LOG_ANALYTICS_UPDATES': True,
    'LOG_NOTIFICATION_CREATION': True,
    'LOG_FEEDBACK_SUBMISSION': True,
    'LOG_APPLICATION_SUBMISSION': True,
    'LOG_PERFORMANCE_ISSUES': True,
    'LOG_LEVEL': 'INFO',
    'LOG_FORMAT': '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
}

# Development Settings
DEVELOPMENT_SETTINGS = {
    'USE_MOCK_DATA': False,
    'ENABLE_DEBUG_TOOLBAR': True,
    'SIMULATE_SLOW_QUERIES': False,
    'FAKE_ANALYTICS_DATA': False,
    'SKIP_EMAIL_SENDING': True,
}

# Production Settings
PRODUCTION_SETTINGS = {
    'USE_CDN_FOR_STATIC': True,
    'ENABLE_COMPRESSION': True,
    'USE_REDIS_CACHE': True,
    'ENABLE_MONITORING': True,
    'USE_CELERY_FOR_TASKS': True,
    'ENABLE_SSL_REDIRECT': True,
}