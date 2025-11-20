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
      // For mobile devices: Use multiple fallback strategies
      // Mobile browsers often block programmatic downloads, so we need alternatives
      const url = window.URL.createObjectURL(blob);
      
      // Strategy 1: Try opening in new tab (works on most mobile browsers)
      const newWindow = window.open(url, '_blank');
      
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Strategy 2: If popup blocked, create a visible link and click it
        // This works better on iOS Safari and some Android browsers
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        // Style it to be invisible but clickable
        a.style.position = 'fixed';
        a.style.top = '0';
        a.style.left = '0';
        a.style.width = '1px';
        a.style.height = '1px';
        a.style.opacity = '0';
        a.style.pointerEvents = 'auto';
        a.style.zIndex = '9999';
        document.body.appendChild(a);
        
        // Trigger click
        a.click();
        
        // Clean up after a short delay
        setTimeout(() => {
          a.remove();
          window.URL.revokeObjectURL(url);
        }, 1000);
      } else {
        // Clean up URL after window opens
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 2000);
      }
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

