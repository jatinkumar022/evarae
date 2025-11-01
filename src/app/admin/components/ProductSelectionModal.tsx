'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { type Product } from '@/lib/data/store/productStore';
import { Package } from 'lucide-react';
import Modal from './Modal';

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

  // Update temp selection when selectedProducts changes
  useEffect(() => {
    setTempSelection(selectedProducts);
  }, [selectedProducts]);

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Products"
      size="lg"
      footer={(
        <>
          <button
            onClick={handleSave}
            className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-sm font-medium text-white hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700"
          >
            Save Selection
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 dark:border-[#3a3a3a] shadow-sm px-4 py-2 bg-white dark:bg-[#242424] text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
          >
            Cancel
          </button>
        </>
      )}
    >
      {products.length === 0 ? (
        <div className="text-center py-8">
          <Package className="mx-auto h-12 w-12 text-gray-400 dark:text-[#696969] mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No products available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto">
          {products.map(product => {
            const isSelected = tempSelection.includes(product._id);
            return (
              <div
                key={product._id}
                onClick={() => toggleProduct(product._id)}
                className={`cursor-pointer rounded-lg border-2 p-3 flex flex-col items-center transition-all ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-600'
                    : 'border-gray-200 dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'
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
                  <div className="w-[120px] h-[120px] bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center rounded-md">
                    <Package className="h-8 w-8 text-gray-400 dark:text-[#696969]" />
                  </div>
                )}
                <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                  {product.name}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
