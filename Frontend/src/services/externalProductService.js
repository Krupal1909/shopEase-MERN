import api from './api';

class ExternalProductService {
  // Get products with real-time data
  async getProducts(params = {}) {
    const {
      keyword = '',
      category = '',
      page = 1,
      limit = 20,
      realTime = true,
      sources = 'local,amazon',
      sortBy = 'relevance',
      minPrice,
      maxPrice
    } = params;

    const queryParams = new URLSearchParams({
      keyword,
      category,
      page: page.toString(),
      limit: limit.toString(),
      realTime: realTime.toString(),
      sources,
      sortBy
    });

    if (minPrice) queryParams.append('minPrice', minPrice.toString());
    if (maxPrice) queryParams.append('maxPrice', maxPrice.toString());

    try {
      const response = await api.get(`/products?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // Search products across all sources
  async searchProducts(query, options = {}) {
    const {
      category = '',
      page = 1,
      limit = 20,
      sources = 'local,amazon'
    } = options;

    const queryParams = new URLSearchParams({
      query,
      category,
      page: page.toString(),
      limit: limit.toString(),
      sources
    });

    try {
      const response = await api.get(`/products/external/search?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  // Get trending products
  async getTrendingProducts(category = '', limit = 20) {
    const queryParams = new URLSearchParams({
      category,
      limit: limit.toString()
    });

    try {
      const response = await api.get(`/products/external/trending?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching trending products:', error);
      throw error;
    }
  }

  // Get products by category
  async getProductsByCategory(category, options = {}) {
    const {
      page = 1,
      limit = 20,
      sources = 'local,amazon'
    } = options;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sources
    });

    try {
      const response = await api.get(`/products/external/category/${category}?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  }

  // Get product details (supports both local and external)
  async getProductDetails(id, source = 'auto') {
    const queryParams = source !== 'auto' ? `?source=${source}` : '';
    
    try {
      const response = await api.get(`/products/${id}${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product details:', error);
      throw error;
    }
  }

  // Get product recommendations
  async getProductRecommendations(id, options = {}) {
    const {
      source = 'local',
      limit = 10
    } = options;

    const queryParams = new URLSearchParams({
      source,
      limit: limit.toString()
    });

    try {
      const response = await api.get(`/products/${id}/recommendations?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product recommendations:', error);
      throw error;
    }
  }

  // Clear API cache (admin only)
  async clearApiCache() {
    try {
      const response = await api.post('/products/external/clear-cache');
      return response.data;
    } catch (error) {
      console.error('Error clearing API cache:', error);
      throw error;
    }
  }

  // Get API statistics (admin only)
  async getApiStats() {
    try {
      const response = await api.get('/products/external/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching API stats:', error);
      throw error;
    }
  }

  // Format product for display (normalize between local and external)
  formatProduct(product) {
    return {
      id: product._id || product.externalId,
      title: product.title || product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || product.price,
      discountPrice: product.discountPrice,
      discount: product.discount || 0,
      rating: product.rating || product.ratings || 0,
      reviewCount: product.reviewCount || product.numOfReviews || 0,
      images: product.images || [],
      variants: product.variants || [],
      category: product.category,
      brand: product.brand,
      availability: product.availability !== false && product.stock !== 0,
      stock: product.stock,
      source: product.source || 'local',
      url: product.url,
      features: product.features || [],
      specifications: product.specifications || {},
      isExternal: product.source && product.source !== 'local'
    };
  }

  // Get categories with external support
  getAvailableCategories() {
    return [
      'All',
      'Electronics',
      'Sports & Outdoors', 
      'Fashion',
      'Health & Personal Care',
      'Home & Garden',
      'Books',
      'Automotive',
      'Grocery & Gourmet Food',
      'Baby'
    ];
  }

  // Get available data sources
  getAvailableSources() {
    return [
      { value: 'local', label: 'Local Products' },
      { value: 'amazon', label: 'Amazon' },
      { value: 'local,amazon', label: 'All Sources' }
    ];
  }

  // Get sort options
  getSortOptions() {
    return [
      { value: 'relevance', label: 'Relevance' },
      { value: 'price_low', label: 'Price: Low to High' },
      { value: 'price_high', label: 'Price: High to Low' },
      { value: 'rating', label: 'Customer Rating' },
      { value: 'discount', label: 'Discount' },
      { value: 'newest', label: 'Newest First' }
    ];
  }
}

export default new ExternalProductService();
