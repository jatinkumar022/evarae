'use client';
import { useState, useEffect } from 'react';
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/lib/utils';
import InlineSpinner from '@/app/admin/components/InlineSpinner';

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  thisMonthRevenue: number;
  lowStockProducts: number;
  productsGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
  revenueGrowth: number;
}

interface RecentOrder {
  _id: string;
  orderNumber: string;
  customer: string;
  customerEmail: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  itemsCount: number;
}

interface TopProduct {
  name: string;
  sales: number;
  revenue: number;
  _id?: string;
}

interface DashboardData {
  stats: DashboardStats;
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
  orderStatusBreakdown: Record<string, number>;
  paymentStatusBreakdown: Record<string, number>;
  lowStockProducts: Array<{
    _id: string;
    name: string;
    sku: string;
    stockQuantity: number;
    price: number;
  }>;
  topCategories: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFetch<DashboardData>('/api/admin/dashboard');
      setData(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(message);
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let highlightTimer: ReturnType<typeof setTimeout> | null = null;

    const focusSectionFromHash = () => {
      if (typeof window === 'undefined') return;
      const hash = window.location.hash?.replace('#', '');
      if (!hash) return;
      const section = document.getElementById(hash);
      if (section && section.classList.contains('admin-section')) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
        section.classList.add('admin-section--focused');
        if (highlightTimer) clearTimeout(highlightTimer);
        highlightTimer = setTimeout(() => {
          section.classList.remove('admin-section--focused');
        }, 1800);
      }
    };

    focusSectionFromHash();
    window.addEventListener('hashchange', focusSectionFromHash);

    return () => {
      window.removeEventListener('hashchange', focusSectionFromHash);
      if (highlightTimer) clearTimeout(highlightTimer);
    };
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCompactCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `₹${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return formatCurrency(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400';
      case 'shipped':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400';
      case 'processing':
      case 'confirmed':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400';
      case 'pending':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
      case 'cancelled':
      case 'returned':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getGrowthIcon = (growth: number) => {
    if (growth >= 0) {
      return <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-400 flex-shrink-0" />;
    }
    return <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-400 flex-shrink-0" />;
  };

  const getGrowthColor = (growth: number) => {
    if (growth >= 0) {
      return 'text-green-600 dark:text-green-400';
    }
    return 'text-red-600 dark:text-red-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <InlineSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600 dark:text-[#bdbdbd]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6 mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-400">Error loading dashboard</h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
              <button
                onClick={fetchDashboardData}
                className="mt-3 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-500 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { stats, recentOrders, topProducts, lowStockProducts } = data;

  return (
    <div className="min-h-screen lg:h-screen flex flex-col overflow-hidden mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      {/* Header */}
      <div className="flex-shrink-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-[#bdbdbd] mt-1">
          Welcome to your Caelvi admin dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div id="dashboard-stats" className="lg:flex-shrink-0 grid grid-cols-1 gap-3 sm:gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-4 mt-4 sm:mt-6 admin-section scroll-mt-36">
        {/* Total Products */}
        <div className="bg-white dark:bg-[#191919] overflow-hidden shadow rounded-lg border border-gray-200 dark:border-[#525252] flex flex-col h-full">
          <div className="p-4 sm:p-5 md:p-6 flex-1">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-orange-400" />
              </div>
              <div className="ml-3 sm:ml-4 md:ml-5 w-0 flex-1 min-w-0">
                <dl>
                  <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-[#bdbdbd] truncate">
                    Total Products
                  </dt>
                  <dd className="text-base sm:text-lg font-medium text-gray-900 dark:text-white truncate">
                    {stats.totalProducts}
                  </dd>
                  <dt className="text-xs text-gray-500 dark:text-[#bdbdbd] mt-1">
                    {stats.activeProducts} active
                  </dt>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-[#1d1d1d] px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 border-t border-gray-200 dark:border-[#525252]">
            <div className="text-xs sm:text-sm">
              <div className="flex items-center flex-wrap gap-1">
                {getGrowthIcon(stats.productsGrowth)}
                <span className={`font-medium ${getGrowthColor(stats.productsGrowth)}`}>
                  {Math.abs(stats.productsGrowth).toFixed(1)}%
                </span>
                <span className="text-gray-500 dark:text-[#bdbdbd] text-xs">from last month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white dark:bg-[#191919] overflow-hidden shadow rounded-lg border border-gray-200 dark:border-[#525252] flex flex-col h-full">
          <div className="p-4 sm:p-5 md:p-6 flex-1">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
              </div>
              <div className="ml-3 sm:ml-4 md:ml-5 w-0 flex-1 min-w-0">
                <dl>
                  <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-[#bdbdbd] truncate">
                    Total Orders
                  </dt>
                  <dd className="text-base sm:text-lg font-medium text-gray-900 dark:text-white truncate">
                    {stats.totalOrders}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-[#1d1d1d] px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 border-t border-gray-200 dark:border-[#525252]">
            <div className="text-xs sm:text-sm">
              <div className="flex items-center flex-wrap gap-1">
                {getGrowthIcon(stats.ordersGrowth)}
                <span className={`font-medium ${getGrowthColor(stats.ordersGrowth)}`}>
                  {Math.abs(stats.ordersGrowth).toFixed(1)}%
                </span>
                <span className="text-gray-500 dark:text-[#bdbdbd] text-xs">from last month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white dark:bg-[#191919] overflow-hidden shadow rounded-lg border border-gray-200 dark:border-[#525252] flex flex-col h-full">
          <div className="p-4 sm:p-5 md:p-6 flex-1">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
              </div>
              <div className="ml-3 sm:ml-4 md:ml-5 w-0 flex-1 min-w-0">
                <dl>
                  <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-[#bdbdbd] truncate">
                    Total Customers
                  </dt>
                  <dd className="text-base sm:text-lg font-medium text-gray-900 dark:text-white truncate">
                    {stats.totalCustomers}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-[#1d1d1d] px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 border-t border-gray-200 dark:border-[#525252]">
            <div className="text-xs sm:text-sm">
              <div className="flex items-center flex-wrap gap-1">
                {getGrowthIcon(stats.customersGrowth)}
                <span className={`font-medium ${getGrowthColor(stats.customersGrowth)}`}>
                  {Math.abs(stats.customersGrowth).toFixed(1)}%
                </span>
                <span className="text-gray-500 dark:text-[#bdbdbd] text-xs">from last month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white dark:bg-[#191919] overflow-hidden shadow rounded-lg border border-gray-200 dark:border-[#525252] flex flex-col h-full">
          <div className="p-4 sm:p-5 md:p-6 flex-1">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
              </div>
              <div className="ml-3 sm:ml-4 md:ml-5 w-0 flex-1 min-w-0">
                <dl>
                  <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-[#bdbdbd] truncate">
                    Total Revenue
                  </dt>
                  <dd className="text-base sm:text-lg font-medium text-gray-900 dark:text-white truncate">
                    {formatCompactCurrency(stats.totalRevenue)}
                  </dd>
                  <dt className="text-xs text-gray-500 dark:text-[#bdbdbd] mt-1">
                    {formatCompactCurrency(stats.thisMonthRevenue)} this month
                  </dt>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-[#1d1d1d] px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 border-t border-gray-200 dark:border-[#525252]">
            <div className="text-xs sm:text-sm">
              <div className="flex items-center flex-wrap gap-1">
                {getGrowthIcon(stats.revenueGrowth)}
                <span className={`font-medium ${getGrowthColor(stats.revenueGrowth)}`}>
                  {Math.abs(stats.revenueGrowth).toFixed(1)}%
                </span>
                <span className="text-gray-500 dark:text-[#bdbdbd] text-xs">from last month</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {stats.lowStockProducts > 0 && (
        <div id="dashboard-low-stock-alert" className="lg:flex-shrink-0 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-4 sm:mt-6 admin-section scroll-mt-36">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                Low Stock Alert
              </h3>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                {stats.lowStockProducts} product{stats.lowStockProducts !== 1 ? 's' : ''} have low stock (≤10 units)
              </p>
              <Link
                href="/admin/products"
                className="mt-2 inline-block text-sm font-medium text-yellow-600 dark:text-yellow-400 hover:text-yellow-500 underline"
              >
                View products
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Recent Orders and Top Products */}
      <div className="lg:flex-1 lg:min-h-0 grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 lg:grid-cols-2 mt-4 sm:mt-6">
        {/* Recent Orders */}
        <div id="dashboard-recent-orders" className="bg-white dark:bg-[#191919] shadow rounded-lg border border-gray-200 dark:border-[#525252] lg:flex lg:flex-col lg:h-full lg:min-h-0 lg:max-h-[52vh] 2xl:max-h-[48vh] admin-section scroll-mt-36">
          <div className="p-4 sm:p-5 md:p-6 lg:flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Recent Orders
              </h3>
              <Link
                href="/admin/orders"
                className="text-xs sm:text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="lg:flex-1 lg:min-h-0 lg:overflow-y-auto px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6">
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="mx-auto h-8 w-8 text-gray-400 dark:text-[#bdbdbd]" />
                <p className="mt-2 text-sm text-gray-500 dark:text-[#bdbdbd]">No orders yet</p>
              </div>
            ) : (
              <div className="-my-4 divide-y divide-gray-200 dark:divide-[#525252]">
                {recentOrders.map(order => (
                  <Link
                    key={order._id}
                    href={`/admin/orders/${order._id}`}
                    className="block py-3 sm:py-4 hover:bg-gray-50 dark:hover:bg-[#1d1d1d] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 sm:gap-4">
                      <div className="flex items-center min-w-0 flex-1">
                        <div className="flex-shrink-0">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 dark:bg-[#525252] flex items-center justify-center">
                            <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 dark:text-gray-400" />
                          </div>
                        </div>
                        <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                          <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                            {order.customer}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 dark:text-[#bdbdbd] truncate">
                            {order.orderNumber} • {order.itemsCount} item{order.itemsCount !== 1 ? 's' : ''}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-[#bdbdbd] mt-0.5">
                            {formatDate(order.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <div className="text-xs sm:text-sm text-gray-900 dark:text-white whitespace-nowrap">
                          {formatCompactCurrency(order.totalAmount)}
                        </div>
                        <span
                          className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            order.orderStatus
                          )}`}
                        >
                          {order.orderStatus}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div id="dashboard-top-products" className="bg-white dark:bg-[#191919] shadow rounded-lg border border-gray-200 dark:border-[#525252] lg:flex lg:flex-col lg:h-full lg:min-h-0 lg:max-h-[52vh] 2xl:max-h-[48vh] admin-section scroll-mt-36">
          <div className="p-4 sm:p-5 md:p-6 lg:flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Top Products
              </h3>
              <Link
                href="/admin/products"
                className="text-xs sm:text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="lg:flex-1 lg:min-h-0 lg:overflow-y-auto px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6">
            {topProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="mx-auto h-8 w-8 text-gray-400 dark:text-[#bdbdbd]" />
                <p className="mt-2 text-sm text-gray-500 dark:text-[#bdbdbd]">No product sales yet</p>
              </div>
            ) : (
              <div className="-my-4 divide-y divide-gray-200 dark:divide-[#525252]">
                {topProducts.map((product, index) => (
                  <div key={product._id || product.name} className="py-3 sm:py-4">
                    <div className="flex items-center justify-between gap-2 sm:gap-4">
                      <div className="flex items-center min-w-0 flex-1">
                        <div className="flex-shrink-0">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 dark:bg-[#525252] flex items-center justify-center">
                            <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                              {index + 1}
                            </span>
                          </div>
                        </div>
                        <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                          <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                            {product.name}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 dark:text-[#bdbdbd]">
                            {product.sales} sale{product.sales !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <div className="text-xs sm:text-sm text-gray-900 dark:text-white whitespace-nowrap">
                          {formatCompactCurrency(product.revenue)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Low Stock Products */}
      {lowStockProducts.length > 0 && (
        <div id="dashboard-low-stock-list" className="lg:flex-shrink-0 bg-white dark:bg-[#191919] shadow rounded-lg border border-gray-200 dark:border-[#525252] mt-4 sm:mt-6 admin-section scroll-mt-36">
          <div className="p-4 sm:p-5 md:p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Low Stock Products
              </h3>
              <Link
                href="/admin/products"
                className="text-xs sm:text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
              >
                View all
              </Link>
            </div>
            <div className="mt-4 flow-root">
              <div className="-my-4 divide-y divide-gray-200 dark:divide-[#525252]">
                {lowStockProducts.map(product => (
                  <Link
                    key={product._id}
                    href={`/admin/products/${product._id}`}
                    className="block py-3 sm:py-4 hover:bg-gray-50 dark:hover:bg-[#1d1d1d] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 sm:gap-4">
                      <div className="flex items-center min-w-0 flex-1">
                        <div className="flex-shrink-0">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                            <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-600 dark:text-yellow-400" />
                          </div>
                        </div>
                        <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                          <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                            {product.name}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 dark:text-[#bdbdbd]">
                            SKU: {product.sku || 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <div className="text-xs sm:text-sm text-gray-900 dark:text-white">
                          <span className="font-medium text-red-600 dark:text-red-400">{product.stockQuantity}</span>
                          <span className="text-gray-500 dark:text-[#bdbdbd] ml-1">units</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
