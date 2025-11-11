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

function normalizeEnv(value?: string | null) {
  const v = (value || '').trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    return v.slice(1, -1).trim();
  }
  return v;
}

const USER_JWT_SECRET = process.env.USER_JWT_SECRET as string;
// Normalize envs to guard against whitespace and accidental quotes
const RAZORPAY_KEY_ID = normalizeEnv(process.env.RAZORPAY_KEY_ID);
const RAZORPAY_KEY_SECRET = normalizeEnv(process.env.RAZORPAY_KEY_SECRET);

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

interface PopulatedProductForOrder {
  _id: string;
  name: string;
  slug?: string;
  sku?: string;
  price?: number;
  discountPrice?: number | null;
  images?: string[];
  originalPrice?: number | null;
}

type PopulatedCartItem = CartLean['items'][number] & {
  product: PopulatedProductForOrder | null | undefined;
};

type PopulatedCart = Omit<CartLean, 'items'> & { items: PopulatedCartItem[] };

export async function POST(request: Request) {
  try {
    await connect();
    const uid = getUid(request);
    if (!uid) {
      return NextResponse.json(
        { error: 'Please log in to create payment order' },
        { status: 401 }
      );
    }

    // Validate Razorpay credentials
    const keyIdPreview = RAZORPAY_KEY_ID
      ? `${RAZORPAY_KEY_ID.slice(0, 8)}...`
      : 'undefined';
    const keyIdLooksValid = /^rzp_(test|live)_/i.test(RAZORPAY_KEY_ID);
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        {
          error:
            'Payment gateway not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to environment variables.',
          reason: 'MISSING_KEYS',
        },
        { status: 500 }
      );
    }
    if (!keyIdLooksValid) {
      return NextResponse.json(
        {
          fallback: true,
          reason: 'RAZORPAY_BAD_CREDENTIALS_FORMAT',
          message:
            'RAZORPAY_KEY_ID is not in expected format (rzp_test_... or rzp_live_...). Please verify.',
          keyPreview: keyIdPreview,
        },
        { status: 502 }
      );
    }

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

    // Filter out any items with missing product data to avoid crashes
    const validItems = (cart.items || []).filter(
      ci =>
        ci &&
        ci.product &&
        (ci.product.price || ci.product.discountPrice || 0) >= 0
    );
    if (validItems.length === 0)
      return NextResponse.json(
        { error: 'Cart items invalid. Please refresh your cart.' },
        { status: 400 }
      );

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

    const items: OrderItemLean[] = validItems.map(ci => ({
      product: ci.product?._id || '',
      name: ci.product?.name || '',
      slug: ci.product?.slug || '',
      sku: ci.product?.sku || '',
      price: (ci.product?.discountPrice ?? ci.product?.price ?? 0) || 0,
      quantity: ci.quantity || 1,
      image:
        (ci.product?.images && ci.product.images[0]) || null,
      selectedColor: ci.selectedColor ?? null,
      selectedSize: ci.selectedSize ?? null,
    }));

    const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const originalSubtotal = items.reduce(
      (sum, it) => sum + (it.price ?? 0) * it.quantity, // safe original
      0
    );
    const discount = Math.max(0, originalSubtotal - subtotal);

    // 3% GST on discounted subtotal
    const gst = Math.round(subtotal * 0.03);

    // Razorpay fee approx: 2% + 18% GST on fee
    const rpFee = Math.round(subtotal * 0.02);
    const rpFeeGst = Math.round(rpFee * 0.18);
    const paymentCharges = rpFee + rpFeeGst;

    const shipping = 0;
    const total = Math.max(0, subtotal + gst + shipping + paymentCharges);

    // Amount must be integer paise for Razorpay
    const amountPaise = Math.round(total * 100);

    // Generate human-friendly order number: ORD-<YYYYMMDD>-<XXXX> and ensure uniqueness
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
      // Fallback with timestamp fragment to avoid collision
      orderNumber = `ORD-${ymd}-${Date.now().toString().slice(-5)}`;
    }

    if (amountPaise < 100) {
      return NextResponse.json(
        {
          fallback: true,
          reason: 'MIN_AMOUNT',
          message: 'Minimum payable amount is ₹1.00',
          keyPreview: keyIdPreview,
        },
        { status: 400 }
      );
    }

    // Create order in database
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

    try {
      // Create Razorpay order
      const { default: Razorpay } = await import('razorpay');
      const razorpayInstance = new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET,
      });

      const razorpayOrder = await razorpayInstance.orders.create({
        amount: amountPaise,
        currency: 'INR',
        receipt: `order_${order._id}`,
        notes: {
          orderId: order._id.toString(),
          userId: uid,
        },
      });

      // Update order with Razorpay order ID
      await Order.findByIdAndUpdate(order._id, {
        paymentProviderOrderId: razorpayOrder.id,
      });

      return NextResponse.json({
        orderId: order._id,
        orderNumber: order.orderNumber,
        razorpayOrderId: razorpayOrder.id,
        amount: total,
        amountPaise,
        currency: 'INR',
        key: RAZORPAY_KEY_ID,
      });
    } catch (razorpayError: unknown) {
      const err = razorpayError as {
        error?: { code?: string; description?: string };
        code?: string;
        statusCode?: number;
        status?: number;
        message?: string;
      };
      // Improve diagnostics without leaking full secrets
      const code = err?.error?.code || err?.code;
      const statusCode = err?.statusCode || err?.status;
      const description = err?.error?.description || err?.message;
      const keyPreview = keyIdPreview;

      console.error('Razorpay order creation error:', {
        statusCode,
        code,
        description,
        keyPreview,
      });

      const authFailed = statusCode === 401 || code === 'BAD_REQUEST_ERROR';

      return NextResponse.json(
        {
          orderId: order._id,
          fallback: true,
          reason: authFailed ? 'RAZORPAY_AUTH_FAILED' : 'RAZORPAY_UNAVAILABLE',
          message: authFailed
            ? 'Razorpay authentication failed. Verify RAZORPAY_KEY_ID/SECRET (test vs live) and retry.'
            : 'Payment gateway temporarily unavailable. Please try again later.',
          keyPreview,
        },
        { status: 502 }
      );
    }
  } catch (error: unknown) {
    console.error('[checkout/razorpay/create-order] Error:', error);
    return NextResponse.json(
      { error: 'Unable to create payment order. Please try again' },
      { status: 500 }
    );
  }
}
