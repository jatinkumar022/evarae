'use client';
import { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  Download,
} from 'lucide-react';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
  productsGrowth: number;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  topCategories: Array<{ name: string; sales: number; percentage: number }>;
  topProducts: Array<{ name: string; sales: number; revenue: number }>;
  recentActivity: Array<{
    type: string;
    description: string;
    time: string;
    amount?: number;
  }>;
}

const mockAnalytics: AnalyticsData = {
  totalRevenue: 12500000,
  totalOrders: 89,
  totalCustomers: 234,
  totalProducts: 156,
  revenueGrowth: 23.1,
  ordersGrowth: 8.2,
  customersGrowth: 15.7,
  productsGrowth: 12.5,
  monthlyRevenue: [
    { month: 'Jan', revenue: 850000 },
    { month: 'Feb', revenue: 920000 },
    { month: 'Mar', revenue: 780000 },
    { month: 'Apr', revenue: 1050000 },
    { month: 'May', revenue: 980000 },
    { month: 'Jun', revenue: 1250000 },
  ],
  topCategories: [
    { name: 'Rings', sales: 45, percentage: 35 },
    { name: 'Earrings', sales: 32, percentage: 25 },
    { name: 'Chains', sales: 28, percentage: 22 },
    { name: 'Bangles', sales: 18, percentage: 14 },
    { name: 'Others', sales: 5, percentage: 4 },
  ],
  topProducts: [
    { name: 'Diamond Solitaire Ring', sales: 15, revenue: 2250000 },
    { name: 'Gold Chain', sales: 12, revenue: 900000 },
    { name: 'Diamond Earrings', sales: 10, revenue: 950000 },
    { name: 'Traditional Bangles', sales: 8, revenue: 680000 },
    { name: 'Platinum Ring', sales: 6, revenue: 900000 },
  ],
  recentActivity: [
    {
      type: 'order',
      description: 'New order #ORD-001 placed',
      time: '2 hours ago',
      amount: 150000,
    },
    {
      type: 'customer',
      description: 'New customer registered',
      time: '3 hours ago',
    },
    {
      type: 'product',
      description: 'Product stock updated',
      time: '4 hours ago',
    },
    {
      type: 'order',
      description: 'Order #ORD-002 delivered',
      time: '5 hours ago',
      amount: 75000,
    },
    {
      type: 'customer',
      description: 'Customer feedback received',
      time: '6 hours ago',
    },
  ],
};

export default function AnalyticsPage() {
  const [analytics] = useState<AnalyticsData>(mockAnalytics);
  const [timeRange, setTimeRange] = useState('6months');

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">
            Track your business performance and insights
          </p>
        </div>
        <div className="flex space-x-3">
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="3months">Last 3 months</option>
            <option value="6months">Last 6 months</option>
            <option value="1year">Last year</option>
          </select>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Revenue
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCompactCurrency(analytics.totalRevenue)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span className="ml-2 font-medium text-green-600">
                  {analytics.revenueGrowth}%
                </span>
                <span className="ml-2 text-gray-500">from last period</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingBag className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Orders
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {analytics.totalOrders}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span className="ml-2 font-medium text-green-600">
                  {analytics.ordersGrowth}%
                </span>
                <span className="ml-2 text-gray-500">from last period</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Customers
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {analytics.totalCustomers}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span className="ml-2 font-medium text-green-600">
                  {analytics.customersGrowth}%
                </span>
                <span className="ml-2 text-gray-500">from last period</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-6 w-6 text-orange-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Products
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {analytics.totalProducts}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span className="ml-2 font-medium text-green-600">
                  {analytics.productsGrowth}%
                </span>
                <span className="ml-2 text-gray-500">from last period</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Insights */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Revenue Chart */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Monthly Revenue
            </h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {analytics.monthlyRevenue.map(item => {
                const maxRevenue = Math.max(
                  ...analytics.monthlyRevenue.map(m => m.revenue)
                );
                const height = (item.revenue / maxRevenue) * 100;
                return (
                  <div
                    key={item.month}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div className="text-xs text-gray-500 mb-2">
                      {formatCompactCurrency(item.revenue)}
                    </div>
                    <div
                      className="w-full bg-gradient-to-t from-primary to-primary/70 rounded-t"
                      style={{ height: `${height}%` }}
                    ></div>
                    <div className="text-xs text-gray-500 mt-2">
                      {item.month}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Top Categories by Sales
            </h3>
            <div className="space-y-4">
              {analytics.topCategories.map(category => (
                <div
                  key={category.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-primary rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-gray-900">
                      {category.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 w-12 text-right">
                      {category.sales} sales
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Top Performing Products
            </h3>
            <div className="space-y-4">
              {analytics.topProducts.map((product, index) => (
                <div
                  key={product.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-gray-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.sales} sales
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatCompactCurrency(product.revenue)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      {activity.type === 'order' && (
                        <ShoppingBag className="h-4 w-4 text-blue-500" />
                      )}
                      {activity.type === 'customer' && (
                        <Users className="h-4 w-4 text-green-500" />
                      )}
                      {activity.type === 'product' && (
                        <Package className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      {activity.description}
                    </p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                  {activity.amount && (
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(activity.amount)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Business Insights
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ₹
                {Math.round(
                  analytics.totalRevenue / analytics.totalOrders
                ).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Average Order Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(
                  (analytics.totalOrders / analytics.totalCustomers) * 100
                ) / 100}
              </div>
              <div className="text-sm text-gray-500">Orders per Customer</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(
                  analytics.totalRevenue / analytics.totalProducts / 1000
                )}
                K
              </div>
              <div className="text-sm text-gray-500">Revenue per Product</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
