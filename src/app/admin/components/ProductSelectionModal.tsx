'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/lib/types/product';
import { Package } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  selectedProducts: string[];
  onSave: (ids: string[]) => void;
}

export default function ProductSelectionModal({
  isOpen,
  onClose,
  products,
  selectedProducts,
  onSave,
}: Props) {
  const [tempSelection, setTempSelection] =
    useState<string[]>(selectedProducts);

  if (!isOpen) return null; // ✅ don't render modal if closed

  const toggleProduct = (id: string) => {
    setTempSelection(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    onSave(tempSelection);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose} // ✅ close when clicking outside
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-lg p-6 z-50">
        <h2 className="text-lg font-semibold mb-4">Select Products</h2>

        {products.length === 0 ? (
          <p className="text-sm text-gray-500">No products available.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto">
            {products.map(product => {
              const isSelected = tempSelection.includes(product._id);
              return (
                <div
                  key={product._id}
                  onClick={() => toggleProduct(product._id)}
                  className={`cursor-pointer rounded-lg border p-3 flex flex-col items-center transition ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      width={120}
                      height={120}
                      className="object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-[120px] h-[120px] bg-gray-100 flex items-center justify-center rounded-md">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <p className="mt-2 text-sm font-medium text-gray-700 text-center">
                    {product.name}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Save Selection
          </button>
        </div>
      </div>
    </div>
  );
}
