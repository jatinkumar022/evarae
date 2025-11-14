'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
}

export function ImageViewerModal({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
}: ImageViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handlePrevious = useCallback(() => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      document.body.style.overflow = 'hidden';
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
        if (e.key === 'ArrowLeft') {
          handlePrevious();
        }
        if (e.key === 'ArrowRight') {
          handleNext();
        }
      };
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, initialIndex, onClose, handlePrevious, handleNext]);

  if (!isOpen || images.length === 0) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4 pointer-events-none z-50">
        <div
          className="relative w-full h-full max-w-7xl max-h-[95vh] sm:max-h-[90vh] flex flex-col pointer-events-auto bg-black/90 sm:bg-black/50 backdrop-blur-sm rounded-lg sm:rounded-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 bg-black/50 backdrop-blur-sm rounded-t-lg">
            <div className="text-white">
              <p className="text-xs sm:text-sm font-medium">
                Image {currentIndex + 1} of {images.length}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
          </div>

          {/* Image Container */}
          <div className="relative flex-1 flex items-center justify-center bg-black/50 overflow-hidden min-h-0">
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-2 sm:left-4 p-2 sm:p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 sm:right-4 p-2 sm:p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>
              </>
            )}

            <div className="w-full h-full flex items-center justify-center p-2 sm:p-4">
              <img
                src={images[currentIndex]}
                alt={`Return image ${currentIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="p-2 sm:p-4 bg-black/50 backdrop-blur-sm rounded-b-lg overflow-x-auto">
              <div className="flex gap-2 justify-center">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentIndex
                        ? 'border-white scale-110'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

