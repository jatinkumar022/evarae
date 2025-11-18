'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useReturnRequestStore, ReturnRequest } from '@/lib/data/store/returnRequestStore';
import {
  Package,
  Truck,
  XCircle,
  Clock,
  Download,
  RefreshCw,
  Star,
  Phone,
  RotateCcw,
  ArrowLeft,
  Copy,
  ExternalLink,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';
import Image from '@/app/(main)/components/ui/FallbackImage';
import toastApi from '@/lib/toast';
import Container from '@/app/(main)/components/layouts/Container';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { InvoiceDownloadProgress } from '@/app/(main)/components/ui/InvoiceDownloadProgress';
import { downloadInvoiceWithProgress } from '@/app/(main)/utils/invoiceDownload';
import PageLoader from '@/app/(main)/components/layouts/PageLoader';
import ReturnRequestModal from '@/app/(main)/components/ui/ReturnRequestModal';
import { ReturnStatusModal } from '@/app/(main)/components/ui/ReturnStatusModal';

// Strict types for order data
type OrderItem = {
  product: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  quantity: number;
  image: string | null;
};

type ShippingAddress = {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type OrderStatusType =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

type OrderPaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'completed';

type OrderDoc = {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotalAmount: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  paymentChargesAmount: number;
  totalAmount: number;
  paymentMethod: 'razorpay' | 'stripe' | 'phonepe' | 'cod';
  paymentStatus: OrderPaymentStatus;
  orderStatus: OrderStatusType;
  shippingAddress: ShippingAddress;
  paymentProviderOrderId: string | null;
  paymentProviderPaymentId: string | null;
  paymentProviderSignature: string | null;
  paymentProvider: string;
  trackingNumber: string | null;
  courierName: string | null;
  isGift: boolean;
  couponCode: string | null;
  notes: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const OrderStatus = ({ status }: { status: OrderStatusType }) => {
  const statusConfig: Record<
    OrderStatusType,
    { color: string; icon: React.ElementType; label: string }
  > = {
    pending: {
      color: 'bg-yellow-100 text-yellow-800',
      icon: Clock,
      label: 'Pending',
    },
    confirmed: {
      color: 'bg-blue-100 text-blue-800',
      icon: CheckCircle2,
      label: 'Confirmed',
    },
    processing: {
      color: 'bg-purple-100 text-purple-800',
      icon: Package,
      label: 'Processing',
    },
    shipped: {
      color: 'bg-orange-100 text-orange-800',
      icon: Truck,
      label: 'Shipped',
    },
    delivered: {
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle2,
      label: 'Delivered',
    },
    cancelled: {
      color: 'bg-red-100 text-red-800',
      icon: XCircle,
      label: 'Cancelled',
    },
    returned: {
      color: 'bg-gray-100 text-gray-800',
      icon: RotateCcw,
      label: 'Returned',
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium ${config.color}`}
    >
      {config.label}
    </span>
  );
};

function formatCurrency(n: number): string {
  return `₹${n.toLocaleString()}`;
}

const baseStatusStages = [
  { key: 'pending', label: 'Order Placed', icon: CreditCard },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

// Return stage - only added when return request exists
const returnStage = { key: 'return', label: 'Return', icon: RotateCcw };

const getStatusIndex = (status: string, hasReturnStage: boolean = false) => {
  const stages = hasReturnStage
    ? [...baseStatusStages, returnStage]
    : baseStatusStages;
  const index = stages.findIndex(stage => stage.key === status);
  return index >= 0 ? index : 0;
};

// Map return request status to timeline status
// Returns the timeline status based on return request status
const getReturnTimelineStatus = (returnRequests: ReturnRequest[]): { status: string; isCompleted: boolean } | null => {
  if (!returnRequests || returnRequests.length === 0) return null;

  // Get the most advanced return request (not rejected)
  const activeReturns = returnRequests.filter(rr => rr.status !== 'rejected');
  if (activeReturns.length === 0) return null;

  // Get the highest priority status
  const statusPriority: Record<string, number> = {
    'pending': 1,
    'approved': 2,
    'processing': 3,
    'completed': 4,
  };

  const highestReturn = activeReturns.reduce((highest, req) => {
    const currentPriority = statusPriority[req.status] || 0;
    const highestPriority = statusPriority[highest?.status || ''] || 0;
    return currentPriority > highestPriority ? req : highest;
  }, activeReturns[0]);

  // If return is completed, mark it as completed in timeline
  // Otherwise, show it as current (not completed)
  return {
    status: 'return',
    isCompleted: highestReturn.status === 'completed'
  };
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Check if order is within 7 days return window
const isWithinReturnWindow = (paidAt: string | null): boolean => {
  if (!paidAt) return false;
  const paidDate = new Date(paidAt);
  const now = new Date();
  const daysDiff = (now.getTime() - paidDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysDiff <= 7 && daysDiff >= 0;
};

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDoc | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [showProgress, setShowProgress] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null);
  const [returnStatusModalOpen, setReturnStatusModalOpen] = useState(false);
  const [selectedItemForStatus, setSelectedItemForStatus] = useState<OrderItem | null>(null);

  const { returnRequestsMap, checkReturnRequestsForOrder, fetchReturnRequests, returnRequests: storeReturnRequests } = useReturnRequestStore();
  const hasFetchedReturnRequestsRef = useRef<string | null>(null);
  const returnRequestsFetchedRef = useRef<boolean>(false);

  // Filter return requests for this order - use ref to track previous value
  const returnRequestsRef = useRef<ReturnRequest[]>([]);
  const returnRequests = useMemo(() => {
    if (!order?._id) {
      returnRequestsRef.current = [];
      return [];
    }
    const filtered = storeReturnRequests.filter(rr => rr.order._id === order._id);
    // Only update if the actual data changed (by comparing IDs and statuses)
    const prevIds = returnRequestsRef.current.map(r => `${r._id}-${r.status}`).sort().join(',');
    const newIds = filtered.map(r => `${r._id}-${r.status}`).sort().join(',');
    if (prevIds !== newIds) {
      returnRequestsRef.current = filtered;
    }
    return returnRequestsRef.current;
  }, [storeReturnRequests, order?._id]);

  // Ensure body scroll is enabled when component mounts/unmounts
  useEffect(() => {
    // Ensure scroll is enabled on mount
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';

    return () => {
      // Ensure scroll is enabled on unmount
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    setStatus('loading');
    setError(null);
    setOrder(null);
    // Reset the refs when orderId changes
    hasFetchedReturnRequestsRef.current = null;
    returnRequestsFetchedRef.current = false;

    (async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`, {
          credentials: 'include',
        });
        const data: { order?: OrderDoc; error?: string } = await res.json();

        if (!res.ok || !data.order) {
          throw new Error(data?.error || 'Order not found');
        }

        if (isMounted) {
          setOrder(data.order);
          setStatus('loaded');
        }
      } catch (e: unknown) {
        if (isMounted) {
          const message =
            e instanceof Error ? e.message : 'Failed to load order';
          setError(message);
          setStatus('error');
        }
        toastApi.error('Failed to load order');
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  const handleTrackOrder = (trackingNumber: string) => {
    toastApi.info(`Opening tracking page for: ${trackingNumber}`);
  };

  const handleReorder = (order: OrderDoc) => {
    toastApi.success(`Adding items from ${order.orderNumber} to cart`);
  };

  // Build dynamic status stages - include return if return requests exist
  const statusStages = useMemo(() => {
    const hasReturnRequests = returnRequests.length > 0 &&
      returnRequests.some(rr => rr.status !== 'rejected');
    const shouldIncludeReturnStage = hasReturnRequests || order?.orderStatus === 'returned';
    return shouldIncludeReturnStage
      ? [...baseStatusStages, returnStage]
      : baseStatusStages;
  }, [returnRequests, order?.orderStatus]);

  // Get current timeline status and completion info - include return if applicable
  const timelineInfo = useMemo(() => {
    if (!order) return { status: null, returnCompleted: false };

    const returnInfo = getReturnTimelineStatus(returnRequests);

    // If order itself is returned, always show the return stage as completed
    if (order.orderStatus === 'returned') {
      return {
        status: 'return',
        returnCompleted: returnInfo?.isCompleted ?? true,
      };
    }

    // If order is delivered and return request exists
    if (order.orderStatus === 'delivered' && returnInfo) {
      return {
        status: returnInfo.status, // 'return'
        returnCompleted: returnInfo.isCompleted
      };
    }

    return {
      status: order.orderStatus,
      returnCompleted: false
    };
  }, [order, returnRequests]);

  // Separate effect to fetch return requests after order is loaded
  useEffect(() => {
    if (!order || !order._id || !order.items || order.items.length === 0) {
      returnRequestsFetchedRef.current = false;
      return;
    }

    // Only fetch if we haven't fetched for this order ID yet
    if (hasFetchedReturnRequestsRef.current === order._id && returnRequestsFetchedRef.current) {
      return;
    }

    // Mark as fetched immediately to prevent race conditions
    hasFetchedReturnRequestsRef.current = order._id;
    returnRequestsFetchedRef.current = true;

    // Fetch return requests - use a timeout to debounce and prevent rapid calls
    const timeoutId = setTimeout(() => {
      checkReturnRequestsForOrder(order._id, order.items).catch(console.error);
      fetchReturnRequests(order._id).catch(console.error);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
    };
    // Only depend on order._id - functions are stable from Zustand
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?._id]);

  const handleDownloadInvoice = async (order: OrderDoc) => {
    const key = order.orderNumber || order._id;
    if (!key) return;

    setShowProgress(true);
    setDownloadProgress(0);

    try {
      await downloadInvoiceWithProgress(key, (progress) => {
        setDownloadProgress(progress);
      });
      setTimeout(() => {
        setShowProgress(false);
        setDownloadProgress(0);
      }, 1500);
    } catch {
      toastApi.error('Unable to download invoice', 'Please try again later');
      setShowProgress(false);
      setDownloadProgress(0);
    }
  };

  const handleCopyTrackingNumber = (trackingNumber: string) => {
    navigator.clipboard.writeText(trackingNumber);
    toastApi.success('Tracking number copied to clipboard!');
  };

  // Show loader while fetching order details
  if (status === 'loading') {
    return (
      <>
        (
        <div className="h-screen overflow-hidden">
          <PageLoader fullscreen showLogo />
        </div>
        )
        <ReturnRequestModal
          isOpen={false}
          onClose={() => { }}
          orderId=""
          orderItem={null}
        />
      </>
    );
  }

  if (status === 'error' || !order) {
    return (
      <>
        <div className="bg-white text-text-primary">
          <Container className="py-12 text-center text-red-600">
            {error || 'Order not found'}
          </Container>
        </div>
        <ReturnRequestModal
          isOpen={false}
          onClose={() => { }}
          orderId=""
          orderItem={null}
        />
      </>
    );
  }

  return (
    <>
      <div className="bg-white text-text-primary min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-primary/10">
          <Container>
            <div className="py-8">
              <div className="flex items-center justify-between">
                <div>
                  <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-primary hover:text-primary-dark mb-4 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Orders
                  </button>
                  <h1 className="text-3xl md:text-4xl font-heading font-bold text-heading mb-2">
                    Order Details
                  </h1>
                  <p className="text-primary-dark">
                    Order #{order.orderNumber} • Placed on {formatDate(order.createdAt)}
                  </p>
                </div>

              </div>
            </div>
          </Container>
        </div>

        <Container>
          <AnimatePresence>
            <div className="py-16 space-y-12">
              {/* Order Summary */}
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-primary/10 rounded-2xl p-4 sm:p-6 lg:p-8"
              >
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 sm:mb-8 gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-fraunces font-medium text-primary mb-1 sm:mb-2">
                      Order #{order.orderNumber}
                    </h2>
                    <p className="text-sm sm:text-base text-text-primary/70">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center">
                    <OrderStatus status={order.orderStatus} />
                  </div>
                </div>

                {/* Products */}
                <div className="space-y-4 sm:space-y-6">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-bg-menu/30 rounded-xl"
                    >
                      {/* Product Image */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center text-primary/60 flex-shrink-0 mx-auto sm:mx-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <Package className="w-6 h-6 sm:w-8 sm:h-8" />
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 w-full">
                        <h3 className="font-medium text-primary text-base sm:text-lg mb-1 sm:mb-2">
                          {item.name}
                        </h3>
                        <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
                          <span className="text-text-primary/70">
                            <strong>SKU:</strong> {item.sku}
                          </span>
                          <span className="text-text-primary/70">
                            <strong>Qty:</strong> {item.quantity}
                          </span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-left sm:text-right w-full sm:w-auto">
                        <div className="text-lg sm:text-xl font-medium text-primary">
                          {formatCurrency(item.price * item.quantity)}
                        </div>
                        <div className="text-xs sm:text-sm text-text-primary/50">
                          {formatCurrency(item.price)} each
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-primary/10">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-primary/70">Subtotal:</span>
                      <span className="font-medium">{formatCurrency(order.subtotalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-primary/70">Shipping:</span>
                      <span className="font-medium">{formatCurrency(order.shippingAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-primary/70">Tax:</span>
                      <span className="font-medium">{formatCurrency(order.taxAmount)}</span>
                    </div>
                    {order.paymentChargesAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-text-primary/70">Payment Charges:</span>
                        <span className="font-medium">{formatCurrency(order.paymentChargesAmount)}</span>
                      </div>
                    )}
                    {order.discountAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-text-primary/70">Discount:</span>
                        <span className="font-medium text-green-600">-{formatCurrency(order.discountAmount)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-primary/10">
                    <span className="text-base sm:text-lg font-medium text-primary">
                      Total Amount:
                    </span>
                    <span className="text-lg sm:text-xl font-medium text-primary">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-xs sm:text-sm text-text-primary/70">
                    <span>Payment Method: {order.paymentMethod}</span>
                    <span className={`font-medium ${order.paymentStatus === 'paid' || order.paymentStatus === 'completed'
                      ? 'text-green-600'
                      : 'text-yellow-600'
                      }`}>
                      ✓ {order.paymentStatus}
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
                <h2 className="text-xl sm:text-2xl font-fraunces font-medium text-primary mb-8">
                  Delivery Progress
                </h2>

                {/* Status Progress Bar */}
                <div className="hidden md:block relative mb-12">
                  <div className="flex justify-between">
                    {statusStages.map((stage, index) => {
                      const currentIndex = getStatusIndex(timelineInfo.status || order.orderStatus, statusStages.length > baseStatusStages.length);
                      // If return is completed, mark all stages including return as completed
                      // If return is just generated (not completed), mark delivered and before as completed, return as current
                      // Otherwise, mark stages up to current index as completed
                      let isCompleted: boolean;
                      if (timelineInfo.returnCompleted) {
                        // Return completed: all stages including return are completed
                        isCompleted = index <= currentIndex;
                      } else if (stage.key === 'return' && index === currentIndex) {
                        // Return is current but not completed: show as current (not completed)
                        isCompleted = false;
                      } else {
                        // Normal logic: stages up to and including current are completed
                        isCompleted = index <= currentIndex;
                      }
                      const isCurrent = index === currentIndex && !timelineInfo.returnCompleted;
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
                            className={`relative w-12 h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-20 ${isCompleted || isCurrent
                              ? 'bg-primary text-white border-primary'
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
                            className={`mt-3 text-xs lg:text-sm text-center px-2 ${isCompleted || isCurrent
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
                                  // When return is completed, glow all lines up to and including the line before return
                                  // When return is not completed, glow lines up to (but not including) current stage
                                  width: timelineInfo.returnCompleted
                                    ? (index < currentIndex ? '100%' : '0%')  // All lines before return glow when return is completed
                                    : (index < currentIndex ? '100%' : '0%'), // Normal logic: lines before current stage glow
                                }}
                                transition={{
                                  duration: 2.2,
                                  delay: index * 1.8,
                                }}
                                className={`h-full ${timelineInfo.returnCompleted
                                  ? (index < currentIndex ? 'bg-primary' : 'bg-gray-300')  // All lines glow when return is completed
                                  : (index < currentIndex ? 'bg-primary' : 'bg-gray-300')  // Normal logic
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
                        height: `${(getStatusIndex(timelineInfo.status || order.orderStatus, statusStages.length > baseStatusStages.length) /
                          (statusStages.length - 1)) *
                          100
                          }%`,
                      }}
                      transition={{ duration: 1.2, ease: 'easeInOut' }}
                      className="absolute left-[13px] top-0 w-0.5 bg-primary origin-top"
                    />

                    {/* Timeline Items */}
                    {statusStages.map((stage, index) => {
                      const currentIndex = getStatusIndex(timelineInfo.status || order.orderStatus, statusStages.length > baseStatusStages.length);
                      // If return is completed, mark all stages including return as completed
                      // If return is just generated (not completed), mark delivered and before as completed, return as current
                      // Otherwise, mark stages up to current index as completed
                      let isCompleted: boolean;
                      if (timelineInfo.returnCompleted) {
                        // Return completed: all stages including return are completed
                        isCompleted = index <= currentIndex;
                      } else if (stage.key === 'return' && index === currentIndex) {
                        // Return is current but not completed: show as current (not completed)
                        isCompleted = false;
                      } else {
                        // Normal logic: stages up to and including current are completed
                        isCompleted = index <= currentIndex;
                      }
                      const isCurrent = index === currentIndex && !timelineInfo.returnCompleted;
                      const IconComponent = stage.icon;
                      const isLast = index === statusStages.length - 1;

                      return (
                        <div
                          key={stage.key}
                          className={`flex items-start relative ${isLast ? 'mb-0' : 'mb-8'
                            }`}
                        >
                          {/* Icon */}
                          <div className="flex flex-col items-center mr-4 relative z-10">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: index * 0.2 }}
                              className={`relative w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted || isCurrent
                                ? 'bg-primary text-white border-primary'
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
                              className={`font-medium ${isCompleted || isCurrent ? 'text-primary' : 'text-gray-500'
                                }`}
                            >
                              {stage.label}
                            </h4>
                            <p className="text-sm text-text-primary/70">
                              {isCompleted || isCurrent ? formatDate(order.createdAt) : 'Pending'}
                            </p>
                            <p className="text-text-primary/80 text-sm">
                              {isCompleted || isCurrent
                                ? 'This step has been completed successfully.'
                                : 'This step is pending.'
                              }
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.section>

              {/* Shipping & Contact Info */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Shipping Address */}
                <motion.section
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white border border-primary/10 rounded-2xl p-6"
                >
                  <h3 className="text-lg font-fraunces font-medium text-primary mb-4">
                    Shipping Address
                  </h3>
                  <div className="space-y-2 text-text-primary/80 text-sm">
                    <p className="font-medium text-primary text-base">
                      {order.shippingAddress.fullName}
                    </p>
                    <p>{order.shippingAddress.line1}</p>
                    {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state}
                    </p>
                    <p>{order.shippingAddress.postalCode}</p>
                    <p>{order.shippingAddress.country}</p>
                    <div className="pt-4 space-y-1 text-sm">
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {order.shippingAddress.phone}
                      </p>
                    </div>
                  </div>
                </motion.section>

                {/* Delivery Info */}
                <motion.section
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white border border-primary/10 rounded-2xl p-6"
                >
                  <h3 className="text-lg font-fraunces font-medium text-primary mb-4">
                    Delivery Information
                  </h3>
                  <div className="space-y-3 text-text-primary/80 text-sm">
                    {order.courierName && (
                      <div className="flex justify-between">
                        <span>Courier Partner:</span>
                        <span className="font-medium text-end">
                          {order.courierName}
                        </span>
                      </div>
                    )}
                    {order.trackingNumber && (
                      <div className="flex justify-between">
                        <span>Tracking Number:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-medium text-primary text-end">
                            {order.trackingNumber}
                          </span>
                          <button
                            onClick={() => handleCopyTrackingNumber(order.trackingNumber!)}
                            className="p-1 hover:bg-primary/10 rounded transition-colors"
                          >
                            <Copy className="w-4 h-4 text-primary" />
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Order Date:</span>
                      <span className="font-medium text-end">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                  </div>
                </motion.section>
              </div>

              {/* Order Actions */}
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white border border-primary/10 rounded-2xl p-6"
              >
                <h3 className="text-lg font-fraunces font-medium text-primary mb-6">
                  Order Actions
                </h3>
                <div className="flex flex-wrap gap-4">
                  {order.trackingNumber && order.orderStatus !== 'delivered' && (
                    <button
                      onClick={() => handleTrackOrder(order.trackingNumber!)}
                      className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-medium flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Track Package
                    </button>
                  )}

                  <button
                    onClick={() => handleDownloadInvoice(order)}
                    className="px-6 py-3 bg-white text-primary border border-primary/20 rounded-xl hover:bg-primary/5 hover:border-primary/40 transition-all duration-300 font-medium flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Invoice
                  </button>

                  {order.orderStatus === 'delivered' && (
                    <>
                      <button
                        onClick={() => handleReorder(order)}
                        className="px-6 py-3 bg-white text-primary border border-primary/20 rounded-xl hover:bg-primary/5 hover:border-primary/40 transition-all duration-300 font-medium flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Reorder Items
                      </button>

                      <button className="px-6 py-3 bg-white text-primary border border-primary/20 rounded-xl hover:bg-primary/5 hover:border-primary/40 transition-all duration-300 font-medium flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        Write Review
                      </button>

                      {/* Return Buttons for each eligible item - only show if delivered */}
                      {isWithinReturnWindow(order.paidAt) &&
                        (order.paymentStatus === 'paid' || order.paymentStatus === 'completed') &&
                        order.items.map((item, index) => {
                          const hasReturnRequest = returnRequestsMap[item.sku];
                          return hasReturnRequest ? (
                            <button
                              key={`${item.sku}-${index}-status`}
                              onClick={() => {
                                setSelectedItemForStatus(item);
                                setReturnStatusModalOpen(true);
                              }}
                              className="px-6 py-3 bg-white text-primary border border-primary/20 rounded-xl hover:bg-primary/5 hover:border-primary/40 transition-all duration-300 font-medium flex items-center gap-2"
                              title={`View Return Status for ${item.name}`}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              {order.items.length > 1 ? `Return Status ${index + 1}` : 'Return Status'}
                            </button>
                          ) : (
                            <button
                              key={`${item.sku}-${index}`}
                              onClick={() => {
                                setSelectedItem(item);
                                setReturnModalOpen(true);
                              }}
                              className="px-6 py-3 bg-white text-primary border border-primary/20 rounded-xl hover:bg-primary/5 hover:border-primary/40 transition-all duration-300 font-medium flex items-center gap-2"
                              title={`Return ${item.name}`}
                            >
                              <RotateCcw className="w-4 h-4" />
                              {order.items.length > 1 ? `Return Item ${index + 1}` : 'Return'}
                            </button>
                          );
                        })}
                    </>
                  )}

                  {/* Return Status buttons - show always after return req is generated (not just when delivered) */}
                  {returnRequests.length > 0 &&
                    returnRequests.some(rr => rr.status !== 'rejected') &&
                    order.items.map((item, index) => {
                      const hasReturnRequest = returnRequestsMap[item.sku];
                      if (!hasReturnRequest) return null;

                      // Don't show if already shown in delivered section
                      if (order.orderStatus === 'delivered' && isWithinReturnWindow(order.paidAt)) {
                        return null;
                      }

                      return (
                        <button
                          key={`${item.sku}-${index}-status-all`}
                          onClick={() => {
                            setSelectedItemForStatus(item);
                            setReturnStatusModalOpen(true);
                          }}
                          className="px-6 py-3 bg-white text-primary border border-primary/20 rounded-xl hover:bg-primary/5 hover:border-primary/40 transition-all duration-300 font-medium flex items-center gap-2"
                          title={`View Return Status for ${item.name}`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          {order.items.length > 1 ? `Return Status ${index + 1}` : 'Return Status'}
                        </button>
                      );
                    })}
                </div>
              </motion.section>
            </div>
          </AnimatePresence>

          {/* Help Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
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
                  href="/contact-us"
                  className="px-8 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-primary to-accent text-white rounded-full transform hover:scale-105 transition-all duration-300 font-medium"
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
            <p className="text-text-primary/60 font-light italic sm:text-lg font-fraunces text-sm">
              &ldquo;Your precious moments, delivered with care&rdquo;
            </p>
          </div>
        </Container>
      </div>
      <InvoiceDownloadProgress
        isOpen={showProgress}
        onClose={() => {
          if (downloadProgress >= 100) {
            setShowProgress(false);
            setDownloadProgress(0);
          }
        }}
        progress={downloadProgress}
      />
      <ReturnRequestModal
        isOpen={returnModalOpen && !!selectedItem && !!order}
        onClose={() => {
          setReturnModalOpen(false);
          setSelectedItem(null);
        }}
        orderId={order?._id || ''}
        orderItem={selectedItem}
        onSuccess={() => {
          // The store's createReturnRequest already updates returnRequestsMap
          // But we refresh to ensure we have the latest data from server
          if (order && order.items && order.items.length > 0) {
            checkReturnRequestsForOrder(order._id, order.items);
            // Refresh return requests for timeline
            fetchReturnRequests(order._id);
          }
          setReturnModalOpen(false);
          setSelectedItem(null);
        }}
      />
      <ReturnStatusModal
        isOpen={returnStatusModalOpen && !!selectedItemForStatus && !!order}
        onClose={() => {
          setReturnStatusModalOpen(false);
          setSelectedItemForStatus(null);
        }}
        orderId={order?._id || ''}
        orderItemSku={selectedItemForStatus?.sku || ''}
      />
    </>
  );
}
