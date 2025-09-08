import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiTrendingDown, FiExternalLink, FiStar } from 'react-icons/fi';

const PriceComparisonWidget = ({ productTitle, brand = '', category = '' }) => {
  const [comparisons, setComparisons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (productTitle) {
      fetchPriceComparison();
    }
  }, [productTitle, brand, category]);

  const fetchPriceComparison = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        productTitle,
        brand,
        category
      });

      const response = await fetch(`/api/v1/products/price-comparison?${params}`);
      const data = await response.json();

      if (data.success) {
        setComparisons(data.products);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch price comparison');
      console.error('Price comparison error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSourceColor = (source) => {
    const colors = {
      amazon: 'text-orange-600 bg-orange-50',
      ebay: 'text-blue-600 bg-blue-50',
      walmart: 'text-blue-700 bg-blue-50',
      local: 'text-green-600 bg-green-50'
    };
    return colors[source] || 'text-gray-600 bg-gray-50';
  };

  const getLowestPrice = () => {
    if (comparisons.length === 0) return null;
    return Math.min(...comparisons.map(p => p.price));
  };

  const getAveragePrice = () => {
    if (comparisons.length === 0) return null;
    return comparisons.reduce((sum, p) => sum + p.price, 0) / comparisons.length;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || comparisons.length === 0) {
    return null;
  }

  const lowestPrice = getLowestPrice();
  const averagePrice = getAveragePrice();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <div className="flex items-center gap-2 mb-4">
        <FiDollarSign className="text-green-600" size={20} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Price Comparison
        </h3>
      </div>

      {/* Price Summary */}
      <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">Lowest Price</div>
          <div className="text-lg font-bold text-green-600">${lowestPrice?.toFixed(2)}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">Average Price</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">${averagePrice?.toFixed(2)}</div>
        </div>
      </div>

      {/* Price Comparison List */}
      <div className="space-y-3">
        {comparisons.slice(0, 5).map((product, index) => {
          const savings = averagePrice - product.price;
          const savingsPercentage = ((savings / averagePrice) * 100).toFixed(0);
          const isLowestPrice = product.price === lowestPrice;

          return (
            <div
              key={`${product.source}_${index}`}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all hover:shadow-md ${
                isLowestPrice 
                  ? 'border-green-200 bg-green-50 dark:bg-green-900/20' 
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getSourceColor(product.source)}`}>
                  {product.source.toUpperCase()}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {product.title}
                  </div>
                  {product.rating > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <FiStar className="text-yellow-400 fill-current" size={12} />
                      <span className="text-xs text-gray-500">{product.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {savings > 0 && (
                  <div className="text-right">
                    <div className="text-xs text-green-600 font-medium">
                      Save ${savings.toFixed(2)} ({savingsPercentage}%)
                    </div>
                  </div>
                )}
                
                <div className="text-right">
                  <div className={`text-lg font-bold ${isLowestPrice ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                    ${product.price.toFixed(2)}
                  </div>
                  {product.originalPrice > product.price && (
                    <div className="text-sm text-gray-500 line-through">
                      ${product.originalPrice.toFixed(2)}
                    </div>
                  )}
                </div>

                {product.url && (
                  <button
                    onClick={() => window.open(product.url, '_blank')}
                    className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                    title="View on site"
                  >
                    <FiExternalLink size={16} />
                  </button>
                )}
              </div>

              {isLowestPrice && (
                <div className="absolute -top-1 -right-1">
                  <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <FiTrendingDown size={10} />
                    Best Price
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {comparisons.length > 5 && (
        <div className="text-center mt-4">
          <button
            onClick={fetchPriceComparison}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View {comparisons.length - 5} more options
          </button>
        </div>
      )}
    </div>
  );
};

export default PriceComparisonWidget;
