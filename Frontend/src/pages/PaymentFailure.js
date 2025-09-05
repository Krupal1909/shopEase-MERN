import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiXCircle, FiRefreshCw, FiHome, FiArrowLeft } from 'react-icons/fi';

const PaymentFailure = () => {
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error') || 'Payment failed';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <FiXCircle size={80} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Payment Failed
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            We couldn't process your payment. Please try again or use a different payment method.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800 dark:text-red-200">
              {error}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Link
            to="/checkout"
            className="w-full flex items-center justify-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FiRefreshCw size={20} />
            <span>Try Again</span>
          </Link>
          
          <Link
            to="/cart"
            className="w-full flex items-center justify-center space-x-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <FiArrowLeft size={20} />
            <span>Back to Cart</span>
          </Link>
          
          <Link
            to="/"
            className="w-full flex items-center justify-center space-x-2 text-gray-500 dark:text-gray-400 px-6 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <FiHome size={20} />
            <span>Continue Shopping</span>
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>Need help? Contact our support team for assistance.</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
