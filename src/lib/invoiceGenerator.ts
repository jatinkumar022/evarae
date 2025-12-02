import PDFDocument from 'pdfkit';
import cloudinary from '@/lib/cloudinary';

// Format money with proper Indian number formatting (commas for thousands)
const money = (n: number) => {
  const num = Number(n || 0);
  // Round to 2 decimal places
  const rounded = Math.round(num * 100) / 100;
  
  // Split into integer and decimal parts
  const parts = rounded.toString().split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];
  
  // Add commas to integer part (Indian numbering system)
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  // Combine with decimal if exists
  const formatted = decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  
  return `₹${formatted}`;
};

type InvoiceOrderItem = {
  name: string;
  price: number;
  quantity: number;
};

type InvoiceShippingAddress = {
  fullName?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

type InvoiceOrder = {
  _id: string;
  orderNumber?: string;
  items: InvoiceOrderItem[];
  subtotalAmount: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  paymentChargesAmount: number;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  shippingAddress?: InvoiceShippingAddress;
  createdAt?: string | Date;
  courierName?: string | null;
  trackingNumber?: string | null;
  paidAt?: string | Date | null;
};

function generateInvoiceDate(order: InvoiceOrder): string {
  return order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';
}

async function generatePDF(order: InvoiceOrder): Promise<Buffer> {
  const invoiceNumber = order.orderNumber || order._id;
  const invoiceDate = generateInvoiceDate(order);
  const status = `${order.orderStatus} • ${order.paymentStatus}`;
  const addr = order.shippingAddress || {};

  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, left: 50, right: 50, bottom: 50 },
  });

  const buffers: Buffer[] = [];
  doc.on('data', (chunk: unknown) => buffers.push(chunk as Buffer));

  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err: unknown) => reject(err));
  });

  // Header - Company info
  doc
    .font('Helvetica-Bold')
    .fontSize(24)
    .fillColor('#1a1a1a')
    .text('Caelvi Jewellery', { align: 'left' });

  doc
    .moveDown(0.3)
    .font('Helvetica')
    .fontSize(12)
    .fillColor('#666666')
    .text('Luxury Imitation Jewellery');

  doc
    .moveDown(0.2)
    .fontSize(10)
    .text('Caelvi Pvt. Ltd.')
    .text('123 artisan park, Mumbai, MH 400001, IN')
    .text('GSTIN: 27AAAPC1234A1Z5');

  doc.moveDown(1.5);

  // Invoice header (right side)
  const headerTop = doc.y;
  doc
    .font('Helvetica-Bold')
    .fontSize(14)
    .text('Invoice', 320, headerTop, { align: 'left' });

  doc
    .moveDown(0.3)
    .font('Helvetica')
    .fontSize(10)
    .text(`Invoice No: ${invoiceNumber}`)
    .text(`Date: ${invoiceDate}`)
    .text(`Status: ${status}`);

  doc.moveDown(2);

  // Address section
  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .fillColor('#000000')
    .text('Billing / Shipping');

  doc
    .moveDown(0.5)
    .font('Helvetica')
    .fontSize(10);

  const addressLines: string[] = [];
  if (addr.fullName) addressLines.push(addr.fullName);
  if (addr.line1) addressLines.push(addr.line1);
  if (addr.line2) addressLines.push(addr.line2);
  const cityLine = [addr.city, addr.state, addr.postalCode]
    .filter(Boolean)
    .join(', ');
  if (cityLine) addressLines.push(cityLine);
  if (addr.country) addressLines.push(addr.country);
  if (addr.phone) addressLines.push(`Phone: ${addr.phone}`);

  addressLines.forEach((line) => doc.text(line));

  doc.moveDown(1.5);

  // Items table header
  const tableTop = doc.y;
  const colItemX = 50;
  const colQtyX = 330;
  const colPriceX = 390;
  const colAmountX = 470;

  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .text('Item', colItemX, tableTop)
    .text('Qty', colQtyX, tableTop, { width: 40, align: 'center' })
    .text('Price', colPriceX, tableTop, { width: 60, align: 'right' })
    .text('Amount', colAmountX, tableTop, { width: 80, align: 'right' });

  // Divider line under header
  doc
    .moveTo(colItemX, tableTop + 14)
    .lineTo(colAmountX + 80, tableTop + 14)
    .strokeColor('#333333')
    .lineWidth(1)
    .stroke();

  // Table rows
  let rowY = tableTop + 22;
  doc.font('Helvetica').fontSize(9).strokeColor('#eeeeee').lineWidth(0.5);

  (order.items || []).forEach((item) => {
    const lineHeight = 14;

    doc
      .fillColor('#000000')
      .text(item.name || '', colItemX, rowY, {
        width: colQtyX - colItemX - 10,
      })
      .text(String(item.quantity || 0), colQtyX, rowY, {
        width: 40,
        align: 'center',
      })
      .text(money(item.price || 0), colPriceX, rowY, {
        width: 60,
        align: 'right',
      })
      .text(
        money((item.price || 0) * (item.quantity || 0)),
        colAmountX,
        rowY,
        { width: 80, align: 'right' }
      );

    // Row divider
    doc
      .moveTo(colItemX, rowY + lineHeight)
      .lineTo(colAmountX + 80, rowY + lineHeight)
      .stroke();

    rowY += lineHeight + 2;
  });

  doc.moveDown(2);

  // Summary section on right side
  const summaryX = 300;
  let summaryY = doc.y;

  const addSummaryRow = (label: string, value: string) => {
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#000000')
      .text(label, summaryX, summaryY, { width: 120, align: 'left' })
      .text(value, summaryX + 120, summaryY, { width: 100, align: 'right' });
    summaryY += 14;
  };

  addSummaryRow('Subtotal:', money(order.subtotalAmount || 0));

  if ((order.discountAmount || 0) > 0) {
    addSummaryRow('Discount:', `-${money(order.discountAmount || 0)}`);
  }

  addSummaryRow('GST (3%):', money(order.taxAmount || 0));
  addSummaryRow('Payment Charges:', money(order.paymentChargesAmount || 0));
  addSummaryRow('Shipping:', money(order.shippingAmount || 0));

  // Divider
  summaryY += 6;
  doc
    .moveTo(summaryX, summaryY)
    .lineTo(summaryX + 220, summaryY)
    .strokeColor('#333333')
    .lineWidth(1)
    .stroke();
  summaryY += 10;

  // Total
  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .text('Total:', summaryX, summaryY, { width: 120, align: 'left' })
    .text(money(order.totalAmount || 0), summaryX + 120, summaryY, {
      width: 100,
      align: 'right',
    });

  // Footer
  doc.moveDown(4);
  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor('#666666')
    .text(
      'Thank you for shopping with Caelvi. This is a computer-generated invoice. No signature required.',
      50,
      doc.page.height - 80,
      {
        width: doc.page.width - 100,
        align: 'center',
      }
    );

  doc.end();
  return done;
}

/**
 * Generate invoice PDF and upload to Cloudinary
 * Returns the Cloudinary URL
 */
export async function generateAndUploadInvoice(order: InvoiceOrder): Promise<string> {
  try {
    // Validate required fields
    if (!order._id) {
      throw new Error('Order ID is required');
    }
    if (!order.items || order.items.length === 0) {
      throw new Error('Order must have at least one item');
    }

    // Validate Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary configuration is missing. Please check environment variables.');
    }

    console.log('[generateAndUploadInvoice] Starting invoice generation', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      itemsCount: order.items?.length || 0,
      hasCloudinaryConfig: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY),
    });

    // Generate PDF
    const pdfBuffer = await generatePDF(order);
    console.log('[generateAndUploadInvoice] PDF generated', {
      orderId: order._id,
      bufferSize: pdfBuffer.length,
    });

    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('Generated PDF buffer is empty');
    }

    // Upload to Cloudinary using the same pattern as the existing upload route
    const fileName = `invoice-${order.orderNumber || order._id}`;
    console.log('[generateAndUploadInvoice] Uploading to Cloudinary', {
      fileName,
      folder: 'invoices',
    });

    // Add timeout to Cloudinary upload (30 seconds)
    const uploadPromise = new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        try {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'invoices',
              resource_type: 'raw',
              public_id: fileName,
              // Don't specify format - let Cloudinary detect it from the buffer
            },
            (error, result) => {
              if (error) {
                console.error('[generateAndUploadInvoice] Cloudinary upload error', {
                  error: error.message || error,
                  stack: error instanceof Error ? error.stack : undefined,
                  code: (error as { code?: string })?.code,
                });
                reject(error);
              } else if (!result || !result.secure_url) {
                console.error('[generateAndUploadInvoice] Invalid Cloudinary response', result);
                reject(new Error('Invalid response from Cloudinary'));
              } else {
                console.log('[generateAndUploadInvoice] Upload successful', {
                  public_id: result.public_id,
                  secure_url: result.secure_url,
                });
                resolve({
                  secure_url: result.secure_url,
                  public_id: result.public_id || fileName,
                });
              }
            }
          );

          // Use .end() method directly with buffer (same as existing upload route)
          uploadStream.end(pdfBuffer);
        } catch (streamError) {
          console.error('[generateAndUploadInvoice] Stream creation error', streamError);
          reject(streamError);
        }
      }
    );

    // Add timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Cloudinary upload timeout after 30 seconds'));
      }, 30000);
    });

    const uploadResult = await Promise.race([uploadPromise, timeoutPromise]);

    if (!uploadResult.secure_url) {
      throw new Error('Failed to get secure URL from Cloudinary');
    }

    console.log('[generateAndUploadInvoice] Invoice uploaded successfully', {
      orderId: order._id,
      invoiceUrl: uploadResult.secure_url,
    });

    return uploadResult.secure_url;
  } catch (error) {
    console.error('[generateAndUploadInvoice] Error:', error);
    throw error;
  }
}
