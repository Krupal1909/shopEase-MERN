import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  FiSearch,
  FiShoppingCart,
  FiHeart,
  FiUser,
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
  FiLogOut,
  FiPackage,
  FiSettings,
  FiSmartphone,
  FiHome,
  FiActivity,
  FiBook,
  FiTool,
  FiShoppingBag,
  FiUsers,
  FiChevronDown,
  FiGrid
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const Navbar = () => {
  const {
    user,
    isAuthenticated,
    cart,
    wishlist,
    darkMode,
    searchQuery,
    categories,
    getCartItemsCount,
    setSearchQuery,
    toggleDarkMode,
    logout
  } = useApp();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const navigate = useNavigate();
  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const categoriesRef = useRef(null);

  // Category icons mapping
  const categoryIcons = {
    'Electronics': FiSmartphone,
    'Fashion': FiUser,
    'Health': FiHeart,
    'Home': FiHome,
    'Sports': FiActivity,
    'Books': FiBook,
    'Automotive': FiTool,
    'Grocery': FiShoppingBag,
    'Baby': FiUsers
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(event.target)) {
        setIsCategoriesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mock search suggestions (in real app, this would come from API)
  const mockSuggestions = [
    'iPhone 14', 'Samsung Galaxy', 'MacBook Pro', 'Nike Shoes', 'Adidas T-shirt',
    'Sony Headphones', 'Canon Camera', 'Dell Laptop', 'Apple Watch', 'Gaming Chair'
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim()) {
      const filtered = mockSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setSearchSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
    setShowSuggestions(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/signup');
    setIsProfileOpen(false);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50 transition-colors duration-300">
      {/* Top Bar */}
      <div className="bg-primary-600 text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-4">
              <span>📞 Customer Support: +91-1234567890</span>
              <span>📧 support@shopease.com</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Free shipping on orders above ₹999</span>
              <button
                onClick={toggleDarkMode}
                className="p-1 rounded-full hover:bg-primary-700 transition-colors"
              >
                {darkMode ? <FiSun size={16} /> : <FiMoon size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-primary-600 text-white p-2 rounded-lg">
              <span className="text-xl font-bold">SE</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              ShopEase
            </span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8 relative" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                placeholder="Search for products, brands and more..."
                className="w-full px-4 py-3 pl-12 pr-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-600 text-white px-4 py-1.5 rounded-md hover:bg-primary-700 transition-colors"
              >
                Search
              </button>
            </form>

            {/* Search Suggestions */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg mt-1 shadow-lg z-50">
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <FiSearch className="inline mr-2" size={16} />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-6">
            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <FiHeart size={24} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <FiShoppingCart size={24} />
              {getCartItemsCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getCartItemsCount()}
                </span>
              )}
            </Link>

            {/* User Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <FiUser size={24} />
                {isAuthenticated && (
                  <span className="hidden md:block text-sm">
                    {user?.name || 'Profile'}
                  </span>
                )}
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50">
                  {isAuthenticated ? (
                    <>
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FiUser className="mr-2" size={16} />
                        My Profile
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FiPackage className="mr-2" size={16} />
                        My Orders
                      </Link>
                      <Link
                        to="/wishlist"
                        className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FiHeart className="mr-2" size={16} />
                        Wishlist
                      </Link>
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <FiSettings className="mr-2" size={16} />
                          Admin Panel
                        </Link>
                      )}
                      <hr className="border-gray-200 dark:border-gray-600" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <FiLogOut className="mr-2" size={16} />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        to="/signup"
                        className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-300"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Categories Navigation */}
        <div className="hidden md:flex items-center space-x-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="relative" ref={categoriesRef}>
            <button
              onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/30 font-medium rounded-lg transition-all duration-200 border border-primary-200 dark:border-primary-800"
            >
              <FiGrid size={16} />
              <span>All Categories</span>
              <FiChevronDown 
                size={14} 
                className={`transition-transform duration-200 ${isCategoriesOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Categories Dropdown */}
            {isCategoriesOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-3">
                  <h3 className="text-white font-semibold text-sm flex items-center">
                    <FiGrid className="mr-2" size={16} />
                    Shop by Category
                  </h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {categories.map((category, index) => {
                    const IconComponent = categoryIcons[category] || FiShoppingBag;
                    return (
                      <Link
                        key={index}
                        to={`/category/${encodeURIComponent(category.toLowerCase().replace(/\s+/g, '-'))}`}
                        className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 border-b border-gray-100 dark:border-gray-700 last:border-b-0 group"
                        onClick={() => setIsCategoriesOpen(false)}
                      >
                        <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg mr-3 group-hover:bg-primary-200 dark:group-hover:bg-primary-900/50 transition-colors">
                          <IconComponent size={18} className="text-primary-600 dark:text-primary-400" />
                        </div>
                        <div className="flex-1">
                          <span className="font-medium">{category}</span>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Explore {category.toLowerCase()}
                          </div>
                        </div>
                        <FiChevronDown size={14} className="text-gray-400 rotate-[-90deg] group-hover:text-primary-500 transition-colors" />
                      </Link>
                    );
                  })}
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    to="/categories"
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium flex items-center justify-center transition-colors"
                    onClick={() => setIsCategoriesOpen(false)}
                  >
                    View All Categories
                    <FiChevronDown size={14} className="ml-1 rotate-[-90deg]" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Quick Category Links */}
          {categories.slice(0, 5).map((category, index) => {
            const IconComponent = categoryIcons[category] || FiShoppingBag;
            return (
              <Link
                key={index}
                to={`/category/${encodeURIComponent(category.toLowerCase().replace(/\s+/g, '-'))}`}
                className="flex items-center space-x-1 px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all duration-200 group"
              >
                <IconComponent size={14} className="group-hover:text-primary-600 dark:group-hover:text-primary-400" />
                <span className="text-sm font-medium">{category.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
            <div className="space-y-1">
              {categories.map((category, index) => {
                const IconComponent = categoryIcons[category] || FiShoppingBag;
                return (
                  <Link
                    key={index}
                    to={`/category/${encodeURIComponent(category.toLowerCase().replace(/\s+/g, '-'))}`}
                    className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-all duration-200 group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg mr-3 group-hover:bg-primary-200 dark:group-hover:bg-primary-900/50 transition-colors">
                      <IconComponent size={16} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="font-medium">{category}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
