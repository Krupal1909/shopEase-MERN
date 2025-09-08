import React, { useState, useEffect, useCallback, useRef } from 'react';
import ProductCard from './ProductCard';
import { FiLoader, FiFilter, FiGrid, FiList, FiChevronDown } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const InfiniteProductGrid = ({ 
  searchQuery = '', 
  category = '', 
  initialFilters = {},
  onFiltersChange = () => {},
  showFilters = true 
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sources, setSources] = useState({});
  const [filters, setFilters] = useState({
    sources: ['amazon', 'ebay', 'walmart', 'local'],
    sortBy: 'relevance',
    minPrice: '',
    maxPrice: '',
    minRating: 0,
    brands: [],
    availability: true,
    ...initialFilters
  });
  const [availableFilters, setAvailableFilters] = useState({
    priceRange: { min: 0, max: 1000 },
    categories: [],
    brands: [],
    sources: []
  });
  const [viewMode, setViewMode] = useState('grid');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  
  const observer = useRef();
  const lastProductElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreProducts();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const loadProducts = useCallback(async (pageNum = 1, resetProducts = false) => {
    if (loading && !resetProducts) return;
    
    setLoading(true);
    
    try {
      const queryParams = new URLSearchParams({
        query: searchQuery,
        category: category,
        page: pageNum,
        limit: 50,
        sources: filters.sources.join(','),
        sortBy: filters.sortBy,
        minRating: filters.minRating,
        availability: filters.availability
      });

      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
      if (filters.brands.length > 0) queryParams.append('brands', filters.brands.join(','));

      const response = await fetch(`/api/v1/products/unlimited?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        if (resetProducts || pageNum === 1) {
          setProducts(data.products);
        } else {
          setProducts(prev => [...prev, ...data.products]);
        }
        
        setTotalCount(data.totalCount);
        setSources(data.sources);
        setAvailableFilters(data.filters);
        setHasMore(data.pagination.hasNext);
        setPage(pageNum);
      } else {
        toast.error(data.message || 'Failed to load products');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, category, filters]);

  const loadMoreProducts = useCallback(() => {
    if (!loading && hasMore) {
      loadProducts(page + 1, false);
    }
  }, [page, loading, hasMore, loadProducts]);

  useEffect(() => {
    loadProducts(1, true);
  }, [searchQuery, category, filters]);

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSourceToggle = (source) => {
    const newSources = filters.sources.includes(source)
      ? filters.sources.filter(s => s !== source)
      : [...filters.sources, source];
    handleFilterChange('sources', newSources);
  };

  const handleBrandToggle = (brand) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter(b => b !== brand)
      : [...filters.brands, brand];
    handleFilterChange('brands', newBrands);
  };

  const clearFilters = () => {
    const defaultFilters = {
      sources: ['amazon', 'ebay', 'walmart', 'local'],
      sortBy: 'relevance',
      minPrice: '',
      maxPrice: '',
      minRating: 0,
      brands: [],
      availability: true
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const getSourceColor = (source) => {
    const colors = {
      amazon: 'bg-orange-500',
      ebay: 'bg-blue-500',
      walmart: 'bg-blue-600',
      aliexpress: 'bg-red-500',
      etsy: 'bg-orange-600',
      local: 'bg-green-500'
    };
    return colors[source] || 'bg-gray-500';
  };

  return (
    <div className="w-full">
      {/* Header with Stats and Controls */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {searchQuery ? `Search: "${searchQuery}"` : category ? `${category} Products` : 'All Products'}
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {totalCount.toLocaleString()} products found
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-gray-600 text-primary-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
              >
                <FiGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-gray-600 text-primary-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
              >
                <FiList size={16} />
              </button>
            </div>

            {/* Filter Toggle */}
            {showFilters && (
              <button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <FiFilter size={16} />
                Filters
                <FiChevronDown 
                  size={14} 
                  className={`transition-transform ${showFilterPanel ? 'rotate-180' : ''}`} 
                />
              </button>
            )}

            {/* Sort Dropdown */}
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="relevance">Most Relevant</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popularity">Most Popular</option>
              <option value="best_deal">Best Deals</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        {/* Source Status Indicators */}
        <div className="flex flex-wrap gap-2 mt-4">
          {Object.entries(sources).map(([source, data]) => (
            <div key={source} className="flex items-center gap-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${getSourceColor(source)}`}></div>
              <span className="text-gray-600 dark:text-gray-400">
                {source.charAt(0).toUpperCase() + source.slice(1)}: {data.count} products
                {data.status === 'error' && <span className="text-red-500 ml-1">(Error)</span>}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && showFilterPanel && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price Range
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Minimum Rating
              </label>
              <select
                value={filters.minRating}
                onChange={(e) => handleFilterChange('minRating', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={0}>Any Rating</option>
                <option value={1}>1+ Stars</option>
                <option value={2}>2+ Stars</option>
                <option value={3}>3+ Stars</option>
                <option value={4}>4+ Stars</option>
              </select>
            </div>

            {/* Sources */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sources
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {['amazon', 'ebay', 'walmart', 'aliexpress', 'local'].map(source => (
                  <label key={source} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.sources.includes(source)}
                      onChange={() => handleSourceToggle(source)}
                      className="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {source}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Brands */}
            {availableFilters.brands.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Brands
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {availableFilters.brands.slice(0, 10).map(brand => (
                    <label key={brand.name} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.brands.includes(brand.name)}
                        onChange={() => handleBrandToggle(brand.name)}
                        className="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {brand.name} ({brand.count})
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Clear Filters */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' 
          : 'grid-cols-1'
      }`}>
        {products.map((product, index) => (
          <div
            key={`${product.source}_${product.externalId || product._id}_${index}`}
            ref={index === products.length - 1 ? lastProductElementRef : null}
          >
            <ProductCard 
              product={product} 
              showQuickView={true}
              viewMode={viewMode}
            />
          </div>
        ))}
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="flex items-center gap-3">
            <FiLoader className="animate-spin text-primary-600" size={24} />
            <span className="text-gray-600 dark:text-gray-400">Loading more products...</span>
          </div>
        </div>
      )}

      {/* End of Results */}
      {!hasMore && products.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            You've reached the end! Showing all {totalCount.toLocaleString()} products.
          </p>
        </div>
      )}

      {/* No Results */}
      {!loading && products.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <FiGrid size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No products found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Try adjusting your search terms or filters
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default InfiniteProductGrid;
