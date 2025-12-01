/**
 * Detect if the device is mobile
 */
function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check user agent
  const userAgent = navigator.userAgent || navigator.vendor || (window as unknown as { opera?: string }).opera || '';
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  
  // Check screen width (mobile is typically < 768px)
  const isSmallScreen = window.innerWidth < 768;
  
  // Check touch support
  const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  return mobileRegex.test(userAgent) || (isSmallScreen && hasTouchScreen);
}

/**
 * Utility function to download invoice with progress tracking
 * Handles mobile devices by opening PDF in new window instead of programmatic download
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

    const isMobile = isMobileDevice();

    if (isMobile) {
      // For mobile devices: navigate directly to the blob URL.
      // This avoids popup blockers and works better on iOS/Android browsers.
      const url = window.URL.createObjectURL(blob);
      window.location.href = url;

      // Revoke after navigation has had time to start.
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 10_000);
    } else {
      // For desktop: Use blob URL with programmatic download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    }
  } catch (error) {
    clearInterval(progressInterval);
    throw error;
  }
}

