import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { HeroCarousel, ProductCarousel } from '../components/common/Carousel';
import ProductCard from '../components/common/ProductCard';
import Loader, { ProductGridSkeleton } from '../components/common/Loader';
import { productsAPI } from '../services/api';
import { 
  FiTruck, 
  FiShield, 
  FiRefreshCw, 
  FiHeadphones,
  FiSmartphone,
  FiUser,
  FiHeart,
  FiHome,
  FiActivity,
  FiBook,
  FiTool,
  FiShoppingBag,
  FiUsers
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const Home = () => {
  const { categories, loading, setLoading } = useApp();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);

  // Hero carousel slides
  const heroSlides = [
    {
      title: "Mega Electronics Sale",
      subtitle: "Up to 70% off on smartphones, laptops & more",
      primaryButton: "Shop Now",
      secondaryButton: "View Deals",
      image: "/api/placeholder/500/400"
    },
    {
      title: "Fashion Forward",
      subtitle: "Latest trends in clothing & accessories",
      primaryButton: "Explore Fashion",
      secondaryButton: "New Arrivals",
      image: "/api/placeholder/500/400"
    },
    {
      title: "Home & Living",
      subtitle: "Transform your space with our collection",
      primaryButton: "Shop Home",
      secondaryButton: "Decor Ideas",
      image: "/api/placeholder/500/400"
    }
  ];

  // Category icons mapping
  const categoryIcons = {
    'Electronics & Gadgets': FiSmartphone,
    'Fashion & Apparel': FiUser,
    'Health & Beauty': FiHeart,
    'Home & Living': FiHome,
    'Sports & Outdoors': FiActivity,
    'Books & Stationery': FiBook,
    'Automotive & Industrial': FiTool,
    'Grocery & Food': FiShoppingBag,
    'Baby & Kids': FiUsers
  };

  // Load products on component mount
  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      // Load featured products
      const featuredResponse = await productsAPI.getAllProducts({ 
        limit: 8, 
        featured: true 
      });
      setFeaturedProducts(featuredResponse.data.products || []);

      // Load trending products
      const trendingResponse = await productsAPI.getAllProducts({ 
        limit: 8, 
        sortBy: 'popularity' 
      });
      setTrendingProducts(trendingResponse.data.products || []);

      // Load new arrivals
      const newArrivalsResponse = await productsAPI.getAllProducts({ 
        limit: 8, 
        sortBy: 'createdAt',
        order: 'desc'
      });
      setNewArrivals(newArrivalsResponse.data.products || []);

    } catch (error) {
      console.error('Error loading home data:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section>
        <HeroCarousel slides={heroSlides} />
      </section>

      {/* Features Section */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-4 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full">
                <FiTruck className="text-primary-600 dark:text-primary-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Free Shipping</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">On orders above ₹999</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full">
                <FiRefreshCw className="text-primary-600 dark:text-primary-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Easy Returns</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">30-day return policy</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full">
                <FiShield className="text-primary-600 dark:text-primary-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Secure Payment</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">100% secure checkout</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full">
                <FiHeadphones className="text-primary-600 dark:text-primary-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">24/7 Support</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Customer service</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Shop by Category
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover our wide range of products across different categories
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {categories.map((category, index) => {
              const IconComponent = categoryIcons[category] || FiShoppingBag;
              const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
              
              return (
                <Link
                  key={index}
                  to={`/category/${categorySlug}`}
                  className="group bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-center"
                >
                  <div className="bg-primary-100 dark:bg-primary-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 dark:group-hover:bg-primary-800 transition-colors">
                    <IconComponent className="text-primary-600 dark:text-primary-400" size={28} />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {category}
                  </h3>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Products
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Handpicked products just for you
            </p>
          </div>
          
          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
          
          {!loading && featuredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No featured products available</p>
            </div>
          )}
        </div>
      </section>

      {/* Trending Products Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Trending Now
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Most popular products this week
            </p>
          </div>
          
          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {trendingProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                New Arrivals
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Latest additions to our collection
              </p>
            </div>
            <Link
              to="/category/all?sortBy=createdAt&order=desc"
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
            >
              View All →
            </Link>
          </div>
          
          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {newArrivals.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-primary-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and get exclusive deals, new product announcements, and more!
          </p>
          
          <div className="max-w-md mx-auto">
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-l-lg border-0 focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
              <button className="bg-white text-primary-600 px-6 py-3 rounded-r-lg font-semibold hover:bg-gray-100 transition-colors">
                Subscribe
              </button>
            </div>
            <p className="text-primary-100 text-sm mt-2">
              No spam, unsubscribe at any time
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
