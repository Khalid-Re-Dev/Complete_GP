/**
 * Products Management Page
 * Page for store owners to manage their products
 */

import { authService } from '../services/auth.js';
import { productService } from '../services/product.js';
import { storeService } from '../services/store.js';
import { showToast } from '../utils/toast.js';

export function ProductsManagementPage() {
    const page = document.createElement('div');
    page.innerHTML = `
        <div class="min-h-screen bg-gray-50">
            <!-- Header -->
            <div class="bg-white shadow-sm border-b">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between items-center py-6">
                        <div>
                            <h1 class="text-2xl font-bold text-gray-900">Products Management</h1>
                            <p class="text-gray-600">Manage your store products</p>
                        </div>
                        <div class="flex space-x-4 space-x-reverse">
                            <button
                                id="add-product-btn"
                                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <i class="fas fa-plus mr-2"></i>
                                Add Product
                            </button>
                            <button
                                id="bulk-actions-btn"
                                class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                <i class="fas fa-tasks mr-2"></i>
                                Bulk Actions
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <!-- Loading State -->
                <div id="products-loading" class="text-center py-12">
                    <i class="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
                    <p class="text-gray-600">Loading products...</p>
                </div>

                <!-- Products Content -->
                <div id="products-content" class="hidden">
                    <!-- Filters and Search -->
                    <div class="bg-white p-6 rounded-lg shadow-sm border mb-6">
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
                                <input
                                    type="text"
                                    id="search-input"
                                    placeholder="Search products..."
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <select
                                    id="category-filter"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Categories</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select
                                    id="status-filter"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="out_of_stock">Out of Stock</option>
                                </select>
                            </div>
                            <div class="flex items-end">
                                <button
                                    id="apply-filters-btn"
                                    class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Products Table -->
                    <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
                        <div class="px-6 py-4 border-b border-gray-200">
                            <div class="flex justify-between items-center">
                                <h3 class="text-lg font-medium text-gray-900">Products</h3>
                                <div class="flex items-center space-x-4 space-x-reverse">
                                    <span class="text-sm text-gray-500" id="products-count">0 products</span>
                                    <div class="flex items-center space-x-2 space-x-reverse">
                                        <label class="text-sm text-gray-500">Show:</label>
                                        <select
                                            id="per-page-select"
                                            class="px-2 py-1 border border-gray-300 rounded text-sm"
                                        >
                                            <option value="10">10</option>
                                            <option value="25" selected>25</option>
                                            <option value="50">50</option>
                                            <option value="100">100</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <input type="checkbox" id="select-all-products" class="rounded">
                                        </th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Product
                                        </th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Stock
                                        </th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Views
                                        </th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody id="products-table-body" class="bg-white divide-y divide-gray-200">
                                    <!-- Products will be loaded here -->
                                </tbody>
                            </table>
                        </div>

                        <!-- Pagination -->
                        <div id="pagination-container" class="px-6 py-4 border-t border-gray-200">
                            <!-- Pagination will be loaded here -->
                        </div>
                    </div>
                </div>

                <!-- No Products State -->
                <div id="no-products" class="hidden text-center py-12">
                    <i class="fas fa-box-open text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
                    <p class="text-gray-600 mb-6">Start by adding your first product to your store.</p>
                    <button
                        id="add-first-product-btn"
                        class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <i class="fas fa-plus mr-2"></i>
                        Add Your First Product
                    </button>
                </div>
            </div>
        </div>

        <!-- Add/Edit Product Modal -->
        <div id="product-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h2 id="modal-title" class="text-xl font-bold text-gray-900">Add Product</h2>
                            <button id="close-modal" class="text-gray-400 hover:text-gray-600">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>

                        <form id="product-form" class="space-y-6">
                            <input type="hidden" id="product-id" name="product_id">
                            
                            <!-- Basic Information -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label for="product-name" class="block text-sm font-medium text-gray-700 mb-2">
                                        Product Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="product-name"
                                        name="name"
                                        required
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter product name"
                                    >
                                </div>
                                
                                <div>
                                    <label for="product-category" class="block text-sm font-medium text-gray-700 mb-2">
                                        Category *
                                    </label>
                                    <select
                                        id="product-category"
                                        name="category"
                                        required
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select category</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label for="product-description" class="block text-sm font-medium text-gray-700 mb-2">
                                    Description *
                                </label>
                                <textarea
                                    id="product-description"
                                    name="description"
                                    rows="4"
                                    required
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter product description"
                                ></textarea>
                            </div>

                            <!-- Pricing and Stock -->
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label for="product-price" class="block text-sm font-medium text-gray-700 mb-2">
                                        Price (SAR) *
                                    </label>
                                    <input
                                        type="number"
                                        id="product-price"
                                        name="price"
                                        step="0.01"
                                        min="0"
                                        required
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0.00"
                                    >
                                </div>
                                
                                <div>
                                    <label for="product-stock" class="block text-sm font-medium text-gray-700 mb-2">
                                        Stock Quantity
                                    </label>
                                    <input
                                        type="number"
                                        id="product-stock"
                                        name="stock_quantity"
                                        min="0"
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0"
                                    >
                                </div>
                                
                                <div>
                                    <label for="product-brand" class="block text-sm font-medium text-gray-700 mb-2">
                                        Brand
                                    </label>
                                    <select
                                        id="product-brand"
                                        name="brand"
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select brand</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Images -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Product Images
                                </label>
                                <div class="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                    <div class="text-center">
                                        <i class="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-4"></i>
                                        <div class="flex text-sm text-gray-600">
                                            <label for="product-images" class="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                                                <span>Upload files</span>
                                                <input id="product-images" name="images" type="file" class="sr-only" multiple accept="image/*">
                                            </label>
                                            <p class="pl-1">or drag and drop</p>
                                        </div>
                                        <p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                                    </div>
                                    <div id="image-preview" class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 hidden">
                                        <!-- Image previews will be shown here -->
                                    </div>
                                </div>
                            </div>

                            <!-- Submit Buttons -->
                            <div class="flex justify-end space-x-4 space-x-reverse pt-6 border-t">
                                <button
                                    type="button"
                                    id="cancel-product-btn"
                                    class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    id="save-product-btn"
                                    class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    <span id="save-text">Save Product</span>
                                    <span id="save-loading" class="hidden">
                                        <i class="fas fa-spinner fa-spin mr-2"></i>
                                        Saving...
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Initialize the page
    setTimeout(() => {
        initProductsManagementPage();
    }, 100);
    
    return page;
}

export function initProductsManagementPage() {
    console.log('🔄 Initializing Products Management Page...');
    
    // Check authentication
    if (!authService.isAuthenticated()) {
        console.log('❌ User not authenticated, redirecting to login');
        location.hash = '/login';
        return;
    }

    const user = authService.getCurrentUser();
    if (!user || user.role !== 'store_owner') {
        console.log('❌ User not authorized for products management');
        location.hash = '/dashboard';
        return;
    }

    console.log('✅ User authenticated, loading products management...');
    
    // Load initial data
    loadProductsData();
    loadCategories();
    loadBrands();
    
    // Setup event listeners
    setupEventListeners();
}

async function loadProductsData() {
    const loadingEl = document.getElementById('products-loading');
    const contentEl = document.getElementById('products-content');
    const noProductsEl = document.getElementById('no-products');
    
    try {
        loadingEl.classList.remove('hidden');
        contentEl.classList.add('hidden');
        noProductsEl.classList.add('hidden');
        
        console.log('🔄 Loading products data...');
        
        // Get current user's products
        const products = await productService.getMyProducts();
        
        console.log('✅ Products loaded:', products);
        
        if (products.results && products.results.length > 0) {
            renderProductsTable(products.results);
            renderPagination(products);
            updateProductsCount(products.count || products.results.length);
            
            contentEl.classList.remove('hidden');
        } else {
            noProductsEl.classList.remove('hidden');
        }
        
    } catch (error) {
        console.error('❌ Error loading products:', error);
        showToast('Failed to load products: ' + error.message, 'error');
        noProductsEl.classList.remove('hidden');
    } finally {
        loadingEl.classList.add('hidden');
    }
}

async function loadCategories() {
    try {
        const categories = await productService.getCategories();
        const categorySelects = document.querySelectorAll('#category-filter, #product-category');
        
        categorySelects.forEach(select => {
            // Clear existing options (except first one)
            while (select.children.length > 1) {
                select.removeChild(select.lastChild);
            }
            
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                select.appendChild(option);
            });
        });
        
    } catch (error) {
        console.error('❌ Error loading categories:', error);
    }
}

async function loadBrands() {
    try {
        const brands = await productService.getBrands();
        const brandSelect = document.getElementById('product-brand');
        
        // Clear existing options (except first one)
        while (brandSelect.children.length > 1) {
            brandSelect.removeChild(brandSelect.lastChild);
        }
        
        brands.forEach(brand => {
            const option = document.createElement('option');
            option.value = brand.id;
            option.textContent = brand.name;
            brandSelect.appendChild(option);
        });
        
    } catch (error) {
        console.error('❌ Error loading brands:', error);
    }
}

function renderProductsTable(products) {
    const tbody = document.getElementById('products-table-body');
    tbody.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <input type="checkbox" class="product-checkbox rounded" value="${product.id}">
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-12 w-12">
                        <img class="h-12 w-12 rounded-lg object-cover" 
                             src="${product.image || '/images/placeholder-product.jpg'}" 
                             alt="${product.name}">
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${product.name}</div>
                        <div class="text-sm text-gray-500">${product.slug}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-900">${product.category?.name || 'N/A'}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-medium text-gray-900">${product.price} SAR</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-900">${product.stock_quantity || 0}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(product.status)}">
                    ${product.status || 'active'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-900">${product.view_count || 0}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                    <button onclick="editProduct('${product.slug}')" class="text-blue-600 hover:text-blue-900">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="viewProductAnalytics(${product.id})" class="text-green-600 hover:text-green-900">
                        <i class="fas fa-chart-line"></i>
                    </button>
                    <button onclick="toggleProductStock(${product.id})" class="text-yellow-600 hover:text-yellow-900">
                        <i class="fas fa-toggle-${product.is_active ? 'on' : 'off'}"></i>
                    </button>
                    <button onclick="deleteProduct('${product.slug}')" class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function getStatusBadgeClass(status) {
    switch (status) {
        case 'active':
            return 'bg-green-100 text-green-800';
        case 'inactive':
            return 'bg-gray-100 text-gray-800';
        case 'out_of_stock':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-blue-100 text-blue-800';
    }
}

function renderPagination(data) {
    const container = document.getElementById('pagination-container');
    if (!data.next && !data.previous) {
        container.innerHTML = '';
        return;
    }
    
    // Simple pagination implementation
    container.innerHTML = `
        <div class="flex justify-between items-center">
            <button ${!data.previous ? 'disabled' : ''} 
                    class="px-4 py-2 border rounded-md ${!data.previous ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}">
                Previous
            </button>
            <span class="text-sm text-gray-700">
                Page ${Math.ceil((data.count || 0) / 25)} of ${Math.ceil((data.count || 0) / 25)}
            </span>
            <button ${!data.next ? 'disabled' : ''} 
                    class="px-4 py-2 border rounded-md ${!data.next ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}">
                Next
            </button>
        </div>
    `;
}

function updateProductsCount(count) {
    const countEl = document.getElementById('products-count');
    countEl.textContent = `${count} product${count !== 1 ? 's' : ''}`;
}

function setupEventListeners() {
    // Add product buttons
    document.getElementById('add-product-btn')?.addEventListener('click', () => openProductModal());
    document.getElementById('add-first-product-btn')?.addEventListener('click', () => openProductModal());
    
    // Modal controls
    document.getElementById('close-modal')?.addEventListener('click', closeProductModal);
    document.getElementById('cancel-product-btn')?.addEventListener('click', closeProductModal);
    
    // Product form
    document.getElementById('product-form')?.addEventListener('submit', handleProductSubmit);
    
    // Image upload
    document.getElementById('product-images')?.addEventListener('change', handleImageUpload);
    
    // Filters
    document.getElementById('apply-filters-btn')?.addEventListener('click', applyFilters);
    
    // Search
    document.getElementById('search-input')?.addEventListener('input', debounce(applyFilters, 500));
    
    // Select all checkbox
    document.getElementById('select-all-products')?.addEventListener('change', toggleSelectAll);
}

function openProductModal(productSlug = null) {
    const modal = document.getElementById('product-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('product-form');
    
    if (productSlug) {
        title.textContent = 'Edit Product';
        loadProductForEdit(productSlug);
    } else {
        title.textContent = 'Add Product';
        form.reset();
        document.getElementById('product-id').value = '';
    }
    
    modal.classList.remove('hidden');
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    modal.classList.add('hidden');
}

async function handleProductSubmit(e) {
    e.preventDefault();
    
    const saveBtn = document.getElementById('save-product-btn');
    const saveText = document.getElementById('save-text');
    const saveLoading = document.getElementById('save-loading');
    
    try {
        saveText.classList.add('hidden');
        saveLoading.classList.remove('hidden');
        saveBtn.disabled = true;
        
        const formData = new FormData(e.target);
        const productId = document.getElementById('product-id').value;
        
        let result;
        if (productId) {
            // Update existing product
            result = await productService.updateProduct(productId, formData);
        } else {
            // Create new product
            result = await productService.createProduct(formData);
        }
        
        showToast('Product saved successfully!', 'success');
        closeProductModal();
        loadProductsData(); // Reload the products list
        
    } catch (error) {
        console.error('❌ Error saving product:', error);
        showToast('Failed to save product: ' + error.message, 'error');
    } finally {
        saveText.classList.remove('hidden');
        saveLoading.classList.add('hidden');
        saveBtn.disabled = false;
    }
}

function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    const preview = document.getElementById('image-preview');
    
    if (files.length > 0) {
        preview.classList.remove('hidden');
        preview.innerHTML = '';
        
        files.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const div = document.createElement('div');
                div.className = 'relative';
                div.innerHTML = `
                    <img src="${e.target.result}" class="w-full h-24 object-cover rounded-lg">
                    <button type="button" onclick="removeImage(${index})" 
                            class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        ×
                    </button>
                `;
                preview.appendChild(div);
            };
            reader.readAsDataURL(file);
        });
    } else {
        preview.classList.add('hidden');
    }
}

function applyFilters() {
    // Implement filtering logic
    console.log('🔄 Applying filters...');
    loadProductsData();
}

function toggleSelectAll(e) {
    const checkboxes = document.querySelectorAll('.product-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = e.target.checked;
    });
}

// Utility function for debouncing
function debounce(func, wait) {
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

// Global functions for table actions
window.editProduct = function(productSlug) {
    openProductModal(productSlug);
};

window.viewProductAnalytics = function(productId) {
    location.hash = `/products/${productId}/analytics`;
};

window.toggleProductStock = async function(productId) {
    try {
        await productService.toggleProductStock(productId);
        showToast('Product stock status updated', 'success');
        loadProductsData();
    } catch (error) {
        showToast('Failed to update product status: ' + error.message, 'error');
    }
};

window.deleteProduct = async function(productSlug) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            await productService.deleteProduct(productSlug);
            showToast('Product deleted successfully', 'success');
            loadProductsData();
        } catch (error) {
            showToast('Failed to delete product: ' + error.message, 'error');
        }
    }
};

window.removeImage = function(index) {
    // Implement image removal logic
    console.log('Removing image at index:', index);
};