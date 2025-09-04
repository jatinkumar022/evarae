'use client';
import { useState } from 'react';
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your Caelvi admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Products
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalProducts}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <div className="flex items-center">
                {stats.productsGrowth > 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-400" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-400" />
                )}
                <span
                  className={`ml-2 font-medium ${
                    stats.productsGrowth > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {Math.abs(stats.productsGrowth)}%
                </span>
                <span className="ml-2 text-gray-500">from last month</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingCart className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Orders
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalOrders}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <div className="flex items-center">
                {stats.ordersGrowth > 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-400" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-400" />
                )}
                <span
                  className={`ml-2 font-medium ${
                    stats.ordersGrowth > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {Math.abs(stats.ordersGrowth)}%
                </span>
                <span className="ml-2 text-gray-500">from last month</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Customers
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalCustomers}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <div className="flex items-center">
                {stats.customersGrowth > 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-400" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-400" />
                )}
                <span
                  className={`ml-2 font-medium ${
                    stats.customersGrowth > 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {Math.abs(stats.customersGrowth)}%
                </span>
                <span className="ml-2 text-gray-500">from last month</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Revenue
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(stats.totalRevenue)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <div className="flex items-center">
                {stats.revenueGrowth > 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-400" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-400" />
                )}
                <span
                  className={`ml-2 font-medium ${
                    stats.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {Math.abs(stats.revenueGrowth)}%
                </span>
                <span className="ml-2 text-gray-500">from last month</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders and Top Products */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Orders
              </h3>
              <Link
                href="/admin/orders"
                className="text-sm font-medium text-primary hover:text-primary/80"
              >
                View all
              </Link>
            </div>
            <div className="mt-4 flow-root">
              <div className="-my-4 divide-y divide-gray-200">
                {recentOrders.map(order => (
                  <div key={order.id} className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <ShoppingCart className="h-4 w-4 text-gray-500" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {order.customer}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.product}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(order.amount)}
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
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
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Top Products
              </h3>
              <Link
                href="/admin/products"
                className="text-sm font-medium text-primary hover:text-primary/80"
              >
                View all
              </Link>
            </div>
            <div className="mt-4 flow-root">
              <div className="-my-4 divide-y divide-gray-200">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {index + 1}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.sales} sales
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(product.revenue)}
                        </div>
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 text-green-400" />
                          <span className="ml-1 text-sm text-green-600">
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
