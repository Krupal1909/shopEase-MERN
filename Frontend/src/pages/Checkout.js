import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ordersAPI, paymentAPI, couponsAPI } from '../services/api';
import { FiCreditCard, FiMapPin, FiTag, FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { 
    cart, 
    user, 
    getCartTotal, 
    getCartItemsCount, 
    clearCart,
    isAuthenticated 
  } = useApp();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });

  const [paymentMethod, setPaymentMethod] = useState('razorpay');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }

    if (cart.length === 0) {
      navigate('/cart');
      return;
    }

    // Pre-fill address from user profile
    if (user) {
      setShippingAddress({
        name: user.name || '',
        phone: user.phone || '',
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        zipCode: user.address?.zipCode || '',
        country: user.address?.country || 'India'
      });
    }
  }, [isAuthenticated, cart, user, navigate]);

  const cartTotal = getCartTotal();
  const deliveryFee = cartTotal > 999 ? 0 : 99;
  const subtotal = cartTotal + deliveryFee - couponDiscount;
  const finalTotal = Math.max(0, subtotal);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateAddress = () => {
    const required = ['name', 'phone', 'street', 'city', 'state', 'zipCode'];
    return required.every(field => shippingAddress[field].trim() !== '');
  };

const applyCoupon = async () => {
  if (!couponCode.trim()) {
    toast.error("Please enter a coupon code");
    return;
  }

  try {
    setLoading(true);
    console.log('Applying coupon:', couponCode);
    const response = await couponsAPI.applyCoupon(couponCode.trim(), cart);
    console.log('Coupon response:', response.data);
    
    const { discount, coupon } = response.data;

    setCouponDiscount(discount);
    setAppliedCoupon(coupon);
    toast.success(`Coupon applied! You saved ₹${discount.toFixed(2)}`);
  } catch (error) {
    console.error('Coupon application error:', error);
    const message = error.response?.data?.message || error.message || "Invalid coupon code";
    toast.error(message);
  } finally {
    setLoading(false);
  }
};



  const removeCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    toast.success('Coupon removed');
  };

  const handlePayment = async () => {
  if (!validateAddress()) {
    toast.error('Please fill in all address fields');
    return;
  }

  try {
    setLoading(true);

    // Create order data
    const orderData = {
      items: cart.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.selectedVariant?.price || item.product.discountPrice || item.product.price,
        name: item.product.name || item.product.title,
        variant: item.selectedVariant
      })),
      shippingAddress,
      paymentMethod,
      subtotal: cartTotal,
      deliveryFee,
      couponDiscount,
      total: finalTotal,
      couponCode: appliedCoupon?.code
    };

    // Handle Cash on Delivery
    if (paymentMethod === 'cod') {
      try {
        const orderResponse = await ordersAPI.createOrder({
          ...orderData,
          paymentStatus: 'pending',
          paymentMethod: 'cod'
        });

        clearCart();
        toast.success('Order placed successfully! Pay on delivery.');
        navigate('/payment/success', { 
          state: { 
            orderId: orderResponse.data.order._id,
            paymentMethod: 'cod'
          }
        });
      } catch (error) {
        console.error('COD Order creation error:', error);
        const message = error.response?.data?.message || 'Failed to place order';
        toast.error(message);
      }
      return;
    }

    // For online payment, create Razorpay order first
    if (paymentMethod === 'razorpay') {
      const razorpayOrder = await paymentAPI.createOrder({
        amount: finalTotal
      });

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_RF0Godgrm0egt5',
        amount: razorpayOrder.data.amount,
        currency: razorpayOrder.data.currency,
        name: 'ShopEase',
        description: 'Order Payment',
        order_id: razorpayOrder.data.orderId,
        prefill: {
          name: user.name,
          email: user.email,
          contact: shippingAddress.phone
        },
        theme: {
          color: '#3B82F6'
        },
        handler: async (response) => {
          try {
            // Verify payment
            const verifyResponse = await paymentAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyResponse.data.success) {
              // Create order after successful payment
              const orderResponse = await ordersAPI.createOrder({
                ...orderData,
                paymentStatus: 'completed',
                paymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id
              });

              clearCart();
              toast.success('Payment successful!');
              navigate('/payment/success', { 
                state: { 
                  orderId: orderResponse.data.order._id,
                  paymentId: response.razorpay_payment_id
                }
              });
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed');
            navigate('/payment/failure');
          }
        },
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    }
  } catch (error) {
    console.error('Checkout error:', error);
    const message = error.response?.data?.message || 'Checkout failed';
    toast.error(message);
  } finally {
    setLoading(false);
  }
};

  const steps = [
    { id: 1, name: 'Shipping Address', completed: currentStep > 1 },
    { id: 2, name: 'Payment Method', completed: currentStep > 2 },
    { id: 3, name: 'Review Order', completed: false }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step.completed 
                    ? 'bg-green-500 border-green-500 text-white'
                    : currentStep === step.id
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : 'border-gray-300 dark:border-gray-600 text-gray-400'
                }`}>
                  {step.completed ? <FiCheck size={20} /> : step.id}
                </div>
                <span className={`ml-2 font-medium ${
                  currentStep === step.id 
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 ml-4 ${
                    step.completed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Shipping Address */}
            {currentStep === 1 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Shipping Address
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={shippingAddress.name}
                      onChange={handleAddressChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleAddressChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="street"
                      value={shippingAddress.street}
                      onChange={handleAddressChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleAddressChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={shippingAddress.state}
                      onChange={handleAddressChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={shippingAddress.zipCode}
                      onChange={handleAddressChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Country *
                    </label>
                    <select
                      name="country"
                      value={shippingAddress.country}
                      onChange={handleAddressChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="India">India</option>
                      <option value="USA">United States</option>
                      <option value="UK">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                    </select>
                  </div>
                </div>
                
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!validateAddress()}
                  className="mt-6 w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {currentStep === 2 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Payment Method
                </h2>
                
                <div className="space-y-4">
                  <div className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    paymentMethod === 'razorpay' 
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`} onClick={() => setPaymentMethod('razorpay')}>
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="razorpay"
                        checked={paymentMethod === 'razorpay'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-primary-600"
                      />
                      <FiCreditCard className="text-primary-600" size={20} />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          Credit/Debit Card, UPI, Net Banking
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Secure payment via Razorpay
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    paymentMethod === 'cod' 
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`} onClick={() => setPaymentMethod('cod')}>
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-primary-600"
                      />
                      <FiMapPin className="text-primary-600" size={20} />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          Cash on Delivery
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Pay when your order arrives
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review Order */}
            {currentStep === 3 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Review Your Order
                </h2>
                
                {/* Order Items */}
                <div className="space-y-4 mb-6">
                  {cart.map((item) => {
                    const currentPrice = item.selectedVariant?.price || item.product.discountPrice || item.product.price;
                    return (
                      <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <img
                          src={item.product.images?.[0]?.url || '/api/placeholder/60/60'}
                          alt={item.product.name}
                          className="w-15 h-15 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {item.product.name}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Qty: {item.quantity} × {formatPrice(currentPrice)}
                          </p>
                        </div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {formatPrice(currentPrice * item.quantity)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Shipping Address Summary */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Shipping Address
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {shippingAddress.name}<br />
                    {shippingAddress.street}<br />
                    {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}<br />
                    {shippingAddress.country}<br />
                    Phone: {shippingAddress.phone}
                  </p>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Processing...' : `Place Order - ${formatPrice(finalTotal)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Order Summary
              </h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Subtotal ({getCartItemsCount()} items)
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Delivery Fee
                  </span>
                  <span className={`font-medium ${deliveryFee === 0 ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                    {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                  </span>
                </div>
                
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount</span>
                    <span>-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
                
                <hr className="border-gray-200 dark:border-gray-700" />
                
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatPrice(finalTotal)}
                  </span>
                </div>
              </div>
              
              {/* Coupon Code */}
              <div className="mb-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    disabled={appliedCoupon}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                  {appliedCoupon ? (
                    <button
                      onClick={removeCoupon}
                      className="px-3 py-2 text-red-600 hover:text-red-700 border border-red-600 rounded-lg transition-colors"
                    >
                      <FiX size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={applyCoupon}
                      disabled={loading || !couponCode.trim()}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FiTag size={16} />
                    </button>
                  )}
                </div>
                {appliedCoupon && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ {appliedCoupon.code} applied
                  </p>
                )}
              </div>
              
              {/* Security Info */}
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>Secure checkout with SSL encryption</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
