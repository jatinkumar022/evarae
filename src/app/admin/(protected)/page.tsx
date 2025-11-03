'use client';
import { useState } from 'react';
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  productsGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
  revenueGrowth: number;
}

const mockStats: DashboardStats = {
  totalProducts: 156,
  totalOrders: 89,
  totalCustomers: 234,
  totalRevenue: 12500000,
  productsGrowth: 12.5,
  ordersGrowth: 8.2,
  customersGrowth: 15.7,
  revenueGrowth: 23.1,
};

const recentOrders = [
  {
    id: 'ORD-001',
    customer: 'Priya Sharma',
    product: 'Diamond Solitaire Ring',
    amount: 150000,
    status: 'Delivered',
    date: '2024-01-15',
  },
  {
    id: 'ORD-002',
    customer: 'Rahul Patel',
    product: 'Gold Chain',
    amount: 75000,
    status: 'Processing',
    date: '2024-01-14',
  },
  {
    id: 'ORD-003',
    customer: 'Anjali Singh',
    product: 'Diamond Earrings',
    amount: 95000,
    status: 'Shipped',
    date: '2024-01-13',
  },
  {
    id: 'ORD-004',
    customer: 'Vikram Mehta',
    product: 'Traditional Bangles',
    amount: 85000,
    status: 'Pending',
    date: '2024-01-12',
  },
];

const topProducts = [
  {
    name: 'Diamond Solitaire Ring',
    sales: 45,
    revenue: 6750000,
    growth: 15.2,
  },
  {
    name: 'Gold Chain',
    sales: 38,
    revenue: 2850000,
    growth: 8.7,
  },
  {
    name: 'Diamond Earrings',
    sales: 32,
    revenue: 3040000,
    growth: 12.3,
  },
  {
    name: 'Traditional Bangles',
    sales: 28,
    revenue: 2380000,
    growth: 5.9,
  },
];

export default function AdminDashboard() {
  const [stats] = useState<DashboardStats>(mockStats);

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
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400';
      case 'pending':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-[#696969] mt-1">
          Welcome to your Caelvi admin dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-[#191919] overflow-hidden shadow rounded-lg border border-gray-200 dark:border-[#525252]">
          <div className="p-4 sm:p-5 md:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-orange-400" />
              </div>
              <div className="ml-3 sm:ml-4 md:ml-5 w-0 flex-1 min-w-0">
                <dl>
                  <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-[#696969] truncate">
                    Total Products
                  </dt>
                  <dd className="text-base sm:text-lg font-medium text-gray-900 dark:text-white truncate">
                    {stats.totalProducts}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-[#1d1d1d] px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 border-t border-gray-200 dark:border-[#525252]">
            <div className="text-xs sm:text-sm">
              <div className="flex items-center flex-wrap gap-1">
                <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-400 flex-shrink-0" />
                <span className="font-medium text-green-600 dark:text-green-400">
                  {stats.productsGrowth}%
                </span>
                <span className="text-gray-500 dark:text-[#696969] text-xs">from last period</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#191919] overflow-hidden shadow rounded-lg border border-gray-200 dark:border-[#525252]">
          <div className="p-4 sm:p-5 md:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
              </div>
              <div className="ml-3 sm:ml-4 md:ml-5 w-0 flex-1 min-w-0">
                <dl>
                  <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-[#696969] truncate">
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
                <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-400 flex-shrink-0" />
                <span className="font-medium text-green-600 dark:text-green-400">
                  {stats.ordersGrowth}%
                </span>
                <span className="text-gray-500 dark:text-[#696969] text-xs">from last period</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#191919] overflow-hidden shadow rounded-lg border border-gray-200 dark:border-[#525252]">
          <div className="p-4 sm:p-5 md:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
              </div>
              <div className="ml-3 sm:ml-4 md:ml-5 w-0 flex-1 min-w-0">
                <dl>
                  <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-[#696969] truncate">
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
                <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-400 flex-shrink-0" />
                <span className="font-medium text-green-600 dark:text-green-400">
                  {stats.customersGrowth}%
                </span>
                <span className="text-gray-500 dark:text-[#696969] text-xs">from last period</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#191919] overflow-hidden shadow rounded-lg border border-gray-200 dark:border-[#525252]">
          <div className="p-4 sm:p-5 md:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
              </div>
              <div className="ml-3 sm:ml-4 md:ml-5 w-0 flex-1 min-w-0">
                <dl>
                  <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-[#696969] truncate">
                    Total Revenue
                  </dt>
                  <dd className="text-base sm:text-lg font-medium text-gray-900 dark:text-white truncate">
                    {formatCompactCurrency(stats.totalRevenue)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-[#1d1d1d] px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 border-t border-gray-200 dark:border-[#525252]">
            <div className="text-xs sm:text-sm">
              <div className="flex items-center flex-wrap gap-1">
                <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-400 flex-shrink-0" />
                <span className="font-medium text-green-600 dark:text-green-400">
                  {stats.revenueGrowth}%
                </span>
                <span className="text-gray-500 dark:text-[#696969] text-xs">from last period</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders and Top Products */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="bg-white dark:bg-[#191919] shadow rounded-lg border border-gray-200 dark:border-[#525252]">
          <div className="p-4 sm:p-5 md:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
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
            <div className="mt-4 flow-root">
              <div className="-my-4 divide-y divide-gray-200 dark:divide-[#525252]">
                {recentOrders.map(order => (
                  <div key={order.id} className="py-3 sm:py-4">
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
                          <div className="text-xs sm:text-sm text-gray-500 dark:text-[#696969] truncate">
                            {order.product}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 sm:space-x-4 flex-shrink-0">
                        <div className="text-xs sm:text-sm text-gray-900 dark:text-white whitespace-nowrap">
                          {formatCompactCurrency(order.amount)}
                        </div>
                        <span
                          className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-[#191919] shadow rounded-lg border border-gray-200 dark:border-[#525252]">
          <div className="p-4 sm:p-5 md:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
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
            <div className="mt-4 flow-root">
              <div className="-my-4 divide-y divide-gray-200 dark:divide-[#525252]">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="py-3 sm:py-4">
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
                          <div className="text-xs sm:text-sm text-gray-500 dark:text-[#696969]">
                            {product.sales} sales
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 sm:space-x-4 flex-shrink-0">
                        <div className="text-xs sm:text-sm text-gray-900 dark:text-white whitespace-nowrap">
                          {formatCompactCurrency(product.revenue)}
                        </div>
                        <div className="flex items-center">
                          <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-400 flex-shrink-0" />
                          <span className="ml-1 text-xs sm:text-sm text-green-600 dark:text-green-400">
                            {product.growth}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
