import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const AppContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  cart: [],
  wishlist: [],
  products: [],
  categories: [
    'Electronics',
    'Fashion',
    'Health',
    'Home',
    'Sports',
    'Books',
    'Automotive',
    'Grocery',
    'Baby'
  ],
  loading: false,
  darkMode: false,
  searchQuery: '',
  filters: {
    category: '',
    priceRange: [0, 10000],
    rating: 0,
    brand: '',
    sortBy: 'popularity'
  }
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload, 
        isAuthenticated: !!action.payload 
      };
    
    case 'LOGOUT':
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { 
        ...state, 
        user: null, 
        isAuthenticated: false,
        cart: [],
        wishlist: []
      };
    
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    
    case 'ADD_TO_CART':
      const existingCartItem = state.cart.find(item => 
        item.product._id === action.payload.product._id && 
        item.selectedVariant?.size === action.payload.selectedVariant?.size &&
        item.selectedVariant?.color === action.payload.selectedVariant?.color
      );
      
      if (existingCartItem) {
        const updatedCart = state.cart.map(item =>
          item.product._id === action.payload.product._id &&
          item.selectedVariant?.size === action.payload.selectedVariant?.size &&
          item.selectedVariant?.color === action.payload.selectedVariant?.color
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        return { ...state, cart: updatedCart };
      } else {
        const newCart = [...state.cart, action.payload];
        localStorage.setItem('cart', JSON.stringify(newCart));
        return { ...state, cart: newCart };
      }
    
    case 'REMOVE_FROM_CART':
      const filteredCart = state.cart.filter(item => item.id !== action.payload);
      localStorage.setItem('cart', JSON.stringify(filteredCart));
      return { ...state, cart: filteredCart };
    
    case 'UPDATE_CART_QUANTITY':
      const updatedCartQuantity = state.cart.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      localStorage.setItem('cart', JSON.stringify(updatedCartQuantity));
      return { ...state, cart: updatedCartQuantity };
    
    case 'CLEAR_CART':
      localStorage.removeItem('cart');
      return { ...state, cart: [] };
    
    case 'SET_CART':
      return { ...state, cart: action.payload };
    
    case 'ADD_TO_WISHLIST':
      if (!state.wishlist.find(item => item._id === action.payload._id)) {
        const newWishlist = [...state.wishlist, action.payload];
        localStorage.setItem('wishlist', JSON.stringify(newWishlist));
        return { ...state, wishlist: newWishlist };
      }
      return state;
    
    case 'REMOVE_FROM_WISHLIST':
      const filteredWishlist = state.wishlist.filter(item => item._id !== action.payload);
      localStorage.setItem('wishlist', JSON.stringify(filteredWishlist));
      return { ...state, wishlist: filteredWishlist };
    
    case 'SET_WISHLIST':
      return { ...state, wishlist: action.payload };
    
    case 'TOGGLE_DARK_MODE':
      const newDarkMode = !state.darkMode;
      localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
      return { ...state, darkMode: newDarkMode };
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    
    case 'RESET_FILTERS':
      return { ...state, filters: initialState.filters };
    
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from localStorage on app start
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedWishlist = localStorage.getItem('wishlist');
    const savedDarkMode = localStorage.getItem('darkMode');
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (savedCart) {
      dispatch({ type: 'SET_CART', payload: JSON.parse(savedCart) });
    }

    if (savedWishlist) {
      dispatch({ type: 'SET_WISHLIST', payload: JSON.parse(savedWishlist) });
    }

    if (savedDarkMode) {
      dispatch({ type: 'TOGGLE_DARK_MODE' });
    }

    if (savedUser && token) {
      dispatch({ type: 'SET_USER', payload: JSON.parse(savedUser) });
    }
  }, []);

  // Cart helper functions
  const addToCart = (product, quantity = 1, selectedVariant = null) => {
    const cartItem = {
      id: `${product._id}-${selectedVariant?.size || ''}-${selectedVariant?.color || ''}`,
      product,
      quantity,
      selectedVariant,
      addedAt: new Date().toISOString()
    };
    
    dispatch({ type: 'ADD_TO_CART', payload: cartItem });
    toast.success('Added to cart!');
  };

  const removeFromCart = (itemId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
    toast.success('Removed from cart');
  };

  const updateCartQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { id: itemId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    toast.success('Cart cleared');
  };

  // Wishlist helper functions
  const addToWishlist = (product) => {
    dispatch({ type: 'ADD_TO_WISHLIST', payload: product });
    toast.success('Added to wishlist!');
  };

  const removeFromWishlist = (productId) => {
    dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });
    toast.success('Removed from wishlist');
  };

  const isInWishlist = (productId) => {
    return state.wishlist.some(item => item._id === productId);
  };

  // Cart calculations
  const getCartTotal = () => {
    return state.cart.reduce((total, item) => {
      const price = item.selectedVariant?.price || item.product.discountPrice || item.product.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const getCartItemsCount = () => {
    return state.cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Auth functions
  const login = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    dispatch({ type: 'SET_USER', payload: userData });
    toast.success('Login successful!');
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  // Other helper functions
  const toggleDarkMode = () => {
    dispatch({ type: 'TOGGLE_DARK_MODE' });
  };

  const setSearchQuery = (query) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  };

  const setFilters = (filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const resetFilters = () => {
    dispatch({ type: 'RESET_FILTERS' });
  };

  const setLoading = (loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setProducts = (products) => {
    dispatch({ type: 'SET_PRODUCTS', payload: products });
  };

  const value = {
    ...state,
    // Cart functions
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    // Wishlist functions
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    // Auth functions
    login,
    logout,
    // Other functions
    toggleDarkMode,
    setSearchQuery,
    setFilters,
    resetFilters,
    setLoading,
    setProducts
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
