import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
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

function generateInvoiceHTML(order: InvoiceOrder): string {
  const invoiceNumber = order.orderNumber || order._id;
  const invoiceDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';
  const status = `${order.orderStatus} • ${order.paymentStatus}`;
  const addr = order.shippingAddress || {};

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoiceNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      font-size: 12px;
      line-height: 1.6;
      color: #333;
      padding: 50px;
      background: white;
    }
    .header {
      margin-bottom: 40px;
    }
    .company-name {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 5px;
      color: #1a1a1a;
    }
    .company-tagline {
      font-size: 12px;
      color: #666;
      margin-bottom: 5px;
    }
    .company-details {
      font-size: 10px;
      color: #666;
      line-height: 1.8;
    }
    .invoice-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .invoice-info {
      text-align: right;
      font-size: 10px;
    }
    .invoice-title {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .invoice-details {
      line-height: 1.8;
    }
    .address-section {
      margin-bottom: 30px;
    }
    .address-title {
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .address-content {
      font-size: 10px;
      line-height: 1.8;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    .items-table th {
      text-align: left;
      font-size: 10px;
      font-weight: bold;
      padding-bottom: 10px;
      border-bottom: 1px solid #333;
    }
    .items-table th.amount {
      text-align: right;
    }
    .items-table td {
      font-size: 9px;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }
    .items-table td.item-name {
      width: 50%;
    }
    .items-table td.qty {
      width: 10%;
      text-align: center;
    }
    .items-table td.price {
      width: 15%;
      text-align: right;
    }
    .items-table td.amount {
      width: 15%;
      text-align: right;
    }
    .summary {
      margin-top: 20px;
      margin-left: auto;
      width: 300px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      margin-bottom: 10px;
    }
    .summary-label {
      font-weight: normal;
    }
    .summary-value {
      text-align: right;
    }
    .summary-divider {
      border-top: 1px solid #333;
      margin: 10px 0;
    }
    .summary-total {
      font-size: 12px;
      font-weight: bold;
      margin-top: 10px;
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      font-size: 8px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-name">Caelvi Jewellery</div>
    <div class="company-tagline">Luxury Imitation Jewellery</div>
    <div class="company-details">
      Caelvi Pvt. Ltd.<br>
      123 artisan park, Mumbai, MH 400001, IN<br>
      GSTIN: 27AAAPC1234A1Z5
    </div>
  </div>

  <div class="invoice-header">
    <div></div>
    <div class="invoice-info">
      <div class="invoice-title">Invoice</div>
      <div class="invoice-details">
        ${invoiceNumber}<br>
        Date: ${invoiceDate}<br>
        Status: ${status}
      </div>
    </div>
  </div>

  <div class="address-section">
    <div class="address-title">Billing / Shipping</div>
    <div class="address-content">
      ${addr.fullName || ''}<br>
      ${addr.line1 || ''}<br>
      ${addr.line2 ? addr.line2 + '<br>' : ''}
      ${addr.city || ''}, ${addr.state || ''} ${addr.postalCode || ''}<br>
      ${addr.country || ''}<br>
      ${addr.phone ? 'Phone: ' + addr.phone : ''}
    </div>
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <th class="item-name">Item</th>
        <th class="qty">Qty</th>
        <th class="price">Price</th>
        <th class="amount">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${(order.items || [])
        .map(
          (item) => `
        <tr>
          <td class="item-name">${item.name || ''}</td>
          <td class="qty">${item.quantity || 0}</td>
          <td class="price">${money(item.price || 0)}</td>
          <td class="amount">${money((item.price || 0) * (item.quantity || 0))}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <div class="summary">
    <div class="summary-row">
      <span class="summary-label">Subtotal:</span>
      <span class="summary-value">${money(order.subtotalAmount || 0)}</span>
    </div>
    ${(order.discountAmount || 0) > 0
      ? `
    <div class="summary-row">
      <span class="summary-label">Discount:</span>
      <span class="summary-value">-${money(order.discountAmount || 0)}</span>
    </div>
    `
      : ''}
    <div class="summary-row">
      <span class="summary-label">GST (3%):</span>
      <span class="summary-value">${money(order.taxAmount || 0)}</span>
    </div>
    <div class="summary-row">
      <span class="summary-label">Payment Charges:</span>
      <span class="summary-value">${money(order.paymentChargesAmount || 0)}</span>
    </div>
    <div class="summary-row">
      <span class="summary-label">Shipping:</span>
      <span class="summary-value">${money(order.shippingAmount || 0)}</span>
    </div>
    <div class="summary-divider"></div>
    <div class="summary-row summary-total">
      <span>Total:</span>
      <span>${money(order.totalAmount || 0)}</span>
    </div>
  </div>

  <div class="footer">
    Thank you for shopping with Caelvi. This is a computer-generated invoice. No signature required.
  </div>
</body>
</html>
  `.trim();
}

async function generatePDF(order: InvoiceOrder): Promise<Buffer> {
  const html = generateInvoiceHTML(order);

  // Determine if we're in a serverless environment
  const isServerless = !!(process.env.AWS_LAMBDA_FUNCTION_NAME || 
                          process.env.VERCEL || 
                          process.env.NETLIFY);

  let launchOptions: Parameters<typeof puppeteer.launch>[0];

  if (isServerless) {
    // Use @sparticuz/chromium for serverless environments
    launchOptions = {
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless ?? true,
    };
  } else {
    // For local development, try to find Chrome in common locations
    const fs = await import('fs');
    
    const possiblePaths = [
      process.env.CHROME_PATH,
      process.env.PUPPETEER_EXECUTABLE_PATH,
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files\\Chromium\\Application\\chrome.exe',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    ].filter(Boolean) as string[];

    let executablePath: string | undefined;
    for (const chromePath of possiblePaths) {
      try {
        if (fs.existsSync(chromePath)) {
          executablePath = chromePath;
          console.log('[generatePDF] Found Chrome at:', chromePath);
          break;
        }
      } catch {
        // Continue searching
      }
    }

    if (!executablePath) {
      throw new Error(
        'Chrome/Chromium not found. Please install Google Chrome or set CHROME_PATH environment variable.\n' +
        'Common locations:\n' +
        'Windows: C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe\n' +
        'Linux: /usr/bin/google-chrome\n' +
        'Mac: /Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      );
    }

    launchOptions = {
      headless: true,
      executablePath,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
    };
  }

  const browser = await puppeteer.launch(launchOptions);

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '50px',
        right: '50px',
        bottom: '50px',
        left: '50px',
      },
      printBackground: true,
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
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
