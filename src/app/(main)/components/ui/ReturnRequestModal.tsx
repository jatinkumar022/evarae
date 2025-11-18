'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Upload, Trash2, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import CustomDropdown from './customDropdown';
import { useUploadStore } from '@/lib/data/store/uploadStore';
import { useReturnRequestStore } from '@/lib/data/store/returnRequestStore';
import { Spinner } from './ScaleLoader';
import toastApi from '@/lib/toast';
import { ImageUploadProgress } from './ImageUploadProgress';
import { ReturnRequestTrackingModal } from './ReturnRequestTrackingModal';

type OrderItem = {
  product: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  quantity: number;
  image: string | null;
};

interface ReturnRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderItem: OrderItem | null;
  onSuccess?: () => void;
}

// Default empty order item to prevent issues
const DEFAULT_ORDER_ITEM: OrderItem = {
  product: '',
  name: '',
  slug: '',
  sku: '',
  price: 0,
  quantity: 0,
  image: null,
};

const RETURN_REASONS = [
  { value: 'defective', label: 'Defective Product' },
  { value: 'wrong_item', label: 'Wrong Item Received' },
  { value: 'quality_issue', label: 'Quality Issue' },
  { value: 'not_as_described', label: 'Not as Described' },
  { value: 'damaged', label: 'Damaged During Shipping' },
  { value: 'other', label: 'Other' },
];

export default function ReturnRequestModal({
  isOpen,
  onClose,
  orderId,
  orderItem,
  onSuccess,
}: ReturnRequestModalProps) {
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // These hooks MUST be called in the same order on every render
  const [returnReason, setReturnReason] = useState('');
  const [note, setNote] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState<boolean[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    returnReason?: string;
    images?: string;
    note?: string;
  }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, resetUpload } = useUploadStore();
  
  // Upload progress state
  const [showUploadProgress, setShowUploadProgress] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUploadFile, setCurrentUploadFile] = useState(0);
  const [totalUploadFiles, setTotalUploadFiles] = useState(0);
  
  // Return request tracking state
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [returnRequestId, setReturnRequestId] = useState<string | null>(null);

  // Use default order item if null to prevent errors
  const safeOrderItem = orderItem || DEFAULT_ORDER_ITEM;
  
  // Determine if modal should be visible
  const shouldShow = isOpen && !!orderItem;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!shouldShow) {
      setReturnReason('');
      setNote('');
      setImages([]);
      setUploadingImages([]);
      setErrors({});
      resetUpload();
      setShowUploadProgress(false);
      setUploadProgress(0);
      setCurrentUploadFile(0);
      setTotalUploadFiles(0);
      setShowTrackingModal(false);
      setReturnRequestId(null);
      setIsSubmitting(false);
    }
    // resetUpload is from Zustand store and should be stable, but we'll only reset when modal closes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldShow]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (shouldShow) {
      // Save original styles
      const originalBodyOverflow = window.getComputedStyle(document.body).overflow;
      const originalHtmlOverflow = window.getComputedStyle(document.documentElement).overflow;
      const originalBodyHeight = document.body.style.height;
      
      // Disable scrolling on both body and html (Safari fix)
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100%';
      document.documentElement.style.overflow = 'hidden';
      
      return () => {
        // Restore original styles on cleanup
        document.body.style.overflow = originalBodyOverflow;
        document.body.style.height = originalBodyHeight;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [shouldShow]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!shouldShow) {
      return;
    }
    
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [shouldShow, onClose]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Capture current images length at the start
    const currentImagesLength = images.length;
    
    if (currentImagesLength + files.length > 5) {
      toastApi.error('Maximum 5 images allowed', 'Please remove some images first');
      return;
    }

    const validFiles = files.filter(
      file => file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
    );

    if (validFiles.length !== files.length) {
      toastApi.error('Invalid files', 'Please upload image files under 5MB each');
    }

    if (validFiles.length === 0) {
      return;
    }

    // Initialize upload progress
    setTotalUploadFiles(validFiles.length);
    setCurrentUploadFile(0);
    setUploadProgress(0);
    setShowUploadProgress(true);

    // Upload files one by one sequentially
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      
      // Calculate index based on initial images length + current loop index
      const uploadIndex = currentImagesLength + i;
      
      // Update current file and progress
      setCurrentUploadFile(i + 1);
      setUploadProgress((i / validFiles.length) * 100);
      
      // Set uploading state for this file
      setUploadingImages(prev => {
        const updated = [...prev];
        updated[uploadIndex] = true;
        return updated;
      });

      let progressInterval: NodeJS.Timeout | null = null;
      try {
        // Simulate progress during upload
        progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const baseProgress = (i / validFiles.length) * 100;
            const fileProgress = (1 / validFiles.length) * 100;
            const currentFileProgress = Math.min(prev - baseProgress + 5, fileProgress);
            return Math.min(baseProgress + currentFileProgress, ((i + 1) / validFiles.length) * 100);
          });
        }, 200);

        await uploadFile(file);
        if (progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }
        
        const uploadState = useUploadStore.getState();
        if (uploadState.error) {
          toastApi.error('Upload failed', uploadState.error);
          setUploadingImages(prev => {
            const updated = [...prev];
            if (updated[uploadIndex] !== undefined) {
              updated[uploadIndex] = false;
            }
            return updated;
          });
          continue;
        }
        if (uploadState.fileUrl) {
          setImages(prev => [...prev, uploadState.fileUrl!]);
          resetUpload();
          setUploadingImages(prev => {
            const updated = [...prev];
            if (updated[uploadIndex] !== undefined) {
              updated[uploadIndex] = false;
            }
            return updated;
          });
        }
        
        // Update progress after successful upload
        setUploadProgress(((i + 1) / validFiles.length) * 100);
      } catch (error) {
        if (progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }
        console.error('Upload error:', error);
        toastApi.error('Upload failed', 'Please try again');
        setUploadingImages(prev => {
          const updated = [...prev];
          if (updated[uploadIndex] !== undefined) {
            updated[uploadIndex] = false;
          }
          return updated;
        });
      }
    }

    // Complete upload progress
    setUploadProgress(100);
    setTimeout(() => {
      setShowUploadProgress(false);
      setUploadProgress(0);
      setCurrentUploadFile(0);
      setTotalUploadFiles(0);
    }, 1000);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    if (isSubmitting) return;
    setImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      // Clear any errors when removing images if count is valid
      setErrors(err => {
        const newErrors = { ...err };
        if (newErrors.images) {
          if (newImages.length >= 2 && newImages.length <= 5) {
            delete newErrors.images;
          }
        }
        return newErrors;
      });
      return newImages;
    });
    setUploadingImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!returnReason) {
      newErrors.returnReason = 'Please select a return reason';
    }

    if (images.length < 2) {
      newErrors.images = 'Please upload at least 2 images (maximum 5)';
    } else if (images.length > 5) {
      newErrors.images = 'Maximum 5 images allowed';
    }

    if (note.trim().length > 1000) {
      newErrors.note = 'Note must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { createReturnRequest } = useReturnRequestStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !orderItem) {
      return;
    }

    setIsSubmitting(true);

    try {
      const returnRequest = await createReturnRequest({
        orderId,
        orderItem,
        returnReason,
        note: note.trim(),
        images,
      });

      // Reset form
      setReturnReason('');
      setNote('');
      setImages([]);
      setErrors({});

      // Show tracking modal with the return request ID
      if (returnRequest?._id) {
        setReturnRequestId(returnRequest._id);
        toastApi.success('Return request submitted', 'Your request will be reviewed soon');
        // Call onSuccess to update the button immediately
        onSuccess?.();
        // Close the return request modal first
        onClose();
        // Then show tracking modal after a brief delay
        setTimeout(() => {
          setShowTrackingModal(true);
        }, 300);
      } else {
        toastApi.success('Return request submitted', 'Your request will be reviewed soon');
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit return request';
      toastApi.error('Submission failed', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = returnReason && images.length >= 2 && images.length <= 5 && !isSubmitting;

  // Always return JSX to maintain hook consistency - never return null
  // Use conditional rendering inside JSX instead
  // Note: We still render tracking modal even when shouldShow is false
  if (!shouldShow && !showTrackingModal) {
    return null;
  }

  return (
    <>
      {/* Main Return Request Modal */}
      {shouldShow && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />

      {/* Modal Container */}
      <div className="fixed inset-0 flex items-end sm:items-center justify-center p-2 sm:p-4 pointer-events-none">
        <div
          className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-lg shadow-xl z-50 max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out pointer-events-auto border-t sm:border border-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 bg-white z-10">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Request Return
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {orderItem?.name || safeOrderItem.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
              disabled={isSubmitting}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
            {/* Return Reason */}
            <div>
              <CustomDropdown
                label="Return Reason *"
                value={returnReason}
                onChange={setReturnReason}
                options={RETURN_REASONS}
                error={!!errors.returnReason}
              />
              {errors.returnReason && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.returnReason}
                </p>
              )}
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Please provide any additional details about your return..."
                rows={4}
                maxLength={1000}
                className="w-full rounded-xl border border-[oklch(0.84_0.04_10.35)]/40 bg-white px-4 py-2 sm:py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[oklch(0.66_0.14_358.91)]/20 focus:border-[oklch(0.66_0.14_358.91)] transition-all duration-200 resize-none"
              />
              <div className="flex items-center justify-between mt-1">
                {errors.note && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.note}
                  </p>
                )}
                <p className="text-xs text-gray-500 ml-auto">
                  {note.length}/1000 characters
                </p>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Upload Images * (2-5 images required)
              </label>
              <div className="space-y-4">
                {/* Upload Area */}
                {images.length < 5 && (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[oklch(0.66_0.14_358.91)]/50 transition-colors">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <label className="cursor-pointer">
                      <span className="text-sm font-medium text-gray-900">
                        Click to upload images
                      </span>
                      <span className="text-sm text-gray-500 block mt-1">
                        PNG, JPG up to 5MB each • {images.length}/5 uploaded
                      </span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        disabled={isSubmitting}
                      />
                    </label>
                  </div>
                )}

                {/* Error Message */}
                {errors.images && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.images}
                  </p>
                )}

                {/* Uploaded Images */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {images.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100 relative">
                          <Image
                            src={imageUrl}
                            alt={`Return image ${index + 1}`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        {uploadingImages[index] ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                            <Spinner className="text-white" />
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            disabled={isSubmitting}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Image Count Info */}
                <p className="text-xs text-gray-500">
                  {images.length < 2 ? (
                    <span className="text-red-600">
                      Please upload at least {2 - images.length} more image{2 - images.length > 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="text-green-600">
                      ✓ {images.length} image{images.length > 1 ? 's' : ''} uploaded
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className="relative px-4 py-2.5 bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] text-white text-sm font-medium rounded-lg hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner className="text-white" />
                    Submitting...
                  </span>
                ) : (
                  'Submit Return Request'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
        </div>
      )}

      {/* Image Upload Progress Modal */}
      <ImageUploadProgress
        isOpen={showUploadProgress}
        onClose={() => {
          if (uploadProgress >= 100) {
            setShowUploadProgress(false);
            setUploadProgress(0);
            setCurrentUploadFile(0);
            setTotalUploadFiles(0);
          }
        }}
        progress={uploadProgress}
        currentFile={currentUploadFile}
        totalFiles={totalUploadFiles}
      />

      {/* Return Request Tracking Modal - Rendered outside main modal */}
      {returnRequestId && (
        <ReturnRequestTrackingModal
          isOpen={showTrackingModal}
          onClose={() => {
            setShowTrackingModal(false);
            setReturnRequestId(null);
            onSuccess?.();
          }}
          returnRequestId={returnRequestId}
        />
      )}
    </>
  );
}

