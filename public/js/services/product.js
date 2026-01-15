/**
 * Product Service
 * Handles all product-related API calls
 */

import { apiService } from './api.js';

class ProductService {
    constructor() {
        this.baseUrl = '/api/products';
    }

    // Product CRUD Operations
    async createProduct(productData) {
        try {
            console.log('🔄 Creating product with data:', productData);
            
            const response = await fetch(`${this.baseUrl}/create/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('authToken')}`
                },
                body: productData // FormData object
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Product creation failed:', errorData);
                throw new Error(errorData.detail || errorData.message || 'Failed to create product');
            }

            const result = await response.json();
            console.log('✅ Product created successfully:', result);
            return result;
        } catch (error) {
            console.error('❌ Error creating product:', error);
            throw error;
        }
    }

    async updateProduct(productSlug, productData) {
        try {
            console.log('🔄 Updating product:', productSlug, productData);
            
            const response = await fetch(`${this.baseUrl}/${productSlug}/update/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('authToken')}`
                },
                body: productData // FormData object
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Product update failed:', errorData);
                throw new Error(errorData.detail || errorData.message || 'Failed to update product');
            }

            const result = await response.json();
            console.log('✅ Product updated successfully:', result);
            return result;
        } catch (error) {
            console.error('❌ Error updating product:', error);
            throw error;
        }
    }

    async deleteProduct(productSlug) {
        try {
            console.log('🔄 Deleting product:', productSlug);
            
            const response = await apiService.delete(`${this.baseUrl}/${productSlug}/`);
            console.log('✅ Product deleted successfully');
            return response;
        } catch (error) {
            console.error('❌ Error deleting product:', error);
            throw error;
        }
    }

    async getProduct(productSlug) {
        try {
            return await apiService.get(`${this.baseUrl}/${productSlug}/`);
        } catch (error) {
            console.error('❌ Error getting product:', error);
            throw error;
        }
    }

    async getProductById(productId) {
        try {
            return await apiService.get(`${this.baseUrl}/${productId}/`);
        } catch (error) {
            console.error('❌ Error getting product by ID:', error);
            throw error;
        }
    }

    // Product Lists
    async getProducts(filters = {}) {
        try {
            const queryParams = new URLSearchParams(filters);
            return await apiService.get(`${this.baseUrl}/?${queryParams}`);
        } catch (error) {
            console.error('❌ Error getting products:', error);
            throw error;
        }
    }

    async getStoreProducts(storeId, filters = {}) {
        try {
            console.log('🔄 Getting store products for store:', storeId, 'with filters:', filters);
            const queryParams = new URLSearchParams({
                store: storeId,
                ...filters
            });
            const response = await apiService.get(`${this.baseUrl}/?${queryParams}`);
            console.log('✅ Store products loaded:', response);
            return response;
        } catch (error) {
            console.error('❌ Error getting store products:', error);
            throw error;
        }
    }

    async getMyProducts(filters = {}) {
        try {
            console.log('🔄 Getting my products with filters:', filters);
            const queryParams = new URLSearchParams({
                my_products: 'true',
                ...filters
            });
            const response = await apiService.get(`${this.baseUrl}/?${queryParams}`);
            console.log('✅ My products loaded:', response);
            return response;
        } catch (error) {
            console.error('❌ Error getting my products:', error);
            throw error;
        }
    }

    async toggleProductStock(productId) {
        try {
            console.log('🔄 Toggling product stock for product:', productId);
            const response = await apiService.post(`${this.baseUrl}/${productId}/toggle-stock/`);
            console.log('✅ Product stock toggled successfully');
            return response;
        } catch (error) {
            console.error('❌ Error toggling product stock:', error);
            throw error;
        }
    }

    async bulkUpdateProducts(productIds, updateData) {
        try {
            console.log('🔄 Bulk updating products:', productIds, updateData);
            const response = await apiService.post(`${this.baseUrl}/bulk-update/`, {
                product_ids: productIds,
                update_data: updateData
            });
            console.log('✅ Products bulk updated successfully');
            return response;
        } catch (error) {
            console.error('❌ Error bulk updating products:', error);
            throw error;
        }
    }

    // Categories and Brands
    async getCategories() {
        try {
            return await apiService.get(`${this.baseUrl}/categories/`);
        } catch (error) {
            console.error('❌ Error getting categories:', error);
            throw error;
        }
    }

    async getBrands() {
        try {
            return await apiService.get(`${this.baseUrl}/brands/`);
        } catch (error) {
            console.error('❌ Error getting brands:', error);
            throw error;
        }
    }

    // Product Interactions
    async toggleProductLike(productSlug) {
        try {
            console.log('🔄 Toggling product like:', productSlug);
            
            const response = await apiService.post(`${this.baseUrl}/${productSlug}/like/`);
            console.log('✅ Product like toggled successfully');
            return response;
        } catch (error) {
            console.error('❌ Error toggling product like:', error);
            throw error;
        }
    }

    async getSimilarProducts(productSlug) {
        try {
            return await apiService.get(`${this.baseUrl}/${productSlug}/similar/`);
        } catch (error) {
            console.error('❌ Error getting similar products:', error);
            throw error;
        }
    }

    // Product Analytics
    async getProductPerformance(productId) {
        try {
            return await apiService.get(`/api/dashboard/products/${productId}/performance/`);
        } catch (error) {
            console.error('❌ Error getting product performance:', error);
            throw error;
        }
    }

    async toggleProductStock(productId) {
        try {
            console.log('🔄 Toggling product stock:', productId);
            
            const response = await apiService.post(`/api/dashboard/products/${productId}/toggle-stock/`);
            console.log('✅ Product stock toggled successfully');
            return response;
        } catch (error) {
            console.error('❌ Error toggling product stock:', error);
            throw error;
        }
    }

    // Best Products (AI-powered)
    async getBestProducts(filters = {}) {
        try {
            const queryParams = new URLSearchParams(filters);
            return await apiService.get(`${this.baseUrl}/best/?${queryParams}`);
        } catch (error) {
            console.error('❌ Error getting best products:', error);
            throw error;
        }
    }

    // Utility Methods
    async uploadProductImage(file) {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('/api/upload/product-image/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('authToken')}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to upload image');
            }

            return await response.json();
        } catch (error) {
            console.error('❌ Error uploading product image:', error);
            throw error;
        }
    }

    // Validation
    validateProductData(productData) {
        const errors = [];

        if (!productData.name || productData.name.trim().length < 3) {
            errors.push('Product name must be at least 3 characters long');
        }

        if (!productData.description || productData.description.trim().length < 10) {
            errors.push('Product description must be at least 10 characters long');
        }

        if (!productData.price || parseFloat(productData.price) <= 0) {
            errors.push('Product price must be greater than 0');
        }

        if (!productData.category) {
            errors.push('Product category is required');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

export const productService = new ProductService();