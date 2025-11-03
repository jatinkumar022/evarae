'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  AlertCircle,
  Layers,
  Loader2,
  ImageIcon,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCollectionStore } from '@/lib/data/store/collectionStore';
import { useUploadStore } from '@/lib/data/store/uploadStore';
import { setDummyCollectionsInStore } from '@/lib/data/dummyDataHelper';
import { dummyCollections } from '@/lib/data/dummyCollections';

interface CollectionFormData {
  name: string;
  description: string;
  image: string;
  isActive: boolean;
  sortOrder: number;
}

export default function EditCollectionPage() {
  const router = useRouter();
  const params = useParams();
  const collectionId = params.id as string;

  const {
    currentCollection,
    // fetchCollection,
    updateCollection,
    error,
    clearError,
  } = useCollectionStore();
  const { uploadFile } = useUploadStore();

  const [formData, setFormData] = useState<CollectionFormData>({
    name: '',
    description: '',
    image: '',
    isActive: true,
    sortOrder: 0,
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    // Load dummy collections instead of API call
    setDummyCollectionsInStore();
    
    if (collectionId) {
      // Find collection from dummy data
      const collection = dummyCollections.find(c => c._id === collectionId);
      if (collection) {
        useCollectionStore.setState({ 
          currentCollection: collection, 
          status: 'success', 
          error: null 
        });
      } else {
        useCollectionStore.setState({ 
          currentCollection: null, 
          status: 'error', 
          error: 'Collection not found' 
        });
      }
    }
  }, [collectionId]);

  useEffect(() => {
    if (currentCollection) {
      setFormData({
        name: currentCollection.name || '',
        description: currentCollection.description || '',
        image: currentCollection.image || '',
        isActive: currentCollection.isActive ?? true,
        sortOrder: currentCollection.sortOrder || 0,
      });
    }
  }, [currentCollection]);

  const handleInputChange = <K extends keyof CollectionFormData>(
    field: K,
    value: CollectionFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next[field as string];
        return next;
      });
    }
  };

  // Upload image and set URL
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setValidationErrors(prev => ({ ...prev, image: 'Invalid file type' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setValidationErrors(prev => ({
        ...prev,
        image: 'File too large (max 5MB)',
      }));
      return;
    }

    await uploadFile(file);
    const url = useUploadStore.getState().fileUrl;
    if (url) handleInputChange('image', url);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setValidationErrors(prev => ({ ...prev, image: 'Invalid file type' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setValidationErrors(prev => ({
        ...prev,
        image: 'File too large (max 5MB)',
      }));
      return;
    }
    await uploadFile(file);
    const url = useUploadStore.getState().fileUrl;
    if (url) handleInputChange('image', url);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Collection name is required';
    if (!formData.image.trim()) errors.image = 'Collection image is required';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      await updateCollection(collectionId, formData);
      router.push('/admin/collections');
    } catch (err) {
      console.error('Failed to update collection', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentCollection) {
    return (
      <div className="text-center py-12">
        <h3 className="text-sm md:text-lg font-medium text-gray-900 dark:text-white">
          Collection not found
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-[#696969]">
          The collection you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/admin/collections"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-500"
        >
          Back to Collections
        </Link>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d0d0d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/collections"
                className="inline-flex items-center text-sm text-gray-500 dark:text-[#696969] hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </div>
            <button
              type="submit"
              form="collection-form"
              disabled={isSubmitting}
              className="inline-flex items-center px-6 py-3 border border-transparent text-xs md:text-sm font-medium rounded-lg shadow-sm text-white bg-primary-500 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSubmitting ? 'Updating Collection...' : 'Update '}
            </button>
          </div>

          <div className="mt-4">
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Edit Collection
            </h1>
            <p className="mt-2 text-gray-600 dark:text-[#696969] text-sm md:text-base">
              Update collection information and settings
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                  Error updating collection
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</div>
                <div className="mt-4">
                  <button
                    onClick={clearError}
                    className="bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-md text-sm text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <form id="collection-form" onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
          <div className="grid grid-cols-1 gap-8 md:gap-10 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8 md:space-y-10">
              {/* Basic Information */}
              <div className="bg-white dark:bg-[#191919] shadow-sm rounded-xl border border-gray-200 dark:border-[#3a3a3a] overflow-visible">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1f1f1f]">
                  <div className="flex items-center">
                    <Layers className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                    <h2 className="md:text-lg font-semibold text-gray-900 dark:text-white">
                      Basic Information
                    </h2>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Collection Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => handleInputChange('name', e.target.value)}
                      className={`block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-[#696969] focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent bg-white dark:bg-[#242424] text-gray-900 dark:text-white border-gray-300 dark:border-[#525252] text-sm md:text-base ${
                        validationErrors.name
                          ? 'border-red-300 dark:border-red-800'
                          : 'border-gray-300 dark:border-[#525252]'
                      }`}
                      placeholder="Enter collection name"
                    />
                    {validationErrors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {validationErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={e =>
                        handleInputChange('description', e.target.value)
                      }
                      className={`block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-[#696969] focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent bg-white dark:bg-[#242424] text-gray-900 dark:text-white border-gray-300 dark:border-[#525252] resize-none text-sm md:text-base`}
                      placeholder="Describe this collection"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Sort Order
                      </label>
                      <input
                        type="number"
                        value={formData.sortOrder}
                        onChange={e =>
                          handleInputChange(
                            'sortOrder',
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-[#525252] rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-[#696969] focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent bg-white dark:bg-[#242424] text-gray-900 dark:text-white text-sm md:text-base"
                        placeholder="0"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={e =>
                          handleInputChange('isActive', e.target.checked)
                        }
                        className="h-4 w-4 text-primary-600 border-gray-300 dark:border-[#3a3a3a] rounded focus:ring-primary-500 dark:focus:ring-primary-600 bg-white dark:bg-[#242424]"
                      />
                      <label
                        htmlFor="isActive"
                        className="ml-2 block text-sm text-gray-900 dark:text-gray-100"
                      >
                        Active Collection
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8 md:space-y-10">
              {/* Collection Image */}
              <div className="bg-white dark:bg-[#191919] shadow-sm rounded-xl border border-gray-200 dark:border-[#3a3a3a] overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1f1f1f]">
                  <div className="flex items-center">
                    <Upload className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                    <h2 className="md:text-lg font-semibold text-gray-900 dark:text-white">
                      Collection Image *
                    </h2>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {/* Upload Area */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                      dragOver
                        ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-600'
                        : formData.image
                        ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-300 dark:border-[#3a3a3a] hover:border-gray-400 dark:hover:border-[#4a4a4a] hover:bg-gray-50 dark:hover:bg-[#1e1e1e]'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {formData.image ? (
                      <div className="space-y-4">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                          <ImageIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-300">
                          Image uploaded successfully!
                        </p>
                        <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-white dark:bg-[#242424] border border-gray-300 dark:border-[#3a3a3a] rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-all">
                          <Upload className="h-4 w-4 mr-2" />
                          Replace Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                          />
                        </label>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-[#2a2a2a] rounded-full flex items-center justify-center mx-auto">
                          <Upload className="h-6 w-6 text-gray-400 dark:text-[#696969]" />
                        </div>
                        <div>
                          <label className="cursor-pointer">
                            <span className="text-sm md:text-base font-medium text-gray-900 dark:text-gray-100 block mb-1">
                              Upload collection image
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 block mb-3">
                              Drag & drop or click to browse
                            </span>
                            <span className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-600 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-700 transition-all">
                              <Upload className="h-4 w-4 mr-2" />
                              Choose File
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageSelect}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PNG, JPG up to 5MB
                        </p>
                      </div>
                    )}
                  </div>

                  {validationErrors.image && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        {validationErrors.image}
                      </p>
                    </div>
                  )}

                  {/* Image Preview */}
                  {formData.image && (
                    <div className="space-y-4">
                      <div className="relative group">
                        <div className="aspect-square w-full max-w-xs mx-auto rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-[#2a2a2a]">
                          <Image
                            src={formData.image}
                            alt="Collection preview"
                            width={300}
                            height={300}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleInputChange('image', '')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 break-all text-center">
                        {formData.image}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Summary */}
              <div className="bg-white dark:bg-[#191919] shadow-sm rounded-xl overflow-hidden border border-gray-200 dark:border-[#3a3a3a]">
                <div className="px-6 py-4 bg-gray-50 dark:bg-[#1f1f1f]">
                  <h2 className="md:text-lg font-semibold text-gray-900 dark:text-white">
                    Form Summary
                  </h2>
                </div>
                <div className="p-6 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Collection Name:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">
                      {formData.name || 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        formData.isActive
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : 'bg-gray-100 dark:bg-[#2a2a2a] text-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Sort Order:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">
                      {formData.sortOrder}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Image:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">
                      {formData.image ? 'Uploaded' : 'Not set'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
