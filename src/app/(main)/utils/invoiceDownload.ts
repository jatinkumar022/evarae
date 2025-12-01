/**
 * Utility function to download invoice with progress tracking
 * Downloads PDF with proper .pdf extension for both mobile and desktop
 */
export async function downloadInvoiceWithProgress(
  orderId: string,
  onProgress: (progress: number) => void,
  isAdmin: boolean = false
): Promise<void> {
  let currentProgress = 0;
  onProgress(0);

  // Simulate progress updates
  const progressInterval = setInterval(() => {
    if (currentProgress >= 90) {
      clearInterval(progressInterval);
      return;
    }
    currentProgress = Math.min(90, currentProgress + Math.random() * 15);
    onProgress(currentProgress);
  }, 300);

  try {
    const apiPath = isAdmin 
      ? `/api/admin/orders/${orderId}/invoice`
      : `/api/orders/${orderId}/invoice`;
    
    const res = await fetch(apiPath, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'x-skip-global-loader': 'true',
      },
    });

    if (!res.ok) {
      clearInterval(progressInterval);
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData?.error || 'Failed to download invoice');
    }

    clearInterval(progressInterval);
    onProgress(95);

    // API now returns JSON with Cloudinary URL
    const data = await res.json();
    const pdfUrl = data.url;
    
    // Ensure fileName always has .pdf extension and is properly formatted
    let fileName = data.fileName || `invoice-${orderId}`;
    // Remove any existing extension and add .pdf
    fileName = fileName.replace(/\.(pdf|PDF)$/, '');
    fileName = `${fileName}.pdf`;
    
    // Sanitize filename to remove any invalid characters
    fileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');

    if (!pdfUrl) {
      throw new Error('Invoice URL not found in response');
    }

    onProgress(100);

    // Use download endpoint for both mobile and desktop
    // This endpoint sets Content-Disposition header with proper filename
    const downloadApiPath = isAdmin
      ? `/api/admin/orders/${orderId}/invoice/download`
      : `/api/orders/${orderId}/invoice/download`;
    
    // Create download link
    const link = document.createElement('a');
    link.href = downloadApiPath;
    link.download = fileName; // Fallback filename (works if browser supports it)
    link.style.display = 'none';
    document.body.appendChild(link);
    
    try {
      // Trigger download
      link.click();
    } catch (error) {
      console.warn('[invoiceDownload] Link click failed, using window.open:', error);
      // Fallback: open in new tab (user can download from browser)
      window.open(downloadApiPath, '_blank');
    }
    
    // Clean up after delay
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 2000);
  } catch (error) {
    clearInterval(progressInterval);
    throw error;
  }
}

