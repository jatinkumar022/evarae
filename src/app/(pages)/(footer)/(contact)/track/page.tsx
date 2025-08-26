'use client';

import React, { useState } from 'react';
import Container from '@/app/components/layouts/Container';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Package,
  Truck,
  CheckCircle2,
  CreditCard,
  MapPin,
  Clock,
  Phone,
  Mail,
  Calendar,
  User,
} from 'lucide-react';

// You'll need to import your actual product images
// import { star, starWhite, dazzling } from '@/app/assets/Products';

interface OrderProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: string;
  images: string[]; // StaticImageData[] in real implementation
  category: {
    name: string;
    slug: string;
  };
  material: string;
  weight: number;
  sku: string;
  quantity: number;
}

interface OrderDetails {
  id: string;
  orderNumber: string;
  status:
    | 'Placed'
    | 'Confirmed'
    | 'Packed'
    | 'Shipped'
    | 'Out for Delivery'
    | 'Delivered';
  placedDate: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  products: OrderProduct[];
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  shippingAddress: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  trackingNumber?: string;
  courierPartner?: string;
  timeline: {
    status: string;
    date: string;
    time: string;
    location?: string;
    description: string;
  }[];
}

// Mock order data
const mockOrder: OrderDetails = {
  id: '1',
  orderNumber: '0',
  status: 'Shipped',
  placedDate: '2025-08-24T10:30:00Z',
  estimatedDelivery: '2025-08-29T18:00:00Z',
  products: [
    {
      id: '1',
      name: 'Diamond Solitaire Ring',
      description: 'Classic diamond solitaire ring in a timeless setting.',
      price: 150000,
      originalPrice: 180000,
      currency: 'INR',
      images: ['/placeholder-ring.jpg'], // Replace with actual images
      category: {
        name: 'Rings',
        slug: 'rings',
      },
      material: '18K Gold with Diamond',
      weight: 8.5,
      sku: 'RNG-001',
      quantity: 1,
    },
  ],
  totalAmount: 150000,
  paymentMethod: 'Credit Card',
  paymentStatus: 'Paid',
  shippingAddress: {
    name: 'Priya Sharma',
    phone: '+91 98765 43210',
    email: 'priya.sharma@example.com',
    address: '123, Residency Road',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560025',
  },
  trackingNumber: 'TRK987654321',
  courierPartner: 'BlueDart Express',
  timeline: [
    {
      status: 'Order Placed',
      date: '2025-08-24',
      time: '10:30 AM',
      description:
        'Your order has been successfully placed and payment confirmed.',
    },
    {
      status: 'Order Confirmed',
      date: '2025-08-24',
      time: '11:15 AM',
      description:
        'Order confirmed by our team. Preparing your jewelry with care.',
    },
    {
      status: 'Packed',
      date: '2025-08-25',
      time: '02:30 PM',
      location: 'Mumbai Facility',
      description:
        'Your jewelry has been carefully packed and ready for shipment.',
    },
    {
      status: 'Shipped',
      date: '2025-08-25',
      time: '06:45 PM',
      location: 'Mumbai Hub',
      description:
        'Package dispatched and on its way to you via BlueDart Express.',
    },
  ],
};

const statusStages = [
  { key: 'Placed', label: 'Order Placed', icon: CreditCard },
  { key: 'Confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'Packed', label: 'Packed', icon: Package },
  { key: 'Shipped', label: 'Shipped', icon: Truck },
  { key: 'Out for Delivery', label: 'Out for Delivery', icon: MapPin },
  { key: 'Delivered', label: 'Delivered', icon: CheckCircle2 },
];

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [tracking, setTracking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [error, setError] = useState('');

  const handleTrackOrder = async () => {
    if (!orderId.trim() || !email.trim()) {
      setError('Please enter both Order ID and email address');
      return;
    }

    setLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      // Mock validation - in real app, validate against API
      if (orderId.toLowerCase().includes('caelvi') || orderId === 'test') {
        setOrder(mockOrder);
        setTracking(true);
      } else {
        setError('Order not found. Please check your Order ID and email.');
      }
      setLoading(false);
    }, 1500);
  };

  const getStatusIndex = (status: string) => {
    return statusStages.findIndex(stage => stage.key === status);
  };

  const formatPrice = (price: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white text-text-primary">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-bg-menu to-white">
        <Container>
          <div className="py-20 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="heading-component-main-heading mb-6"
            >
              Track Your Order
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-text-primary/80 max-w-2xl mx-auto lg:text-lg leading-relaxed"
            >
              Enter your order details below to track the real-time status of
              your Caelvi jewellery. Stay updated every step of the way from our
              atelier to your doorstep.
            </motion.p>
          </div>
        </Container>
      </div>

      <Container>
        {!tracking ? (
          // Tracking Input Section
          <div className="py-16 flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white shadow-lg border border-primary/10 rounded-2xl p-8 w-full max-w-lg"
            >
              <h2 className="text-2xl font-fraunces font-medium mb-6 text-primary text-center">
                Enter Order Details
              </h2>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-3 text-primary">
                    Order ID <span className="text-accent">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CAELVI240825001"
                    value={orderId}
                    onChange={e => setOrderId(e.target.value)}
                    className="w-full px-4 py-3 border border-primary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 bg-white text-text-primary placeholder-text-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3 text-primary">
                    Email Address <span className="text-accent">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-primary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 bg-white text-text-primary placeholder-text-primary/50"
                  />
                </div>

                <motion.button
                  onClick={handleTrackOrder}
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Tracking Order...
                    </span>
                  ) : (
                    'Track My Order'
                  )}
                </motion.button>
              </div>

              <div className="mt-6 pt-6 border-t border-primary/10">
                <p className="text-sm text-text-primary/70 text-center">
                  Don&apos;t have your Order ID? Check your email confirmation
                  or{' '}
                  <Link
                    href="/contact"
                    className="text-primary hover:underline font-medium"
                  >
                    contact support
                  </Link>
                </p>
              </div>
            </motion.div>

            {/* Quick Access Cards */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full max-w-4xl"
            >
              {[
                {
                  title: 'Guest Checkout',
                  description: 'Placed an order without creating an account?',
                  action: 'Track as Guest',
                  icon: User,
                },
                {
                  title: 'Need Help?',
                  description: 'Having trouble finding your order details?',
                  action: 'Contact Support',
                  icon: Phone,
                },
                {
                  title: 'Order History',
                  description: 'View all your previous Caelvi purchases',
                  action: 'View Orders',
                  icon: Calendar,
                },
              ].map((card, index) => (
                <div
                  key={index}
                  className="bg-white border border-primary/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <card.icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-medium text-primary mb-2">
                    {card.title}
                  </h3>
                  <p className="text-sm text-text-primary/70 mb-4">
                    {card.description}
                  </p>
                  <Link
                    href="#"
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    {card.action} →
                  </Link>
                </div>
              ))}
            </motion.div>
          </div>
        ) : (
          // Order Details Section
          <AnimatePresence>
            <div className="py-16 space-y-12">
              {/* Order Summary */}
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-primary/10  rounded-2xl p-4 sm:p-6 lg:p-8"
              >
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 sm:mb-8 gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-fraunces font-medium text-primary mb-1 sm:mb-2">
                      Order #{order?.orderNumber}
                    </h2>
                    <p className="text-sm sm:text-base text-text-primary/70">
                      Placed on {order && formatDate(order.placedDate)}
                    </p>
                  </div>

                  <div className="flex items-center">
                    <span
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium ${
                        order?.status === 'Delivered'
                          ? 'bg-green-100 text-green-800'
                          : order?.status === 'Shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {order?.status}
                    </span>
                  </div>
                </div>

                {/* Products */}
                <div className="space-y-4 sm:space-y-6">
                  {order?.products.map((product, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-bg-menu/30 rounded-xl"
                    >
                      {/* Product Image */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center text-primary/60 flex-shrink-0 mx-auto sm:mx-0">
                        {/* Replace with actual product image */}
                        <Package className="w-6 h-6 sm:w-8 sm:h-8" />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 w-full">
                        <h3 className="font-medium text-primary text-base sm:text-lg mb-1 sm:mb-2">
                          {product.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-text-primary/70 mb-2 sm:mb-3">
                          {product.description}
                        </p>
                        <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
                          <span className="text-text-primary/70">
                            <strong>Material:</strong> {product.material}
                          </span>
                          <span className="text-text-primary/70">
                            <strong>Weight:</strong> {product.weight}g
                          </span>
                          <span className="text-text-primary/70">
                            <strong>SKU:</strong> {product.sku}
                          </span>
                          <span className="text-text-primary/70">
                            <strong>Qty:</strong> {product.quantity}
                          </span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-left sm:text-right w-full sm:w-auto">
                        <div className="text-lg sm:text-xl font-medium text-primary">
                          {formatPrice(product.price)}
                        </div>
                        {product.originalPrice && (
                          <div className="text-xs sm:text-sm text-text-primary/50 line-through">
                            {formatPrice(product.originalPrice)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-primary/10">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                    <span className="text-base sm:text-lg font-medium text-primary">
                      Total Amount:
                    </span>
                    <span className="text-lg sm:text-xl font-medium text-primary">
                      {formatPrice(order?.totalAmount || 0)}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 text-xs sm:text-sm text-text-primary/70 gap-1 sm:gap-0">
                    <span>Payment Method: {order?.paymentMethod}</span>
                    <span className="text-green-600 font-medium">
                      ✓ {order?.paymentStatus}
                    </span>
                  </div>
                </div>
              </motion.section>
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-primary/10 rounded-2xl p-4 sm:p-6 lg:p-8"
              >
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 sm:mb-8 gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-fraunces font-medium text-primary mb-1 sm:mb-2">
                      Order #{order?.orderNumber}
                    </h2>
                    <p className="text-sm sm:text-base text-text-primary/70">
                      Placed on {order && formatDate(order.placedDate)}
                    </p>
                  </div>

                  <div className="flex items-center">
                    <span
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium ${
                        order?.status === 'Delivered'
                          ? 'bg-green-100 text-green-800'
                          : order?.status === 'Shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {order?.status}
                    </span>
                  </div>
                </div>

                {/* Products */}
                <div className="space-y-4 sm:space-y-6">
                  {order?.products.map((product, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-bg-menu/30 rounded-xl"
                    >
                      {/* Product Image */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center text-primary/60 flex-shrink-0 mx-auto sm:mx-0">
                        {/* Replace with actual product image */}
                        <Package className="w-6 h-6 sm:w-8 sm:h-8" />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 w-full">
                        <h3 className="font-medium text-primary text-base sm:text-lg mb-1 sm:mb-2">
                          {product.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-text-primary/70 mb-2 sm:mb-3">
                          {product.description}
                        </p>
                        <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
                          <span className="text-text-primary/70">
                            <strong>Material:</strong> {product.material}
                          </span>
                          <span className="text-text-primary/70">
                            <strong>Weight:</strong> {product.weight}g
                          </span>
                          <span className="text-text-primary/70">
                            <strong>SKU:</strong> {product.sku}
                          </span>
                          <span className="text-text-primary/70">
                            <strong>Qty:</strong> {product.quantity}
                          </span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-left sm:text-right w-full sm:w-auto">
                        <div className="text-lg sm:text-xl font-medium text-primary">
                          {formatPrice(product.price)}
                        </div>
                        {product.originalPrice && (
                          <div className="text-xs sm:text-sm text-text-primary/50 line-through">
                            {formatPrice(product.originalPrice)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-primary/10">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                    <span className="text-base sm:text-lg font-medium text-primary">
                      Total Amount:
                    </span>
                    <span className="text-lg sm:text-xl font-medium text-primary">
                      {formatPrice(order?.totalAmount || 0)}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 text-xs sm:text-sm text-text-primary/70 gap-1 sm:gap-0">
                    <span>Payment Method: {order?.paymentMethod}</span>
                    <span className="text-green-600 font-medium">
                      ✓ {order?.paymentStatus}
                    </span>
                  </div>
                </div>
              </motion.section>

              {/* Progress Timeline */}
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white border border-primary/10 rounded-2xl p-5 md:p-8"
              >
                <h2 className="text-xl sm:text-2xl  font-fraunces font-medium text-primary mb-8 ">
                  Delivery Progress
                </h2>

                {/* Status Progress Bar */}
                <div className="hidden md:block relative mb-12">
                  <div className="flex justify-between">
                    {statusStages.map((stage, index) => {
                      const currentIndex = getStatusIndex(
                        order?.status || 'Placed'
                      );
                      const isCompleted = index <= currentIndex;
                      const isCurrent = index === currentIndex;
                      const IconComponent = stage.icon;

                      return (
                        <div
                          key={stage.key}
                          className="flex flex-col items-center relative flex-1"
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative w-12 h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-20 ${
                              isCompleted
                                ? 'bg-primary text-white border-primary '
                                : 'bg-gray-100 text-gray-400 border-gray-300'
                            }`}
                          >
                            <IconComponent className="w-5 h-5 lg:w-6 lg:h-6" />

                            {/* Pulsing Ring Animation */}
                            {isCurrent && (
                              <motion.span
                                className="absolute inset-0 rounded-full border-2 border-primary"
                                animate={{
                                  scale: [1, 1.4, 1],
                                  opacity: [0.8, 0, 0.8],
                                }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  ease: 'easeInOut',
                                }}
                              />
                            )}
                          </motion.div>
                          <p
                            className={`mt-3 text-xs lg:text-sm text-center px-2 ${
                              isCompleted
                                ? 'text-primary font-medium'
                                : 'text-gray-400'
                            }`}
                          >
                            {stage.label}
                          </p>

                          {/* Progress Line */}
                          {index < statusStages.length - 1 && (
                            <div className="absolute top-6 lg:top-7 left-1/2 w-full h-0.5 z-0">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                  width: index < currentIndex ? '100%' : '0%',
                                }}
                                transition={{
                                  duration: 2.2,
                                  delay: index * 1.8,
                                }}
                                className={`h-full ${
                                  index < currentIndex
                                    ? 'bg-primary'
                                    : 'bg-gray-300'
                                }`}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Vertical Timeline */}
                <div className="block md:hidden relative mb-12">
                  <div className="relative flex flex-col">
                    {/* Background Line */}
                    <div className="absolute left-[13px] top-0 bottom-0 w-0.5 bg-gray-300" />

                    {/* Active Line */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{
                        height: `${
                          (getStatusIndex(order?.status || 'Placed') /
                            (statusStages.length - 1)) *
                          100
                        }%`,
                      }}
                      transition={{ duration: 1.2, ease: 'easeInOut' }}
                      className="absolute left-[13px] top-0 w-0.5 bg-primary origin-top"
                    />

                    {/* Timeline Items */}
                    {statusStages.map((stage, index) => {
                      const currentIndex = getStatusIndex(
                        order?.status || 'Placed'
                      );
                      const isCompleted = index <= currentIndex;
                      const isCurrent = index === currentIndex;
                      const IconComponent = stage.icon;

                      // find matching timeline data if exists
                      const event = order?.timeline.find(
                        e => e.status === stage.key
                      );

                      const isLast = index === statusStages.length - 1;

                      return (
                        <div
                          key={stage.key}
                          className={`flex items-start relative ${
                            isLast ? 'mb-0' : 'mb-8'
                          }`}
                        >
                          {/* Icon */}
                          <div className="flex flex-col items-center mr-4 relative z-10">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: index * 0.2 }}
                              className={`relative w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                isCompleted
                                  ? 'bg-primary text-white border-primary '
                                  : 'bg-gray-100 text-gray-400 border-gray-300'
                              }`}
                            >
                              <IconComponent className="w-4 h-4" />

                              {/* Pulsing Ring for Current */}
                              {isCurrent && (
                                <motion.span
                                  className="absolute inset-0 rounded-full border-2 border-primary"
                                  animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.8, 0, 0.8],
                                  }}
                                  transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                  }}
                                />
                              )}
                            </motion.div>
                          </div>

                          {/* Event Details */}
                          <div className={`pb-2 ${isLast ? 'pb-0' : ''}`}>
                            <h4
                              className={`font-medium ${
                                isCompleted ? 'text-primary' : 'text-gray-500'
                              }`}
                            >
                              {stage.label}
                            </h4>
                            {event ? (
                              <>
                                <p className="text-sm text-text-primary/70">
                                  {event.date} • {event.time}
                                </p>
                                {event.location && (
                                  <p className="text-xs text-gray-500">
                                    {event.location}
                                  </p>
                                )}
                                <p className="text-text-primary/80 text-sm">
                                  {event.description}
                                </p>
                              </>
                            ) : (
                              <p className="text-sm text-gray-400">Pending</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Detailed Timeline */}
                <div className="hidden md:block space-y-4">
                  <h3 className="text-lg font-medium text-primary mb-4">
                    Order Timeline
                  </h3>
                  {order?.timeline
                    .slice()
                    .reverse()
                    .map((event, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-4 p-4 rounded-xl bg-bg-menu/20 border border-primary/5"
                      >
                        <div className="w-3 h-3 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-2">
                            <h4 className="font-medium text-primary">
                              {event.status}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-text-primary/70">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {event.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {event.time}
                              </span>
                              {event.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {event.location}
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-text-primary/80 text-sm">
                            {event.description}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </motion.section>

              {/* Shipping & Contact Info */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Shipping Address */}
                <motion.section
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white border border-primary/10  rounded-2xl p-6"
                >
                  <h3 className="text-lg font-fraunces font-medium text-primary mb-4">
                    Shipping Address
                  </h3>
                  <div className="space-y-2 text-text-primary/80 text-sm">
                    <p className="font-medium text-primary text-base">
                      {order?.shippingAddress.name}
                    </p>
                    <p>{order?.shippingAddress.address}</p>
                    <p>
                      {order?.shippingAddress.city},{' '}
                      {order?.shippingAddress.state}
                    </p>
                    <p>{order?.shippingAddress.pincode}</p>
                    <div className="pt-4 space-y-1 text-sm">
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {order?.shippingAddress.phone}
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {order?.shippingAddress.email}
                      </p>
                    </div>
                  </div>
                </motion.section>

                {/* Delivery Info */}
                <motion.section
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white border border-primary/10  rounded-2xl p-6"
                >
                  <h3 className="text-lg font-fraunces font-medium text-primary mb-4">
                    Delivery Information
                  </h3>
                  <div className="space-y-3 text-text-primary/80 text-sm">
                    <div className="flex justify-between">
                      <span>Courier Partner:</span>
                      <span className="font-medium text-end">
                        {order?.courierPartner}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tracking Number:</span>
                      <span className="font-mono text-sm font-medium text-primary text-end">
                        {order?.trackingNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Delivery:</span>
                      <span className="font-medium text-end">
                        {order && formatDate(order.estimatedDelivery)}
                      </span>
                    </div>
                  </div>
                </motion.section>
              </div>
            </div>
          </AnimatePresence>
        )}

        {/* Help Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: tracking ? 0.5 : 0.3 }}
          className="py-16 text-center border-t border-primary/10"
        >
          <div className="max-w-2xl mx-auto">
            <h2 className="heading-component-main-heading py-4 mb-2">
              Need Help with Your Order?
            </h2>
            <p className="text-text-primary/70 mb-8 leading-relaxed text-sm">
              If you have any questions about your order or need assistance with
              tracking, our dedicated customer support team is here to help you
              24/7.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/contact"
                className="px-8 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-primary to-accent text-white rounded-full  transform hover:scale-105 transition-all duration-300 font-medium"
              >
                Contact Support
              </Link>
              <Link
                href="/help-faq"
                className="px-8 py-2 sm:py-3 text-sm sm:text-base bg-white text-primary border border-primary/20 rounded-full hover:bg-primary/5 hover:border-primary/40 transition-all duration-300 font-medium"
              >
                View FAQ
              </Link>
            </div>
          </div>
        </motion.section>

        {/* Bottom Decorative Section */}
        <div className="pb-10 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="inline-flex items-center space-x-4 mb-8"
          >
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-pink-300 to-rose-400"></div>
            <div className="w-2 h-2 rounded-full bg-gradient-to-br from-rose-300 to-purple-400"></div>
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-300 to-pink-400"></div>
            <div className="w-2 h-2 rounded-full bg-gradient-to-br from-pink-400 to-rose-300"></div>
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-rose-400 to-purple-300"></div>
          </motion.div>
          <p className="text-text-primary/60 font-light italic sm:text-lg font-fraunces text-sm ">
            &ldquo;Your precious moments, delivered with care&rdquo;
          </p>
        </div>
      </Container>
    </div>
  );
}
