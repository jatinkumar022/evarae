'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { X, Package, CheckCircle2, Clock, XCircle, RotateCcw, AlertCircle } from 'lucide-react';

type ReturnRequestStatus = 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';

interface ReturnRequestTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnRequestId: string;
}

interface ReturnRequestData {
  _id: string;
  status: ReturnRequestStatus;
  returnReason: string;
  note?: string;
  images: string[];
  createdAt: string;
  processedAt?: string;
  adminNotes?: string;
  orderItem: {
    name: string;
    sku: string;
    price: number;
    quantity: number;
    image: string | null;
  };
}

const STATUS_STAGES: Array<{
  key: ReturnRequestStatus;
  label: string;
  icon: typeof Package;
  description: string;
}> = [
  {
    key: 'pending',
    label: 'Request Submitted',
    icon: Package,
    description: 'Your return request has been submitted and is awaiting review',
  },
  {
    key: 'approved',
    label: 'Request Approved',
    icon: CheckCircle2,
    description: 'Your return request has been approved',
  },
  {
    key: 'processing',
    label: 'Processing Return',
    icon: RotateCcw,
    description: 'Your return is being processed',
  },
  {
    key: 'completed',
    label: 'Return Completed',
    icon: CheckCircle2,
    description: 'Your return has been completed and refund processed',
  },
  {
    key: 'rejected',
    label: 'Request Rejected',
    icon: XCircle,
    description: 'Your return request has been rejected',
  },
];

const RETURN_REASON_LABELS: Record<string, string> = {
  defective: 'Defective Product',
  wrong_item: 'Wrong Item Received',
  size_issue: 'Size Issue',
  color_issue: 'Color Issue',
  quality_issue: 'Quality Issue',
  not_as_described: 'Not as Described',
  damaged: 'Damaged During Shipping',
  other: 'Other',
};

export function ReturnRequestTrackingModal({
  isOpen,
  onClose,
  returnRequestId,
}: ReturnRequestTrackingModalProps) {
  const [returnRequest, setReturnRequest] = useState<ReturnRequestData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchReturnRequest = useCallback(async () => {
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/account/return-requests/${returnRequestId}`, {
        credentials: 'include',
        signal,
      });

      if (signal.aborted) return;

      if (!res.ok) {
        throw new Error('Failed to fetch return request');
      }

      const data = await res.json();
      if (signal.aborted) return;

      setReturnRequest(data.returnRequest);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Request was cancelled, ignore
      }
      setError(err instanceof Error ? err.message : 'Failed to load return request');
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, [returnRequestId]);

  useEffect(() => {
    if (isOpen && returnRequestId) {
      fetchReturnRequest();
    } else {
      // Reset state when modal closes
      setReturnRequest(null);
      setError(null);
      setLoading(false);
    }

    return () => {
      // Cancel request on unmount or when dependencies change
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [isOpen, returnRequestId, fetchReturnRequest]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getStatusIndex = (status: ReturnRequestStatus): number => {
    const statusOrder: ReturnRequestStatus[] = ['pending', 'approved', 'processing', 'completed'];
    return statusOrder.indexOf(status);
  };

  const getStatusColor = (status: ReturnRequestStatus): string => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'approved':
      case 'processing':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="fixed inset-0 flex items-end sm:items-center justify-center p-2 sm:p-4 pointer-events-none z-50">
        <div
          className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-lg shadow-xl z-50 max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out pointer-events-auto border-t sm:border border-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 bg-white z-10">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Return Request Tracking
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Request ID: {returnRequestId.substring(0, 8)}...
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600">{error}</p>
                <button
                  onClick={fetchReturnRequest}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : returnRequest ? (
              <div className="space-y-6">
                {/* Current Status */}
                <div className={`p-3 sm:p-4 rounded-lg border ${getStatusColor(returnRequest.status)}`}>
                  <div className="flex items-center gap-2 sm:gap-3">
                    {returnRequest.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                    ) : returnRequest.status === 'rejected' ? (
                      <XCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                    ) : (
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base">
                        {STATUS_STAGES.find(s => s.key === returnRequest.status)?.label || 'Unknown Status'}
                      </h3>
                      <p className="text-xs sm:text-sm mt-1 opacity-90">
                        {STATUS_STAGES.find(s => s.key === returnRequest.status)?.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Item Details */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Item Details</h3>
                  <div className="flex flex-col sm:flex-row gap-4">
                    {returnRequest.orderItem.image && (
                      <img
                        src={returnRequest.orderItem.image}
                        alt={returnRequest.orderItem.name}
                        className="w-full sm:w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white break-words">{returnRequest.orderItem.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">SKU: {returnRequest.orderItem.sku}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Quantity: {returnRequest.orderItem.quantity}
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                        {formatCurrency(returnRequest.orderItem.price * returnRequest.orderItem.quantity)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Return Reason */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Return Reason</h3>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 break-words">
                    {RETURN_REASON_LABELS[returnRequest.returnReason] || returnRequest.returnReason}
                  </p>
                  {returnRequest.note && (
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 break-words">{returnRequest.note}</p>
                  )}
                </div>

                {/* Status Timeline */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 text-sm sm:text-base">Status Timeline</h3>
                  <div className="space-y-4">
                    {STATUS_STAGES.filter(stage => {
                      if (stage.key === 'rejected') {
                        return returnRequest.status === 'rejected';
                      }
                      return ['pending', 'approved', 'processing', 'completed'].includes(stage.key);
                    }).map((stage, index) => {
                      const currentIndex = getStatusIndex(returnRequest.status);
                      const isCompleted = index <= currentIndex;
                      const isCurrent = index === currentIndex;
                      const IconComponent = stage.icon;

                      return (
                        <div key={stage.key} className="flex gap-3 sm:gap-4">
                          <div className="flex flex-col items-center flex-shrink-0">
                            <div
                              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                                isCompleted
                                  ? 'bg-primary text-white border-primary'
                                  : 'bg-gray-100 text-gray-400 border-gray-300'
                              }`}
                            >
                              <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            {index < STATUS_STAGES.length - 1 && (
                              <div
                                className={`w-0.5 h-8 sm:h-12 mt-2 ${
                                  isCompleted ? 'bg-primary' : 'bg-gray-300'
                                }`}
                              />
                            )}
                          </div>
                          <div className="flex-1 pb-4 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div className="min-w-0">
                                <p
                                  className={`font-medium text-sm sm:text-base ${
                                    isCompleted ? 'text-gray-900' : 'text-gray-500'
                                  }`}
                                >
                                  {stage.label}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-600 mt-1">{stage.description}</p>
                              </div>
                              {isCompleted && (
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                  {stage.key === 'pending'
                                    ? formatDate(returnRequest.createdAt)
                                    : returnRequest.processedAt
                                    ? formatDate(returnRequest.processedAt)
                                    : ''}
                                </span>
                              )}
                            </div>
                            {isCurrent && returnRequest.adminNotes && (
                              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-900">
                                  <strong>Admin Note:</strong> {returnRequest.adminNotes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Images */}
                {returnRequest.images && returnRequest.images.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm sm:text-base">Uploaded Images</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                      {returnRequest.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Return image ${index + 1}`}
                          className="w-full h-20 sm:h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-6 border-t bg-gray-50 rounded-b-2xl">
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

