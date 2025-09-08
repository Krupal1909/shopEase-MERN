const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getAllProductsAdmin,
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  getCategoriesWithCounts,
  bulkUpdateProducts
} = require("../../controller/admin/admin.controller");
const isAuthenticated = require("../../middleware/auth.middleware");
const isAdmin = require("../../middleware/admin.middleware");

// Apply authentication and admin middleware to all routes
router.use(isAuthenticated);
router.use(isAdmin);

// Dashboard stats
router.get("/dashboard", getDashboardStats);

// Product management
router.get("/products", getAllProductsAdmin);
router.patch("/products/bulk-update", bulkUpdateProducts);

// User management
router.get("/users", getAllUsers);
router.patch("/users/:userId/role", updateUserRole);
router.patch("/users/:userId/toggle-status", toggleUserStatus);

// Categories
router.get("/categories", getCategoriesWithCounts);

module.exports = router;
