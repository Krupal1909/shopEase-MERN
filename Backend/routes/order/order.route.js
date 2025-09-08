const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrderDetails,
  getAllOrders,
  updateOrderStatus,
} = require("../../controller/orders/orders.controller");
const isAuthenticated = require("../../middleware/auth.middleware");

// Create new order - REMOVED multer middleware
router.post("/", isAuthenticated, createOrder);

// Get all orders (admin only)
router.get("/", isAuthenticated, getAllOrders);

// Get single order by ID
router.get("/:id", isAuthenticated, getOrderDetails);

// Update order status (admin only)
router.put("/:id/status", isAuthenticated, updateOrderStatus);

module.exports = router;