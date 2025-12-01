import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import jwt from 'jsonwebtoken';
import Order from '@/models/orderModel';
import { generateAndUploadInvoice } from '@/lib/invoiceGenerator';

const USER_JWT_SECRET = process.env.USER_JWT_SECRET as string;

export const runtime = 'nodejs';

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
        { error: 'Please log in to view invoice' },
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

    let invoiceUrl = order.invoiceUrl;

    // If invoice doesn't exist, generate it
    if (!invoiceUrl) {
      // Normalize order data for invoice generation
      const normalizedOrder = {
        _id: String(order._id),
        orderNumber: order.orderNumber || String(order._id),
        items: (order.items || []).map(item => ({
          name: item.name || 'Unknown Item',
          quantity: item.quantity || 0,
          price: item.price || 0,
        })),
        subtotalAmount: order.subtotalAmount || 0,
        taxAmount: order.taxAmount || 0,
        shippingAmount: order.shippingAmount || 0,
        discountAmount: order.discountAmount || 0,
        paymentChargesAmount: order.paymentChargesAmount || 0,
        totalAmount: order.totalAmount || 0,
        orderStatus: order.orderStatus || 'pending',
        paymentStatus: order.paymentStatus || 'pending',
        shippingAddress: order.shippingAddress || {},
        createdAt: order.createdAt || new Date(),
        paidAt: order.paidAt || null,
      };

      // Generate and upload invoice
      invoiceUrl = await generateAndUploadInvoice(normalizedOrder);

      // Save invoice URL to order for future use
      await Order.updateOne(
        { _id: order._id },
        { $set: { invoiceUrl } }
      ).catch(err => console.error('[orders/[id]/invoice/view] Failed to save invoice URL:', err));
    }

    // Fetch PDF from Cloudinary
    const pdfResponse = await fetch(invoiceUrl);
    if (!pdfResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch invoice' },
        { status: 500 }
      );
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();

    // Return PDF with headers that allow display in iframe
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="invoice.pdf"', // 'inline' instead of 'attachment' to display
        'Cache-Control': 'private, no-store, no-cache, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('[orders/[id]/invoice/view GET] Error:', error);
    return NextResponse.json(
      { error: 'Unable to view invoice' },
      { status: 500 }
    );
  }
}

