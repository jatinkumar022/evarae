'use client';

import React, { useEffect, useState, useLayoutEffect, useCallback } from 'react';
import { X, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import PDFViewer with SSR disabled to avoid PDF.js SSR issues
const PDFViewer = dynamic<{ file: string | null; onError?: (error: Error) => void }>(
  () => import('@/app/(main)/components/ui/PDFViewer'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }
);

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber?: string;
  isAdmin?: boolean;
}

export default function InvoiceModal({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  isAdmin = false,
}: InvoiceModalProps) {
  const [invoiceBlobUrl, setInvoiceBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoiceUrl = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use the view endpoint that proxies the PDF with proper headers for display
      const viewApiPath = isAdmin
        ? `/api/admin/orders/${orderId}/invoice/view`
        : `/api/orders/${orderId}/invoice/view`;

      const viewRes = await fetch(viewApiPath, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'x-skip-global-loader': 'true',
        },
      });

      if (!viewRes.ok) {
        const errorData = await viewRes.json().catch(() => ({}));
        throw new Error(errorData?.error || 'Failed to fetch invoice');
      }

      // Create blob URL from the proxied PDF response
      const blob = await viewRes.blob();

      // Verify it's a PDF
      if (!blob.type.includes('pdf') && blob.type !== 'application/octet-stream') {
        console.warn('[InvoiceModal] Response is not a PDF, type:', blob.type);
      }

      // Check blob size
      if (blob.size === 0) {
        throw new Error('PDF file is empty');
      }

      const blobUrl = URL.createObjectURL(blob);
      setInvoiceBlobUrl(blobUrl);

      console.log('[InvoiceModal] PDF blob created, size:', blob.size, 'type:', blob.type, 'url:', blobUrl.substring(0, 50) + '...');
    } catch (err) {
      console.error('Failed to fetch invoice:', err);
      setError(err instanceof Error ? err.message : 'Unable to load invoice');
    } finally {
      setIsLoading(false);
    }
  }, [orderId, isAdmin]);

  // Fetch invoice URL when modal opens
  useEffect(() => {
    if (isOpen && orderId) {
      fetchInvoiceUrl();
    } else {
      // Reset state when modal closes
      setInvoiceBlobUrl(null);
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen, orderId, fetchInvoiceUrl]);

  // Cleanup blob URL when modal closes or component unmounts
  useEffect(() => {
    return () => {
      if (invoiceBlobUrl) {
        URL.revokeObjectURL(invoiceBlobUrl);
      }
    };
  }, [invoiceBlobUrl]);

  // Cleanup blob URL when modal closes
  useEffect(() => {
    if (!isOpen && invoiceBlobUrl) {
      URL.revokeObjectURL(invoiceBlobUrl);
      setInvoiceBlobUrl(null);
    }
  }, [isOpen, invoiceBlobUrl]);

  // Prevent body scrolling when modal is open - use useLayoutEffect for immediate effect
  useLayoutEffect(() => {
    if (isOpen) {
      // Save original styles
      const originalBodyOverflow = window.getComputedStyle(document.body).overflow;
      const originalHtmlOverflow = window.getComputedStyle(document.documentElement).overflow;
      const originalBodyPosition = document.body.style.position;
      const originalBodyTop = document.body.style.top;
      const originalBodyWidth = document.body.style.width;
      const originalBodyHeight = document.body.style.height;

      // Get current scroll position
      const scrollY = window.scrollY;

      // Disable scrolling on both body and html
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.height = '100%';

      // Prevent touch scrolling on mobile
      document.body.style.touchAction = 'none';
      document.documentElement.style.touchAction = 'none';

      return () => {
        // Restore original styles
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.position = originalBodyPosition;
        document.body.style.top = originalBodyTop;
        document.body.style.width = originalBodyWidth;
        document.body.style.height = originalBodyHeight;

        // Restore touch action
        document.body.style.touchAction = '';
        document.documentElement.style.touchAction = '';

        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invoice-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        onTouchStart={(e) => {
          // Prevent backdrop touch from scrolling background
          e.preventDefault();
        }}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="fixed inset-0 flex items-center justify-center p-1 sm:p-2 md:p-4 pointer-events-none">
        {/* Modal Panel */}
        <div
          className="relative z-50 w-full max-w-4xl max-h-[98vh] sm:max-h-[95vh] flex flex-col pointer-events-auto bg-white dark:bg-[#242424] shadow-2xl border border-gray-200 dark:border-[#2f2f2f] rounded-lg sm:rounded-xl overflow-hidden transform transition-all duration-300 ease-out"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => {
            // Prevent modal touch from closing modal
            e.stopPropagation();
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-[#2f2f2f] bg-gray-50 dark:bg-[#1e1e1e]">
            <div className="flex-1 min-w-0">
              <h3
                id="invoice-modal-title"
                className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white"
              >
                Invoice
              </h3>
              {orderNumber && (
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1 truncate">
                  {orderNumber}
                </p>
              )}
            </div>
            {/* Close Button */}
            <button
              onClick={onClose}
              className="rounded-md p-1.5 sm:p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-[#2a2a2a] transition-colors flex-shrink-0"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden bg-gray-100 dark:bg-[#1a1a1a] min-h-0">
            {isLoading && (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Loading invoice...
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center px-4">
                  <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                  <button
                    onClick={fetchInvoiceUrl}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {!isLoading && !error && invoiceBlobUrl && (
              <div className="w-full h-full flex flex-col min-h-0">
                <PDFViewer
                  file={invoiceBlobUrl}
                  onError={(error: Error) => {
                    console.error('[InvoiceModal] PDF error:', error);
                    setError('Failed to load PDF document');
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

