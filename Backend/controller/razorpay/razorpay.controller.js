const razorpay = require("../../utills/razorpay");
const crypto = require("crypto");
const Order = require('../../models/order/order.model')
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100, // convert to paise
      currency: "INR",
      receipt: "order_rcptid_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (err) {
    console.error("Razorpay Order Error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: err.message || err,
    });
  }
};


const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (expectedSign === razorpay_signature) {
      const order = await Order.create({
        user: req.user?.id,
        orderItems: orderData.orderItems,
        shippingAddress: orderData.shippingAddress,
        paymentInfo: {
          id: razorpay_payment_id,
          status: "Paid",
          method: "Razorpay",
        },
        itemsPrice: orderData.itemsPrice,
        taxPrice: orderData.taxPrice,
        shippingPrice: orderData.shippingPrice,
        totalPrice: orderData.totalPrice,
      });

      return res.status(200).json({ success: true, order });
    } else {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }
  } catch (err) {
    console.error("Verify Payment Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  verifyPayment,
  createRazorpayOrder,
};
