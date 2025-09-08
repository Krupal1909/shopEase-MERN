import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { FiHeart, FiShoppingCart, FiStar, FiEye } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { getImageUrl, getPlaceholderImage } from '../../services/api';

const ProductCard = ({ product, showQuickView = true }) => {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useApp();
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Handle both local and external products
  const productId = product._id || product.externalId;
  const isWishlisted = isInWishlist(productId);
  
  // Convert USD to INR for external products (approximate rate: 1 USD = 83 INR)
  const convertToINR = (price) => {
    if (product.source === 'amazon' || product.currency === 'USD') {
      return Math.round(price * 83);
    }
    return price;
  };

  // Calculate discount for both local and external products
  const discountPercentage = product.discountPrice 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : product.discount || 0;

  // Get product images (handle multiple variants)
  const productImages = product.images || [];
  const hasMultipleImages = productImages.length > 1;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Create a normalized product object with converted prices
    const normalizedProduct = {
      ...product,
      price: convertToINR(product.price),
      discountPrice: product.discountPrice ? convertToINR(product.discountPrice) : null,
      originalPrice: product.originalPrice ? convertToINR(product.originalPrice) : null,
      // Ensure unique ID for cart items
      _id: product._id || product.externalId || `${product.source}_${product.id}`,
      currency: 'INR'
    };
    
    addToCart(normalizedProduct, 1);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(product);
    }
  };

  const handleImageHover = (index) => {
    if (hasMultipleImages) {
      setCurrentImageIndex(index);
    }
  };

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
    }
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <FiStar key={i} className="text-yellow-400 fill-current" size={14} />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <FiStar className="text-gray-300" size={14} />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <FiStar className="text-yellow-400 fill-current" size={14} />
            </div>
          </div>
        );
      } else {
        stars.push(
          <FiStar key={i} className="text-gray-300" size={14} />
        );
      }
    }
    return stars;
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden product-card group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${productId}${product.source ? `?source=${product.source}` : ''}`} className="block">
        {/* Image Container */}
        <div className="relative overflow-hidden bg-gray-100 dark:bg-gray-700">
          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold z-10">
              -{discountPercentage}%
            </div>
          )}

          {/* External Product Badge */}
          {product.source && product.source !== 'local' && (
            <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-md text-xs font-semibold z-10" style={{marginTop: discountPercentage > 0 ? '32px' : '0'}}>
              {product.source.toUpperCase()}
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 z-10 ${
              isWishlisted 
                ? 'bg-red-500 text-white' 
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-red-500 hover:text-white'
            }`}
          >
            <FiHeart size={16} className={isWishlisted ? 'fill-current' : ''} />
          </button>

          {/* Product Image with Multiple Variants */}
          <div className="aspect-square relative">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            )}
            <img
              src={productImages[currentImageIndex]?.url || getImageUrl(product.images?.[0]?.url, product.category)}
              alt={product.title || product.name}
              className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                e.target.src = getPlaceholderImage(product.category);
                setImageLoaded(true);
              }}
              loading="lazy"
            />
            
            {/* Image Navigation for Multiple Images */}
            {hasMultipleImages && isHovered && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-1 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-1 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                {/* Image Dots Indicator */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {productImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Quick Actions Overlay */}
          {isHovered && showQuickView && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center space-x-2 transition-all duration-200">
              <button
                onClick={handleAddToCart}
                className="bg-white text-gray-900 p-2 rounded-full hover:bg-primary-600 hover:text-white transition-colors"
                title="Add to Cart"
              >
                <FiShoppingCart size={16} />
              </button>
              <Link
                to={`/product/${productId}${product.source ? `?source=${product.source}` : ''}`}
                className="bg-white text-gray-900 p-2 rounded-full hover:bg-primary-600 hover:text-white transition-colors"
                title="Quick View"
              >
                <FiEye size={16} />
              </Link>
            </div>
          )}

          {/* Stock Status */}
          {((product.stock === 0) || (product.availability === false)) && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="bg-red-500 text-white px-3 py-1 rounded-md font-semibold">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Brand */}
          {product.brand && (
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              {product.brand}
            </p>
          )}

          {/* Product Name */}
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {product.title || product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center space-x-1 mb-2">
            <div className="flex space-x-0.5">
              {renderStars(product.rating || product.ratings || 0)}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({product.reviewCount || product.numOfReviews || 0})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              ₹{convertToINR(product.discountPrice || product.price)}
            </span>
            {(product.discountPrice || product.originalPrice > product.price) && (
              <span className="text-sm text-gray-500 line-through">
                ₹{convertToINR(product.originalPrice || product.price)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || product.availability === false}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              (product.stock === 0 || product.availability === false)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700 text-white'
            }`}
          >
            {(product.stock === 0 || product.availability === false) 
              ? 'Out of Stock' 
              : 'Add to Cart'
            }
          </button>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
