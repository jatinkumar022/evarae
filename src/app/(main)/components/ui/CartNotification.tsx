'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, X, ShoppingCart } from 'lucide-react';

interface CartNotificationProps {
  isVisible: boolean;
  onClose: () => void;
  productName: string;
}

export default function CartNotification({
  isVisible,
  onClose,
  productName,
}: CartNotificationProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      // Auto dismiss after 6 seconds
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => {
          onClose();
        }, 300); // Wait for animation to complete
      }, 6000);

      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
    }
  }, [isVisible, onClose]);

  if (!isVisible && !isAnimating) return null;

  return (
    <div
      className={`fixed z-[9999] transition-all duration-300 ease-out ${
        isAnimating && isVisible
          ? 'opacity-100 translate-y-0 sm:translate-y-0'
          : 'opacity-0 translate-y-full sm:translate-y-4'
      } ${
        // Mobile: bottom full-width, Desktop: top-right
        'bottom-0 left-0 right-0 sm:bottom-auto sm:left-auto sm:right-4 sm:top-4 sm:w-96 sm:rounded-lg sm:shadow-xl'
      }`}
    >
      <div className="bg-white border-t sm:border sm:border-gray-200 rounded-t-2xl sm:rounded-lg shadow-xl sm:shadow-xl">
        {/* Mobile Layout */}
        <div className="sm:hidden">
          <div className="p-3 flex items-start gap-3">
            {/* Success Icon */}
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>

            {/* Message */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                Item added to cart!
              </p>
              <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">
                {productName}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0 mt-0.5"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* View Cart Button - Full Width on Mobile */}
          <div className="px-3 pb-3 pt-2 border-t border-gray-100">
            <Link
              href="/cart"
              onClick={onClose}
              className="w-full px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              View Cart
            </Link>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center gap-3 p-4">
          {/* Success Icon */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>

          {/* Message */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              Item added to cart!
            </p>
            <p className="text-xs text-gray-600 truncate mt-0.5">
              {productName}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/cart"
              onClick={onClose}
              className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-md hover:bg-primary-dark transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              View Cart
            </Link>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

