import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import InfiniteProductGrid from '../components/common/InfiniteProductGrid';
import UnlimitedSearchBar from '../components/common/UnlimitedSearchBar';
import { FiShoppingBag, FiTrendingUp, FiZap } from 'react-icons/fi';

const UnlimitedProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [filters, setFilters] = useState({});

  const categories = [
    'All',
    'Electronics',
    'Fashion',
    'Sports & Outdoors',
    'Health & Personal Care',
    'Home & Garden',
    'Books',
    'Automotive',
    'Grocery & Gourmet Food',
    'Baby'
  ];

  useEffect(() => {
    const search = searchParams.get('search') || '';
    const cat = searchParams.get('category') || '';
    setSearchQuery(search);
    setCategory(cat);
  }, [searchParams]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    const newParams = new URLSearchParams(searchParams);
    if (query) {
      newParams.set('search', query);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    const newParams = new URLSearchParams(searchParams);
    if (newCategory && newCategory !== 'All') {
      newParams.set('category', newCategory);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <FiZap className="text-yellow-400" size={32} />
              <h1 className="text-4xl md:text-5xl font-bold">
                Unlimited Products
              </h1>
            </div>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Search millions of products from Amazon, eBay, Walmart, and more. 
              Find the best deals with real-time price comparison.
            </p>
            
            {/* Search Bar */}
            <UnlimitedSearchBar 
              onSearch={handleSearch}
              placeholder="Search millions of products across all platforms..."
              showSuggestions={true}
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">5M+</div>
              <div className="text-primary-100">Products Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">5+</div>
              <div className="text-primary-100">Major Platforms</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">Real-time</div>
              <div className="text-primary-100">Price Updates</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-4 overflow-x-auto">
            <FiShoppingBag className="text-gray-400 flex-shrink-0" size={20} />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
                  (category === cat || (cat === 'All' && !category))
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Trending Section */}
        {!searchQuery && !category && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <FiTrendingUp className="text-primary-600" size={24} />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Trending Now
              </h2>
            </div>
            <TrendingProducts />
          </div>
        )}

        {/* Infinite Product Grid */}
        <InfiniteProductGrid
          searchQuery={searchQuery}
          category={category}
          initialFilters={filters}
          onFiltersChange={handleFiltersChange}
          showFilters={true}
        />
      </div>
    </div>
  );
};

// Trending Products Component
const TrendingProducts = () => {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingProducts();
  }, []);

  const fetchTrendingProducts = async () => {
    try {
      const response = await fetch('/api/v1/products/external/trending?limit=20');
      const data = await response.json();
      
      if (data.success) {
        setTrendingProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching trending products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse">
            <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {trendingProducts.slice(0, 6).map((product, index) => (
        <div
          key={`trending_${product.externalId}_${index}`}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
          onClick={() => window.open(`/product/${product.externalId}?source=${product.source}`, '_blank')}
        >
          <div className="aspect-square overflow-hidden rounded-t-lg">
            <img
              src={product.images?.[0]?.url || '/placeholder-image.jpg'}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              loading="lazy"
            />
          </div>
          <div className="p-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-2">
              {product.title}
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-primary-600">
                ${product.price}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                product.source === 'amazon' ? 'bg-orange-100 text-orange-800' :
                product.source === 'ebay' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {product.source.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UnlimitedProductsPage;
