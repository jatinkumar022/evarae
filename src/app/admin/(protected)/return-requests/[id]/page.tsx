'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  User,
  FileText,
  ArrowLeft,
  Image as ImageIcon,
  Save,
} from 'lucide-react';
import { toastApi } from '@/lib/toast';
import InlineSpinner from '@/app/admin/components/InlineSpinner';
import { ImageViewerModal } from '@/app/admin/components/ImageViewerModal';
import { CustomSelect } from '@/app/admin/components/CustomSelect';

type ReturnRequest = {
  _id: string;
  user: {
    _id: string;
    name?: string;
    email?: string;
  };
  order: {
    _id: string;
    orderNumber?: string;
    totalAmount?: number;
    paidAt?: string;
  };
  orderItem: {
    product: string;
    name: string;
    slug: string;
    sku: string;
    price: number;
    quantity: number;
    image: string | null;
  };
  returnReason: string;
  note: string;
  images: string[];
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  adminNotes: string | null;
  processedAt: string | null;
  processedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

const RETURN_REASON_LABELS: Record<string, string> = {
  defective: 'Defective Product',
  wrong_item: 'Wrong Item Received',
  quality_issue: 'Quality Issue',
  not_as_described: 'Not as Described',
  damaged: 'Damaged During Shipping',
  other: 'Other',
};

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
];

export default function ReturnRequestDetailsPage() {
  const params = useParams();
  const returnRequestId = params.id as string;

  const [returnRequest, setReturnRequest] = useState<ReturnRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formValues, setFormValues] = useState<{
    status: ReturnRequest['status'];
    adminNotes: string;
  } | null>(null);
  const [originalValues, setOriginalValues] = useState<{
    status: ReturnRequest['status'];
    adminNotes: string;
  } | null>(null);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
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
    try {
      const res = await fetch(`/api/admin/return-requests/${returnRequestId}`, {
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
      const initialValues = {
        status: data.returnRequest.status,
        adminNotes: data.returnRequest.adminNotes || '',
      };
      setFormValues(initialValues);
      setOriginalValues(initialValues);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // Request was cancelled, ignore
      }
      console.error('Error fetching return request:', error);
      toastApi.error('Failed to load return request', 'Please try again');
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, [returnRequestId]);

  useEffect(() => {
    if (returnRequestId) {
      fetchReturnRequest();
    }

    return () => {
      // Cancel request on unmount or when returnRequestId changes
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [returnRequestId, fetchReturnRequest]);

  // Check if form is dirty
  const isDirty = formValues && originalValues && (
    formValues.status !== originalValues.status ||
    formValues.adminNotes !== originalValues.adminNotes
  );

  const handleStatusChange = (newStatus: ReturnRequest['status']) => {
    if (formValues) {
      setFormValues({ ...formValues, status: newStatus });
    }
  };

  const handleAdminNotesChange = (notes: string) => {
    if (formValues) {
      setFormValues({ ...formValues, adminNotes: notes });
    }
  };

  const handleSaveAll = async () => {
    if (!returnRequest || !formValues || !isDirty) return;

    setUpdating(true);
    try {
      const res = await fetch('/api/admin/return-requests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          returnRequestId: returnRequest._id,
          status: formValues.status,
          adminNotes: formValues.adminNotes.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update status');
      }

      toastApi.success('Status updated', `Return request ${formValues.status}`);
      
      // Update original values to mark form as clean
      setOriginalValues({ ...formValues });
      
      // Refresh the data
      fetchReturnRequest();
    } catch (error) {
      console.error('Error updating status:', error);
      toastApi.error(
        'Failed to update status',
        error instanceof Error ? error.message : 'Please try again'
      );
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: ReturnRequest['status']) => {
    const config = {
      pending: {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-800 dark:text-yellow-300',
        icon: Clock,
      },
      approved: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-800 dark:text-green-300',
        icon: CheckCircle,
      },
      rejected: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-800 dark:text-red-300',
        icon: XCircle,
      },
      processing: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-800 dark:text-blue-300',
        icon: RotateCcw,
      },
      completed: {
        bg: 'bg-gray-100 dark:bg-gray-900/30',
        text: 'text-gray-800 dark:text-gray-300',
        icon: CheckCircle,
      },
    };

    const statusConfig = config[status] || config.pending;
    const Icon = statusConfig.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.text}`}>
        <Icon className="h-4 w-4 mr-2" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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

  // Show loading state while fetching
  if (loading) {
    return (
      <div className="h-full bg-gray-50 dark:bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-center">
          <InlineSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-[#bdbdbd]">Loading return request...</p>
        </div>
      </div>
    );
  }

  if (!returnRequest) {
    return (
      <div className="h-full bg-gray-50 dark:bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Return request not found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-[#bdbdbd]">
            The return request you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/admin/return-requests"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700"
          >
            Back to Return Requests
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d0d0d]">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6 pb-6 border-b border-gray-100 dark:border-[#1f1f1f]">
          <div>
            <div className="min-w-0">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-[#777777]">
                  <Link href="/admin/return-requests" className="inline-flex items-center hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back
                  </Link>
                  <span>•</span>
                  <span className="font-mono">#{returnRequest._id.slice(-8)}</span>
                </div>
                {/* Save Button - Desktop Only */}
                {isDirty && (
                  <div className="hidden md:flex items-center gap-3">
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                      Unsaved changes
                    </span>
                    <button
                      onClick={handleSaveAll}
                      disabled={updating}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updating ? (
                        <>
                          <InlineSpinner size="sm" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-1 flex items-center gap-3 flex-wrap">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white truncate">
                  Return Request #{returnRequest._id.slice(-8)}
                </h1>
                {formValues && getStatusBadge(formValues.status)}
                <span className="px-3 py-1 rounded-md text-sm font-semibold bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300">
                  Order: {returnRequest.order.orderNumber || returnRequest.order._id.slice(-8)}
                </span>
              </div>
              <div className="mt-5 text-xs md:text-sm text-gray-600 dark:text-[#999999] flex flex-wrap gap-3">
                <span>Created: <span className="font-medium text-gray-800 dark:text-gray-200">{formatDate(returnRequest.createdAt)}</span></span>
                {returnRequest.processedAt && (
                  <span>Processed: <span className="font-medium text-gray-800 dark:text-gray-200">{formatDate(returnRequest.processedAt)}</span></span>
                )}
                <span>Last Updated: <span className="font-medium text-gray-800 dark:text-gray-200">{formatDate(returnRequest.updatedAt)}</span></span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Product Details */}
          <div className="bg-white dark:bg-[#191919] shadow rounded-lg border border-gray-200 dark:border-[#525252] overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-[#525252]">
              <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white">
                Product Details
              </h3>
            </div>
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="flex-shrink-0 w-full sm:w-20 h-20 rounded-md overflow-hidden bg-gray-200 dark:bg-[#525252]">
                  {returnRequest.orderItem.image ? (
                    <Image
                      src={returnRequest.orderItem.image}
                      alt={returnRequest.orderItem.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-full h-full p-4 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0 w-full">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white break-words">
                    {returnRequest.orderItem.name}
                  </h4>
                  <div className="mt-1 text-xs text-gray-500 dark:text-[#bdbdbd] space-y-1">
                    <p>SKU: {returnRequest.orderItem.sku}</p>
                  </div>
                  <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="text-sm text-gray-500 dark:text-[#bdbdbd]">
                      Quantity: {returnRequest.orderItem.quantity}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(returnRequest.orderItem.price * returnRequest.orderItem.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div className="bg-white dark:bg-[#191919] shadow rounded-lg border border-gray-200 dark:border-[#525252] overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-[#525252]">
                <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </h3>
              </div>
              <div className="p-4 sm:p-6">
                <dl className="space-y-3 sm:space-y-4">
                  <div>
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-[#bdbdbd]">Name</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white break-words">
                      {returnRequest.user.name || 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-[#bdbdbd]">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white break-all">
                      {returnRequest.user.email || 'N/A'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Order Information */}
            <div className="bg-white dark:bg-[#191919] shadow rounded-lg border border-gray-200 dark:border-[#525252] overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-[#525252]">
                <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Order Information
                </h3>
              </div>
              <div className="p-4 sm:p-6">
                <dl className="space-y-3 sm:space-y-4">
                  <div>
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-[#bdbdbd]">Order Number</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white break-all">
                      {returnRequest.order.orderNumber || returnRequest.order._id.slice(-8)}
                    </dd>
                  </div>
                  {returnRequest.order.totalAmount && (
                    <div>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-[#bdbdbd]">Order Total</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {formatCurrency(returnRequest.order.totalAmount)}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Return Reason */}
            <div className="bg-white dark:bg-[#191919] shadow rounded-lg border border-gray-200 dark:border-[#525252] overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-[#525252]">
                <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white">
                  Return Reason
                </h3>
              </div>
              <div className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white break-words">
                      {RETURN_REASON_LABELS[returnRequest.returnReason] || returnRequest.returnReason}
                    </p>
                  </div>
                  {returnRequest.note && (
                    <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-50 dark:bg-[#1f1f1f] rounded-lg">
                      <p className="text-xs font-medium text-gray-500 dark:text-[#bdbdbd] mb-2">Customer Note:</p>
                      <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                        {returnRequest.note}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status & Admin Notes */}
            <div className="bg-white dark:bg-[#191919] shadow rounded-lg border border-gray-200 dark:border-[#525252] overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-[#525252]">
                <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white">
                  Status & Admin Notes
                </h3>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <CustomSelect
                    value={formValues?.status || returnRequest.status}
                    onChange={(v) => handleStatusChange(v as ReturnRequest['status'])}
                    options={STATUS_OPTIONS}
                    disabled={updating}
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Admin Notes
                  </label>
                  <textarea
                    value={formValues?.adminNotes || ''}
                    onChange={(e) => handleAdminNotesChange(e.target.value)}
                    placeholder="Add notes about this return request..."
                    rows={4}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-[#525252] rounded-md shadow-sm bg-white dark:bg-[#242424] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#bdbdbd] focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-600 dark:focus:border-primary-600 text-sm"
                    disabled={updating}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Return Images */}
          {returnRequest.images && returnRequest.images.length > 0 && (
            <div className="bg-white dark:bg-[#191919] shadow rounded-lg border border-gray-200 dark:border-[#525252] overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-[#525252]">
                <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white">
                  Return Images ({returnRequest.images.length})
                </h3>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                  {returnRequest.images.map((imageUrl, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedImageIndex(index);
                        setShowImageViewer(true);
                      }}
                      className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-[#525252] hover:border-primary-500 transition-colors group"
                    >
                      <Image
                        src={imageUrl}
                        alt={`Return image ${index + 1}`}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Save Button - Mobile Only */}
      {isDirty && (
        <div className="fixed bottom-0 left-0 right-0 md:hidden z-50 p-4 bg-white dark:bg-[#191919] border-t border-gray-200 dark:border-[#525252] shadow-lg">
          <button
            onClick={handleSaveAll}
            disabled={updating}
            className="w-full flex items-center justify-center gap-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700 text-white rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updating ? (
              <>
                <InlineSpinner size="md" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      )}
      
      {/* Add bottom padding for mobile when save button is visible */}
      {isDirty && <div className="md:hidden h-24" />}

      {/* Image Viewer Modal */}
      {returnRequest.images && returnRequest.images.length > 0 && (
        <ImageViewerModal
          isOpen={showImageViewer}
          onClose={() => setShowImageViewer(false)}
          images={returnRequest.images}
          initialIndex={selectedImageIndex}
        />
      )}
    </div>
  );
}
