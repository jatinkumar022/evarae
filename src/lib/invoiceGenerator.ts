import PDFDocument from 'pdfkit';

// Format money with proper Indian number formatting (commas for thousands)
// Using "Rs." prefix instead of rupee symbol for better compatibility across all devices
// Helvetica font doesn't support the rupee symbol, so using "Rs." ensures it displays correctly
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
  
  // Use "Rs." prefix for better compatibility across all PDF viewers and mobile devices
  return `Rs. ${formatted}`;
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

// Export generatePDF so it can be used directly without Cloudinary
export async function generatePDF(order: InvoiceOrder): Promise<Buffer> {
  const invoiceNumber = order.orderNumber || order._id;
  const invoiceDate = generateInvoiceDate(order);
  const status = `${order.orderStatus} • ${order.paymentStatus}`;
  const addr = order.shippingAddress || {};

  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, left: 50, right: 50, bottom: 50 },
    // Optimize for mobile viewing
    autoFirstPage: true,
    // Set PDF metadata for better mobile viewing
    info: {
      Title: `Invoice ${order.orderNumber || order._id}`,
      Author: 'Caelvi Jewellery',
      Subject: 'Invoice',
      Producer: 'Caelvi Invoice Generator',
    },
  });
  
  // Note: PDFKit doesn't directly support setting viewer preferences
  // The PDF will be optimized through proper sizing and font choices

  const buffers: Buffer[] = [];
  doc.on('data', (chunk: unknown) => buffers.push(chunk as Buffer));

  const done = new Promise<Buffer>((resolve, reject) => {
    let hasEnded = false;
    let hasErrored = false;
    
    doc.on('end', () => {
      if (hasErrored) return;
      hasEnded = true;
      const fullBuffer = Buffer.concat(buffers);
      // Validate PDF buffer - should start with PDF header
      if (fullBuffer.length < 100 || !fullBuffer.toString('ascii', 0, 4).startsWith('%PDF')) {
        reject(new Error(`Invalid PDF generated: size=${fullBuffer.length}, header=${fullBuffer.toString('ascii', 0, 10)}`));
        return;
      }
      resolve(fullBuffer);
    });
    
    doc.on('error', (err: unknown) => {
      hasErrored = true;
      reject(err);
    });
    
    // Timeout safety - if PDF doesn't complete in 10 seconds, something is wrong
    setTimeout(() => {
      if (!hasEnded && !hasErrored) {
        hasErrored = true;
        reject(new Error('PDF generation timeout - document did not complete'));
      }
    }, 10000);
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
  // Increased font sizes for better mobile readability
  const tableTop = doc.y;
  const colItemX = 50;
  const colQtyX = 330;
  const colPriceX = 390;
  const colAmountX = 470;

  doc
    .font('Helvetica-Bold')
    .fontSize(11) // Increased from 10 for better mobile readability
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
  // Increased font size for better mobile readability
  let rowY = tableTop + 22;
  doc.font('Helvetica').fontSize(10).strokeColor('#eeeeee').lineWidth(0.5); // Increased from 9

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
      .fontSize(10) // Increased from 9 for better mobile readability
      .fillColor('#000000')
      .text(label, summaryX, summaryY, { width: 120, align: 'left' })
      .text(value, summaryX + 120, summaryY, { width: 100, align: 'right' });
    summaryY += 15; // Slightly increased spacing
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
  // Increased font size for better mobile visibility
  doc
    .font('Helvetica-Bold')
    .fontSize(13) // Increased from 12 for better mobile visibility
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

// Note: generateAndUploadInvoice function removed - PDFs are now generated on-demand
// No Cloudinary storage needed. Use generatePDF() directly when needed.
