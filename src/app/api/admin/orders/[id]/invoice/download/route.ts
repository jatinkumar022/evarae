import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import jwt from 'jsonwebtoken';
import Order from '@/models/orderModel';
import { generatePDF } from '@/lib/invoiceGenerator';

export const runtime = 'nodejs';

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET as string;

function getAdminId(request: Request): string | null {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const token = cookieHeader
      .split(';')
      .map(p => p.trim())
      .find(p => p.startsWith('adminToken='))
      ?.split('=')[1];
    if (!token || !ADMIN_JWT_SECRET) return null;
    const payload = jwt.verify(token, ADMIN_JWT_SECRET) as {
      uid?: string;
      role?: string;
    } | null;
    if (!payload || payload.role !== 'admin') return null;
    return payload.uid || null;
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
  discountAmount?: number;
  taxAmount?: number;
  shippingAmount?: number;
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
  trackingNumber?: string | null;
  paidAt?: string | Date | null;
  createdAt?: string | Date;
};

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connect();
    const adminId = getAdminId(request);
    if (!adminId) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const key = id;
    const order = (await Order.findOne(
      key.startsWith('ORD-')
        ? { orderNumber: key }
        : { _id: key }
    )
      .select('_id orderNumber items subtotalAmount taxAmount shippingAmount discountAmount paymentChargesAmount totalAmount orderStatus paymentStatus shippingAddress createdAt trackingNumber paidAt')
      .lean()) as unknown as HtmlOrder | null;

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Generate PDF on-demand (no Cloudinary storage needed)
    console.log('[admin/orders/[id]/invoice/download] Generating PDF on-demand', {
      orderId: order._id,
      orderNumber: order.orderNumber,
    });

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

    // Generate PDF directly
    const pdfBuffer = await generatePDF(normalizedOrder);
    
    // Validate PDF buffer
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('Generated PDF buffer is empty');
    }
    
    if (pdfBuffer.length < 5000) {
      throw new Error(`Generated PDF is too small (${pdfBuffer.length} bytes). Expected at least 5KB.`);
    }
    
    // Validate PDF header
    const pdfHeader = pdfBuffer.toString('ascii', 0, 4);
    if (pdfHeader !== '%PDF') {
      throw new Error(`Invalid PDF header: ${pdfHeader}. PDF may be corrupted.`);
    }

    console.log('[admin/orders/[id]/invoice/download] PDF generated successfully', {
      orderId: order._id,
      bufferSize: pdfBuffer.length,
      header: pdfHeader,
    });

    // Ensure filename always has .pdf extension
    let fileName = `invoice-${order.orderNumber || order._id}`;
    fileName = fileName.replace(/\.(pdf|PDF)$/, '');
    fileName = `${fileName}.pdf`;
    
    // Sanitize filename for Content-Disposition header
    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');

    // Convert Buffer to Uint8Array for NextResponse compatibility
    const buffer = new Uint8Array(pdfBuffer);

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
    console.error('[admin/orders/[id]/invoice/download GET] Error:', error);
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

