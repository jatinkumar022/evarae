'use client';
import { useState, useEffect } from 'react';
import Image from '@/app/(main)/components/ui/FallbackImage';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Product } from '@/lib/types/product';
import { useCartStore } from '@/lib/data/mainStore/cartStore';
import CartNotification from './CartNotification';
import { Spinner } from '@/app/(main)/components/ui/ScaleLoader';
import { useUserAccountStore } from '@/lib/data/mainStore/userAccountStore';
import LoginPromptModal from '@/app/(main)/components/ui/LoginPromptModal';

interface ProductOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export default function ProductOptionsModal({
  isOpen,
  onClose,
  product,
}: ProductOptionsModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [showNotification, setShowNotification] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { user: currentUser } = useUserAccountStore();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const addToCart = useCartStore(s => s.add);

  // User is loaded centrally via Navbar, no need to fetch here

  // Reset state when modal opens/closes or product changes
  useEffect(() => {
    if (isOpen && product) {
      setQuantity(1);
    }
  }, [isOpen, product]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
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

  if (!product) return null;

  const maxQuantity = Math.min(product.stockCount || 10, 10); // Limit to 10 or available stock

  const handleAddToCart = async () => {
    if (!product?.id || isAddingToCart) return;

    if (!currentUser) {
      onClose();
      setShowLoginModal(true);
      return;
    }

    const optimisticProduct = {
      _id: product.id,
      id: product.id,
      name: product.name,
      price: product.price ?? 0,
      discountPrice: product.price ?? 0,
      images: product.images as string[],
      stockQuantity: product.stockCount ?? 1,
    };

    try {
      setIsAddingToCart(true);
      await addToCart({
        productSlug: String(product.id),
        quantity,
        optimisticProduct,
      });
      onClose();
      // Show notification after modal closes
      setShowNotification(true);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const canAddToCart = quantity > 0;

  return (
    <>
      {isOpen && product && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />

          {/* Modal Container - bottom on mobile, centered on desktop */}
          <div className="fixed inset-0 flex items-end sm:items-center justify-center p-2 sm:p-4 pointer-events-none">
            {/* Modal */}
            <div 
              className="relative w-full max-w-md bg-white rounded-2xl sm:rounded-lg shadow-xl z-50 max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out pointer-events-auto border-t sm:border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-primary-dark">
            Select Options
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
                <X className="w-5 h-5 text-gray-500" />
              </button>
              </div>

              {/* Product Info */}
              <div className="p-4 border-b">
          <div className="flex gap-3">
            <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
              <Image
                src={product.images[0]}
                alt={product.name}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-primary-dark text-sm line-clamp-2">
                {product.name}
              </h3>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm font-bold text-accent">
                  ₹{product.price?.toLocaleString()}
                </span>
                {product.originalPrice && product.originalPrice > (product.price ?? 0) && (
                  <span className="text-xs text-gray-500 line-through">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>
              </div>

              {/* Options */}
              <div className="p-4 space-y-4">
              {/* Quantity Selection */}
              <div>
            <label className="block text-sm font-medium text-primary-dark mb-2">
              Quantity
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                disabled={quantity >= maxQuantity}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
                {maxQuantity} available in stock
              </p>
              </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t space-y-2">
          <button
            onClick={handleAddToCart}
            disabled={!canAddToCart || isAddingToCart}
            className={`relative w-full bg-primary text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              isAddingToCart ? 'opacity-80 cursor-wait' : 'hover:bg-primary-dark'
            }`}
          >
            <span className={isAddingToCart ? 'opacity-0 flex items-center gap-2' : 'flex items-center gap-2'}>
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </span>
            {isAddingToCart && (
              <span className="absolute inset-0 flex items-center justify-center">
                <Spinner className="text-white" />
              </span>
            )}
          </button>
          
          <button
            onClick={onClose}
            className="w-full border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
                Cancel
              </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Notification - Rendered outside modal so it persists */}
      {product && (
        <CartNotification
          isVisible={showNotification}
          onClose={() => setShowNotification(false)}
          productName={product.name}
        />
      )}

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        action="cart"
      />
    </>
  );
}
