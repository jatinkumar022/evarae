'use client';
import { useEffect } from 'react';
import { X, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  action?: 'cart' | 'wishlist';
}

export default function LoginPromptModal({
  isOpen,
  onClose,
  action = 'cart',
}: LoginPromptModalProps) {
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'auto';
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogin = () => {
    router.push('/login');
    onClose();
  };

  const actionText = action === 'wishlist' ? 'add items to your wishlist' : 'add items to your cart';

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-prompt-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container - bottom on mobile, centered on desktop */}
      <div className="fixed inset-0 flex items-end sm:items-center justify-center p-2 sm:p-4 pointer-events-none">
        <div
          className="relative w-full sm:max-w-md bg-white rounded-2xl shadow-xl z-50 pointer-events-auto transform transition-all duration-300 ease-out border-t sm:border border-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b">
            <h2
              id="login-prompt-title"
              className="text-xl font-semibold text-primary-dark"
            >
              Login Required
            </h2>
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
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <LogIn className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">
                  Please login to continue
                </p>
                <p className="text-sm text-gray-600">
                  You need to be logged in to {actionText}. Please login or create an account to continue.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-6 border-t bg-gray-50 flex flex-col sm:flex-row gap-3 sm:justify-end rounded-b-2xl">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleLogin}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Go to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

