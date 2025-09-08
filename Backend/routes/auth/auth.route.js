const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  verifyEmail,
  forgotPassword,
  googleAuth,
  verifyAuth,
} = require("../../controller/auth/auth.controller");
const isAuthenticated = require("../../middleware/auth.middleware");
const upload = require("../../middleware/multer.middleware");

// Register user
router.post("/register", upload.single("avatar"), registerUser);

// Login user
router.post("/login", loginUser);

// Google authentication
router.post("/google", googleAuth);

// Logout user
router.post("/logout", isAuthenticated, logoutUser);

// Verify email
router.get("/verify-email/:token", verifyEmail);

// Forgot password
router.post("/forgot-password", forgotPassword);

// Verify authentication status
router.get("/verify", isAuthenticated, verifyAuth);

module.exports = router;
