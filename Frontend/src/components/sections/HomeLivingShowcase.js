import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../common/ProductCard';
import { ProductGridSkeleton } from '../common/Loader';
import { productsAPI } from '../../services/api';
import { 
  FiHome, 
  FiBox, 
  FiSun, 
  FiCoffee, 
  FiArrowRight,
  FiStar,
  FiTrendingUp
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import '../../styles/HomeLiving.css';

const HomeLivingShowcase = () => {
  const [homeProducts, setHomeProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Items', icon: FiHome },
    { id: 'furniture', name: 'Furniture', icon: FiBox },
    { id: 'lighting', name: 'Lighting', icon: FiSun },
    { id: 'decor', name: 'Decor', icon: FiCoffee }
  ];

  const features = [
    {
      icon: FiStar,
      title: "Premium Quality",
      description: "Handpicked items with superior craftsmanship"
    },
    {
      icon: FiTrendingUp,
      title: "Trending Designs",
      description: "Latest styles that define modern living"
    },
    {
      icon: FiHome,
      title: "Complete Solutions",
      description: "Everything you need for your dream home"
    }
  ];

  useEffect(() => {
    loadHomeProducts();
  }, [activeCategory]);

  const loadHomeProducts = async () => {
    try {
      setLoading(true);
      
      const params = {
        category: 'Home',
        limit: 8,
        sortBy: 'popularity'
      };

      if (activeCategory !== 'all') {
        params.subCategory = activeCategory;
      }

      const response = await productsAPI.getAllProducts(params);
      setHomeProducts(response.data.products || []);
      
    } catch (error) {
      console.error('Error loading home products:', error);
      toast.error('Failed to load home products');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full mb-6">
            <FiHome size={16} />
            <span className="text-sm font-medium">Home & Living Collection</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Transform Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Living Space</span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Discover our curated collection of furniture, decor, and essentials that blend style with functionality 
            to create the perfect ambiance for your home.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <feature.icon className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-md'
              }`}
            >
              <category.icon size={18} />
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : homeProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {homeProducts.map((product) => (
              <div key={product._id} className="transform hover:scale-105 transition-transform duration-300">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-gray-100 dark:bg-gray-800 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiHome className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Products Found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We're working on adding more {activeCategory !== 'all' ? activeCategory : 'home'} products to our collection.
            </p>
            <Link
              to="/category/home"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>Browse All Categories</span>
              <FiArrowRight size={16} />
            </Link>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center">
          <Link
            to="/category/home"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <span>Explore Full Collection</span>
            <FiArrowRight size={20} />
          </Link>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 dark:bg-blue-800 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-indigo-200 dark:bg-indigo-800 rounded-full opacity-20 blur-3xl animate-pulse delay-1000"></div>
      </div>
    </section>
  );
};

export default HomeLivingShowcase;
