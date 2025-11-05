'use client';
import { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Eye,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  MoreVertical,
  Download,
} from 'lucide-react';
import { useOrderStore, Order } from '@/lib/data/store/orderStore';
import { CustomSelect } from '@/app/admin/components/CustomSelect';

export default function OrdersPage() {
  const {
    orders,
    filters,
    pagination,
    status,
    setFilters,
    fetchOrders,
  } = useOrderStore();

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; right: number } | null>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Fetch orders from API
  useEffect(() => {
    setFilters({ limit: 10 });
  }, [setFilters]);

  // Fetch orders whenever filters change
  useEffect(() => {
    fetchOrders();
  }, [filters, fetchOrders]);

  // Calculate dropdown position based on button position
  const calculateDropdownPosition = (buttonElement: HTMLButtonElement) => {
    const rect = buttonElement.getBoundingClientRect();
    return {
      top: rect.bottom + 4, // 4px gap, fixed positioning uses viewport coordinates
      right: window.innerWidth - rect.right,
    };
  };

  // Handle window resize/scroll to update dropdown position
  useEffect(() => {
    if (openDropdownId && buttonRefs.current[openDropdownId]) {
      const button = buttonRefs.current[openDropdownId];
      if (button) {
        const updatePosition = () => {
          setDropdownPosition(calculateDropdownPosition(button));
        };
        updatePosition();
        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);
        return () => {
          window.removeEventListener('scroll', updatePosition, true);
          window.removeEventListener('resize', updatePosition);
        };
      }
    }
  }, [openDropdownId]);

  // Orders are filtered and paginated by the API, so we just use them directly

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
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
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
        <Icon className="h-3 w-3 mr-1" />
        <span className="hidden sm:inline">{orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}</span>
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
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
        {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      {/* Header */}
      <div className="flex md:items-center gap-4 flex-col md:flex-row justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
          <p className="text-gray-600 dark:text-[#bdbdbd]">Manage customer orders and track shipments</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            className="inline-flex items-center text-xs md:text-sm px-4 py-2 border border-gray-300 dark:border-[#525252] shadow-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-[#242424] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors"
          >
            <Download className="h-4 w-4 mr-2" /> Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#191919] shadow rounded-lg p-6 border border-gray-200 dark:border-[#525252]">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Search
            </label>
            <div className="mt-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[#bdbdbd]" />
              <input
                type="text"
                value={filters.search}
                onChange={e => setFilters({ search: e.target.value, page: 1 })}
                placeholder="Search by order number, customer name, phone..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-[#525252] rounded-md sm:text-sm bg-white dark:bg-[#242424] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#bdbdbd] focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-600 dark:focus:border-primary-600"
              />
            </div>
          </div>

          <div>
            <CustomSelect
              label="Order Status"
              value={filters.orderStatus}
              onChange={(v) => setFilters({ orderStatus: v, page: 1 })}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'pending', label: 'Pending' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'processing', label: 'Processing' },
                { value: 'shipped', label: 'Shipped' },
                { value: 'delivered', label: 'Delivered' },
                { value: 'cancelled', label: 'Cancelled' },
                { value: 'returned', label: 'Returned' },
              ]}
            />
          </div>

          <div>
            <CustomSelect
              label="Payment Status"
              value={filters.paymentStatus}
              onChange={(v) => setFilters({ paymentStatus: v, page: 1 })}
              options={[
                { value: '', label: 'All Payments' },
                { value: 'pending', label: 'Pending' },
                { value: 'paid', label: 'Paid' },
                { value: 'failed', label: 'Failed' },
                { value: 'refunded', label: 'Refunded' },
                { value: 'completed', label: 'Completed' },
              ]}
            />
          </div>

          <div>
            <CustomSelect
              label="Sort By"
              value={filters.sortBy}
              onChange={(v) => setFilters({ sortBy: v, page: 1 })}
              options={[
                { value: 'createdAt', label: 'Date' },
                { value: 'totalAmount', label: 'Amount' },
                { value: 'orderNumber', label: 'Order Number' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-[#191919] shadow rounded-lg border border-gray-200 dark:border-[#525252] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-[#525252]">
            <thead className="bg-gray-50 dark:bg-[#1d1d1d]">
              <tr>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                  Customer
                </th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  Items
                </th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                  Status
                </th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                  Payment
                </th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden xl:table-cell">
                  Date
                </th>
                <th className="sticky right-0 px-3 sm:px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-[#1d1d1d] z-10">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#1d1d1d] divide-y divide-gray-200 dark:divide-[#525252]">
              {status === 'loading' ? (
                <tr>
                  <td colSpan={8} className="px-3 sm:px-4 py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-[#bdbdbd]">Loading orders...</p>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 sm:px-4 py-12 text-center">
                    <Package className="mx-auto h-12 w-12 text-gray-400 dark:text-[#bdbdbd]" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      No orders found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-[#bdbdbd]">
                      Try adjusting your search or filter criteria.
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const isDropdownOpen = openDropdownId === order._id;
                  return (
                    <tr key={order._id} className="transition-colors">
                      {/* Order Number & Mobile Customer Info */}
                      <td className="px-3 sm:px-4 py-4 whitespace-nowrap hover:bg-gray-50 dark:hover:bg-[#242424] transition-colors">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {order.orderNumber}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-[#bdbdbd] mt-1 sm:hidden">
                          {order.shippingAddress.fullName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-[#bdbdbd] mt-1 sm:hidden">
                          {order.shippingAddress.phone}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-[#bdbdbd] mt-1 xl:hidden">
                          {formatDate(order.createdAt)}
                        </div>
                        <div className="mt-2 sm:hidden">
                          {getStatusBadge(order.orderStatus)}
                        </div>
                        <div className="mt-2 sm:hidden lg:hidden">
                          {getPaymentStatusBadge(order.paymentStatus)}
                        </div>
                        {order.trackingNumber && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-gray-500 dark:text-[#bdbdbd]">
                            <Truck className="h-3 w-3" />
                            <span className="truncate max-w-[150px]">{order.trackingNumber}</span>
                          </div>
                        )}
                      </td>

                      {/* Customer - Desktop */}
                      <td className="px-3 sm:px-4 py-4 whitespace-nowrap hidden sm:table-cell hover:bg-gray-50 dark:hover:bg-[#242424] transition-colors">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {order.shippingAddress.fullName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-[#bdbdbd]">
                          {order.shippingAddress.phone}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-[#bdbdbd]">
                          {order.shippingAddress.city}, {order.shippingAddress.state}
                        </div>
                      </td>

                      {/* Items - Desktop */}
                      <td className="px-3 sm:px-4 py-4 hidden md:table-cell hover:bg-gray-50 dark:hover:bg-[#242424] transition-colors">
                        <div className="text-sm text-gray-900 dark:text-white">
                          <div className="flex items-center gap-2 mb-2">
                            {order.items[0]?.image ? (
                              <Image
                                src={order.items[0].image}
                                alt={order.items[0].name}
                                width={32}
                                height={32}
                                className="rounded-md"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-gray-200 dark:bg-[#525252] rounded-md flex items-center justify-center">
                                <Package className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{order.items[0].name}</div>
                              <div className="text-xs text-gray-500 dark:text-[#bdbdbd]">
                                Qty: {order.items[0].quantity}
                              </div>
                            </div>
                          </div>
                          {order.items.length > 1 && (
                            <div className="text-xs text-gray-500 dark:text-[#bdbdbd]">
                              +{order.items.length - 1} more item{order.items.length - 1 !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Total */}
                      <td className="px-3 sm:px-4 py-4 whitespace-nowrap hover:bg-gray-50 dark:hover:bg-[#242424] transition-colors">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(order.totalAmount)}
                        </div>
                        {order.discountAmount > 0 && (
                          <div className="text-xs text-green-600 dark:text-green-400">
                            -{formatCurrency(order.discountAmount)} discount
                          </div>
                        )}
                      </td>

                      {/* Status - Desktop */}
                      <td className="px-3 sm:px-4 py-4 whitespace-nowrap hidden lg:table-cell hover:bg-gray-50 dark:hover:bg-[#242424] transition-colors">
                        {getStatusBadge(order.orderStatus)}
                        {order.trackingNumber && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-gray-500 dark:text-[#bdbdbd]">
                            <Truck className="h-3 w-3" />
                            <span className="truncate max-w-[120px]">{order.trackingNumber}</span>
                          </div>
                        )}
                      </td>

                      {/* Payment Status - Desktop */}
                      <td className="px-3 sm:px-4 py-4 whitespace-nowrap hidden lg:table-cell hover:bg-gray-50 dark:hover:bg-[#242424] transition-colors">
                        {getPaymentStatusBadge(order.paymentStatus)}
                        <div className="text-xs text-gray-500 dark:text-[#bdbdbd] mt-1">
                          {order.paymentMethod.toUpperCase()}
                        </div>
                      </td>

                      {/* Date - Desktop */}
                      <td className="px-3 sm:px-4 py-4 whitespace-nowrap hidden xl:table-cell hover:bg-gray-50 dark:hover:bg-[#242424] transition-colors">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {formatDate(order.createdAt)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="sticky right-0 px-3 sm:px-4 py-4 whitespace-nowrap text-right text-sm font-medium bg-white dark:bg-[#1d1d1d] hover:bg-gray-50 dark:hover:bg-[#242424] z-10 transition-colors">
                        <div className="relative inline-block">
                          <button
                            ref={(el) => {
                              buttonRefs.current[order._id] = el;
                            }}
                            onClick={(e) => {
                              if (isDropdownOpen) {
                                setOpenDropdownId(null);
                                setDropdownPosition(null);
                              } else {
                                const position = calculateDropdownPosition(e.currentTarget);
                                setDropdownPosition(position);
                                setOpenDropdownId(order._id);
                              }
                            }}
                            className="inline-flex items-center px-2 py-1 border border-gray-300 dark:border-[#525252] shadow-sm text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-[#242424] hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-4 py-4 border-t border-gray-200 dark:border-[#525252] flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
              of {pagination.total} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilters({ page: pagination.page - 1 })}
                disabled={!pagination.hasPrev}
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#242424] border border-gray-300 dark:border-[#525252] rounded-md hover:bg-gray-50 dark:hover:bg-[#2f2f2f] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setFilters({ page: pagination.page + 1 })}
                disabled={!pagination.hasNext}
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#242424] border border-gray-300 dark:border-[#525252] rounded-md hover:bg-gray-50 dark:hover:bg-[#2f2f2f] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dropdown Menu - Rendered outside table to avoid overflow constraints */}
      {openDropdownId && dropdownPosition && (
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => {
              setOpenDropdownId(null);
              setDropdownPosition(null);
            }}
          />
          <div
            className="fixed min-w-48 rounded-md shadow-xl bg-white dark:bg-[#1d1d1d] ring-1 ring-black ring-opacity-5 z-[9999] border border-gray-200 dark:border-[#525252]"
            style={{
              top: `${dropdownPosition.top}px`,
              right: `${dropdownPosition.right}px`,
            }}
          >
            <div className="py-1">
              <Link
                href={`/admin/orders/${openDropdownId}`}
                onClick={() => {
                  setOpenDropdownId(null);
                  setDropdownPosition(null);
                }}
                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#525252] whitespace-nowrap"
              >
                <Eye className="h-4 w-4 mr-2 flex-shrink-0" /> View Details
              </Link>
              <button
                onClick={() => {
                  setOpenDropdownId(null);
                  setDropdownPosition(null);
                  // Handle export/invoice
                }}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#525252] whitespace-nowrap"
              >
                <Download className="h-4 w-4 mr-2 flex-shrink-0" /> Download Invoice
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
