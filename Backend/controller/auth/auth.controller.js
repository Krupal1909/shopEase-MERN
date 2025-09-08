const User = require("../../models/auth/user.model");
const crypto = require("crypto");
const sendEmail = require("../../utills/sendEmail");
const catchAsyncErrors = require("../../middleware/catchAsyncError");
const ErrorHandler = require("../../utills/ErrorHandler");
const cloudinary = require("cloudinary").v2;

//register user
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, googleId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorHandler("User already exists with this email", 400));
    }

    let avatarData = null;

    // Handle avatar upload if file is provided
    if (req.file) {
      const avatar = req.file;
      const allowedFormats = ["image/png", "image/jpeg", "image/webp"];

      if (!allowedFormats.includes(avatar.mimetype)) {
        return next(new ErrorHandler("File Format Not Supported!", 400));
      }

      // Upload to cloudinary
      const cloudinaryResponse = await cloudinary.uploader.upload(avatar.path, {
        folder: "avatars",
      });

      if (!cloudinaryResponse || cloudinaryResponse.error) {
        console.error(
          "Cloudinary Error:",
          cloudinaryResponse.error || "Unknown Cloudinary error"
        );
        return next(
          new ErrorHandler("Failed To Upload Avatar To Cloudinary", 500)
        );
      }

      avatarData = {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
      };
    } else if (req.body.avatar && typeof req.body.avatar === 'string') {
      // Handle Google avatar URL
      avatarData = {
        public_id: null,
        url: req.body.avatar,
      };
    }

    // Create user data
    const userData = {
      name,
      email,
      password,
      role: role || 'user',
      isActive: googleId ? true : false, // Auto-activate Google users
    };

    if (avatarData) {
      userData.avatar = avatarData;
    }

    if (googleId) {
      userData.googleId = googleId;
    }

    // Create user
    const user = await User.create(userData);

    // Generate token
    const token = user.generateToken();

    // If not a Google user, send verification email
    if (!googleId) {
      const verificationToken = user.getVerificationToken();
      await user.save({ validateBeforeSave: false });

      const verificationUrl = `${req.protocol}://${req.get(
        "host"
      )}/api/v1/auth/verify-email/${verificationToken}`;

      const message = `Hello ${user.name},\n\nPlease verify your email:\n\n${verificationUrl}\n\nThis link will expire in 24 hours.`;

      try {
        await sendEmail({
          email: user.email,
          subject: "Email Verification",
          message,
        });
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        // Don't fail registration if email fails
      }
    }

    const options = {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      sameSite: "strict",
    };

    res
      .status(201)
      .cookie("token", token, options)
      .json({
        success: true,
        message: googleId 
          ? "User registered successfully with Google!" 
          : `User created successfully. ${!googleId ? 'Verification email sent to ' + user.email : ''}`,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isActive: user.isActive,
        },
        token,
      });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return next(new ErrorHandler("User already exists with this email", 400));
    }
    next(new ErrorHandler(error.message || "Something went wrong", 500));
  }
};

// Login user
const loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return next(new ErrorHandler("Please enter email and password", 400));
  }

  // Find user and include password
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  // Check password
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  // Generate token and send response
  const token = user.generateToken();

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    // secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  res
    .status(200)
    .cookie("token", token, options)
    .json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      token,
    });
});

// Logout user
const logoutUser = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

// Verify email
const verifyEmail = catchAsyncErrors(async (req, res, next) => {
  try {
    const verificationToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      verificationToken,
      verificationTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });
    }

    user.isActive = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Email verified successfully" });
  } catch (err) {
    return next(
      new ErrorHandler("Verification token is invalid or expired", 400)
    );
  }
});

// Forgot password
const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found with this email", 404));
  }

  // Get reset password token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset password URL
  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/password/reset/${resetToken}`;

  const message = `Your password reset token is:\n\n${resetPasswordUrl}\n\nIf you have not requested this email, please ignore it.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Recovery",
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
  }
});

// Google Authentication
const googleAuth = catchAsyncErrors(async (req, res, next) => {
  const { name, email, googleId, avatar } = req.body;

  try {
    // Validate required fields
    if (!name || !email || !googleId) {
      return next(new ErrorHandler("Name, email, and Google ID are required", 400));
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // User exists, just login
      if (!user.googleId) {
        // Link Google account to existing user
        user.googleId = googleId;
        if (avatar && !user.avatar?.url) {
          user.avatar = { public_id: null, url: avatar };
        }
        user.isActive = true; // Activate user when linking Google
        await user.save({ validateBeforeSave: false });
      }
    } else {
      // Create new user - explicitly set password as undefined for Google users
      const userData = {
        name,
        email,
        googleId,
        avatar: avatar ? { public_id: null, url: avatar } : null,
        isActive: true, // Auto-activate Google users
        role: 'user',
        password: undefined // Explicitly set to undefined for Google users
      };
      
      user = new User(userData);
      await user.save({ validateBeforeSave: false });
    }

    // Generate token
    const token = user.generateToken();

    const options = {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      sameSite: "strict",
    };

    res
      .status(200)
      .cookie("token", token, options)
      .json({
        success: true,
        message: "Google authentication successful!",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isActive: user.isActive,
        },
        token,
      });
  } catch (error) {
    console.error("Google auth error:", error);
    next(new ErrorHandler(error.message || "Google authentication failed", 500));
  }
});

// Verify authentication status
const verifyAuth = catchAsyncErrors(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: "User is authenticated",
    user: req.user
  });
});

module.exports = {
  forgotPassword,
  verifyEmail,
  logoutUser,
  loginUser,
  registerUser,
  googleAuth,
  verifyAuth,
};
