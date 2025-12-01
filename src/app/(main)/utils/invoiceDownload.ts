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

    // For both mobile and desktop: Download from Cloudinary URL with proper filename
    // Fetch the PDF as blob to ensure proper download with extension
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch PDF from Cloudinary');
    }
    
    const blob = await response.blob();
    
    // Verify it's a PDF blob
    if (!blob.type.includes('pdf') && blob.type !== 'application/octet-stream') {
      console.warn('[invoiceDownload] Unexpected blob type:', blob.type);
    }
    
    // Create a blob URL with proper MIME type to ensure .pdf extension
    const blobUrl = window.URL.createObjectURL(
      new Blob([blob], { type: 'application/pdf' })
    );
    
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName; // This ensures the .pdf extension is used
    a.style.display = 'none';
    document.body.appendChild(a);
    
    try {
      a.click();
    } catch (error) {
      // If click fails (some mobile browsers), try opening in new tab as fallback
      console.warn('[invoiceDownload] Click failed, opening in new tab:', error);
      window.open(blobUrl, '_blank');
    }
    
    // Clean up after a short delay
    setTimeout(() => {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
      window.URL.revokeObjectURL(blobUrl);
    }, 1000);
  } catch (error) {
    clearInterval(progressInterval);
    throw error;
  }
}

