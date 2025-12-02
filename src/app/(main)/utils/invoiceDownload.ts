/**
 * Utility function to download invoice with progress tracking
 * Uses the server-side download endpoint and a robust client-side download
 * via fetch + blob + file-saver, so the user stays on the same tab.
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
    // Fetch PDF and trigger blob download without navigation
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

    // Trigger download using a temporary link and blob URL
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

