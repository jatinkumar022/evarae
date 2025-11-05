import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Product from '@/models/productModel';
import Order from '@/models/orderModel';
import User from '@/models/userModel';
import Category from '@/models/categoryModel';
import mongoose from 'mongoose';

interface OrderDocument {
  _id: mongoose.Types.ObjectId;
  orderNumber?: string;
  user?: mongoose.Types.ObjectId | { name?: string; email?: string };
  items?: Array<{
    product: mongoose.Types.ObjectId | string;
    name?: string;
    price?: number;
    quantity?: number;
  }>;
  totalAmount?: number;
  orderStatus?: string;
  paymentStatus?: string;
  createdAt?: Date;
}

interface ProductDocument {
  _id: mongoose.Types.ObjectId;
  name?: string;
  sku?: string;
  stockQuantity?: number;
  price?: number;
}

interface CategoryDocument {
  _id: mongoose.Types.ObjectId;
  name: string;
}

interface OrderStatusBreakdown {
  _id: string;
  count: number;
}

interface PaymentStatusBreakdown {
  _id: string;
  count: number;
}

interface CategorySales {
  _id: mongoose.Types.ObjectId | null;
  totalRevenue: number;
  totalSales: number;
}

export async function GET(request: Request) {
  try {
    await connect();

    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() - now.getDay());
    startOfThisWeek.setHours(0, 0, 0, 0);
    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

    // Total counts
    const [
      totalProducts,
      totalOrders,
      totalCustomers,
      activeProducts,
      lowStockProducts,
    ] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Product.countDocuments({ status: 'active' }),
      Product.countDocuments({ stockQuantity: { $lte: 10 }, status: 'active' }),
    ]);

    // Revenue calculations
    const allOrders = await Order.find({ paymentStatus: { $in: ['paid', 'completed'] } }).lean() as unknown as OrderDocument[];
    const totalRevenue = allOrders.reduce((sum: number, order: OrderDocument) => sum + (order.totalAmount || 0), 0);

    // This month revenue
    const thisMonthOrders = await Order.find({
      createdAt: { $gte: startOfThisMonth },
      paymentStatus: { $in: ['paid', 'completed'] },
    }).lean() as unknown as OrderDocument[];
    const thisMonthRevenue = thisMonthOrders.reduce((sum: number, order: OrderDocument) => sum + (order.totalAmount || 0), 0);

    // Last month revenue
    const lastMonthOrders = await Order.find({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      paymentStatus: { $in: ['paid', 'completed'] },
    }).lean() as unknown as OrderDocument[];
    const lastMonthRevenue = lastMonthOrders.reduce((sum: number, order: OrderDocument) => sum + (order.totalAmount || 0), 0);

    // This week orders
    const thisWeekOrders = await Order.countDocuments({
      createdAt: { $gte: startOfThisWeek },
    });

    // Last week orders
    const lastWeekOrders = await Order.countDocuments({
      createdAt: { $gte: startOfLastWeek, $lt: startOfThisWeek },
    });

    // This month orders
    const thisMonthOrdersCount = await Order.countDocuments({
      createdAt: { $gte: startOfThisMonth },
    });

    // Last month orders
    const lastMonthOrdersCount = await Order.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
    });

    // This month customers
    const thisMonthCustomers = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: startOfThisMonth },
    });

    // Last month customers
    const lastMonthCustomers = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
    });

    // This month products
    const thisMonthProducts = await Product.countDocuments({
      createdAt: { $gte: startOfThisMonth },
    });

    // Last month products
    const lastMonthProducts = await Product.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
    });

    // Calculate growth percentages
    const revenueGrowth = lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : thisMonthRevenue > 0 ? 100 : 0;

    const ordersGrowth = lastMonthOrdersCount > 0
      ? ((thisMonthOrdersCount - lastMonthOrdersCount) / lastMonthOrdersCount) * 100
      : thisMonthOrdersCount > 0 ? 100 : 0;

    const customersGrowth = lastMonthCustomers > 0
      ? ((thisMonthCustomers - lastMonthCustomers) / lastMonthCustomers) * 100
      : thisMonthCustomers > 0 ? 100 : 0;

    const productsGrowth = lastMonthProducts > 0
      ? ((thisMonthProducts - lastMonthProducts) / lastMonthProducts) * 100
      : thisMonthProducts > 0 ? 100 : 0;

    // Recent orders (last 10)
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean() as unknown as OrderDocument[];

    // Format recent orders
    const formattedRecentOrders = recentOrders.map((order: OrderDocument) => {
      const userObj = order.user && typeof order.user === 'object' && !(order.user instanceof mongoose.Types.ObjectId)
        ? order.user as { name?: string; email?: string }
        : null;
      
      return {
        _id: order._id.toString(),
        orderNumber: order.orderNumber || order._id.toString(),
        customer: userObj?.name || 'Unknown',
        customerEmail: userObj?.email || '',
        totalAmount: order.totalAmount || 0,
        orderStatus: order.orderStatus || 'pending',
        paymentStatus: order.paymentStatus || 'pending',
        createdAt: order.createdAt,
        itemsCount: order.items?.length || 0,
      };
    });

    // Top products by revenue (from orders)
    const productRevenueMap = new Map<string, { name: string; revenue: number; sales: number }>();
    
    allOrders.forEach((order: OrderDocument) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item) => {
          const productId = item.product instanceof mongoose.Types.ObjectId 
            ? item.product.toString() 
            : typeof item.product === 'string' 
            ? item.product 
            : null;
          const revenue = (item.price || 0) * (item.quantity || 0);
          
          if (productId) {
            const current = productRevenueMap.get(productId) || { name: item.name || 'Unknown Product', revenue: 0, sales: 0 };
            current.revenue += revenue;
            current.sales += item.quantity || 0;
            productRevenueMap.set(productId, current);
          }
        });
      }
    });

    // Get top products by revenue
    const topProductsByRevenue = Array.from(productRevenueMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Fetch product names for top products
    const topProductsWithDetails = await Promise.all(
      topProductsByRevenue.map(async (product) => {
        // Try to find product by name first, then by other means
        const dbProduct = await Product.findOne({ name: product.name }).lean() as ProductDocument | null;
        return {
          name: product.name,
          sales: product.sales,
          revenue: product.revenue,
          _id: dbProduct?._id?.toString(),
        };
      })
    );

    // Order status breakdown
    const orderStatusBreakdown = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
        },
      },
    ]);

    const statusMap: Record<string, number> = {};
    (orderStatusBreakdown as OrderStatusBreakdown[]).forEach((item: OrderStatusBreakdown) => {
      statusMap[item._id] = item.count;
    });

    // Payment status breakdown
    const paymentStatusBreakdown = await Order.aggregate([
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
        },
      },
    ]);

    const paymentMap: Record<string, number> = {};
    (paymentStatusBreakdown as PaymentStatusBreakdown[]).forEach((item: PaymentStatusBreakdown) => {
      paymentMap[item._id] = item.count;
    });

    // Low stock products
    const lowStockProductsList = await Product.find({
      stockQuantity: { $lte: 10 },
      status: 'active',
    })
      .select('name sku stockQuantity price')
      .sort({ stockQuantity: 1 })
      .limit(10)
      .lean();

    const formattedLowStock = (lowStockProductsList as unknown as ProductDocument[]).map((product: ProductDocument) => ({
      _id: product._id.toString(),
      name: product.name || 'Unknown Product',
      sku: product.sku || '',
      stockQuantity: product.stockQuantity || 0,
      price: product.price || 0,
    }));

    // Category sales breakdown
    const categorySales = await Order.aggregate([
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productData',
        },
      },
      { $unwind: { path: '$productData', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$productData.categories', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$productData.categories',
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          totalSales: { $sum: '$items.quantity' },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
    ]);

    const categoryIds = (categorySales as CategorySales[])
      .map((cat: CategorySales) => cat._id)
      .filter((id): id is mongoose.Types.ObjectId => 
        id !== null && id !== undefined && id instanceof mongoose.Types.ObjectId
      );
    const categories = await Category.find({ _id: { $in: categoryIds } }).lean() as unknown as CategoryDocument[];
    const categoryMap = new Map<string, string>();
    categories.forEach((cat: CategoryDocument) => {
      categoryMap.set(cat._id.toString(), cat.name);
    });

    const topCategories = (categorySales as CategorySales[])
      .map((cat: CategorySales) => {
        let categoryId = '';
        if (cat._id instanceof mongoose.Types.ObjectId) {
          categoryId = cat._id.toString();
        } else if (cat._id !== null && cat._id !== undefined) {
          categoryId = String(cat._id);
        }
        return {
          name: categoryMap.get(categoryId) || 'Uncategorized',
          sales: cat.totalSales || 0,
          revenue: cat.totalRevenue || 0,
        };
      })
      .filter((cat) => cat.name !== 'Uncategorized' || categorySales.length === 0);

    return NextResponse.json({
      stats: {
        totalProducts,
        activeProducts,
        totalOrders,
        totalCustomers,
        totalRevenue,
        thisMonthRevenue,
        lowStockProducts,
        productsGrowth: Math.round(productsGrowth * 10) / 10,
        ordersGrowth: Math.round(ordersGrowth * 10) / 10,
        customersGrowth: Math.round(customersGrowth * 10) / 10,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      },
      recentOrders: formattedRecentOrders,
      topProducts: topProductsWithDetails,
      orderStatusBreakdown: statusMap,
      paymentStatusBreakdown: paymentMap,
      lowStockProducts: formattedLowStock,
      topCategories: topCategories.length > 0 ? topCategories : [],
    });
  } catch (error) {
    console.error('Admin Dashboard GET error:', error);
    return NextResponse.json(
      { error: 'Unable to load dashboard data. Please try again later' },
      { status: 500 }
    );
  }
}

