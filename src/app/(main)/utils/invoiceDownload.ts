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

    // Detect mobile devices
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    // Use download endpoint for both mobile and desktop
    // This endpoint sets Content-Disposition header with proper filename
    const downloadApiPath = isAdmin
      ? `/api/admin/orders/${orderId}/invoice/download`
      : `/api/orders/${orderId}/invoice/download`;
    
    if (isMobile) {
      // For mobile: Use window.location or window.open to trigger download
      // The Content-Disposition: attachment header will force download
      // iOS Safari will open in new tab, but user can use share/download from browser
      try {
        // Try using window.location first (works better on some mobile browsers)
        const link = document.createElement('a');
        link.href = downloadApiPath;
        link.download = fileName;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        setTimeout(() => {
          if (document.body.contains(link)) {
            document.body.removeChild(link);
          }
        }, 2000);
      } catch (error) {
        console.warn('[invoiceDownload] Mobile link click failed, using window.open:', error);
        // Fallback: open in new tab
        // The Content-Disposition header should still trigger download on Android
        window.open(downloadApiPath, '_blank');
      }
    } else {
      // For desktop: Use standard download approach
      const link = document.createElement('a');
      link.href = downloadApiPath;
      link.download = fileName; // Fallback filename
      link.style.display = 'none';
      document.body.appendChild(link);
      
      try {
        // Trigger download
        link.click();
      } catch (error) {
        console.warn('[invoiceDownload] Link click failed, using window.open:', error);
        // Fallback: open in new tab
        window.open(downloadApiPath, '_blank');
      }
      
      // Clean up after delay
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 2000);
    }
  } catch (error) {
    clearInterval(progressInterval);
    throw error;
  }
}

