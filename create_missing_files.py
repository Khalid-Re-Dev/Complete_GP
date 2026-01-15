#!/usr/bin/env python3
"""
Create Missing Files for Best on Click
Creates placeholder files for missing JavaScript modules.
"""

import os
from pathlib import Path

def create_missing_files():
    """Create missing JavaScript files with basic content."""
    print("🔧 Creating Missing Files")
    print("=" * 40)
    
    base_path = Path(__file__).parent / "public"
    
    # File templates
    templates = {
        # Services
        "js/services/api.js": '''/**
 * API Service for Best on Click
 */
export class ApiService {
    constructor() {
        this.baseURL = 'http://localhost:8000/api';
    }
    
    async get(endpoint) {
        const response = await fetch(`${this.baseURL}${endpoint}`);
        return response.json();
    }
    
    async post(endpoint, data) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    }
}

export const apiService = new ApiService();
export default apiService;''',

        # Utils
        "js/utils/helpers.js": '''/**
 * Helper Functions for Best on Click
 */

export function formatPrice(price) {
    return new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: 'SAR'
    }).format(price);
}

export function formatDate(date) {
    return new Intl.DateTimeFormat('ar-SA').format(new Date(date));
}

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

export default {
    formatPrice,
    formatDate,
    debounce,
    throttle
};''',

        # Pages
        "js/pages/HomePage.js": '''/**
 * Home Page Component
 */
export function HomePage() {
    return `
        <div class="home-page">
            <h1>مرحباً بك في Best on Click</h1>
            <p>أفضل منصة للتسوق الإلكتروني</p>
        </div>
    `;
}

export function initHomePage() {
    console.log('Home page initialized');
}

export default HomePage;''',

        "js/pages/ProductsPage.js": '''/**
 * Products Page Component
 */
export function ProductsPage() {
    return `
        <div class="products-page">
            <h1>المنتجات</h1>
            <div id="products-container">
                <p>جاري تحميل المنتجات...</p>
            </div>
        </div>
    `;
}

export function initProductsPage() {
    console.log('Products page initialized');
}

export default ProductsPage;''',

        "js/pages/ProductDetailPage.js": '''/**
 * Product Detail Page Component
 */
export function ProductDetailPage(productId) {
    return `
        <div class="product-detail-page">
            <h1>تفاصيل المنتج ${productId}</h1>
            <div id="product-detail-container">
                <p>جاري تحميل تفاصيل المنتج...</p>
            </div>
        </div>
    `;
}

export function initProductDetailPage(productId) {
    console.log('Product detail page initialized for product:', productId);
}

export default ProductDetailPage;''',

        "js/pages/LoginPage.js": '''/**
 * Login Page Component
 */
export function LoginPage() {
    return `
        <div class="login-page">
            <h1>تسجيل الدخول</h1>
            <form id="login-form">
                <input type="email" placeholder="البريد الإلكتروني" required>
                <input type="password" placeholder="كلمة المرور" required>
                <button type="submit">دخول</button>
            </form>
        </div>
    `;
}

export function initLoginPage() {
    console.log('Login page initialized');
}

export default LoginPage;''',

        "js/pages/RegisterPage.js": '''/**
 * Register Page Component
 */
export function RegisterPage() {
    return `
        <div class="register-page">
            <h1>إنشاء حساب جديد</h1>
            <form id="register-form">
                <input type="text" placeholder="الاسم الكامل" required>
                <input type="email" placeholder="البريد الإلكتروني" required>
                <input type="password" placeholder="كلمة المرور" required>
                <button type="submit">إنشاء حساب</button>
            </form>
        </div>
    `;
}

export function initRegisterPage() {
    console.log('Register page initialized');
}

export default RegisterPage;''',

        "js/pages/ProfilePage.js": '''/**
 * Profile Page Component
 */
export function ProfilePage() {
    return `
        <div class="profile-page">
            <h1>الملف الشخصي</h1>
            <div id="profile-container">
                <p>جاري تحميل بيانات الملف الشخصي...</p>
            </div>
        </div>
    `;
}

export function initProfilePage() {
    console.log('Profile page initialized');
}

export default ProfilePage;''',

        "js/pages/CartPage.js": '''/**
 * Cart Page Component
 */
export function CartPage() {
    return `
        <div class="cart-page">
            <h1>سلة التسوق</h1>
            <div id="cart-container">
                <p>سلة التسوق فارغة</p>
            </div>
        </div>
    `;
}

export function initCartPage() {
    console.log('Cart page initialized');
}

export default CartPage;''',

        "js/pages/ComparisonPage.js": '''/**
 * Comparison Page Component
 */
export function ComparisonPage() {
    return `
        <div class="comparison-page">
            <h1>مقارنة المنتجات</h1>
            <div id="comparison-container">
                <p>لا توجد منتجات للمقارنة</p>
            </div>
        </div>
    `;
}

export function initComparisonPage() {
    console.log('Comparison page initialized');
}

export default ComparisonPage;''',

        "js/pages/PromotionsPage.js": '''/**
 * Promotions Page Component
 */
export function PromotionsPage() {
    return `
        <div class="promotions-page">
            <h1>العروض والخصومات</h1>
            <div id="promotions-container">
                <p>جاري تحميل العروض...</p>
            </div>
        </div>
    `;
}

export function initPromotionsPage() {
    console.log('Promotions page initialized');
}

export default PromotionsPage;''',

        # Components
        "js/components/Footer.js": '''/**
 * Footer Component
 */
export function Footer() {
    return `
        <footer class="bg-gray-800 text-white p-4 text-center">
            <p>&copy; 2024 Best on Click. جميع الحقوق محفوظة.</p>
        </footer>
    `;
}

export default Footer;''',

        "js/components/ProductCard.js": '''/**
 * Product Card Component
 */
export function ProductCard(product) {
    return `
        <div class="product-card border rounded-lg p-4 shadow-md">
            <img src="${product.image || '/assets/placeholder.jpg'}" alt="${product.name}" class="w-full h-48 object-cover rounded">
            <h3 class="text-lg font-semibold mt-2">${product.name}</h3>
            <p class="text-gray-600">${product.price} ريال</p>
            <button class="bg-blue-500 text-white px-4 py-2 rounded mt-2 w-full">
                إضافة للسلة
            </button>
        </div>
    `;
}

export default ProductCard;''',

        "js/components/SearchBar.js": '''/**
 * Search Bar Component
 */
export function SearchBar() {
    return `
        <div class="search-bar">
            <input type="text" id="search-input" placeholder="ابحث عن المنتجات..." 
                   class="w-full px-4 py-2 border rounded-lg">
            <button id="search-btn" class="bg-blue-500 text-white px-4 py-2 rounded-lg ml-2">
                بحث
            </button>
        </div>
    `;
}

export function initSearchBar() {
    console.log('Search bar initialized');
}

export default SearchBar;''',

        # State
        "js/state/store.js": '''/**
 * Global State Store
 */
class Store {
    constructor() {
        this.state = {
            user: null,
            cart: [],
            products: [],
            filters: {},
            loading: false
        };
        this.listeners = [];
    }
    
    getState() {
        return this.state;
    }
    
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notifyListeners();
    }
    
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }
    
    notifyListeners() {
        this.listeners.forEach(listener => listener(this.state));
    }
}

const store = new Store();
export default store;''',

        # CSS
        "css/font-fallback.css": '''/* Font Fallback CSS */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap');

body {
    font-family: 'Noto Sans Arabic', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    direction: rtl;
    text-align: right;
}

.ltr {
    direction: ltr;
    text-align: left;
}'''
    }
    
    created_count = 0
    
    for file_path, content in templates.items():
        full_path = base_path / file_path
        
        if not full_path.exists():
            # Create directory if it doesn't exist
            full_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Write file
            full_path.write_text(content, encoding='utf-8')
            print(f"✅ Created: {file_path}")
            created_count += 1
        else:
            print(f"⏭️ Exists: {file_path}")
    
    print()
    print(f"📊 Created {created_count} files")
    
    # Create index.html if it doesn't exist
    index_path = base_path / "index.html"
    if not index_path.exists():
        index_content = '''<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Best on Click - أفضل منصة للتسوق الإلكتروني</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="/css/font-fallback.css" rel="stylesheet">
</head>
<body class="bg-gray-50">
    <div id="app">
        <div id="navbar-container"></div>
        <main id="page-container" class="min-h-screen">
            <div class="container mx-auto px-4 py-8">
                <h1 class="text-3xl font-bold text-center mb-8">مرحباً بك في Best on Click</h1>
                <p class="text-center text-gray-600">جاري تحميل التطبيق...</p>
            </div>
        </main>
        <div id="footer-container"></div>
    </div>
    
    <script type="module" src="/js/main.js"></script>
</body>
</html>'''
        index_path.write_text(index_content, encoding='utf-8')
        print(f"✅ Created: index.html")
        created_count += 1
    
    return created_count

def main():
    """Main function."""
    print("🔧 Best on Click - Create Missing Files")
    print("=" * 50)
    
    created = create_missing_files()
    
    if created > 0:
        print(f"\n🎉 Created {created} files successfully!")
        print("\n🚀 Now you can start the server:")
        print("   python simple_server.py")
    else:
        print("\n✅ All files already exist!")

if __name__ == "__main__":
    main()