import { mockProducts, mockUser, mockApiResponses } from './mockData.js';
import { showToast } from '../utils/helpers.js?v=2024';

// Mock API service for testing without backend
const MOCK_DELAY = 500; // Simulate network delay

function mockFetch(endpoint, options = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log(`Mock API call: ${endpoint}`, options);
      
      // Handle different endpoints
      if (endpoint === '/auth/login/') {
        const body = JSON.parse(options.body || '{}');
        if (body.username && body.password) {
          resolve(mockApiResponses['/auth/login/']);
        } else {
          reject(new Error('Invalid credentials'));
        }
      } else if (endpoint === '/auth/profile/') {
        resolve(mockApiResponses['/auth/profile/']);
      } else if (endpoint.startsWith('/products/')) {
        if (endpoint === '/products/') {
          resolve(mockApiResponses['/products/']);
        } else if (endpoint === '/products/stores/') {
          resolve(mockApiResponses['/products/stores/']);
        } else {
          // Handle specific product by ID
          const id = parseInt(endpoint.split('/')[2]);
          const product = mockProducts.find(p => p.id === id);
          if (product) {
            resolve(product);
          } else {
            reject(new Error('Product not found'));
          }
        }
      } else if (endpoint === '/dashboard/stats/') {
        resolve(mockApiResponses['/dashboard/stats/']);
      } else if (endpoint === '/auth/register/') {
        const body = JSON.parse(options.body || '{}');
        if (body.username && body.email && body.password) {
          resolve({ message: 'Registration successful' });
        } else {
          reject(new Error('Missing required fields'));
        }
      } else {
        reject(new Error(`Mock endpoint not implemented: ${endpoint}`));
      }
    }, MOCK_DELAY);
  });
}

// Mock API services
export const mockAuthService = {
  login: (username, password) =>
    mockFetch('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),
  register: (userData) =>
    mockFetch('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
  getProfile: () => mockFetch('/auth/profile/')
};

export const mockProductService = {
  getProducts: (params = '') => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Mock API: getProducts with params:', params);
        
        let filteredProducts = [...mockProducts];
        
        // Parse URL parameters
        const urlParams = new URLSearchParams(params);
        
        // Filter by store
        const storeFilter = urlParams.get('store__name');
        if (storeFilter) {
          console.log('Filtering by store:', storeFilter);
          filteredProducts = filteredProducts.filter(p => p.store === storeFilter);
        }
        
        // Filter by category
        const categoryFilter = urlParams.get('category__name');
        if (categoryFilter) {
          console.log('Filtering by category:', categoryFilter);
          filteredProducts = filteredProducts.filter(p => p.category === categoryFilter);
        }
        
        // Filter by price range
        const priceMin = urlParams.get('price__gte');
        const priceMax = urlParams.get('price__lte');
        if (priceMin) {
          filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(priceMin));
        }
        if (priceMax) {
          filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(priceMax));
        }
        
        // Search filter
        const searchQuery = urlParams.get('search');
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.description.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query)
          );
        }
        
        // Sort products
        const ordering = urlParams.get('ordering');
        if (ordering) {
          switch (ordering) {
            case 'price':
              filteredProducts.sort((a, b) => a.price - b.price);
              break;
            case '-price':
              filteredProducts.sort((a, b) => b.price - a.price);
              break;
            case '-average_rating':
              filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
              break;
            case '-created_at':
              filteredProducts.sort((a, b) => b.id - a.id); // Simulate newest first
              break;
            case 'name':
            default:
              filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
              break;
          }
        }
        
        console.log(`Mock API: Returning ${filteredProducts.length} products after filtering`);
        
        resolve({
          count: filteredProducts.length,
          next: null,
          previous: null,
          results: filteredProducts
        });
      }, MOCK_DELAY);
    });
  },
  getProductById: (id) => mockFetch(`/products/${id}/`),
  getStores: (params = '') => mockFetch('/products/stores/'),
  getSimilarProducts: (id) => {
    // Return products from same category
    const product = mockProducts.find(p => p.id === parseInt(id));
    if (product) {
      const similar = mockProducts
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 4);
      return Promise.resolve({ results: similar });
    }
    return Promise.reject(new Error('Product not found'));
  }
};

export const mockDashboardService = {
  getStats: () => mockFetch('/dashboard/stats/'),
  getOwnerProducts: () => mockFetch('/products/'),
  updateProduct: (id, data) => 
    Promise.resolve({ message: 'Product updated successfully' })
};

export const mockBehaviorService = {
  log: (behaviorData) => 
    Promise.resolve({ message: 'Behavior logged' }),
  getRealtimeRecs: () => 
    Promise.resolve({ results: mockProducts.slice(0, 3) })
};

export const mockReportService = {
  generateReport: (reportType) =>
    Promise.resolve({ id: 'mock-report-123', status: 'processing' }),
  getReportStatus: (id) =>
    Promise.resolve({ id, status: 'completed', download_url: '#' })
};
