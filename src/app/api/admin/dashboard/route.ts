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

export async function GET() {
  try {
    await connect();

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() - now.getDay());
    startOfThisWeek.setHours(0, 0, 0, 0);
    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

    // Parallelize ALL queries for maximum speed
    const [
      totalProducts,
      totalOrders,
      totalCustomers,
      activeProducts,
      lowStockProducts,
      totalRevenueResult,
      thisMonthRevenueResult,
      lastMonthRevenueResult,
      thisMonthOrdersCount,
      lastMonthOrdersCount,
      thisMonthCustomers,
      lastMonthCustomers,
      thisMonthProducts,
      lastMonthProducts,
      recentOrders,
      orderStatusBreakdown,
      paymentStatusBreakdown,
      lowStockProductsList,
      categorySales,
    ] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Product.countDocuments({ status: 'active' }),
      Product.countDocuments({ stockQuantity: { $lte: 10 }, status: 'active' }),
      Order.aggregate([{ $match: { paymentStatus: { $in: ['paid', 'completed'] } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: startOfThisMonth }, paymentStatus: { $in: ['paid', 'completed'] } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }, paymentStatus: { $in: ['paid', 'completed'] } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Order.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      Order.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      User.countDocuments({ role: 'user', createdAt: { $gte: startOfThisMonth } }),
      User.countDocuments({ role: 'user', createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      Product.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      Product.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      Order.find().select('orderNumber user totalAmount orderStatus paymentStatus createdAt items').populate('user', 'name email').sort({ createdAt: -1 }).limit(10).lean(),
      Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }]),
      Order.aggregate([{ $group: { _id: '$paymentStatus', count: { $sum: 1 } } }]),
      Product.find({ stockQuantity: { $lte: 10 }, status: 'active' }).select('name sku stockQuantity price').sort({ stockQuantity: 1 }).limit(10).lean(),
      Order.aggregate([
        { $match: { paymentStatus: { $in: ['paid', 'completed'] } } },
        { $unwind: '$items' },
        { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'productData' } },
        { $unwind: { path: '$productData', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$productData.categories', preserveNullAndEmptyArrays: true } },
        { $group: { _id: '$productData.categories', totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }, totalSales: { $sum: '$items.quantity' } } },
        { $sort: { totalRevenue: -1 } },
        { $limit: 5 }
      ]),
    ]);
    
    interface RevenueResult {
      total?: number;
    }
    
    const totalRevenue = (totalRevenueResult as RevenueResult[])[0]?.total || 0;
    const thisMonthRevenue = (thisMonthRevenueResult as RevenueResult[])[0]?.total || 0;
    const lastMonthRevenue = (lastMonthRevenueResult as RevenueResult[])[0]?.total || 0;


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


    const formattedRecentOrders = (recentOrders as unknown as OrderDocument[]).map((order: OrderDocument) => {
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

    // Top products already calculated in parallel above, but need to fetch separately
    interface TopProduct {
      _id?: unknown;
      name?: string;
      sales?: number;
      revenue?: number;
    }
    
    const topProductsAgg = await Order.aggregate([
      { $match: { paymentStatus: { $in: ['paid', 'completed'] } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.product', name: { $first: '$items.name' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }, sales: { $sum: '$items.quantity' } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);
    
    const topProductsWithDetails = (topProductsAgg as TopProduct[]).map((p) => ({ name: p.name || 'Unknown Product', sales: p.sales || 0, revenue: p.revenue || 0, _id: p._id?.toString() }));

    const statusMap: Record<string, number> = {};
    (orderStatusBreakdown as OrderStatusBreakdown[]).forEach((item: OrderStatusBreakdown) => {
      statusMap[item._id] = item.count;
    });
    const paymentMap: Record<string, number> = {};
    (paymentStatusBreakdown as PaymentStatusBreakdown[]).forEach((item: PaymentStatusBreakdown) => {
      paymentMap[item._id] = item.count;
    });

    const formattedLowStock = (lowStockProductsList as unknown as ProductDocument[]).map((product: ProductDocument) => ({
      _id: product._id.toString(),
      name: product.name || 'Unknown Product',
      sku: product.sku || '',
      stockQuantity: product.stockQuantity || 0,
      price: product.price || 0,
    }));


    const categoryIds = (categorySales as CategorySales[]).map((cat: CategorySales) => cat._id).filter((id): id is mongoose.Types.ObjectId => id !== null && id !== undefined && id instanceof mongoose.Types.ObjectId);
    const categories = categoryIds.length > 0 ? await Category.find({ _id: { $in: categoryIds } }).select('name').lean() as unknown as CategoryDocument[] : [];
    const categoryMap = new Map<string, string>();
    categories.forEach((cat: CategoryDocument) => categoryMap.set(cat._id.toString(), cat.name));
    const topCategories = (categorySales as CategorySales[]).map((cat: CategorySales) => {
      const categoryId = cat._id instanceof mongoose.Types.ObjectId ? cat._id.toString() : (cat._id ? String(cat._id) : '');
      return { name: categoryMap.get(categoryId) || 'Uncategorized', sales: cat.totalSales || 0, revenue: cat.totalRevenue || 0 };
    }).filter((cat) => cat.name !== 'Uncategorized' || categorySales.length === 0);

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

