import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import jwt from 'jsonwebtoken';
import Order from '@/models/orderModel';
import { generateAndUploadInvoice } from '@/lib/invoiceGenerator';

// Ensure this route runs in the Node.js runtime (not Edge),
// which is required for PDF generation.
export const runtime = 'nodejs';

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

type HtmlOrder = {
  _id: string;
  orderNumber?: string;
  items: Array<{
    name?: string;
    quantity?: number;
    price?: number;
  }>;
  subtotalAmount?: number;
  taxAmount?: number;
  shippingAmount?: number;
  discountAmount?: number;
  paymentChargesAmount?: number;
  totalAmount?: number;
  orderStatus?: string;
  paymentStatus?: string;
  shippingAddress?: {
    fullName?: string;
    phone?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  createdAt?: string | Date;
  courierName?: string | null;
  trackingNumber?: string | null;
  paidAt?: string | Date | null;
  invoiceUrl?: string | null;
};

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connect();
    const uid = getUid(request);
    if (!uid) {
      return NextResponse.json(
        { error: 'Please log in to download invoice' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const key = id;
    const order = (await Order.findOne(
      key.startsWith('ORD-')
        ? { orderNumber: key, user: uid }
        : { _id: key, user: uid }
    )
      .select('_id orderNumber items subtotalAmount taxAmount shippingAmount discountAmount paymentChargesAmount totalAmount orderStatus paymentStatus shippingAddress createdAt courierName trackingNumber paidAt invoiceUrl')
      .lean()) as unknown as HtmlOrder & { invoiceUrl?: string | null } | null;

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if invoice URL already exists in order
    const orderWithInvoice = order as HtmlOrder & { invoiceUrl?: string | null };
    if (orderWithInvoice.invoiceUrl) {
      // Return existing invoice URL
      const fileName = `invoice-${order.orderNumber || order._id}.pdf`;
      return NextResponse.json(
        {
          url: orderWithInvoice.invoiceUrl,
          fileName,
          cached: true,
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'private, no-store, no-cache, must-revalidate',
          },
        }
      );
    }

    // If invoice doesn't exist, generate and upload it
    // Ensure all required fields have default values
    const normalizedOrder = {
      _id: String(order._id),
      orderNumber: order.orderNumber,
      items: (order.items || []).map(item => {
        // Validate item data
        const itemName = item.name || 'Unknown Product';
        const itemPrice = typeof item.price === 'number' ? item.price : 0;
        const itemQuantity = typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1;
        
        if (!itemName || itemPrice < 0 || itemQuantity < 1) {
          console.warn('[orders/[id]/invoice] Invalid item data', item);
        }
        
        return {
          name: itemName,
          price: itemPrice,
          quantity: itemQuantity,
        };
      }),
      subtotalAmount: typeof order.subtotalAmount === 'number' ? order.subtotalAmount : 0,
      taxAmount: typeof order.taxAmount === 'number' ? order.taxAmount : 0,
      shippingAmount: typeof order.shippingAmount === 'number' ? order.shippingAmount : 0,
      discountAmount: typeof order.discountAmount === 'number' ? order.discountAmount : 0,
      paymentChargesAmount: typeof order.paymentChargesAmount === 'number' ? order.paymentChargesAmount : 0,
      totalAmount: typeof order.totalAmount === 'number' ? order.totalAmount : 0,
      orderStatus: order.orderStatus || 'pending',
      paymentStatus: order.paymentStatus || 'pending',
      shippingAddress: order.shippingAddress || {},
      createdAt: order.createdAt || new Date(),
      paidAt: order.paidAt || new Date(),
    };

    // Validate order has items
    if (!normalizedOrder.items || normalizedOrder.items.length === 0) {
      console.error('[orders/[id]/invoice] Order has no items', { orderId: order._id });
      return NextResponse.json(
        { error: 'Order has no items to generate invoice' },
        { status: 400 }
      );
    }

    console.log('[orders/[id]/invoice] Generating invoice', {
      orderId: normalizedOrder._id,
      itemsCount: normalizedOrder.items.length,
      totalAmount: normalizedOrder.totalAmount,
    });

    // Generate and upload invoice
    const invoiceUrl = await generateAndUploadInvoice(normalizedOrder);

    // Save invoice URL to order for future use
    await Order.updateOne(
      { _id: order._id },
      { $set: { invoiceUrl } }
    ).catch(err => console.error('[orders/[id]/invoice] Failed to save invoice URL:', err));

    // Return Cloudinary URL
    const fileName = `invoice-${normalizedOrder.orderNumber || normalizedOrder._id}.pdf`;
    return NextResponse.json(
      {
        url: invoiceUrl,
        fileName,
        cached: false,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'private, no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('[orders/[id]/invoice GET] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Error ? error.stack : String(error);
    console.error('[orders/[id]/invoice GET] Error details:', errorDetails);
    return NextResponse.json(
      { 
        error: 'Unable to generate invoice. Please try again later',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
