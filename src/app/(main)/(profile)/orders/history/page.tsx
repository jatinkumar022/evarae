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
  MessageCircle,
  Calendar,
  DollarSign,
  ShoppingBag,
  MapPin,
  Phone,
  Mail,
  RotateCcw,
  ArrowLeft,
  Copy,
  ExternalLink,
} from 'lucide-react';
import CustomDropdown from '@/app/(main)/components/ui/customDropdown';
import Image from 'next/image';

// Strict types for order data
type OrderItem = {
  product: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  quantity: number;
  image: string | null;
  selectedColor: string | null;
  selectedSize: string | null;
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
  return `$${n.toFixed(2)}`;
}

export default function OrdersHistoryPage() {
  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderDoc | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/orders', { credentials: 'include' });
        const data: { orders?: OrderDoc[]; error?: string } = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Failed to load orders');
        // Normalize orderNumber fallback
        const mapped = (data.orders || []).map(o => ({
          ...o,
          orderNumber: o.orderNumber || o._id,
        }));
        setOrders(mapped);
        setLoading(false);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load orders');
        setLoading(false);
      }
    })();
  }, []);

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

  const orderStats = useMemo(() => {
    const total = orders.length;
    const delivered = orders.filter(o => o.orderStatus === 'delivered').length;
    const pending = orders.filter(o =>
      ['pending', 'confirmed', 'processing'].includes(o.orderStatus)
    ).length;
    const cancelled = orders.filter(o => o.orderStatus === 'cancelled').length;
    const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    return { total, delivered, pending, cancelled, totalSpent };
  }, [orders]);

  const handleViewOrder = (order: OrderDoc) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleTrackOrder = (trackingNumber: string) => {
    alert(`Opening tracking page for: ${trackingNumber}`);
  };

  const handleReorder = (order: OrderDoc) => {
    alert(`Adding items from ${order.orderNumber} to cart`);
  };

  const handleDownloadInvoice = async (order: OrderDoc) => {
    try {
      const key = order.orderNumber || order._id;
      const res = await fetch(`/api/orders/${key}/invoice`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to download invoice');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${key}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert('Unable to download invoice');
    }
  };

  const handleCopyTrackingNumber = (trackingNumber: string) => {
    navigator.clipboard.writeText(trackingNumber);
    alert('Tracking number copied to clipboard!');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-gray-700">
          Loading your orders...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-red-600">
          {error}
        </div>
      </main>
    );
  }

  if (showOrderDetails && selectedOrder) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <button
                onClick={() => setShowOrderDetails(false)}
                className="flex items-center gap-2 text-[oklch(0.66_0.14_358.91)] hover:text-[oklch(0.58_0.16_8)] mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Orders
              </button>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] bg-clip-text text-transparent">
                Order Details
              </h1>
              <p className="text-gray-600">
                Order {selectedOrder.orderNumber} • Placed on{' '}
                {new Date(selectedOrder.createdAt).toLocaleDateString()}
              </p>
            </div>
            <OrderStatus status={selectedOrder.orderStatus} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Order Items */}
              <div className="bg-white rounded-2xl border border-[oklch(0.84_0.04_10.35)]/30 shadow-sm">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order Items
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 ">
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={64}
                            height={64}
                            className=" rounded-xl border border-gray-200"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {item.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity}
                          </p>
                          <p className="text-sm text-gray-600">
                            Unit Price: {formatCurrency(item.price)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="border-t border-gray-200 mt-6 pt-6">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">
                          {formatCurrency(selectedOrder.subtotalAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Shipping:</span>
                        <span className="font-medium">
                          {formatCurrency(selectedOrder.shippingAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax:</span>
                        <span className="font-medium">
                          {formatCurrency(selectedOrder.taxAmount)}
                        </span>
                      </div>
                      {selectedOrder.paymentChargesAmount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Payment Charges:
                          </span>
                          <span className="font-medium">
                            {formatCurrency(selectedOrder.paymentChargesAmount)}
                          </span>
                        </div>
                      )}
                      {selectedOrder.discountAmount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Discount:</span>
                          <span className="font-medium">
                            -{formatCurrency(selectedOrder.discountAmount)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-xl font-bold pt-3 border-t border-gray-200">
                        <span>Total:</span>
                        <span className="text-[oklch(0.66_0.14_358.91)]">
                          {formatCurrency(selectedOrder.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Timeline */}
              {selectedOrder.orderStatus !== 'cancelled' && (
                <div className="bg-white rounded-2xl border border-[oklch(0.84_0.04_10.35)]/30 shadow-sm">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order Timeline
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      {[
                        {
                          status: 'Order Placed',
                          date: new Date(
                            selectedOrder.createdAt
                          ).toLocaleDateString(),
                          completed: true,
                          description:
                            'Your order has been received and is being processed.',
                        },
                        {
                          status: 'Order Confirmed',
                          date: new Date(
                            selectedOrder.createdAt
                          ).toLocaleDateString(),
                          completed: true,
                          description: 'Payment confirmed and order verified.',
                        },
                        {
                          status: 'Processing',
                          date: new Date(
                            selectedOrder.createdAt
                          ).toLocaleDateString(),
                          completed: [
                            'processing',
                            'shipped',
                            'delivered',
                          ].includes(selectedOrder.orderStatus),
                          description:
                            'Your items are being prepared for shipment.',
                        },
                        {
                          status: 'Shipped',
                          date:
                            selectedOrder.orderStatus === 'shipped'
                              ? new Date(
                                  selectedOrder.createdAt
                                ).toLocaleDateString()
                              : '',
                          completed: ['shipped', 'delivered'].includes(
                            selectedOrder.orderStatus
                          ),
                          description: selectedOrder.trackingNumber
                            ? `Package shipped via ${
                                selectedOrder.courierName || 'courier'
                              }`
                            : 'Package has been shipped.',
                        },
                        {
                          status: 'Delivered',
                          date: selectedOrder.paidAt
                            ? new Date(
                                selectedOrder.paidAt
                              ).toLocaleDateString()
                            : '',
                          completed: selectedOrder.orderStatus === 'delivered',
                          description:
                            selectedOrder.orderStatus === 'delivered'
                              ? 'Package delivered successfully.'
                              : 'Package will be delivered soon.',
                        },
                      ].map((step, index) => (
                        <div key={index} className="flex items-start gap-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                              step.completed
                                ? 'bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] text-white'
                                : 'bg-gray-200 text-gray-500'
                            }`}
                          >
                            <CheckCircle className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h4
                              className={`font-semibold ${
                                step.completed
                                  ? 'text-gray-900'
                                  : 'text-gray-500'
                              }`}
                            >
                              {step.status}
                            </h4>
                            {step.date && (
                              <p className="text-sm text-gray-600 mb-1">
                                {step.date}
                              </p>
                            )}
                            <p className="text-sm text-gray-600">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Shipping Information */}
              <div className="bg-white rounded-2xl border border-[oklch(0.84_0.04_10.35)]/30 shadow-sm">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Shipping Information
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 mb-1">
                        Delivery Address
                      </p>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {selectedOrder.shippingAddress.fullName},{' '}
                        {selectedOrder.shippingAddress.line1}
                        {selectedOrder.shippingAddress.line2
                          ? `, ${selectedOrder.shippingAddress.line2}`
                          : ''}
                        , {selectedOrder.shippingAddress.city},{' '}
                        {selectedOrder.shippingAddress.state}{' '}
                        {selectedOrder.shippingAddress.postalCode},{' '}
                        {selectedOrder.shippingAddress.country}
                      </p>
                    </div>
                  </div>

                  {selectedOrder.trackingNumber && (
                    <div className="flex items-start gap-3">
                      <Truck className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-1">
                          Tracking Number
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-[oklch(0.66_0.14_358.91)] font-mono bg-gray-50 px-2 py-1 rounded">
                            {selectedOrder.trackingNumber}
                          </p>
                          <button
                            onClick={() =>
                              selectedOrder.trackingNumber &&
                              handleCopyTrackingNumber(
                                selectedOrder.trackingNumber
                              )
                            }
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            <Copy className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                        {selectedOrder.courierName && (
                          <p className="text-xs text-gray-500 mt-1">
                            Shipped via {selectedOrder.courierName}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedOrder.createdAt && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900 mb-1">
                          Placed On
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(selectedOrder.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Actions */}
              <div className="bg-white rounded-2xl border border-[oklch(0.84_0.04_10.35)]/30 shadow-sm">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order Actions
                  </h3>
                </div>
                <div className="p-6 space-y-3">
                  {selectedOrder.trackingNumber &&
                    selectedOrder.orderStatus !== 'delivered' && (
                      <button
                        onClick={() =>
                          selectedOrder.trackingNumber &&
                          handleTrackOrder(selectedOrder.trackingNumber)
                        }
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] text-white font-medium rounded-xl hover:shadow-lg transition-all"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Track Package
                      </button>
                    )}

                  <button
                    onClick={() => handleDownloadInvoice(selectedOrder)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Invoice
                  </button>

                  {selectedOrder.orderStatus === 'delivered' && (
                    <>
                      <button
                        onClick={() => handleReorder(selectedOrder)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Reorder Items
                      </button>

                      <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
                        <Star className="w-4 h-4" />
                        Write Review
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Customer Support */}
              <div className="bg-white rounded-2xl border border-[oklch(0.84_0.04_10.35)]/30 shadow-sm">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Need Help?
                  </h3>
                </div>
                <div className="p-6 space-y-3">
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    Live Chat
                  </button>

                  <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
                    <Phone className="w-4 h-4" />
                    Call Support
                  </button>

                  <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
                    <Mail className="w-4 h-4" />
                    Email Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] bg-clip-text text-transparent mb-2">
            My Orders
          </h1>
          <p className="text-gray-600">Track and manage your order history</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: 'Total Orders',
              value: orderStats.total,
              icon: ShoppingBag,
              color: 'from-blue-500 to-blue-600',
            },
            {
              label: 'Delivered',
              value: orderStats.delivered,
              icon: CheckCircle,
              color: 'from-green-500 to-green-600',
            },
            {
              label: 'In Progress',
              value: orderStats.pending,
              icon: Clock,
              color: 'from-yellow-500 to-yellow-600',
            },
            {
              label: 'Total Spent',
              value: formatCurrency(orderStats.totalSpent),
              icon: DollarSign,
              color: 'from-purple-500 to-purple-600',
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-[oklch(0.84_0.04_10.35)]/30 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-[oklch(0.84_0.04_10.35)]/30 shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders by number or product name..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-[oklch(0.84_0.04_10.35)]/40 rounded-xl focus:border-[oklch(0.66_0.14_358.91)] focus:ring-2 focus:ring-[oklch(0.66_0.14_358.91)]/20 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Status Filter */}
            <CustomDropdown
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              className="w-full lg:w-48"
            />

            {/* Date Filter */}
            <CustomDropdown
              value={dateFilter}
              onChange={setDateFilter}
              options={dateOptions}
              className="w-full lg:w-48"
            />
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[oklch(0.84_0.04_10.35)]/30 shadow-sm p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Orders Found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : "You haven't placed any orders yet."}
              </p>
              <button className="px-6 py-3 bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] text-white font-medium rounded-xl hover:shadow-lg transition-all">
                Start Shopping
              </button>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-[oklch(0.84_0.04_10.35)]/30 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] rounded-xl flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order {order.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Placed on{' '}
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <OrderStatus status={order.orderStatus} />
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency(order.totalAmount)}
                        </p>
                        <p className="text-sm text-gray-600">
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
                          <h4 className="font-medium text-gray-900 text-sm truncate">
                            {item.name}
                          </h4>
                          <p className="text-xs text-gray-600">
                            Qty: {item.quantity} • {formatCurrency(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-sm text-gray-600 px-3">
                        +{order.items.length - 2} more item
                        {order.items.length > 3 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  {/* Status-specific Information */}
                  {order.trackingNumber &&
                    (order.orderStatus === 'shipped' ||
                      order.orderStatus === 'delivered') && (
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl mb-4">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-blue-800">
                            Tracking:{' '}
                            <span className="font-medium font-mono">
                              {order.trackingNumber}
                            </span>
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            order.trackingNumber &&
                            handleCopyTrackingNumber(order.trackingNumber)
                          }
                          className="p-1 hover:bg-blue-100 rounded transition-colors"
                        >
                          <Copy className="w-4 h-4 text-blue-600" />
                        </button>
                      </div>
                    )}

                  {/* Estimated delivery or return/cancel notes omitted for brevity in real data */}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleViewOrder(order)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] text-white text-sm font-medium rounded-lg hover:shadow-md transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>

                    {order.trackingNumber &&
                      !['delivered', 'cancelled', 'returned'].includes(
                        order.orderStatus
                      ) && (
                        <button
                          onClick={() =>
                            order.trackingNumber &&
                            handleTrackOrder(order.trackingNumber)
                          }
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Track Order
                        </button>
                      )}

                    <button
                      onClick={() => handleDownloadInvoice(order)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Invoice
                    </button>

                    {['delivered', 'cancelled'].includes(order.orderStatus) && (
                      <button
                        onClick={() => handleReorder(order)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Buy Again
                      </button>
                    )}

                    {order.orderStatus === 'delivered' && (
                      <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
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
            <button className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
              Load More Orders
            </button>
          </div>
        )}

        {/* Help Section & FAQ remain unchanged */}
      </div>
    </main>
  );
}
