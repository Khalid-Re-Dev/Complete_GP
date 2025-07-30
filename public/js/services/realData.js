// Real backend data only - no mock data
// All data is fetched from http://localhost:8000/api

// Only keep essential empty arrays for fallback
export const mockStores = [];
export const mockProducts = [];

export const mockUser = {
  id: null,
  username: "",
  email: "",
  first_name: "",
  last_name: "",
  role: "customer",
  avatar: ""
};

export const mockCategories = [];

// Mock API responses - only for authentication fallback
export const mockApiResponses = {
  '/auth/login/': {
    access: 'mock-jwt-token-12345',
    refresh: 'mock-refresh-token-67890'
  },
  '/auth/profile/': mockUser,
  '/products/stores/': {
    count: 0,
    next: null,
    previous: null,
    results: mockStores
  },
  '/products/': {
    count: 0,
    next: null,
    previous: null,
    results: mockProducts
  },
  '/promotions/': {
    count: 0,
    next: null,
    previous: null,
    results: []
  }
};