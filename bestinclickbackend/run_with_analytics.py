#!/usr/bin/env python
"""
Django development server with automatic analytics updates.
This script runs the Django development server and schedules periodic analytics updates.
"""

import os
import sys
import threading
import time
import schedule
from django.core.management import execute_from_command_line
from django.core.management import call_command

def update_analytics():
    """Update store analytics."""
    try:
        print("🔄 Updating store analytics...")
        call_command('update_store_analytics')
        print("✅ Store analytics updated successfully")
    except Exception as e:
        print(f"❌ Error updating analytics: {e}")

def create_notifications():
    """Create automated notifications."""
    try:
        print("🔔 Creating automated notifications...")
        call_command('create_automated_notifications')
        print("✅ Notifications created successfully")
    except Exception as e:
        print(f"❌ Error creating notifications: {e}")

def run_scheduler():
    """Run the background scheduler."""
    # Schedule analytics updates every 30 minutes
    schedule.every(30).minutes.do(update_analytics)
    
    # Schedule notification creation every hour
    schedule.every().hour.do(create_notifications)
    
    # Run initial updates after 2 minutes
    schedule.every(2).minutes.do(update_analytics).tag('initial')
    schedule.every(3).minutes.do(create_notifications).tag('initial')
    
    print("📅 Scheduler started:")
    print("   - Analytics updates: every 30 minutes")
    print("   - Notifications: every hour")
    print("   - Initial run: in 2-3 minutes")
    
    while True:
        schedule.run_pending()
        time.sleep(60)  # Check every minute

def main():
    """Main function to run Django server with analytics."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'best_on_click.settings')
    
    if len(sys.argv) > 1 and sys.argv[1] == 'runserver':
        # Start the scheduler in a background thread
        scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
        scheduler_thread.start()
        
        print("🚀 Starting Django development server with analytics...")
        print("📊 Analytics will be updated automatically in the background")
        
    # Run Django management command
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()