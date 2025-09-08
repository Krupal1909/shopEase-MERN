import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiX, FiTrendingUp, FiClock } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const UnlimitedSearchBar = ({ 
  onSearch, 
  placeholder = "Search millions of products...", 
  showSuggestions = true,
  autoFocus = false 
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestionPanel, setShowSuggestionPanel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const navigate = useNavigate();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Auto focus if requested
  useEffect(() => {
    if (autoFocus && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [autoFocus]);

  // Fetch search suggestions
  const fetchSuggestions = async (searchQuery) => {
    if (!searchQuery.trim() || !showSuggestions) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/products/suggestions?query=${encodeURIComponent(searchQuery)}&limit=8`);
      const data = await response.json();
      
      if (data.success) {
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced suggestion fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length > 1) {
        fetchSuggestions(query);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestionPanel(true);
  };

  // Handle search submission
  const handleSearch = (searchQuery = query) => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;

    // Add to recent searches
    const updatedRecent = [
      trimmedQuery,
      ...recentSearches.filter(item => item !== trimmedQuery)
    ].slice(0, 5);
    
    setRecentSearches(updatedRecent);
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));

    // Hide suggestions
    setShowSuggestionPanel(false);
    
    // Trigger search
    if (onSearch) {
      onSearch(trimmedQuery);
    } else {
      navigate(`/products?search=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  // Handle recent search click
  const handleRecentClick = (recent) => {
    setQuery(recent);
    handleSearch(recent);
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestionPanel(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target) &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowSuggestionPanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Popular search terms
  const popularSearches = [
    'smartphone', 'laptop', 'headphones', 'shoes', 'watch',
    'camera', 'tablet', 'backpack', 'sunglasses', 'wireless earbuds'
  ];

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <FiSearch 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" 
            size={20} 
          />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestionPanel(true)}
            placeholder={placeholder}
            className="w-full pl-12 pr-12 py-4 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX size={20} />
            </button>
          )}
        </div>
      </form>

      {/* Suggestions Panel */}
      {showSuggestionPanel && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {/* Loading State */}
          {loading && (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          )}

          {/* Search Suggestions */}
          {!loading && suggestions.length > 0 && (
            <div className="border-b border-gray-100 dark:border-gray-700">
              <div className="p-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
                >
                  <FiSearch className="text-gray-400" size={16} />
                  <span className="text-gray-900 dark:text-white">{suggestion}</span>
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="border-b border-gray-100 dark:border-gray-700">
              <div className="p-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Recent Searches
              </div>
              {recentSearches.map((recent, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentClick(recent)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
                >
                  <FiClock className="text-gray-400" size={16} />
                  <span className="text-gray-900 dark:text-white">{recent}</span>
                </button>
              ))}
            </div>
          )}

          {/* Popular Searches */}
          {!query && (
            <div>
              <div className="p-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Popular Searches
              </div>
              {popularSearches.map((popular, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(popular)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
                >
                  <FiTrendingUp className="text-gray-400" size={16} />
                  <span className="text-gray-900 dark:text-white">{popular}</span>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && query && suggestions.length === 0 && (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No suggestions found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UnlimitedSearchBar;
