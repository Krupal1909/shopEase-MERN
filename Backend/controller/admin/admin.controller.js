const Product = require("../../models/product/product.model");
const User = require("../../models/auth/user.model");
const Order = require("../../models/order/order.model");
const catchAsyncErrors = require("../../middleware/catchAsyncError");
const ErrorHandler = require("../../utills/ErrorHandler");
const cloudinary = require("../../utills/cloudinary");

// Get admin dashboard stats
const getDashboardStats = catchAsyncErrors(async (req, res, next) => {
  const totalProducts = await Product.countDocuments();
  const activeProducts = await Product.countDocuments({ isActive: true });
  const totalUsers = await User.countDocuments();
  const totalOrders = await Order.countDocuments();
  
  // Get recent orders
  const recentOrders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .limit(5);

  // Get top selling products
  const topProducts = await Product.find({ isActive: true })
    .sort({ numOfReviews: -1, ratings: -1 })
    .limit(5)
    .select("name price ratings numOfReviews images");

  // Calculate total revenue (you might need to adjust based on your order model)
  const orders = await Order.find({ status: "delivered" });
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalProducts,
        activeProducts,
        totalUsers,
        totalOrders,
        totalRevenue
      },
      recentOrders,
      topProducts
    }
  });
});

// Get all products for admin (including inactive)
const getAllProductsAdmin = catchAsyncErrors(async (req, res, next) => {
  const {
    keyword,
    category,
    brand,
    status,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  let query = {};

  // Search by keyword
  if (keyword) {
    query.$or = [
      { name: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
      { category: { $regex: keyword, $options: "i" } },
    ];
  }

  // Filter by category
  if (category) {
    query.category = { $regex: category, $options: "i" };
  }

  // Filter by brand
  if (brand) {
    query.brand = { $regex: brand, $options: "i" };
  }

  // Filter by status
  if (status) {
    query.isActive = status === "active";
  }

  const skip = (page - 1) * limit;
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

  const products = await Product.find(query)
    .sort(sortOptions)
    .skip(skip)
    .limit(Number(limit))
    .populate("createdBy", "name email");

  const totalProducts = await Product.countDocuments(query);
  const totalPages = Math.ceil(totalProducts / limit);

  res.status(200).json({
    success: true,
    message: "Products fetched successfully",
    products,
    pagination: {
      currentPage: Number(page),
      totalPages,
      totalProducts,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
});

// Get all users for admin
const getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const {
    keyword,
    role,
    status,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  let query = {};

  // Search by keyword
  if (keyword) {
    query.$or = [
      { name: { $regex: keyword, $options: "i" } },
      { email: { $regex: keyword, $options: "i" } },
    ];
  }

  // Filter by role
  if (role) {
    query.role = role;
  }

  // Filter by status
  if (status) {
    query.isActive = status === "active";
  }

  const skip = (page - 1) * limit;
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

  const users = await User.find(query)
    .select("-password")
    .sort(sortOptions)
    .skip(skip)
    .limit(Number(limit));

  const totalUsers = await User.countDocuments(query);
  const totalPages = Math.ceil(totalUsers / limit);

  res.status(200).json({
    success: true,
    message: "Users fetched successfully",
    users,
    pagination: {
      currentPage: Number(page),
      totalPages,
      totalUsers,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
});

// Update user role
const updateUserRole = catchAsyncErrors(async (req, res, next) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!["user", "admin", "customer"].includes(role)) {
    return next(new ErrorHandler("Invalid role specified", 400));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  user.role = role;
  await user.save();

  res.status(200).json({
    success: true,
    message: "User role updated successfully",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    }
  });
});

// Toggle user status
const toggleUserStatus = catchAsyncErrors(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    }
  });
});

// Get categories with product counts
const getCategoriesWithCounts = catchAsyncErrors(async (req, res, next) => {
  const categories = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  res.status(200).json({
    success: true,
    message: "Categories fetched successfully",
    categories
  });
});

// Bulk update products
const bulkUpdateProducts = catchAsyncErrors(async (req, res, next) => {
  const { productIds, updates } = req.body;

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    return next(new ErrorHandler("Product IDs are required", 400));
  }

  const result = await Product.updateMany(
    { _id: { $in: productIds } },
    updates,
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: `${result.modifiedCount} products updated successfully`,
    modifiedCount: result.modifiedCount
  });
});

module.exports = {
  getDashboardStats,
  getAllProductsAdmin,
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  getCategoriesWithCounts,
  bulkUpdateProducts
};
