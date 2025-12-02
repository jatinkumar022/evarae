import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import jwt from 'jsonwebtoken';
import Order from '@/models/orderModel';
import { generateAndUploadInvoice } from '@/lib/invoiceGenerator';

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

    // Check if invoice URL exists, if not generate it
    let invoiceUrl = (order as HtmlOrder & { invoiceUrl?: string | null }).invoiceUrl;
    
    if (!invoiceUrl) {
      // Generate invoice if it doesn't exist
      const normalizedOrder = {
        _id: String(order._id),
        orderNumber: order.orderNumber,
        items: (order.items || []).map(item => ({
          name: item.name || 'Unknown Product',
          price: typeof item.price === 'number' ? item.price : 0,
          quantity: typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1,
        })),
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

      invoiceUrl = await generateAndUploadInvoice(normalizedOrder);
      
      // Save invoice URL to order
      await Order.updateOne(
        { _id: order._id },
        { $set: { invoiceUrl } }
      ).catch(err => console.error('[orders/[id]/invoice/download] Failed to save invoice URL:', err));
    }

    // Fetch PDF from Cloudinary
    const pdfResponse = await fetch(invoiceUrl);
    if (!pdfResponse.ok) {
      throw new Error('Failed to fetch PDF from Cloudinary');
    }

    // Get the full PDF buffer - ensure we read the complete response
    const pdfBuffer = await pdfResponse.arrayBuffer();
    
    // Validate buffer size - if it's suspiciously small, there might be an issue
    if (!pdfBuffer || pdfBuffer.byteLength < 1000) {
      console.error(`[orders/[id]/invoice/download] PDF buffer is too small: ${pdfBuffer.byteLength} bytes`);
      throw new Error('PDF file appears to be corrupted or incomplete');
    }

    // Ensure filename always has .pdf extension
    let fileName = `invoice-${order.orderNumber || order._id}`;
    fileName = fileName.replace(/\.(pdf|PDF)$/, '');
    fileName = `${fileName}.pdf`;
    
    // Sanitize filename for Content-Disposition header
    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');

    // Convert ArrayBuffer to Buffer for NextResponse
    const buffer = Buffer.from(pdfBuffer);

    // Return PDF with proper headers for mobile compatibility
    // Ensure Content-Length matches actual buffer size
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeFileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        'Content-Length': buffer.length.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'private, no-store, no-cache, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('[orders/[id]/invoice/download GET] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Unable to download invoice. Please try again later',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}

