#!/usr/bin/env python3
"""
Quick file check for Best on Click
Verifies that all required JavaScript files exist.
"""

import os
from pathlib import Path

def check_files():
    """Check if all required files exist."""
    print("🔍 Checking Required Files")
    print("=" * 40)
    
    base_path = Path(__file__).parent / "public"
    
    required_files = [
        # Core files
        "index.html",
        "js/main.js",
        "js/router.js",
        
        # Services
        "js/services/auth.js",
        "js/services/store.js",
        "js/services/api.js",
        "js/services/mockApi.js",
        "js/services/mockData.js",
        "js/services/realData.js",
        "js/services/behaviorTracker.js",
        "js/services/personalizationService.js",
        "js/services/promotionService.js",
        
        # Utils
        "js/utils/toast.js",
        "js/utils/helpers.js",
        "js/utils/imageHandler.js",
        "js/utils/imageUtils.js",
        "js/utils/localImageGenerator.js",
        "js/utils/modalManager.js",
        "js/utils/countdown.js",
        
        # Pages
        "js/pages/HomePage.js",
        "js/pages/ProductsPage.js",
        "js/pages/ProductDetailPage.js",
        "js/pages/LoginPage.js",
        "js/pages/RegisterPage.js",
        "js/pages/ProfilePage.js",
        "js/pages/CartPage.js",
        "js/pages/ComparisonPage.js",
        "js/pages/PromotionsPage.js",
        "js/pages/store-application.js",
        "js/pages/store-dashboard.js",
        "js/pages/store-analytics.js",
        "js/pages/store-feedback.js",
        "js/pages/store-feedback-management.js",
        
        # Components
        "js/components/Navbar.js",
        "js/components/Footer.js",
        "js/components/ProductCard.js",
        "js/components/SearchBar.js",
        "js/components/FilterSidebar.js",
        "js/components/CategoryFilter.js",
        "js/components/PriceRangeFilter.js",
        "js/components/BrandFilter.js",
        "js/components/RatingFilter.js",
        "js/components/SortDropdown.js",
        "js/components/Pagination.js",
        "js/components/LoadingSpinner.js",
        "js/components/Modal.js",
        "js/components/Toast.js",
        "js/components/ImageGallery.js",
        "js/components/ReviewSection.js",
        "js/components/RelatedProducts.js",
        "js/components/ComparisonTable.js",
        "js/components/PromotionBanner.js",
        "js/components/CountdownTimer.js",
        "js/components/RecommendationSection.js",
        
        # CSS
        "css/tailwind.css",
        "css/font-fallback.css",
        
        # Test files
        "test-mime.html"
    ]
    
    missing_files = []
    existing_files = []
    
    for file_path in required_files:
        full_path = base_path / file_path
        if full_path.exists():
            size = full_path.stat().st_size
            print(f"✅ {file_path} ({size} bytes)")
            existing_files.append(file_path)
        else:
            print(f"❌ {file_path} - MISSING")
            missing_files.append(file_path)
    
    print()
    print(f"📊 Summary:")
    print(f"   Total files: {len(required_files)}")
    print(f"   Existing: {len(existing_files)}")
    print(f"   Missing: {len(missing_files)}")
    print(f"   Completion: {(len(existing_files)/len(required_files)*100):.1f}%")
    
    if missing_files:
        print()
        print("❌ Missing Files:")
        for file_path in missing_files:
            print(f"   - {file_path}")
        
        print()
        print("💡 To create missing files, run:")
        print("   python create_missing_files.py")
    else:
        print()
        print("🎉 All required files exist!")
    
    return len(missing_files) == 0

def check_directory_structure():
    """Check directory structure."""
    print("\n📁 Directory Structure Check")
    print("=" * 40)
    
    base_path = Path(__file__).parent / "public"
    required_dirs = [
        "js",
        "js/services",
        "js/utils", 
        "js/pages",
        "js/components",
        "js/state",
        "css",
        "assets",
        "images"
    ]
    
    for dir_path in required_dirs:
        full_path = base_path / dir_path
        if full_path.exists() and full_path.is_dir():
            file_count = len(list(full_path.glob("*")))
            print(f"✅ {dir_path}/ ({file_count} files)")
        else:
            print(f"❌ {dir_path}/ - MISSING")
            # Create directory
            full_path.mkdir(parents=True, exist_ok=True)
            print(f"   Created: {dir_path}/")

def main():
    """Main function."""
    print("📋 Best on Click - File Check")
    print("=" * 50)
    
    check_directory_structure()
    all_files_exist = check_files()
    
    if all_files_exist:
        print("\n🚀 Ready to start server!")
        print("Run: python simple_server.py")
    else:
        print("\n⚠️ Some files are missing.")
        print("The server may not work correctly.")

if __name__ == "__main__":
    main()