import { API_BASE_URL } from '../config/api';

class UnlimitedProductService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/products`;
  }

  // Get unlimited products with infinite scroll
  async getInfiniteProducts(options = {}) {
    const {
      query = '',
      category = '',
      page = 1,
      limit = 50,
      sources = ['amazon', 'ebay', 'walmart', 'local'],
      sortBy = 'relevance',
      minPrice,
      maxPrice,
      minRating = 0,
      brands = [],
      availability = true
    } = options;

    const params = new URLSearchParams({
      query,
      category,
      page: page.toString(),
      limit: limit.toString(),
      sources: sources.join(','),
      sortBy,
      minRating: minRating.toString(),
      availability: availability.toString()
    });

    if (minPrice) params.append('minPrice', minPrice.toString());
    if (maxPrice) params.append('maxPrice', maxPrice.toString());
    if (brands.length > 0) params.append('brands', brands.join(','));

    const response = await fetch(`${this.baseURL}/unlimited?${params}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Advanced search with unlimited results
  async advancedSearch(options = {}) {
    const {
      query,
      category = '',
      page = 1,
      limit = 50,
      sources = ['amazon', 'ebay', 'walmart', 'local'],
      sortBy = 'relevance',
      minPrice,
      maxPrice,
      minRating = 0,
      brands = [],
      hasDiscount,
      freeShipping
    } = options;

    if (!query) {
      throw new Error('Search query is required');
    }

    const params = new URLSearchParams({
      query,
      category,
      page: page.toString(),
      limit: limit.toString(),
      sources: sources.join(','),
      sortBy,
      minRating: minRating.toString()
    });

    if (minPrice) params.append('minPrice', minPrice.toString());
    if (maxPrice) params.append('maxPrice', maxPrice.toString());
    if (brands.length > 0) params.append('brands', brands.join(','));
    if (hasDiscount !== undefined) params.append('hasDiscount', hasDiscount.toString());
    if (freeShipping !== undefined) params.append('freeShipping', freeShipping.toString());

    const response = await fetch(`${this.baseURL}/unlimited/search?${params}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Get search suggestions
  async getSearchSuggestions(query, limit = 10) {
    if (!query) {
      throw new Error('Query is required');
    }

    const params = new URLSearchParams({
      query,
      limit: limit.toString()
    });

    const response = await fetch(`${this.baseURL}/suggestions?${params}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Get price comparison
  async getPriceComparison(productTitle, brand = '', category = '') {
    if (!productTitle) {
      throw new Error('Product title is required');
    }

    const params = new URLSearchParams({
      productTitle,
      brand,
      category
    });

    const response = await fetch(`${this.baseURL}/price-comparison?${params}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Get trending products
  async getTrendingProducts(category = '', limit = 100) {
    const params = new URLSearchParams({
      category,
      limit: limit.toString()
    });

    const response = await fetch(`${this.baseURL}/external/trending?${params}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Get product by ID with source
  async getProductById(id, source = 'auto') {
    const params = new URLSearchParams({ source });

    const response = await fetch(`${this.baseURL}/${id}?${params}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Get product recommendations
  async getProductRecommendations(id, source = 'local', limit = 10) {
    const params = new URLSearchParams({
      source,
      limit: limit.toString()
    });

    const response = await fetch(`${this.baseURL}/${id}/recommendations?${params}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Get products by category
  async getProductsByCategory(category, page = 1, limit = 50, sources = ['amazon', 'ebay', 'walmart', 'local']) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sources: sources.join(',')
    });

    const response = await fetch(`${this.baseURL}/external/category/${encodeURIComponent(category)}?${params}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Search products across all sources
  async searchProducts(query, category = '', page = 1, limit = 50, sources = ['amazon', 'ebay', 'walmart', 'local']) {
    if (!query) {
      throw new Error('Search query is required');
    }

    const params = new URLSearchParams({
      query,
      category,
      page: page.toString(),
      limit: limit.toString(),
      sources: sources.join(',')
    });

    const response = await fetch(`${this.baseURL}/external/search?${params}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Admin functions
  async clearApiCache() {
    const response = await fetch(`${this.baseURL}/external/clear-cache`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async getApiStats() {
    const response = await fetch(`${this.baseURL}/external/stats`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Utility functions
  formatPrice(price, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  }

  getSourceDisplayName(source) {
    const displayNames = {
      amazon: 'Amazon',
      ebay: 'eBay',
      walmart: 'Walmart',
      aliexpress: 'AliExpress',
      etsy: 'Etsy',
      local: 'Our Store'
    };
    return displayNames[source] || source.charAt(0).toUpperCase() + source.slice(1);
  }

  getSourceColor(source) {
    const colors = {
      amazon: '#FF9900',
      ebay: '#0064D2',
      walmart: '#0071CE',
      aliexpress: '#FF6A00',
      etsy: '#F16521',
      local: '#10B981'
    };
    return colors[source] || '#6B7280';
  }

  // Cache management
  clearLocalCache() {
    // Clear any localStorage cache if implemented
    const cacheKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('unlimited_products_') || 
      key.startsWith('product_search_') ||
      key.startsWith('trending_products_')
    );
    
    cacheKeys.forEach(key => localStorage.removeItem(key));
  }

  // Error handling utility
  handleApiError(error) {
    console.error('Unlimited Product Service Error:', error);
    
    if (error.message.includes('404')) {
      return 'Product not found';
    } else if (error.message.includes('429')) {
      return 'Too many requests. Please try again later.';
    } else if (error.message.includes('500')) {
      return 'Server error. Please try again later.';
    } else if (error.message.includes('Network')) {
      return 'Network error. Please check your connection.';
    }
    
    return 'An unexpected error occurred. Please try again.';
  }
}

export default new UnlimitedProductService();
