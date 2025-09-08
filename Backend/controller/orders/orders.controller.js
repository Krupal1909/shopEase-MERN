const Order = require("../../models/order/order.model");
const Cart = require("../../models/cart/cart.model");
const Product = require("../../models/product/product.model");
const catchAsyncErrors = require("../../middleware/catchAsyncError");
const ErrorHandler = require("../../utills/ErrorHandler");

// Create new order
const createOrder = catchAsyncErrors(async (req, res, next) => {

  let orderItems = [];
  let shippingAddress = {};

  // 🔹 Check if body is already parsed (for JSON requests)
  if (req.body.items && Array.isArray(req.body.items)) {
    orderItems = req.body.items;
    shippingAddress = req.body.shippingAddress || {};
  } 
  // 🔹 Parse form data format
  else {
    // Parse items from form data format: items[0][product], items[0][quantity], etc.
    for (const key in req.body) {
      
      // Parse order items
      if (key.startsWith('items[') && key.includes('][')) {
        const matches = key.match(/items\[(\d+)\]\[(\w+)\]/);
        if (matches && matches.length === 3) {
          const index = parseInt(matches[1]);
          const field = matches[2];
          
          if (!orderItems[index]) {
            orderItems[index] = {};
          }
          orderItems[index][field] = req.body[key];
        }
      }
      
      // Parse shipping address
      else if (key.startsWith('shippingAddress[')) {
        const matches = key.match(/shippingAddress\[(\w+)\]/);
        if (matches && matches.length === 2) {
          const field = matches[1];
          shippingAddress[field] = req.body[key];
        }
      }
      // Handle flat shipping address fields (fallback)
      else if (['name', 'phone', 'street', 'city', 'state', 'zipCode', 'country'].includes(key)) {
        shippingAddress[key] = req.body[key];
      }
    }
  }


  // 🔹 If no items found, try alternative parsing
  if (orderItems.length === 0) {
    // Try to find items in other possible formats
    for (const key in req.body) {
      if (key.includes('product') || key.includes('quantity') || key.includes('price')) {
      }
    }
    return next(new ErrorHandler("No order items found. Please check the request format.", 400));
  }

  // Filter and format order items
  orderItems = orderItems
    .filter(item => item && item.product)
    .map(item => ({
      product: item.product,
      quantity: parseInt(item.quantity) || 1,
      price: parseFloat(item.price) || 0,
      name: item.name || 'Product'
    }));

  // 🔹 Extract pricing information
  const itemsPrice = parseFloat(req.body.subtotal) || parseFloat(req.body.itemsPrice) || 0;
  const shippingPrice = parseFloat(req.body.deliveryFee) || parseFloat(req.body.shippingPrice) || 0;
  const taxPrice = parseFloat(req.body.taxPrice) || 0;
  const totalPrice = parseFloat(req.body.total) || parseFloat(req.body.totalPrice) || 0;
  const paymentMethod = req.body.paymentMethod || 'cod';

  // 🔹 MAP FIELD NAMES TO MATCH YOUR SCHEMA
  const mappedShippingAddress = {
    address: shippingAddress.street || shippingAddress.address || '',
    city: shippingAddress.city || '',
    state: shippingAddress.state || '',
    pinCode: shippingAddress.zipCode || shippingAddress.pinCode || '',
    country: shippingAddress.country || '',
    phoneNo: shippingAddress.phone || shippingAddress.phoneNo || ''
  };


  if (!orderItems || orderItems.length === 0) {
    return next(new ErrorHandler("No order items found after processing", 400));
  }

  // 🔹 Validate stock and populate product details
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      return next(new ErrorHandler(`Product not found: ${item.product}`, 404));
    }
    if (product.stock < item.quantity) {
      return next(new ErrorHandler(`Insufficient stock for ${product.name}`, 400));
    }
    item.name = product.name;
    if (product.images && product.images.length > 0) {
      item.image = {
        public_id: product.images[0].public_id,
        url: product.images[0].url
      };
    }
  }

  // 🔹 Generate payment ID for COD orders
  const paymentId = req.body.paymentId || `cod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // 🔹 Create order with EXACT schema field names
  const order = await Order.create({
    user: req.user.id,
    orderItems: orderItems, // Note: your schema uses 'orderItems' not 'items'
    shippingAddress: mappedShippingAddress,
    paymentInfo: {
      id: paymentId,
      status: req.body.paymentStatus || 'pending',
      method: paymentMethod
    },
    itemsPrice: itemsPrice,
    taxPrice: taxPrice,
    shippingPrice: shippingPrice,
    totalPrice: totalPrice,
    orderStatus: "Processing"
  });

  // 🔹 Update stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }

  // 🔹 Clear cart
  await Cart.findOneAndUpdate({ user: req.user.id }, { $set: { items: [] } });

  res.status(201).json({
    success: true,
    message: "Order created successfully",
    order,
  });
});


//getOrder Details

const getOrderDetails = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate("orderItems.product", "name images category brand");

  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Order details fetched successfully",
    order,
  });
});

//get All orders
const getAllOrders = catchAsyncErrors(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    status,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  // Build query object
  let query = {};

  // Filter by order status if provided
  if (status) {
    query.orderStatus = status;
  }

  // Pagination
  const skip = (page - 1) * limit;

  // Sort options
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

  const orders = await Order.find(query)
    .populate("user", "name email")
    .populate("orderItems.product", "name images category brand")
    .sort(sortOptions)
    .skip(skip)
    .limit(Number(limit));

  const totalOrders = await Order.countDocuments(query);
  const totalPages = Math.ceil(totalOrders / limit);

  res.status(200).json({
    success: true,
    message: "Orders fetched successfully",
    orders,
    pagination: {
      currentPage: Number(page),
      totalPages,
      totalOrders,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
});

//update order status

const updateOrderStatus = catchAsyncErrors(async (req, res, next) => {
  const { status } = req.body;

  if (!status) {
    return next(new ErrorHandler("Order status is required", 400));
  }

  const validStatuses = [
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
    "Refunded",
  ];
  if (!validStatuses.includes(status)) {
    return next(new ErrorHandler("Invalid order status", 400));
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  // Prevent updating already delivered orders
  if (order.orderStatus === "Delivered") {
    return next(new ErrorHandler("Cannot update delivered order", 400));
  }

  // Update order status
  order.orderStatus = status;

  // Set appropriate timestamps
  if (status === "Shipped") {
    order.shippedAt = Date.now();
  } else if (status === "Delivered") {
    order.deliveredAt = Date.now();
  } else if (status === "Cancelled") {
    order.cancelledAt = Date.now();

    // Restore product stock when order is cancelled
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }
  } else if (status === "Refunded") {
    order.refundedAt = Date.now();

    // Restore product stock when order is refunded
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: "Order status updated successfully",
    order,
  });
});

module.exports = {
  updateOrderStatus,
  getAllOrders,
  getOrderDetails,
  createOrder,
};
