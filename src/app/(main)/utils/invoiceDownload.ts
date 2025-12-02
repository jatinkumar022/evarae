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
    // Build the download endpoint path
    const downloadApiPath = isAdmin
      ? `/api/admin/orders/${orderId}/invoice/download`
      : `/api/orders/${orderId}/invoice/download`;

    // Detect mobile devices (client-side only)
    const isMobile =
      typeof navigator !== 'undefined' &&
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // On mobile, some browsers block downloads initiated from fetch/blob.
      // Use a direct navigation / new tab so the browser treats it as a user download.
      clearInterval(progressInterval);
      onProgress(100);

      try {
        // Prefer opening in a new tab to avoid leaving the SPA
        const opened = window.open(downloadApiPath, '_blank');
        if (!opened) {
          // Fallback if popup blocked
          window.location.href = downloadApiPath;
        }
      } catch {
        window.location.href = downloadApiPath;
      }
      return;
    }

    // Desktop: fetch PDF and trigger blob download without navigation
    const res = await fetch(downloadApiPath, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'x-skip-global-loader': 'true',
      },
    });

    if (!res.ok) {
      clearInterval(progressInterval);
      let errorMessage = 'Failed to download invoice';
      try {
        const errJson = await res.json();
        if (errJson?.error) errorMessage = errJson.error;
      } catch {
        // ignore JSON parse errors
      }
      throw new Error(errorMessage);
    }

    const blob = await res.blob();
    clearInterval(progressInterval);
    onProgress(100);

    // Build a safe filename
    let fileName = `invoice-${orderId}`;
    fileName = fileName.replace(/\.(pdf|PDF)$/, '');
    fileName = `${fileName}.pdf`;
    fileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');

    // Create a temporary link to trigger download without navigation
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);

    try {
      link.click();
    } finally {
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
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

