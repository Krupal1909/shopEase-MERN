const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  getTrendingProducts,
  getProductRecommendations,
  searchProducts,
  getProductsByCategory,
  getInfiniteProducts,
  advancedSearch,
  getSearchSuggestions,
  getPriceComparison,
  clearApiCache,
  getApiStats,
} = require("../../controller/product/product.controller");
const isAuthenticated = require("../../middleware/auth.middleware");
const upload = require("../../middleware/multer.middleware");

// Get all products with filtering and pagination
router.get("/", getAllProducts);

// Get single product by ID
router.get("/:id", getProductById);

// Add new product (admin/seller only)
router.post("/",upload.array("images", 5), isAuthenticated, addProduct);

// Update product (admin/seller only)
router.put("/:id",upload.array("image"), isAuthenticated, updateProduct);

// Delete product (admin/seller only)
router.delete("/:id", isAuthenticated, deleteProduct);

// Get unlimited products with infinite scroll
router.get("/unlimited", getInfiniteProducts);

// Advanced search with unlimited results
router.get("/unlimited/search", advancedSearch);

// Get search suggestions
router.get("/suggestions", getSearchSuggestions);

// Get price comparison
router.get("/price-comparison", getPriceComparison);

// Get trending products from external APIs
router.get("/external/trending", getTrendingProducts);

// Search products across all sources
router.get("/external/search", searchProducts);

// Get products by category from external APIs
router.get("/external/category/:category", getProductsByCategory);

// Get product recommendations
router.get("/:id/recommendations", getProductRecommendations);

// Clear API cache (admin only)
router.post("/external/clear-cache", isAuthenticated, clearApiCache);

// Get API statistics (admin only)
router.get("/external/stats", isAuthenticated, getApiStats);

module.exports = router;
