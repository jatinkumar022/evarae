'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Product } from '@/lib/types/product';
import { useCartStore } from '@/lib/data/mainStore/cartStore';
import CartNotification from './CartNotification';
import InlineLoader from './InlineLoader';

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
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [showNotification, setShowNotification] = useState(false);
  const addToCart = useCartStore(s => s.add);
  const isAdding = useCartStore(s => s.isAdding);

  // Reset state when modal opens/closes or product changes
  useEffect(() => {
    if (isOpen && product) {
      // Pre-select first color if available, otherwise use material (empty string)
      if (product.colors && product.colors.length > 0) {
        setSelectedColor(product.colors[0]);
      } else if (product.material && product.material.trim() !== '') {
        setSelectedColor(''); // Material is represented by empty string in the button
      } else {
        setSelectedColor('');
      }
      setQuantity(1);
    }
  }, [isOpen, product]);

  if (!product) return null;

  const hasColors = (product.colors && product.colors.length > 0) || (product.material && product.material.trim() !== '');
  const maxQuantity = Math.min(product.stockCount || 10, 10); // Limit to 10 or available stock

  const handleAddToCart = async () => {
    if (!product?.id) return;

    const optimisticProduct = {
      _id: product.id,
      id: product.id,
      name: product.name,
      price: product.price ?? 0,
      discountPrice: product.price ?? 0,
      images: product.images as string[],
      thumbnail: (product.images?.[0] as string) || undefined,
      stockQuantity: product.stockCount ?? 1,
    };

    try {
      await addToCart({
        productSlug: String(product.id),
        quantity,
        optimisticProduct,
        selectedColor: hasColors ? selectedColor : undefined,
      });
      onClose();
      // Show notification after modal closes
      setShowNotification(true);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const canAddToCart = quantity > 0 && (!hasColors || selectedColor !== '');

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
          {/* Color Selection */}
          {hasColors && (
            <div>
              <label className="block text-sm font-medium text-primary-dark mb-2">
                {product.colors && product.colors.length > 0 ? 'Color' : 'Material'}
              </label>
              <div className="flex flex-wrap gap-2">
                {product.colors && product.colors.length > 0 ? (
                  product.colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-2 text-xs rounded-full border transition-colors ${
                        selectedColor === color
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                      }`}
                    >
                      {color}
                    </button>
                  ))
                ) : (
                  <button
                    onClick={() => setSelectedColor('')}
                    className={`px-3 py-2 text-xs rounded-full border transition-colors ${
                      selectedColor === ''
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                    }`}
                  >
                    {product.material || 'Default'}
                  </button>
                )}
              </div>
            </div>
          )}

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
            disabled={!canAddToCart || isAdding}
            className="w-full bg-primary text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isAdding ? (
              <>
                <InlineLoader size="sm" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </>
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
    </>
  );
}
