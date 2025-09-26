import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import jwt from 'jsonwebtoken';
import Cart from '@/models/cartModel';
import UserProfile from '@/models/userProfile';
import Order from '@/models/orderModel';
import type {
  Address,
  CartLean,
  OrderItemLean,
  UserProfileLean,
} from '@/lib/types/product';

const USER_JWT_SECRET = process.env.USER_JWT_SECRET as string;

function getUid(request: Request): string | null {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const token = cookieHeader
      .split(';')
      .map(p => p.trim())
      .find(p => p.startsWith('token='))
      ?.split('=')[1];
    if (!token || !USER_JWT_SECRET) return null;
    const payload = jwt.verify(token, USER_JWT_SECRET) as {
      uid?: string;
    } | null;
    return payload?.uid || null;
  } catch {
    return null;
  }
}

// Minimal product shape expected on populated cart items
interface PopulatedProductForOrder {
  _id: string;
  name: string;
  slug?: string;
  sku?: string;
  price?: number;
  discountPrice?: number | null;
  images?: string[];
  thumbnail?: string | null;
}

type PopulatedCartItem = CartLean['items'][number] & {
  product: PopulatedProductForOrder | null | undefined;
};

type PopulatedCart = Omit<CartLean, 'items'> & { items: PopulatedCartItem[] };

export async function POST(request: Request) {
  try {
    await connect();
    const uid = getUid(request);
    if (!uid)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { addressId, couponCode } = (await request.json()) as {
      addressId?: string;
      couponCode?: string;
    };

    const [cart, profile] = await Promise.all([
      Cart.findOne({ user: uid })
        .populate('items.product')
        .lean<PopulatedCart | null>(),
      UserProfile.findOne({ user: uid }).lean<UserProfileLean | null>(),
    ]);

    if (!cart || !cart.items || cart.items.length === 0)
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });

    const address: Address | undefined =
      (profile?.addresses || []).find(
        (a: Address) => String(a._id) === String(addressId)
      ) ||
      (profile?.addresses || []).find((a: Address) => !!a.isDefaultShipping);
    if (!address)
      return NextResponse.json(
        { error: 'No shipping address selected' },
        { status: 400 }
      );

    const items: OrderItemLean[] = cart.items.map(ci => ({
      product: ci.product?._id || '',
      name: ci.product?.name || '',
      slug: ci.product?.slug || '',
      sku: ci.product?.sku || '',
      price: (ci.product?.discountPrice ?? ci.product?.price ?? 0) || 0,
      quantity: ci.quantity || 1,
      image:
        (ci.product?.images && ci.product.images[0]) ||
        ci.product?.thumbnail ||
        null,
      selectedColor: ci.selectedColor ?? null,
      selectedSize: ci.selectedSize ?? null,
    }));

    const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const originalSubtotal = items.reduce(
      (sum, it) => sum + ((it as unknown as { price?: number }).price ?? 0),
      0
    );
    const discount = Math.max(0, originalSubtotal - subtotal);

    const shipping = 0;
    const gst = Math.round(subtotal * 0.03);
    const rpFee = Math.round(subtotal * 0.02);
    const rpFeeGst = Math.round(rpFee * 0.18);
    const paymentCharges = rpFee + rpFeeGst;

    const total = Math.max(0, subtotal + gst + shipping + paymentCharges);

    // Generate human-friendly unique order number
    const now = new Date();
    const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}${String(now.getDate()).padStart(2, '0')}`;
    let orderNumber = '';
    for (let i = 0; i < 5; i++) {
      const rand = Math.floor(1000 + Math.random() * 9000);
      const candidate = `ORD-${ymd}-${rand}`;
      const exists = await Order.exists({ orderNumber: candidate });
      if (!exists) {
        orderNumber = candidate;
        break;
      }
    }
    if (!orderNumber) {
      orderNumber = `ORD-${ymd}-${Date.now().toString().slice(-5)}`;
    }

    const order = await Order.create({
      user: uid,
      orderNumber,
      items,
      subtotalAmount: subtotal,
      taxAmount: gst,
      shippingAmount: shipping,
      discountAmount: discount,
      paymentChargesAmount: paymentCharges,
      totalAmount: total,
      paymentMethod: 'razorpay',
      paymentStatus: 'pending',
      orderStatus: 'pending',
      shippingAddress: {
        fullName: address.fullName,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
      },
      paymentProvider: 'razorpay',
      paymentProviderOrderId: null,
      couponCode: couponCode || null,
    });

    const paymentLink = `/checkout/payment?orderId=${order._id}`;

    return NextResponse.json({
      orderId: order._id,
      orderNumber: order.orderNumber,
      paymentLink,
      amount: total,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
