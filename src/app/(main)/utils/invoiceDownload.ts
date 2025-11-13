/**
 * Utility function to download invoice with progress tracking
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

    const blob = await res.blob();
    onProgress(100);

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${orderId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    clearInterval(progressInterval);
    throw error;
  }
}

