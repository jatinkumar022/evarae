import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Order from '@/models/orderModel';
import User from '@/models/userModel';
import Product from '@/models/productModel';

// Helper function to get date range based on time period
function getDateRange(timeRange: string) {
  const now = new Date();
  const ranges: Record<string, { start: Date; previousStart: Date }> = {
    '7days': {
      start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      previousStart: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
    },
    '30days': {
      start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      previousStart: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
    },
    '3months': {
      start: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      previousStart: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
    },
    '6months': {
      start: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
      previousStart: new Date(now.getTime() - 360 * 24 * 60 * 60 * 1000),
    },
    '1year': {
      start: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
      previousStart: new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000),
    },
  };
  return ranges[timeRange] || ranges['6months'];
}

// Helper to calculate growth percentage
function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// GET: Analytics data
export async function GET(request: Request) {
  try {
    await connect();

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '6months';

    const { start, previousStart } = getDateRange(timeRange);
    const now = new Date();

    // Current period queries
    const currentPeriodStart = start;
    const currentPeriodEnd = now;

    // Previous period queries (for growth calculation)
    const previousPeriodStart = previousStart;
    const previousPeriodEnd = start;

    // Parallelize ALL period queries
    const [
      currentRevenueResult,
      previousRevenueResult,
      currentOrdersCount,
      previousOrdersCount,
      currentCustomersResult,
      previousCustomersResult,
      currentProductsCount,
      previousProductsCount,
    ] = await Promise.all([
      Order.aggregate([{ $match: { createdAt: { $gte: currentPeriodStart, $lte: currentPeriodEnd }, paymentStatus: { $in: ['paid', 'completed'] } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: previousPeriodStart, $lte: previousPeriodEnd }, paymentStatus: { $in: ['paid', 'completed'] } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Order.countDocuments({ createdAt: { $gte: currentPeriodStart, $lte: currentPeriodEnd } }),
      Order.countDocuments({ createdAt: { $gte: previousPeriodStart, $lte: previousPeriodEnd } }),
      Order.distinct('user', { createdAt: { $gte: currentPeriodStart, $lte: currentPeriodEnd } }),
      Order.distinct('user', { createdAt: { $gte: previousPeriodStart, $lte: previousPeriodEnd } }),
      Product.countDocuments({ createdAt: { $gte: currentPeriodStart, $lte: currentPeriodEnd } }),
      Product.countDocuments({ createdAt: { $gte: previousPeriodStart, $lte: previousPeriodEnd } }),
    ]);
    interface RevenueResult {
      total?: number;
    }
    interface CustomerResult {
      _id?: unknown;
    }
    
    const currentRevenue = (currentRevenueResult as RevenueResult[])[0]?.total || 0;
    const previousRevenue = (previousRevenueResult as RevenueResult[])[0]?.total || 0;
    const currentCustomersCount = (currentCustomersResult as CustomerResult[]).length;
    const previousCustomersCount = (previousCustomersResult as CustomerResult[]).length;


    // Calculate growth percentages
    const revenueGrowth = calculateGrowth(currentRevenue, previousRevenue);
    const ordersGrowth = calculateGrowth(currentOrdersCount, previousOrdersCount);
    const customersGrowth = calculateGrowth(currentCustomersCount, previousCustomersCount);
    const productsGrowth = calculateGrowth(currentProductsCount, previousProductsCount);

    // Parallelize all remaining queries
    const [monthlyRevenueData, topCategoriesData, topProductsData, recentOrders, recentCustomers, recentProducts, totalCustomers, totalProducts] = await Promise.all([
      Order.aggregate([{ $match: { createdAt: { $gte: currentPeriodStart, $lte: currentPeriodEnd }, paymentStatus: { $in: ['paid', 'completed'] } } }, { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$totalAmount' } } }, { $sort: { '_id.year': 1, '_id.month': 1 } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: currentPeriodStart, $lte: currentPeriodEnd }, paymentStatus: { $in: ['paid', 'completed'] } } }, { $unwind: '$items' }, { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'productData' } }, { $unwind: '$productData' }, { $unwind: '$productData.categories' }, { $lookup: { from: 'categories', localField: 'productData.categories', foreignField: '_id', as: 'categoryData' } }, { $unwind: '$categoryData' }, { $group: { _id: '$categoryData._id', name: { $first: '$categoryData.name' }, sales: { $sum: '$items.quantity' } } }, { $sort: { sales: -1 } }, { $limit: 5 }]),
      Order.aggregate([{ $match: { createdAt: { $gte: currentPeriodStart, $lte: currentPeriodEnd }, paymentStatus: { $in: ['paid', 'completed'] } } }, { $unwind: '$items' }, { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'productData' } }, { $unwind: '$productData' }, { $group: { _id: '$items.product', name: { $first: '$productData.name' }, sales: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } }, { $sort: { sales: -1 } }, { $limit: 5 }]),
      Order.find({ createdAt: { $gte: currentPeriodStart, $lte: currentPeriodEnd } }).select('orderNumber totalAmount createdAt').sort({ createdAt: -1 }).limit(5).lean(),
      User.find({ role: 'user', createdAt: { $gte: currentPeriodStart, $lte: currentPeriodEnd } }).select('_id createdAt').sort({ createdAt: -1 }).limit(3).lean(),
      Product.find({ createdAt: { $gte: currentPeriodStart, $lte: currentPeriodEnd } }).select('_id name createdAt').sort({ createdAt: -1 }).limit(2).lean(),
      User.countDocuments({ role: 'user' }),
      Product.countDocuments(),
    ]);
    
    interface MonthlyRevenueItem {
      _id: { year: number; month: number };
      revenue: number;
    }
    interface CategoryData {
      _id: unknown;
      name: string;
      sales: number;
    }
    interface ProductData {
      _id: unknown;
      name: string;
      sales: number;
      revenue: number;
    }
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenue = (monthlyRevenueData as MonthlyRevenueItem[]).map((item) => ({ month: monthNames[item._id.month - 1], revenue: item.revenue }));
    const totalCategorySales = (topCategoriesData as CategoryData[]).reduce((sum: number, cat) => sum + cat.sales, 0);
    const topCategories = (topCategoriesData as CategoryData[]).map((cat) => ({ name: cat.name, sales: cat.sales, percentage: totalCategorySales > 0 ? Math.round((cat.sales / totalCategorySales) * 100) : 0 }));
    const topProducts = (topProductsData as ProductData[]).map((product) => ({ name: product.name, sales: product.sales, revenue: product.revenue }));

    // Format recent activity
    const formatTimeAgo = (date: Date) => {
      const now = new Date();
      const diffMs = now.getTime() - new Date(date).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
      if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    };

    const recentActivity: Array<{
      type: string;
      description: string;
      time: string;
      amount?: number;
      createdAt: Date;
    }> = [];

    recentOrders.forEach((order) => {
      const orderId = order._id ? String(order._id) : '';
      recentActivity.push({
        type: 'order',
        description: `New order #${order.orderNumber || orderId.slice(-6)} placed`,
        time: formatTimeAgo(order.createdAt),
        amount: order.totalAmount,
        createdAt: order.createdAt,
      });
    });

    recentCustomers.forEach((customer) => {
      recentActivity.push({
        type: 'customer',
        description: 'New customer registered',
        time: formatTimeAgo(customer.createdAt),
        createdAt: customer.createdAt,
      });
    });

    recentProducts.forEach((product) => {
      recentActivity.push({
        type: 'product',
        description: `Product ${product.name} added`,
        time: formatTimeAgo(product.createdAt),
        createdAt: product.createdAt,
      });
    });

    // Sort by date (most recent first) and limit to 5
    recentActivity.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Remove createdAt before returning
    const formattedActivity = recentActivity.slice(0, 5).map(({ createdAt: _createdAt, ...rest }) => {
      void _createdAt; // Explicitly mark as intentionally unused
      return rest;
    });


    return NextResponse.json({
      totalRevenue: currentRevenue,
      totalOrders: currentOrdersCount,
      totalCustomers: totalCustomers, // All-time customers
      totalProducts: totalProducts, // All-time products
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      ordersGrowth: Math.round(ordersGrowth * 10) / 10,
      customersGrowth: Math.round(customersGrowth * 10) / 10,
      productsGrowth: Math.round(productsGrowth * 10) / 10,
      monthlyRevenue: monthlyRevenue.length > 0 ? monthlyRevenue : [],
      topCategories: topCategories.length > 0 ? topCategories : [],
      topProducts: topProducts.length > 0 ? topProducts : [],
      recentActivity: formattedActivity,
    });
  } catch (error) {
    console.error('Analytics GET error:', error);
    return NextResponse.json(
      { error: 'Unable to load analytics. Please try again later' },
      { status: 500 }
    );
  }
}

