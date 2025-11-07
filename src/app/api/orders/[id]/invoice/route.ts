import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import jwt from 'jsonwebtoken';
import puppeteer from 'puppeteer';
import Order from '@/models/orderModel';
import { createErrorResponse } from '@/lib/api/response';

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
    const payload = jwt.verify(token, USER_JWT_SECRET) as { uid?: string } | null;
    return payload?.uid || null;
  } catch {
    return null;
  }
}

const money = (n: number) => `₹${Number(n || 0).toLocaleString()}`;

function escapeHtml(str: string) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

interface InvoiceOrderItem {
  name?: string;
  price?: number;
  quantity?: number;
}

interface InvoiceShippingAddress {
  fullName?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
}

interface InvoiceOrder {
  orderNumber?: string;
  _id?: string;
  subtotalAmount?: number;
  discountAmount?: number;
  taxAmount?: number;
  shippingAmount?: number;
  paymentChargesAmount?: number;
  totalAmount?: number;
  orderStatus?: string;
  paymentStatus?: string;
  shippingAddress?: InvoiceShippingAddress;
  items?: InvoiceOrderItem[];
  createdAt?: string | Date;
}

function buildHtml(order: InvoiceOrder) {
  const subtotal = order.subtotalAmount || 0;
  const discount = order.discountAmount || 0;
  const gst = order.taxAmount || 0;
  const shipping = order.shippingAmount || 0;
  const paymentCharges = order.paymentChargesAmount || 0;
  const total = order.totalAmount || 0;

  const addr = order.shippingAddress || {};

  const rows = (order.items || [])
    .map(
      (it: InvoiceOrderItem, idx: number) => `
      <tr class="row ${idx % 2 === 0 ? 'zebra' : ''}">
        <td class="item">${escapeHtml(it.name || '')}</td>
        <td class="qty">${it.quantity || 0}</td>
        <td class="price">${money(it.price || 0)}</td>
        <td class="amount">${money((it.price || 0) * (it.quantity || 1))}</td>
      </tr>`
    )
    .join('');

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, 'Noto Sans', 'Liberation Sans', sans-serif; color: #111; margin: 0; }
  .container { padding: 24px; }
  .header { display: flex; justify-content: space-between; gap: 24px; align-items: flex-start; }
  .brand-wrap { flex: 1; }
  .brand { font-size: 20px; font-weight: 700; }
  .brand-sub { color: #666; margin-top: 2px; font-size: 12px; }
  .company { margin-top: 8px; font-size: 11px; color: #444; line-height: 1.35; }
  .meta { min-width: 260px; border: 1px solid #e5e5e5; border-radius: 8px; padding: 12px; }
  .row { display: flex; justify-content: space-between; align-items: center; width: 100%; }
  .label { color: #666; }
  .value { font-weight: 600; }
  .muted { color: #666; }
  .table { width: 100%; border-collapse: collapse; margin-top: 16px; }
  .th { background: #f6f6f7; font-weight: 700; }
  .table th, .table td { padding: 9px 10px; border-bottom: 1px solid #efeff0; text-align: right; font-size: 12px; }
  .table th.item, .table td.item { text-align: left; width: 60%; }
  .table th.qty, .table td.qty { width: 10%; }
  .table th.price, .table td.price { width: 15%; }
  .table th.amount, .table td.amount { width: 15%; }
  tr.zebra { background: #fbfbfc; }
  .summary { width: 320px; margin-left: auto; margin-top: 14px; border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden; }
  .summary .line { display: flex; justify-content: space-between; padding: 9px 12px; border-bottom: 1px solid #f0f0f0; }
  .summary .line:last-child { border-bottom: 0; }
  .summary .total { background: #fff6e6; font-weight: 800; }
  .footer { margin-top: 18px; color: #666; font-size: 11px; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand-wrap">
        <div class="brand">Caelvi Jewellery</div>
        <div class="brand-sub">Luxury Imitation Jewellery</div>
        <div class="company">
          Caelvi Pvt. Ltd.<br/>
          123 artisan park, Mumbai, MH 400001, IN<br/>
          GSTIN: 27AAAPC1234A1Z5
        </div>
      </div>
      <div class="meta">
        <div class="row"><div>Invoice</div><div class="value">${escapeHtml(
          (order.orderNumber || order._id || 'N/A').toString()
        )}</div></div>
        <div class="row" style="margin-top:6px"><div class="label">Date</div><div>${
          order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''
        }</div></div>
        <div class="row" style="margin-top:4px"><div class="label">Status</div><div>${escapeHtml(
          `${order.orderStatus} • ${order.paymentStatus}`
        )}</div></div>
      </div>
    </div>

    <div class="meta" style="margin-top:16px">
      <div class="value" style="margin-bottom:6px">Billing / Shipping</div>
      <div>${escapeHtml(addr.fullName || '')}</div>
      <div>${escapeHtml(addr.line1 || '')}</div>
      ${addr.line2 ? `<div>${escapeHtml(addr.line2)}</div>` : ''}
      <div>${escapeHtml(
        `${addr.city || ''}, ${addr.state || ''} ${addr.postalCode || ''}`
      )}</div>
      <div>${escapeHtml(addr.country || '')}</div>
      <div>Phone: ${escapeHtml(addr.phone || '')}</div>
    </div>

    <table class="table">
      <thead>
        <tr class="th">
          <th class="item">Item</th>
          <th class="qty">Qty</th>
          <th class="price">Price</th>
          <th class="amount">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <div class="summary">
      <div class="line"><div class="label">Subtotal</div><div>${money(subtotal)}</div></div>
      ${
        discount > 0
          ? `<div class="line"><div class="label">Discount</div><div>-${money(discount)}</div></div>`
          : ''
      }
      <div class="line"><div class="label">GST (3%)</div><div>${money(gst)}</div></div>
      <div class="line"><div class="label">Payment Charges</div><div>${money(paymentCharges)}</div></div>
      <div class="line"><div class="label">Shipping</div><div>${money(shipping)}</div></div>
      <div class="line total"><div>Total</div><div>${money(total)}</div></div>
    </div>

    <div class="footer">Thank you for shopping with Caelvi. This is a computer-generated invoice. No signature required.</div>
  </div>
</body>
</html>`;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connect();
    const uid = getUid(request);
    if (!uid) {
      return createErrorResponse('Please log in to download invoice', 401);
    }

    const { id } = await context.params;
    const filter = id.startsWith('ORD-')
      ? { orderNumber: id, user: uid }
      : { _id: id, user: uid };

    const orderDoc = await Order.findOne(filter)
      .select(
        'orderNumber items.name items.price items.quantity subtotalAmount taxAmount shippingAmount discountAmount paymentChargesAmount totalAmount orderStatus paymentStatus shippingAddress.fullName shippingAddress.line1 shippingAddress.line2 shippingAddress.city shippingAddress.state shippingAddress.postalCode shippingAddress.country shippingAddress.phone createdAt courierName trackingNumber paidAt'
      )
      .lean();

    if (!orderDoc) {
      return createErrorResponse('Order not found', 404);
    }

    const order = orderDoc as InvoiceOrder;

    const html = buildHtml(order);

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
        printBackground: true,
      });

      const pdfArray = new Uint8Array(pdfBuffer);
      const fileName = `invoice-${order.orderNumber || order._id}.pdf`;
      return new NextResponse(pdfArray, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Cache-Control': 'private, no-store, no-cache, must-revalidate',
        },
      });
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error('[orders/[id]/invoice GET] Error:', error);
    return createErrorResponse('Unable to generate invoice. Please try again later', 500);
  }
}
