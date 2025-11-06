'use client';
import { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  Download,
} from 'lucide-react';
import { CustomSelect } from '@/app/admin/components/LazyCustomSelect';
import InlineSpinner from '@/app/admin/components/InlineSpinner';

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

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('6months');

  // Fetch analytics data
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}`);
        if (!response.ok) throw new Error('Failed to fetch analytics');
        const data = await response.json();
        if (!cancelled) setAnalytics(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [timeRange]);

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

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <InlineSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-[#bdbdbd]">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="h-full flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-sm text-red-600 dark:text-red-400">{error || 'Failed to load analytics'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="flex md:items-center gap-3 sm:gap-4 flex-col md:flex-row justify-between">
        <div className="w-full md:w-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-[#bdbdbd] mt-1">
            Track your business performance and insights
          </p>
        </div>
        <div className="flex items-end gap-2 flex-wrap w-full md:w-auto">
          <div className="flex-1 md:flex-none min-w-[140px] sm:min-w-[160px]">
            <CustomSelect
              label=""
              value={timeRange}
              onChange={(v) => setTimeRange(v)}
              options={[
                { value: '7days', label: 'Last 7 days' },
                { value: '30days', label: 'Last 30 days' },
                { value: '3months', label: 'Last 3 months' },
                { value: '6months', label: 'Last 6 months' },
                { value: '1year', label: 'Last year' },
              ]}
            />
          </div>
          <button className="flex-1 md:flex-none inline-flex items-center justify-center text-xs sm:text-sm px-3 sm:px-4 py-2 border border-gray-300 dark:border-[#525252] shadow-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-[#242424] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors">
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
            <span className="hidden xs:inline">Export Report</span>
            <span className="xs:hidden">Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-[#191919] overflow-hidden shadow rounded-lg border border-gray-200 dark:border-[#525252]">
          <div className="p-4 sm:p-5 md:p-6">
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
                    {formatCompactCurrency(analytics.totalRevenue)}
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
                  {analytics.revenueGrowth}%
                </span>
                <span className="text-gray-500 dark:text-[#bdbdbd] text-xs">from last period</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#191919] overflow-hidden shadow rounded-lg border border-gray-200 dark:border-[#525252]">
          <div className="p-4 sm:p-5 md:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
              </div>
              <div className="ml-3 sm:ml-4 md:ml-5 w-0 flex-1 min-w-0">
                <dl>
                  <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-[#bdbdbd] truncate">
                    Total Orders
                  </dt>
                  <dd className="text-base sm:text-lg font-medium text-gray-900 dark:text-white truncate">
                    {analytics.totalOrders}
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
                  {analytics.ordersGrowth}%
                </span>
                <span className="text-gray-500 dark:text-[#bdbdbd] text-xs">from last period</span>
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
                  <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-[#bdbdbd] truncate">
                    Total Customers
                  </dt>
                  <dd className="text-base sm:text-lg font-medium text-gray-900 dark:text-white truncate">
                    {analytics.totalCustomers}
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
                  {analytics.customersGrowth}%
                </span>
                <span className="text-gray-500 dark:text-[#bdbdbd] text-xs">from last period</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#191919] overflow-hidden shadow rounded-lg border border-gray-200 dark:border-[#525252]">
          <div className="p-4 sm:p-5 md:p-6">
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
                    {analytics.totalProducts}
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
                  {analytics.productsGrowth}%
                </span>
                <span className="text-gray-500 dark:text-[#bdbdbd] text-xs">from last period</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Insights */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 lg:grid-cols-2">
        {/* Monthly Revenue Chart */}
        <div className="bg-white dark:bg-[#191919] shadow rounded-lg border border-gray-200 dark:border-[#525252] overflow-hidden">
          <div className="p-4 sm:p-5 md:p-6">
            <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
              Monthly Revenue
            </h3>
            <div className="h-48 sm:h-56 md:h-64 flex items-end justify-between gap-0.5 sm:gap-1 md:gap-2 overflow-x-auto">
              {analytics.monthlyRevenue.length > 0 ? (() => {
                // Calculate max revenue once outside the map
                const revenues = analytics.monthlyRevenue.map(m => m.revenue);
                const maxRevenue = Math.max(...revenues, 1);
                const minRevenue = Math.min(...revenues, 0);
                const range = maxRevenue - minRevenue;
                
                // If all values are the same or very close, use a fixed height
                const isUniform = range < maxRevenue * 0.01; // Less than 1% difference
                
                return analytics.monthlyRevenue.map(item => {
                  let height: number;
                  
                  if (isUniform || range === 0) {
                    // If all values are similar, show at 50% height for visibility
                    height = 50;
                  } else {
                    // Normalize value to 0-1 range, then scale to 20-100% for better visibility
                    const normalizedValue = (item.revenue - minRevenue) / range;
                    // Scale from 20% to 100% to ensure bars are always visible
                    height = 20 + (normalizedValue * 80);
                  }
                  
                  return (
                    <div
                      key={item.month}
                      className="flex-1 min-w-[28px] sm:min-w-[32px] md:min-w-[36px] flex flex-col items-center"
                    >
                      <div className="text-[10px] xs:text-xs text-gray-500 dark:text-[#bdbdbd] mb-1 sm:mb-2 text-center leading-tight">
                        {formatCompactCurrency(item.revenue)}
                      </div>
                      <div
                        className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t dark:from-primary-500 dark:to-primary-300 min-h-[4px]"
                        style={{ height: `${height}%` }}
                      ></div>
                      <div className="text-[10px] xs:text-xs text-gray-500 dark:text-[#bdbdbd] mt-1 sm:mt-2">
                        {item.month}
                      </div>
                    </div>
                  );
                });
              })() : (
                <div className="w-full flex items-center justify-center h-full">
                  <p className="text-sm text-gray-500 dark:text-[#bdbdbd]">No revenue data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white dark:bg-[#191919] shadow rounded-lg border border-gray-200 dark:border-[#525252]">
          <div className="p-4 sm:p-5 md:p-6">
            <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
              Top Categories by Sales
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {analytics.topCategories.length > 0 ? (
                analytics.topCategories.map(category => (
                <div
                  key={category.name}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-primary-600 dark:bg-primary-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                      {category.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
                    <div className="w-20 sm:w-24 md:w-32 bg-gray-200 dark:bg-[#525252] rounded-full h-1.5 sm:h-2">
                      <div
                        className="bg-primary-600 dark:bg-primary-500 h-1.5 sm:h-2 rounded-full"
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-[#bdbdbd] w-12 sm:w-14 text-right whitespace-nowrap">
                      {category.sales} sales
                    </span>
                  </div>
                </div>
              ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-[#bdbdbd]">No category data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-[#191919] shadow rounded-lg border border-gray-200 dark:border-[#525252]">
          <div className="p-4 sm:p-5 md:p-6">
            <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
              Top Performing Products
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {analytics.topProducts.length > 0 ? (
                analytics.topProducts.map((product, index) => (
                <div
                  key={product.name}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 dark:bg-[#525252] rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                      <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                        {index + 1}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                        {product.name}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-[#bdbdbd]">
                        {product.sales} sales
                      </div>
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white flex-shrink-0 ml-2">
                    {formatCompactCurrency(product.revenue)}
                  </div>
                </div>
              ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-[#bdbdbd]">No product data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-[#191919] shadow rounded-lg border border-gray-200 dark:border-[#525252]">
          <div className="p-4 sm:p-5 md:p-6">
            <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {analytics.recentActivity.length > 0 ? (
                analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-2 sm:gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 dark:bg-[#525252] rounded-full flex items-center justify-center">
                      {activity.type === 'order' && (
                        <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
                      )}
                      {activity.type === 'customer' && (
                        <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
                      )}
                      {activity.type === 'product' && (
                        <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-900 dark:text-white break-words">
                      {activity.description}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-[#bdbdbd] mt-0.5">{activity.time}</p>
                  </div>
                  {activity.amount && (
                    <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white flex-shrink-0 ml-2">
                      {formatCompactCurrency(activity.amount)}
                    </div>
                  )}
                </div>
              ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-[#bdbdbd]">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="bg-white dark:bg-[#191919] shadow rounded-lg border border-gray-200 dark:border-[#525252]">
        <div className="p-4 sm:p-5 md:p-6">
          <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
            Business Insights
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                ₹
                {analytics.totalOrders > 0
                  ? Math.round(analytics.totalRevenue / analytics.totalOrders).toLocaleString()
                  : '0'}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-[#bdbdbd] mt-1">Average Order Value</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                {analytics.totalCustomers > 0
                  ? (Math.round((analytics.totalOrders / analytics.totalCustomers) * 100) / 100).toFixed(2)
                  : '0'}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-[#bdbdbd] mt-1">Orders per Customer</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                {analytics.totalProducts > 0
                  ? Math.round(analytics.totalRevenue / analytics.totalProducts / 1000)
                  : '0'}
                K
              </div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-[#bdbdbd] mt-1">Revenue per Product</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
