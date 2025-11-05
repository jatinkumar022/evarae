import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';
import Order from '@/models/orderModel';

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
    const orders = await Order.find({ user: id }).lean();
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
    const lastOrder = orders.length > 0 
      ? orders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
      : null;
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    const profile = (user as any).profile && typeof (user as any).profile === 'object' ? (user as any).profile : null;

    const customer = {
      _id: (user as any)._id.toString(),
      name: (user as any).name,
      email: (user as any).email,
      phone: profile?.phone || '',
      role: (user as any).role,
      isVerified: (user as any).isVerified,
      createdAt: (user as any).createdAt,
      updatedAt: (user as any).updatedAt,
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
        addresses: (profile.addresses || []).map((addr: any) => ({
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
    const orders = await Order.find({ user: id }).lean();
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
    const lastOrder = orders.length > 0 
      ? orders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
      : null;
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    const profile = (user as any).profile && typeof (user as any).profile === 'object' ? (user as any).profile : null;

    const customer = {
      _id: (user as any)._id.toString(),
      name: (user as any).name,
      email: (user as any).email,
      phone: profile?.phone || '',
      role: (user as any).role,
      isVerified: (user as any).isVerified,
      createdAt: (user as any).createdAt,
      updatedAt: (user as any).updatedAt,
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
        addresses: (profile.addresses || []).map((addr: any) => ({
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

