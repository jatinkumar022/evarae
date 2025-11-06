import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';
import Order from '@/models/orderModel';
import mongoose from 'mongoose';

// Type definitions
interface Address {
  _id?: mongoose.Types.ObjectId | string;
  label?: string;
  fullName?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
}

interface UserProfile {
  _id?: mongoose.Types.ObjectId | string;
  phone?: string;
  gender?: string;
  dob?: Date;
  newsletterOptIn?: boolean;
  smsNotifications?: boolean;
  emailNotifications?: boolean;
  orderUpdates?: boolean;
  promotionalEmails?: boolean;
  language?: string;
  twoFactorEnabled?: boolean;
  addresses?: Address[];
}

interface LeanUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  profile?: UserProfile | mongoose.Types.ObjectId;
}

interface OrderStat {
  _id: mongoose.Types.ObjectId;
  totalOrders?: number;
  totalSpent?: number;
  lastOrderDate?: Date | null;
}

// GET: List customers with filters, search, pagination
export async function GET(request: Request) {
  try {
    await connect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const role = searchParams.get('role') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build filter
    const filter: Record<string, unknown> = { role: 'user' }; // Only get regular users, not admins
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (role) filter.role = role;
    
    if (status === 'verified') filter.isVerified = true;
    if (status === 'unverified') filter.isVerified = false;

    // Build sort
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Parallelize user fetch and count
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-__v')
        .populate({
          path: 'profile',
          model: 'UserProfile',
        })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter)
    ]);

    // Get all order stats in one aggregation (much faster than per-user queries)
    const userIds = (users as unknown as LeanUser[]).map(u => u._id);
    const orderStats = userIds.length > 0 ? await Order.aggregate([
      { $match: { user: { $in: userIds } } },
      { $group: {
        _id: '$user',
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: '$totalAmount' },
        lastOrderDate: { $max: '$createdAt' }
      }}
    ]) : [];
    const statsMap = new Map<string, { totalOrders: number; totalSpent: number; lastOrderDate: Date | null }>();
    (orderStats as OrderStat[]).forEach((stat) => {
      const userId = stat._id?.toString();
      if (userId) statsMap.set(userId, { totalOrders: stat.totalOrders || 0, totalSpent: stat.totalSpent || 0, lastOrderDate: stat.lastOrderDate || null });
    });
    
    const customers = (users as unknown as LeanUser[]).map((user: LeanUser) => {
      const stats = statsMap.get(user._id.toString()) || { totalOrders: 0, totalSpent: 0, lastOrderDate: null };
      const averageOrderValue = stats.totalOrders > 0 ? stats.totalSpent / stats.totalOrders : 0;
      const profile = user.profile && typeof user.profile === 'object' && !(user.profile instanceof mongoose.Types.ObjectId) ? user.profile as UserProfile : null;
      return {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: profile?.phone || '',
          role: user.role,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          profile: profile ? {
            _id: profile._id?.toString() || '',
            phone: profile.phone || '',
            gender: profile.gender,
            dob: profile.dob,
            newsletterOptIn: profile.newsletterOptIn,
            smsNotifications: profile.smsNotifications,
            emailNotifications: profile.emailNotifications,
            orderUpdates: profile.orderUpdates,
            promotionalEmails: profile.promotionalEmails,
            language: profile.language,
            twoFactorEnabled: profile.twoFactorEnabled,
            addresses: (profile.addresses || []).map((addr: Address) => ({
              _id: addr._id?.toString() || '',
              label: addr.label || '',
              fullName: addr.fullName || '',
              phone: addr.phone || '',
              line1: addr.line1 || '',
              line2: addr.line2 || '',
              city: addr.city || '',
              state: addr.state || '',
              postalCode: addr.postalCode || '',
              country: addr.country || 'IN',
              isDefaultShipping: addr.isDefaultShipping || false,
              isDefaultBilling: addr.isDefaultBilling || false,
            })),
          } : undefined,
          totalOrders: stats.totalOrders,
          totalSpent: stats.totalSpent,
          lastOrderDate: stats.lastOrderDate,
          averageOrderValue,
        };
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      customers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Admin Customers GET error:', error);
    return NextResponse.json(
      { error: 'Unable to load customers. Please try again later' },
      { status: 500 }
    );
  }
}

