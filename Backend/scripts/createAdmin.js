const mongoose = require("mongoose");
const User = require("../models/auth/user.model");
require("dotenv").config();

const createAdmin = async () => {
  try {
    // Connect to database
    const MONGO_URL = process.env.MONGO_URL || "mongodb+srv://krupalpatel3571:Krupal%231909@cluster0.xpeoqci.mongodb.net/chat-mern-stack";
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@shopease.com" });
    if (existingAdmin) {
      console.log("Admin user already exists!");
      console.log("Email: admin@shopease.com");
      console.log("Password: admin123");
      process.exit(0);
    }

    // Create admin user
    const adminData = {
      name: "Admin User",
      email: "admin@shopease.com",
      password: "admin123",
      role: "admin",
      isActive: true,
    };

    const admin = await User.create(adminData);
    console.log("Admin user created successfully!");
    console.log("Email: admin@shopease.com");
    console.log("Password: admin123");
    console.log("Admin ID:", admin._id);

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();
