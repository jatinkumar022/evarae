'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Download,
  Eye,
  RefreshCw,
  Star,
  Copy,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import CustomDropdown from '@/app/(main)/components/ui/customDropdown';
import Image from '@/app/(main)/components/ui/FallbackImage';
import toastApi from '@/lib/toast';
import Container from '@/app/(main)/components/layouts/Container';
import Link from 'next/link';
import { InvoiceDownloadProgress } from '@/app/(main)/components/ui/InvoiceDownloadProgress';
import { downloadInvoiceWithProgress } from '@/app/(main)/utils/invoiceDownload';
import { useOrdersStore } from '@/lib/data/mainStore/ordersStore';
import PageLoader from '@/app/(main)/components/layouts/PageLoader';

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
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      icon: Clock,
      label: 'Pending',
    },
    confirmed: {
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: CheckCircle,
      label: 'Confirmed',
    },
    processing: {
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: Package,
      label: 'Processing',
    },
    shipped: {
      color: 'bg-orange-50 text-orange-700 border-orange-200',
      icon: Truck,
      label: 'Shipped',
    },
    delivered: {
      color: 'bg-green-50 text-green-700 border-green-200',
      icon: CheckCircle,
      label: 'Delivered',
    },
    cancelled: {
      color: 'bg-red-50 text-red-700 border-red-200',
      icon: XCircle,
      label: 'Cancelled',
    },
    returned: {
      color: 'bg-gray-50 text-gray-700 border-gray-200',
      icon: RotateCcw,
      label: 'Returned',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${config.color}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};

function formatCurrency(n: number): string {
  return `₹${n.toLocaleString()}`;
}

export default function OrdersHistoryPage() {
  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [showProgress, setShowProgress] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const { orders: storeOrders, fetchOrders, status: ordersStatus } = useOrdersStore();

  // Load orders once on mount
  useEffect(() => {
    if (ordersStatus === 'idle') fetchOrders();
  }, [ordersStatus, fetchOrders]);

  // Update local orders state from store
  useEffect(() => {
    if (storeOrders.length > 0) {
      setOrders(storeOrders as OrderDoc[]);
    } else if (ordersStatus === 'success' && storeOrders.length === 0) {
      toastApi.info('No orders yet');
    }
    if (ordersStatus === 'error') {
      setError('Failed to load orders');
      toastApi.error('Failed to load orders');
    }
  }, [storeOrders, ordersStatus]);

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'returned', label: 'Returned' },
  ];

  const dateOptions = [
    { value: 'all', label: 'All Time' },
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 3 Months' },
    { value: '1year', label: 'Last Year' },
  ];

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesStatus =
        statusFilter === 'all' ||
        order.orderStatus === (statusFilter as OrderStatusType);

      let matchesDate = true;
      if (dateFilter !== 'all') {
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        const daysDiff = Math.floor(
          (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        switch (dateFilter) {
          case '7days':
            matchesDate = daysDiff <= 7;
            break;
          case '30days':
            matchesDate = daysDiff <= 30;
            break;
          case '90days':
            matchesDate = daysDiff <= 90;
            break;
          case '1year':
            matchesDate = daysDiff <= 365;
            break;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, searchTerm, statusFilter, dateFilter]);



  const handleTrackOrder = (trackingNumber: string) => {
    alert(`Opening tracking page for: ${trackingNumber}`);
  };

  const handleReorder = (order: OrderDoc) => {
    alert(`Adding items from ${order.orderNumber} to cart`);
  };

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
    alert('Tracking number copied to clipboard!');
  };

  // Show loader while fetching - AFTER all hooks, BEFORE main return
  if (ordersStatus === 'loading') {
    return (
      <div className="h-screen overflow-hidden">
        <PageLoader fullscreen showLogo />
      </div>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Container className="py-12 text-center text-red-600">
          {error}
        </Container>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Container className="py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-heading mb-2">
              My Orders
            </h1>
            <p className="text-primary-dark">Track and manage your order history</p>
          </div>

          {/* Compact Filters */}
          <div className="bg-white rounded-xl border border-primary/20 shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary/60" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-3 text-sm border border-primary/20 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <CustomDropdown
                value={statusFilter}
                onChange={setStatusFilter}
                options={statusOptions}
                className="w-full sm:w-40"
              />

              {/* Date Filter */}
              <CustomDropdown
                value={dateFilter}
                onChange={setDateFilter}
                options={dateOptions}
                className="w-full sm:w-40"
              />
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-primary/20 shadow-sm p-12 text-center">
                <Package className="w-16 h-16 text-primary/30 mx-auto mb-4" />
                <h3 className="text-xl font-heading font-semibold text-heading mb-2">
                  No Orders Found
                </h3>
                <p className="text-primary-dark mb-6">
                  {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                    ? 'Try adjusting your search or filters.'
                    : "You haven't placed any orders yet."}
                </p>
                <button className="btn btn-filled">
                  Start Shopping
                </button>
              </div>
            ) : (
              filteredOrders.map(order => (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl border border-primary/20 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    {/* Order Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                          <Package className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-heading font-semibold text-heading">
                            Order {order.orderNumber}
                          </h3>
                          <p className="text-sm text-primary-dark">
                            Placed on{' '}
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <OrderStatus status={order.orderStatus} />
                        <div className="text-right">
                          <p className="text-lg font-heading font-semibold text-heading">
                            {formatCurrency(order.totalAmount)}
                          </p>
                          <p className="text-sm text-primary-dark">
                            {order.items.length} item
                            {order.items.length > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="space-y-3 mb-6">
                      {order.items.slice(0, 2).map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center flex-shrink-0">
                            {item.image && (
                              <Image
                                src={item.image}
                                alt={item.name}
                                width={48}
                                height={48}
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-heading font-medium text-heading text-sm truncate">
                              {item.name}
                            </h4>
                            <p className="text-xs text-primary-dark">
                              Qty: {item.quantity} • {formatCurrency(item.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-sm text-primary-dark px-3">
                          +{order.items.length - 2} more item
                          {order.items.length > 3 ? 's' : ''}
                        </p>
                      )}
                    </div>

                    {/* Status-specific Information */}
                    {order.trackingNumber &&
                      (order.orderStatus === 'shipped' ||
                        order.orderStatus === 'delivered') && (
                        <div className="flex items-center justify-between p-3 bg-primary/10 rounded-xl mb-4">
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-primary" />
                            <span className="text-sm text-primary-dark">
                              Tracking:{' '}
                              <span className="font-medium font-mono text-primary">
                                {order.trackingNumber}
                              </span>
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              order.trackingNumber &&
                              handleCopyTrackingNumber(order.trackingNumber)
                            }
                            className="p-1 hover:bg-primary/20 rounded transition-colors"
                          >
                            <Copy className="w-4 h-4 text-primary" />
                          </button>
                        </div>
                      )}

                    {/* Estimated delivery or return/cancel notes omitted for brevity in real data */}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-primary/10">
                      <Link
                        href={`/orders/${order.orderNumber || order._id}`}
                        className="btn btn-filled flex items-center gap-2 text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Link>

                      {order.trackingNumber &&
                        !['delivered', 'cancelled', 'returned'].includes(
                          order.orderStatus
                        ) && (
                          <button
                            onClick={() =>
                              order.trackingNumber &&
                              handleTrackOrder(order.trackingNumber)
                            }
                            className="btn btn-outline flex items-center gap-2 text-sm"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Track Order
                          </button>
                        )}

                      <button
                        onClick={() => handleDownloadInvoice(order)}
                        className="btn btn-outline flex items-center gap-2 text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Invoice
                      </button>

                      {['delivered', 'cancelled'].includes(order.orderStatus) && (
                        <button
                          onClick={() => handleReorder(order)}
                          className="btn btn-outline flex items-center gap-2 text-sm"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Buy Again
                        </button>
                      )}

                      {order.orderStatus === 'delivered' && (
                        <button className="btn btn-outline flex items-center gap-2 text-sm">
                          <Star className="w-4 h-4" />
                          Write Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Load More Button */}
          {filteredOrders.length > 0 && filteredOrders.length >= 5 && (
            <div className="text-center mt-8">
              <button className="btn btn-outline">
                Load More Orders
              </button>
            </div>
          )}
        </Container>
      </main>
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
    </>
  );
}
