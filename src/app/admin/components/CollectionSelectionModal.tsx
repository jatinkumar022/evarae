'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { type Collection } from '@/lib/data/store/collectionStore';
import { Layers } from 'lucide-react';
import Modal from './Modal';
import InlineSpinner from './InlineSpinner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  collections: Collection[];
  selectedCollections: string[];
  onSave: (ids: string[]) => void;
  isSaving?: boolean;
  maxSelection?: number;
}

export default function CollectionSelectionModal({
  isOpen,
  onClose,
  collections,
  selectedCollections,
  onSave,
  isSaving = false,
  maxSelection,
}: Props) {
  const [tempSelection, setTempSelection] =
    useState<string[]>(selectedCollections);

  // Update temp selection when selectedCollections changes
  useEffect(() => {
    setTempSelection(selectedCollections);
  }, [selectedCollections]);

  const toggleCollection = (id: string) => {
    setTempSelection(prev => {
      if (prev.includes(id)) {
        return prev.filter(c => c !== id);
      }
      // If maxSelection is set and we've reached it, don't add more
      if (maxSelection && prev.length >= maxSelection) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleSave = () => {
    if (isSaving) return;
    onSave(tempSelection);
    // Parent will close modal after save completes
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Select Collections${maxSelection ? ` (Max ${maxSelection})` : ''}`}
      size="lg"
      footer={(
        <>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-sm font-medium text-white hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <InlineSpinner size="sm" />
                Saving...
              </>
            ) : (
              'Save Selection'
            )}
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
      {collections.length === 0 ? (
        <div className="text-center py-8">
          <Layers className="mx-auto h-12 w-12 text-gray-400 dark:text-[#bdbdbd] mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No collections available.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {collections.map(collection => {
            const isSelected = tempSelection.includes(collection._id);
            const isDisabled = maxSelection
              ? !isSelected && tempSelection.length >= maxSelection
              : false;
            return (
              <div
                key={collection._id}
                onClick={() => !isDisabled && toggleCollection(collection._id)}
                className={`cursor-pointer rounded-lg border-2 p-4 flex items-center gap-4 transition-all ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-600'
                    : isDisabled
                    ? 'border-gray-200 dark:border-[#3a3a3a] bg-gray-50 dark:bg-[#1e1e1e] opacity-50 cursor-not-allowed'
                    : 'border-gray-200 dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'
                }`}
              >
                {collection.image ? (
                  <Image
                    src={collection.image}
                    alt={collection.name}
                    width={80}
                    height={80}
                    className="object-cover rounded-md flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center rounded-md flex-shrink-0">
                    <Layers className="h-8 w-8 text-gray-400 dark:text-[#bdbdbd]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {collection.name}
                  </p>
                  {collection.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {collection.description}
                    </p>
                  )}
                </div>
                {isSelected && (
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

