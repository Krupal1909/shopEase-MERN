import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - cookies are automatically sent with requests
api.interceptors.request.use(
  (config) => {
    // Ensure credentials are included for cookie-based auth
    config.withCredentials = true;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear any stored user data and redirect to login
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    toast.error(message);
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (formData) => api.post('/auth/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  googleAuth: (userData) => api.post('/auth/google', userData),
};

// Products API
export const productsAPI = {
  getAllProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/product?${queryString}`);
  },
  getProductById: (id) => api.get(`/product/${id}`),
  getProductsByCategory: (category, params = {}) => {
    const queryString = new URLSearchParams({ ...params, category }).toString();
    return api.get(`/product?${queryString}`);
  },
  addProduct: (formData) => api.post('/product', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateProduct: (id, formData) => api.put(`/product/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteProduct: (id) => api.delete(`/product/${id}`),
  addReview: (productId, reviewData) => api.post(`/product/${productId}/review`, reviewData),
};

// Categories API
export const categoriesAPI = {
  getAllCategories: () => api.get('/category'),
  getCategoryById: (id) => api.get(`/category/${id}`),
  createCategory: (categoryData) => api.post('/category', categoryData),
  updateCategory: (id, categoryData) => api.put(`/category/${id}`, categoryData),
  deleteCategory: (id) => api.delete(`/category/${id}`),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (productData) => api.post('/cart/add', productData),
  updateCartItem: (itemId, updateData) => api.put(`/cart/item/${itemId}`, updateData),
  removeFromCart: (itemId) => api.delete(`/cart/item/${itemId}`),
};

// Wishlist API
export const wishlistAPI = {
  getWishlist: () => api.get('/wishlist'),
  addToWishlist: (productData) => api.post('/wishlist', productData),
  removeFromWishlist: (productId) => api.delete(`/wishlist/${productId}`),
  clearWishlist: () => api.delete('/wishlist'),
};

// Orders API
export const ordersAPI = {
  createOrder: (formData) => api.post('/orders', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAllOrders: () => api.get('/orders'),
  getOrderDetails: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

// Payment API
export const paymentAPI = {
  createRazorpayOrder: (orderData) => api.post('/payment/create-order', orderData),
  verifyPayment: (paymentData) => api.post('/payment/verify', paymentData),
};

// User API
export const userAPI = {
  getUserProfile: () => api.get('/user/profile'),
  updateUserProfile: (userData) => api.put('/user/profile', userData),
  updatePassword: (passwordData) => api.put('/user/password', passwordData),
  getUsersOrder: () => api.get('/user/orders'),
  getUserOrderById: (id) => api.get(`/user/orders/${id}`),
};

// Coupons API
export const couponsAPI = {
  getAllCoupons: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/coupons?${queryString}`);
  },
  getCouponById: (id) => api.get(`/coupons/${id}`),
  createCoupon: (couponData) => api.post('/coupons', couponData),
  updateCoupon: (id, couponData) => api.put(`/coupons/${id}`, couponData),
  applyCoupon: (couponData) => api.post('/coupons/apply-coupon', couponData),
};

// Utility functions
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getImageUrl = (imagePath, category = 'general') => {
  if (!imagePath) return getPlaceholderImage(category);
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_BASE_URL}/uploads/${imagePath}`;
};

// Static placeholder images based on category
export const getPlaceholderImage = (category = 'general') => {
  const placeholders = {
    'electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop&crop=center',
    'fashion': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&crop=center',
    'health': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center',
    'home': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=center',
    'sports': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center',
    'books': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop&crop=center',
    'automotive': 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=400&fit=crop&crop=center',
    'grocery': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop&crop=center',
    'baby': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop&crop=center',
    'general': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center'
  };

  // Map category names to placeholder keys
  const categoryKey = category.toLowerCase().includes('electronics') || category.toLowerCase().includes('gadgets') ? 'electronics' :
                     category.toLowerCase().includes('fashion') || category.toLowerCase().includes('apparel') ? 'fashion' :
                     category.toLowerCase().includes('health') || category.toLowerCase().includes('beauty') ? 'health' :
                     category.toLowerCase().includes('home') || category.toLowerCase().includes('living') ? 'home' :
                     category.toLowerCase().includes('sports') || category.toLowerCase().includes('outdoor') ? 'sports' :
                     category.toLowerCase().includes('book') || category.toLowerCase().includes('stationery') ? 'books' :
                     category.toLowerCase().includes('automotive') || category.toLowerCase().includes('industrial') ? 'automotive' :
                     category.toLowerCase().includes('grocery') || category.toLowerCase().includes('food') ? 'grocery' :
                     category.toLowerCase().includes('baby') || category.toLowerCase().includes('kids') ? 'baby' :
                     'general';

  return placeholders[categoryKey];
};

// Error handler utility
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    switch (status) {
      case 400:
        return data.message || 'Bad request';
      case 401:
        return 'Unauthorized access';
      case 403:
        return 'Access forbidden';
      case 404:
        return 'Resource not found';
      case 500:
        return 'Internal server error';
      default:
        return data.message || 'Something went wrong';
    }
  } else if (error.request) {
    // Network error
    return 'Network error. Please check your connection.';
  } else {
    // Other error
    return error.message || 'Something went wrong';
  }
};

// Admin API
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getAllProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/products?${queryString}`);
  },
  getAllUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/users?${queryString}`);
  },
  updateUserRole: (userId, roleData) => api.patch(`/admin/users/${userId}/role`, roleData),
  toggleUserStatus: (userId) => api.patch(`/admin/users/${userId}/toggle-status`),
  getCategories: () => api.get('/admin/categories'),
  bulkUpdateProducts: (productIds, updates) => api.patch('/admin/products/bulk-update', { productIds, updates }),
};

// Product API (alias for backward compatibility)
export const productAPI = productsAPI;

export default api;
