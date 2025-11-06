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

interface LeanOrder {
  _id: mongoose.Types.ObjectId;
  totalAmount?: number;
  createdAt?: Date;
}

// GET: Get single customer by ID
export async function GET(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    await connect();
    const { id } = await ctx.params;

    const user = await User.findById(id)
      .populate({
        path: 'profile',
        model: 'UserProfile',
      })
      .lean();

    if (!user) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Get order statistics
    const orders = (await Order.find({ user: id }).lean()) as unknown as LeanOrder[];
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum: number, order: LeanOrder) => sum + (order.totalAmount || 0), 0);
    const lastOrder = orders.length > 0 
      ? orders.sort((a: LeanOrder, b: LeanOrder) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        })[0]
      : null;
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    const leanUser = user as LeanUser;
    const profile = leanUser.profile && typeof leanUser.profile === 'object' && !(leanUser.profile instanceof mongoose.Types.ObjectId) ? leanUser.profile as UserProfile : null;

    const customer = {
      _id: leanUser._id.toString(),
      name: leanUser.name,
      email: leanUser.email,
      phone: profile?.phone || '',
      role: leanUser.role,
      isVerified: leanUser.isVerified,
      createdAt: leanUser.createdAt,
      updatedAt: leanUser.updatedAt,
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
      totalOrders,
      totalSpent,
      lastOrderDate: lastOrder ? lastOrder.createdAt : null,
      averageOrderValue,
    };

    return NextResponse.json({ customer });
  } catch (error) {
    console.error('Admin Customer GET error:', error);
    return NextResponse.json(
      { error: 'Unable to load customer. Please try again later' },
      { status: 500 }
    );
  }
}

// PATCH: Update customer
export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    await connect();
    const { id } = await ctx.params;
    const body = await request.json();

    const allowedUpdates = ['name', 'isVerified'];
    const updates: Record<string, unknown> = {};
    
    Object.keys(body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate({
        path: 'profile',
        model: 'UserProfile',
      })
      .lean();

    if (!user) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Get order statistics
    const orders = (await Order.find({ user: id }).lean()) as unknown as LeanOrder[];
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum: number, order: LeanOrder) => sum + (order.totalAmount || 0), 0);
    const lastOrder = orders.length > 0 
      ? orders.sort((a: LeanOrder, b: LeanOrder) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        })[0]
      : null;
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    const leanUser = user as LeanUser;
    const profile = leanUser.profile && typeof leanUser.profile === 'object' && !(leanUser.profile instanceof mongoose.Types.ObjectId) ? leanUser.profile as UserProfile : null;

    const customer = {
      _id: leanUser._id.toString(),
      name: leanUser.name,
      email: leanUser.email,
      phone: profile?.phone || '',
      role: leanUser.role,
      isVerified: leanUser.isVerified,
      createdAt: leanUser.createdAt,
      updatedAt: leanUser.updatedAt,
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
      totalOrders,
      totalSpent,
      lastOrderDate: lastOrder ? lastOrder.createdAt : null,
      averageOrderValue,
    };

    return NextResponse.json({ customer });
  } catch (error) {
    console.error('Admin Customer PATCH error:', error);
    return NextResponse.json(
      { error: 'Unable to update customer. Please try again later' },
      { status: 500 }
    );
  }
}

// DELETE: Delete customer
export async function DELETE(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    await connect();
    const { id } = await ctx.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Admin Customer DELETE error:', error);
    return NextResponse.json(
      { error: 'Unable to delete customer. Please try again later' },
      { status: 500 }
    );
  }
}

