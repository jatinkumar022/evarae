'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Package,
  AlertCircle,
  MapPin,
  CreditCard,
  Truck,
  User,
  CheckCircle,
  Clock,
  XCircle,
  Save,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useOrderStore, Order } from '@/lib/data/store/orderStore';
import { CustomSelect } from '@/app/admin/components/CustomSelect';
import { toastApi } from '@/lib/toast';
import InlineSpinner from '@/app/admin/components/InlineSpinner';

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const {
    currentOrder,
    fetchOrder,
    updateOrderStatus,
    updatePaymentStatus,
    updateTracking,
    status,
    error,
    clearError,
  } = useOrderStore();

  const [isUpdating, setIsUpdating] = useState(false);
  const [formValues, setFormValues] = useState<{
    orderStatus: Order['orderStatus'];
    paymentStatus: Order['paymentStatus'];
    trackingNumber: string;
    courierName: string;
  } | null>(null);
  const [originalValues, setOriginalValues] = useState<{
    orderStatus: Order['orderStatus'];
    paymentStatus: Order['paymentStatus'];
    trackingNumber: string;
    courierName: string;
  } | null>(null);

  // Fetch order from API
  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId);
    }
  }, [orderId, fetchOrder]);

  // Initialize form values when order loads
  useEffect(() => {
    if (currentOrder) {
      const initialValues = {
        orderStatus: currentOrder.orderStatus,
        paymentStatus: currentOrder.paymentStatus,
        trackingNumber: currentOrder.trackingNumber || '',
        courierName: currentOrder.courierName || '',
      };
      setFormValues(initialValues);
      setOriginalValues(initialValues);
    }
  }, [currentOrder]);

  // Check if form is dirty
  const isDirty = formValues && originalValues && (
    formValues.orderStatus !== originalValues.orderStatus ||
    formValues.paymentStatus !== originalValues.paymentStatus ||
    formValues.trackingNumber !== originalValues.trackingNumber ||
    formValues.courierName !== originalValues.courierName
  );

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      toastApi.error('Error updating order', error);
      clearError();
    }
  }, [error, clearError]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (orderStatus: Order['orderStatus']) => {
    const config = {
      pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300', icon: Clock },
      confirmed: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300', icon: Package },
      processing: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-300', icon: Package },
      shipped: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-800 dark:text-indigo-300', icon: Truck },
      delivered: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300', icon: CheckCircle },
      cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300', icon: XCircle },
      returned: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-800 dark:text-gray-300', icon: AlertCircle },
    };

    const statusConfig = config[orderStatus] || config.pending;
    const Icon = statusConfig.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.text}`}>
        <Icon className="h-4 w-4 mr-2" />
        {orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}
      </span>
    );
  };

  const getPaymentStatusBadge = (paymentStatus: Order['paymentStatus']) => {
    const config = {
      pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300' },
      paid: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300' },
      failed: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300' },
      refunded: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-800 dark:text-gray-300' },
      completed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300' },
    };

    const statusConfig = config[paymentStatus] || config.pending;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.text}`}>
        {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
      </span>
    );
  };

  // Generate tracking number
  const generateTrackingNumber = () => {
    const now = new Date();
    const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const random = Math.floor(100000 + Math.random() * 900000);
    return `TRK-${ymd}-${random}`;
  };

  // Handle form field changes (updates local state only)
  const handleStatusChange = (newStatus: Order['orderStatus']) => {
    if (formValues) {
      const updated = { ...formValues, orderStatus: newStatus };

      // Auto-generate tracking number when status changes to shipped
      if (newStatus === 'shipped' && !formValues.trackingNumber) {
        updated.trackingNumber = generateTrackingNumber();
        // Auto-set courier name if not set
        if (!formValues.courierName) {
          updated.courierName = 'Standard Shipping';
        }
      }

      setFormValues(updated);
    }
  };

  const handlePaymentStatusChange = (newStatus: Order['paymentStatus']) => {
    if (formValues) {
      setFormValues({ ...formValues, paymentStatus: newStatus });
    }
  };

  const handleTrackingNumberChange = (trackingNumber: string) => {
    if (formValues) {
      setFormValues({ ...formValues, trackingNumber });
    }
  };

  const handleCourierNameChange = (courierName: string) => {
    if (formValues) {
      setFormValues({ ...formValues, courierName });
    }
  };

  // Save all changes at once
  const handleSaveAll = async () => {
    if (!currentOrder || !formValues || !isDirty) return;

    setIsUpdating(true);
    try {
      // Update order status if changed
      if (formValues.orderStatus !== originalValues?.orderStatus) {
        await updateOrderStatus(currentOrder._id, formValues.orderStatus);
      }

      // Update payment status if changed
      if (formValues.paymentStatus !== originalValues?.paymentStatus) {
        await updatePaymentStatus(currentOrder._id, formValues.paymentStatus);
      }

      // Update tracking if changed
      if (
        formValues.trackingNumber !== originalValues?.trackingNumber ||
        formValues.courierName !== originalValues?.courierName
      ) {
        await updateTracking(currentOrder._id, formValues.trackingNumber, formValues.courierName);
      }

      // Update original values to mark form as clean
      setOriginalValues({ ...formValues });

      // Update currentOrder in store
      useOrderStore.setState({
        currentOrder: {
          ...currentOrder,
          orderStatus: formValues.orderStatus,
          paymentStatus: formValues.paymentStatus,
          trackingNumber: formValues.trackingNumber,
          courierName: formValues.courierName,
        },
      });

      toastApi.success('Order updated successfully', 'Order details have been saved');
    } catch (error) {
      console.error('Failed to save changes:', error);
      toastApi.error('Failed to update order', 'Please try again');
    } finally {
      setIsUpdating(false);
    }
  };

  // Show loading state while fetching
  if (status === 'loading') {
    return (
      <div className="h-full bg-gray-50 dark:bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-center">
          <InlineSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-[#bdbdbd]">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="h-full bg-gray-50 dark:bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Order not found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-[#bdbdbd]">
            The order you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/admin/orders"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d0d0d]">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6 pb-6 border-b border-gray-100 dark:border-[#1f1f1f]">
          <div>
            <div className="min-w-0">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-[#777777]">
                  <Link href="/admin/orders" className="inline-flex items-center hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back
                  </Link>
                  <span>•</span>
                  <span className="font-mono">{currentOrder.orderNumber}</span>
                </div>
                {/* Save Button - Desktop Only */}
                {isDirty && (
                  <div className="hidden md:flex items-center gap-3">
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                      Unsaved changes
                    </span>
                    <button
                      onClick={handleSaveAll}
                      disabled={isUpdating}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? (
                        <>
                          <InlineSpinner size="sm" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-1 flex items-center gap-3 flex-wrap">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white truncate">
                  Order {currentOrder.orderNumber}
                </h1>
                {formValues && getStatusBadge(formValues.orderStatus)}
                {formValues && getPaymentStatusBadge(formValues.paymentStatus)}
                <span className="px-3 py-1 rounded-md text-sm font-semibold bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300">
                  {formatCurrency(currentOrder.totalAmount)}
                </span>
              </div>
              <div className="mt-5 text-xs md:text-sm text-gray-600 dark:text-[#999999] flex flex-wrap gap-3">
                <span>Placed on: <span className="font-medium text-gray-800 dark:text-gray-200">{formatDate(currentOrder.createdAt)}</span></span>
                <span>Items: <span className="font-medium text-gray-800 dark:text-gray-200">{currentOrder.items.length}</span></span>
                <span>Payment Method: <span className="font-medium text-gray-800 dark:text-gray-200">{currentOrder.paymentMethod.toUpperCase()}</span></span>
                {currentOrder.paidAt && (
                  <span>Paid on: <span className="font-medium text-gray-800 dark:text-gray-200">{formatDate(currentOrder.paidAt)}</span></span>
                )}
              </div>
            </div>
          </div>
        </div>


        <div className="space-y-6">
          {/* Order Items */}
          <div className="bg-white dark:bg-[#191919] shadow rounded-lg border border-gray-200 dark:border-[#525252] overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-[#525252]">
              <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white">
                Order Items
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {currentOrder.items.map((item, index) => (
                  <div key={index} className="flex items-start gap-4 pb-4 border-b border-gray-200 dark:border-[#525252] last:border-0 last:pb-0">
                    <div className="flex-shrink-0 w-20 h-20 rounded-md overflow-hidden bg-gray-200 dark:bg-[#525252]">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-full h-full p-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {item.name}
                      </h4>
                      <div className="mt-1 text-xs text-gray-500 dark:text-[#bdbdbd] space-y-1">
                        <p>SKU: {item.sku}</p>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-[#bdbdbd]">
                          Quantity: {item.quantity}
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div className="bg-white dark:bg-[#191919] shadow rounded-lg border border-gray-200 dark:border-[#525252] overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-[#525252]">
                <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </h3>
              </div>
              <div className="p-6">
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-[#bdbdbd]">Full Name</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {currentOrder.shippingAddress.fullName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-[#bdbdbd]">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {currentOrder.shippingAddress.phone}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-[#bdbdbd]">Address</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {currentOrder.shippingAddress.line1}
                      {currentOrder.shippingAddress.line2 && (
                        <>, {currentOrder.shippingAddress.line2}</>
                      )}
                      <br />
                      {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state}
                      <br />
                      {currentOrder.shippingAddress.postalCode}, {currentOrder.shippingAddress.country}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white dark:bg-[#191919] shadow rounded-lg border border-gray-200 dark:border-[#525252] overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-[#525252]">
                <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {currentOrder.shippingAddress.fullName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-[#999999] mt-1">
                      {currentOrder.shippingAddress.line1}
                      {currentOrder.shippingAddress.line2 && (
                        <>, {currentOrder.shippingAddress.line2}</>
                      )}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-[#999999]">
                      {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-[#999999]">
                      {currentOrder.shippingAddress.postalCode}, {currentOrder.shippingAddress.country}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-[#999999] mt-2">
                      Phone: {currentOrder.shippingAddress.phone}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white dark:bg-[#191919] shadow rounded-lg border border-gray-200 dark:border-[#525252] overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-[#525252]">
                <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Status
                  </label>
                  <CustomSelect
                    value={formValues?.paymentStatus || currentOrder.paymentStatus}
                    onChange={(v) => handlePaymentStatusChange(v as Order['paymentStatus'])}
                    options={[
                      { value: 'pending', label: 'Pending' },
                      { value: 'paid', label: 'Paid' },
                      { value: 'failed', label: 'Failed' },
                      { value: 'refunded', label: 'Refunded' },
                      { value: 'completed', label: 'Completed' },
                    ]}
                    disabled={isUpdating}
                  />
                </div>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500 dark:text-[#bdbdbd]">Payment Method</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                      {currentOrder.paymentMethod.toUpperCase()}
                    </dd>
                  </div>
                  {currentOrder.paymentProviderOrderId && (
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500 dark:text-[#bdbdbd]">Order ID</dt>
                      <dd className="text-sm font-mono text-gray-900 dark:text-white">
                        {currentOrder.paymentProviderOrderId}
                      </dd>
                    </div>
                  )}
                  {currentOrder.paymentProviderPaymentId && (
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500 dark:text-[#bdbdbd]">Payment ID</dt>
                      <dd className="text-sm font-mono text-gray-900 dark:text-white">
                        {currentOrder.paymentProviderPaymentId}
                      </dd>
                    </div>
                  )}
                  {currentOrder.paidAt && (
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500 dark:text-[#bdbdbd]">Paid At</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">
                        {formatDate(currentOrder.paidAt)}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Shipping & Tracking */}
            <div className="bg-white dark:bg-[#191919] shadow rounded-lg border border-gray-200 dark:border-[#525252] overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-[#525252]">
                <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping & Tracking
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Order Status
                  </label>
                  <CustomSelect
                    value={formValues?.orderStatus || currentOrder.orderStatus}
                    onChange={(v) => handleStatusChange(v as Order['orderStatus'])}
                    options={[
                      { value: 'pending', label: 'Pending' },
                      { value: 'confirmed', label: 'Confirmed' },
                      { value: 'processing', label: 'Processing' },
                      { value: 'shipped', label: 'Shipped' },
                      { value: 'delivered', label: 'Delivered' },
                      { value: 'cancelled', label: 'Cancelled' },
                      { value: 'returned', label: 'Returned' },
                    ]}
                    disabled={isUpdating}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tracking Number
                    </label>
                    {!formValues?.trackingNumber && (
                      <button
                        type="button"
                        onClick={() => {
                          if (formValues) {
                            setFormValues({
                              ...formValues,
                              trackingNumber: generateTrackingNumber(),
                            });
                          }
                        }}
                        className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                      >
                        Generate
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formValues?.trackingNumber || currentOrder.trackingNumber || ''}
                    onChange={(e) => handleTrackingNumberChange(e.target.value)}
                    placeholder="Enter tracking number or click Generate"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-[#525252] rounded-md shadow-sm bg-white dark:bg-[#242424] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#bdbdbd] focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-600 dark:focus:border-primary-600 sm:text-sm"
                    disabled={isUpdating}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Courier Name
                  </label>
                  <input
                    type="text"
                    value={formValues?.courierName || currentOrder.courierName || ''}
                    onChange={(e) => handleCourierNameChange(e.target.value)}
                    placeholder="Enter courier name"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-[#525252] rounded-md shadow-sm bg-white dark:bg-[#242424] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#bdbdbd] focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-600 dark:focus:border-primary-600 sm:text-sm"
                    disabled={isUpdating}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white dark:bg-[#191919] shadow rounded-lg border border-gray-200 dark:border-[#525252] overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-[#525252]">
              <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white">
                Order Summary
              </h3>
            </div>
            <div className="p-6">
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500 dark:text-[#bdbdbd]">Subtotal</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(currentOrder.subtotalAmount)}
                  </dd>
                </div>
                {currentOrder.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500 dark:text-[#bdbdbd]">Tax</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(currentOrder.taxAmount)}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500 dark:text-[#bdbdbd]">Shipping</dt>
                  <dd className="text-sm font-medium">
                    {currentOrder.shippingAmount === 0 ? (
                      <span className="flex items-center gap-2">
                        <span className="text-gray-500 dark:text-gray-400 line-through">₹109</span>
                        <span className="text-green-600 dark:text-green-400 font-semibold">FREE</span>
                      </span>
                    ) : (
                      <span className="text-gray-900 dark:text-white">{formatCurrency(currentOrder.shippingAmount)}</span>
                    )}
                  </dd>
                </div>
                {currentOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <dt className="text-sm">Discount</dt>
                    <dd className="text-sm font-medium">
                      -{formatCurrency(currentOrder.discountAmount)}
                    </dd>
                  </div>
                )}
                {currentOrder.paymentChargesAmount > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500 dark:text-[#bdbdbd]">Payment Charges</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(currentOrder.paymentChargesAmount)}
                    </dd>
                  </div>
                )}
                {currentOrder.couponCode && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500 dark:text-[#bdbdbd]">Coupon Code</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                      {currentOrder.couponCode}
                    </dd>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-200 dark:border-[#525252] flex justify-between">
                  <dt className="text-base font-semibold text-gray-900 dark:text-white">Total</dt>
                  <dd className="text-base font-bold text-gray-900 dark:text-white">
                    {formatCurrency(currentOrder.totalAmount)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Additional Information */}
          {(currentOrder.isGift || currentOrder.notes) && (
            <div className="bg-white dark:bg-[#191919] shadow rounded-lg border border-gray-200 dark:border-[#525252] overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-[#525252]">
                <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white">
                  Additional Information
                </h3>
              </div>
              <div className="p-6">
                <dl className="space-y-4">
                  {currentOrder.isGift && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-[#bdbdbd]">Gift Order</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        This is a gift order
                      </dd>
                    </div>
                  )}
                  {currentOrder.notes && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-[#bdbdbd]">Notes</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {currentOrder.notes}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Save Button - Mobile Only (Flipkart-style) */}
      {isDirty && (
        <div className="fixed bottom-0 left-0 right-0 md:hidden z-50 p-4 bg-white dark:bg-[#191919] border-t border-gray-200 dark:border-[#525252] shadow-lg">
          <button
            onClick={handleSaveAll}
            disabled={isUpdating}
            className="w-full flex items-center justify-center gap-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700 text-white  rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? (
              <>
                <InlineSpinner size="md" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Add bottom padding for mobile when save button is visible */}
      {isDirty && <div className="md:hidden h-24" />}
    </div>
  );
}

