const Product = require("../../models/product/product.model");
const catchAsyncErrors = require("../../middleware/catchAsyncError");
const ErrorHandler = require("../../utills/ErrorHandler");
const cloudinary = require("../../utills/cloudinary");

// Get all products with filtering, sorting, and pagination
const getAllProducts = catchAsyncErrors(async (req, res, next) => {
  const {
    keyword,
    category,
    brand,
    minPrice,
    maxPrice,
    ratings,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  // Build query object
  let query = { isActive: true };

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

  // Filter by price range
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Filter by ratings
  if (ratings) {
    query.ratings = { $gte: Number(ratings) };
  }

  // Pagination
  const skip = (page - 1) * limit;

  // Sort options
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

  const products = await Product.find(query)
    .sort(sortOptions)
    .skip(skip)
    .limit(Number(limit))
    .populate("createdBy", "name");

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

// Get single product by ID
const getProductById = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate("createdBy", "name email")
    .populate("reviews.user", "name avatar");

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Product fetched successfully",
    product,
  });
});

// Add Product
const addProduct = catchAsyncErrors(async (req, res, next) => {
  let { name, description, price, category, brand, stock, variants, tags, useDefaultImages } =
    req.body;

  // Validation
  if (!name || !description || !price || !category || !brand || stock === undefined) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  // Category-specific default images with more variety
  const defaultImages = {
    'Electronics': [
      // Smartphones & Mobile
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=400&h=400&fit=crop&crop=center',
      // Laptops & Computers
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop&crop=center',
      // Headphones & Audio
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop&crop=center',
      // Cameras & Photography
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop&crop=center'
    ],
    'Fashion': [
      // Men's Clothing
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=400&fit=crop&crop=center',
      // Women's Clothing
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&h=400&fit=crop&crop=center',
      // Shoes & Footwear
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&crop=center',
      // Accessories & Jewelry
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&crop=center'
    ],
    'Sports & Outdoors': [
      // Fitness Equipment
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop&crop=center',
      // Sports Equipment
      'https://images.unsplash.com/photo-1551524164-6cf2ac531400?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e4?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=center',
      // Outdoor Gear
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1533873984035-25970ab07461?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551524164-6cf2ac531400?w=400&h=400&fit=crop&crop=center',
      // Athletic Wear
      'https://images.unsplash.com/photo-1506629905687-f2d3d2d3d2d3?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=400&fit=crop&crop=center'
    ],
    'Health & Beauty': [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=400&h=400&fit=crop&crop=center'
    ],
    'Home & Garden': [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop&crop=center',
    ],
    'Automotive': [
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1486496572940-2bb2341fdbdf?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=400&h=400&fit=crop&crop=center'
    ],
    'Grocery': [
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1506617564039-2f3b650b7010?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=400&fit=crop&crop=center'
    ],
    'Baby Products': [
      'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1587393855524-087f83d95bc9?w=400&h=400&fit=crop&crop=center'
    ]
  };

  // Function to get unique random images for a category
  const getDefaultImages = (category, count = 3, productName = '') => {
    const categoryImages = defaultImages[category] || defaultImages['Electronics'];
    const selectedImages = [];
    const usedIndices = new Set();
    
    // Create a more unique seed based on product name, current time, and random values
    const seed = productName + Date.now() + Math.random() + category;
    let seedHash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      seedHash = ((seedHash << 5) - seedHash + char) & 0xffffffff;
    }
    
    // Make seed more unique by adding product name length and current milliseconds
    seedHash = Math.abs(seedHash + productName.length + (Date.now() % 10000));
    
    // Ensure we don't request more images than available
    const maxImages = Math.min(count, categoryImages.length);
    
    // Shuffle the available indices to get better randomness
    const availableIndices = Array.from({length: categoryImages.length}, (_, i) => i);
    
    // Fisher-Yates shuffle with our custom seed
    for (let i = availableIndices.length - 1; i > 0; i--) {
      const j = Math.abs(seedHash + i) % (i + 1);
      [availableIndices[i], availableIndices[j]] = [availableIndices[j], availableIndices[i]];
    }
    
    // Take the first maxImages from shuffled array
    for (let i = 0; i < maxImages; i++) {
      const imageIndex = availableIndices[i];
      selectedImages.push({
        public_id: `default_${category.toLowerCase().replace(/\s+/g, '_')}_${seedHash}_${i}`,
        url: categoryImages[imageIndex]
      });
    }
    
    return selectedImages;
  };

  let images = [];

  if (useDefaultImages === 'true') {
    // Use category-appropriate default images with product name for uniqueness
    images = getDefaultImages(category, 3, name);
  } else {
    if (!req.files || req.files.length === 0) {
      return next(new ErrorHandler("At least one image is required", 400));
    }
  }

  // Parse variants and tags if they are strings
  if (variants && typeof variants === "string") {
    try {
      variants = JSON.parse(variants);
    } catch (error) {
      return next(new ErrorHandler("Invalid variants format", 400));
    }
  }
  
  if (tags && typeof tags === "string") {
    try {
      tags = JSON.parse(tags);
    } catch (error) {
      return next(new ErrorHandler("Invalid tags format", 400));
    }
  }

  // Upload images to Cloudinary only if not using default images
  if (useDefaultImages !== 'true') {
    for (const file of req.files) {
      const cloudinaryResponse = await cloudinary.uploader.upload(file.path, {
        folder: "products",
      });

      images.push({
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
      });
    }
  }

  const product = await Product.create({
    name,
    description,
    price,
    category,
    brand,
    stock,
    images,
    variants: variants || [],
    tags: tags || [],
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    product,
  });
});

// Update Product
const updateProduct = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  // Find the product
  let product = await Product.findById(id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  // Authorization check
  if (product.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return next(new ErrorHandler("Not authorized to update this product", 403));
  }

  // Update product fields
  const updateData = { ...req.body };
  
  // Handle image updates if files are provided
  if (req.files && req.files.length > 0) {
    // Delete old images from cloudinary
    for (const image of product.images) {
      if (image.public_id && !image.public_id.startsWith('default_')) {
        await cloudinary.uploader.destroy(image.public_id);
      }
    }

    // Upload new images
    const newImages = [];
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "products",
      });
      newImages.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
    updateData.images = newImages;
  }

  // Parse variants and tags if they are strings
  if (updateData.variants && typeof updateData.variants === "string") {
    try {
      updateData.variants = JSON.parse(updateData.variants);
    } catch (error) {
      return next(new ErrorHandler("Invalid variants format", 400));
    }
  }
  
  if (updateData.tags && typeof updateData.tags === "string") {
    try {
      updateData.tags = JSON.parse(updateData.tags);
    } catch (error) {
      return next(new ErrorHandler("Invalid tags format", 400));
    }
  }

  product = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    product,
  });
});

// Delete Product
const deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const { hardDelete = false } = req.query;

  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  // Authorization check
  if (product.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return next(new ErrorHandler("Not authorized to delete this product", 403));
  }

  if (hardDelete === 'true') {
    // Delete images from cloudinary
    for (const image of product.images) {
      if (image.public_id && !image.public_id.startsWith('default_')) {
        await cloudinary.uploader.destroy(image.public_id);
      }
    }
    
    // Permanently delete the product
    await Product.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: "Product deleted permanently",
    });
  } else {
    // Soft delete - mark as inactive
    product.isActive = false;
    await product.save();
    
    res.status(200).json({
      success: true,
      message: "Product deactivated successfully",
    });
  }
});

module.exports = {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
};
