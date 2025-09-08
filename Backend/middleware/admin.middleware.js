const catchAsyncError = require("./catchAsyncError");
const ErrorHandler = require("../utills/ErrorHandler");

// Middleware to check if user is admin
const isAdmin = catchAsyncError(async (req, res, next) => {
  if (!req.user) {
    return next(new ErrorHandler("Authentication required", 401));
  }

  if (req.user.role !== "admin") {
    return next(new ErrorHandler("Access denied. Admin privileges required.", 403));
  }

  next();
});

module.exports = isAdmin;
