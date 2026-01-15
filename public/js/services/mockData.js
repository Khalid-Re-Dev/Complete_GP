// Real backend data only - no mock data
// All data is fetched from http://localhost:8000/api
// Note: Using local fallback images to avoid CORS issues
// Mock stores data
export const mockStores = [
  {
    id: 1,
    name: "TechWorld",
    slug: "techworld",
    description: "Your one-stop shop for the latest technology and gadgets",
    logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop",
    products_count: 45,
    rating: 4.8,
    verified: true,
    location: "New York, USA"
  },
  {
    id: 2,
    name: "ElectroHub",
    slug: "electrohub",
    description: "Premium electronics and home appliances",
    logo: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop",
    products_count: 32,
    rating: 4.6,
    verified: true,
    location: "California, USA"
  },
  {
    id: 3,
    name: "GadgetZone",
    slug: "gadgetzone",
    description: "Innovative gadgets and smart devices",
    logo: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=100&h=100&fit=crop",
    products_count: 28,
    rating: 4.7,
    verified: true,
    location: "Texas, USA"
  },
  {
    id: 4,
    name: "SmartStore",
    slug: "smartstore",
    description: "Smart home solutions and IoT devices",
    logo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop",
    products_count: 19,
    rating: 4.5,
    verified: false,
    location: "Florida, USA"
  },
  {
    id: 5,
    name: "DigitalMart",
    slug: "digitalmart",
    description: "Digital products and software solutions",
    logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop",
    products_count: 15,
    rating: 4.4,
    verified: true,
    location: "Washington, USA"
  }
]

export const mockProducts = [
  {
    id: 1,
    name: "iPhone 15 Pro",
    category: "Phones",
    price: 999.99,
    discount_percentage: 10,
    image_urls: ["./assets/products/iphone-15-pro.jpg"],
    description: "Latest iPhone with advanced camera system and A17 Pro chip.",
    stock: 50,
    rating: 4.8,
    reviews_count: 1250,
    store: "TechWorld"
  },
  {
    id: 2,
    name: "MacBook Pro 16\"",
    category: "Computers",
    price: 2499.99,
    discount_percentage: 5,
    image_urls: ["https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop"],
    description: "Powerful laptop for professionals with M3 chip.",
    stock: 25,
    rating: 4.9,
    reviews_count: 890,
    store: "TechWorld"
  },
  {
    id: 3,
    name: "Apple Watch Series 9",
    category: "SmartWatch",
    price: 399.99,
    discount_percentage: 15,
    image_urls: ["https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=400&fit=crop"],
    description: "Advanced health monitoring and fitness tracking.",
    stock: 100,
    rating: 4.7,
    reviews_count: 2100,
    store: "ElectroHub"
  },
  {
    id: 4,
    name: "Canon EOS R5",
    category: "Camera",
    price: 3899.99,
    discount_percentage: 8,
    image_urls: ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=400&fit=crop"],
    description: "Professional mirrorless camera with 8K video recording.",
    stock: 15,
    rating: 4.9,
    reviews_count: 450,
    store: "GadgetZone"
  },
  {
    id: 5,
    name: "Sony WH-1000XM5",
    category: "HeadPhones",
    price: 399.99,
    discount_percentage: 20,
    image_urls: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop"],
    description: "Industry-leading noise canceling headphones.",
    stock: 75,
    rating: 4.8,
    reviews_count: 3200,
    store: "ElectroHub"
  },
  {
    id: 6,
    name: "PlayStation 5",
    category: "Gaming",
    price: 499.99,
    discount_percentage: 0,
    image_urls: ["https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=400&fit=crop"],
    description: "Next-generation gaming console with ultra-fast SSD.",
    stock: 30,
    rating: 4.6,
    reviews_count: 5600,
    store: "GadgetZone"
  },
  {
    id: 7,
    name: "Samsung Galaxy S24 Ultra",
    category: "Phones",
    price: 1199.99,
    discount_percentage: 12,
    image_urls: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop"],
    description: "Premium Android phone with S Pen and AI features.",
    stock: 40,
    rating: 4.7,
    reviews_count: 980,
    store: "SmartStore"
  },
  {
    id: 8,
    name: "Dell XPS 13",
    category: "Computers",
    price: 1299.99,
    discount_percentage: 7,
    image_urls: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop"],
    description: "Ultra-portable laptop with stunning InfinityEdge display.",
    stock: 35,
    rating: 4.5,
    reviews_count: 670,
    store: "DigitalMart"
  }
];

export const mockUser = {
  id: 1,
  username: "testuser",
  email: "test@example.com",
  first_name: "Test",
  last_name: "User",
  role: "customer",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
};

export const mockCategories = [
  { id: 1, name: "Phones", icon: "fa-mobile-alt", count: 25 },
  { id: 2, name: "Computers", icon: "fa-laptop", count: 18 },
  { id: 3, name: "SmartWatch", icon: "fa-stopwatch", count: 12 },
  { id: 4, name: "Camera", icon: "fa-camera", count: 8 },
  { id: 5, name: "HeadPhones", icon: "fa-headphones", count: 15 },
  { id: 6, name: "Gaming", icon: "fa-gamepad", count: 10 }
];

// Mock API responses
export const mockApiResponses = {
  '/auth/login/': {
    access: 'mock-jwt-token-12345',
    refresh: 'mock-refresh-token-67890'
  },
  '/auth/profile/': mockUser,
  '/products/stores/': mockStores,
  '/products/': {
    count: mockProducts.length,
    next: null,
    previous: null,
    results: mockProducts
  },
  '/dashboard/stats/': {
    total_products: 150,
    total_orders: 1250,
    total_revenue: 125000.50,
    monthly_growth: 15.5
  }
};
