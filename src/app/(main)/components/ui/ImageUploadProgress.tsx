'use client';

import { useEffect } from 'react';
import { X, Upload } from 'lucide-react';

interface ImageUploadProgressProps {
  isOpen: boolean;
  onClose: () => void;
  progress: number;
  currentFile: number;
  totalFiles: number;
  message?: string;
}

export function ImageUploadProgress({
  isOpen,
  onClose,
  progress,
  currentFile,
  totalFiles,
  message,
}: ImageUploadProgressProps) {
  useEffect(() => {
    if (isOpen) {
      // Save original overflow value
      const originalOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      
      // Lock scroll
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && progress >= 100) {
          onClose();
        }
      };
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        // Restore original overflow values
        document.body.style.overflow = originalOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.removeEventListener('keydown', handleEscape);
      };
    } else {
      // Ensure scroll is unlocked when modal closes
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
  }, [isOpen, progress, onClose]);

  if (!isOpen) return null;

  const displayMessage = message || `Uploading image ${currentFile} of ${totalFiles}...`;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity z-40"
        onClick={progress >= 100 ? onClose : undefined}
      />

      {/* Modal Container - Always centered */}
      <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4 pointer-events-none z-50">
        <div
          className="relative w-full max-w-md bg-white rounded-2xl shadow-xl pointer-events-auto border border-primary/10 transform transition-all duration-300 ease-out"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-primary/10">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                  Uploading Images
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 truncate">{displayMessage}</p>
              </div>
            </div>
            {progress >= 100 && (
              <button
                onClick={onClose}
                className="p-1.5 sm:p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 ml-2"
                aria-label="Close"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              </button>
            )}
          </div>

          {/* Progress Content */}
          <div className="p-4 sm:p-6">
            {/* Progress Bar */}
            <div className="mb-3 sm:mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-medium text-gray-700">
                  Progress
                </span>
                <span className="text-xs sm:text-sm font-semibold text-primary">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary to-primary-dark h-2 sm:h-2.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Status Messages */}
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
              {progress < 30 && (
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse flex-shrink-0" />
                  <span>Preparing image for upload...</span>
                </p>
              )}
              {progress >= 30 && progress < 70 && (
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse flex-shrink-0" />
                  <span>Uploading to server...</span>
                </p>
              )}
              {progress >= 70 && progress < 100 && (
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse flex-shrink-0" />
                  <span>Processing image...</span>
                </p>
              )}
              {progress >= 100 && (
                <p className="flex items-center gap-2 text-green-600 font-medium">
                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full flex-shrink-0" />
                  <span>All images uploaded successfully!</span>
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          {progress >= 100 && (
            <div className="p-4 sm:p-5 border-t border-primary/10 bg-gray-50 rounded-b-2xl">
              <button
                onClick={onClose}
                className="w-full px-4 py-2.5 sm:py-2 bg-primary text-white rounded-md hover:bg-primary-dark active:bg-primary-dark transition-colors font-medium text-sm sm:text-base"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

