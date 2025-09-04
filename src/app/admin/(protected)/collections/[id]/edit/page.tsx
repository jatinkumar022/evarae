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
  Check,
  ImageIcon,
  Info,
  Sparkles,
  Eye,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCollectionStore } from '@/lib/data/store/collectionStore';
import { useUploadStore } from '@/lib/data/store/uploadStore';

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
    fetchCollection,
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
  const [previewMode, setPreviewMode] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (collectionId) fetchCollection(collectionId);
  }, [collectionId, fetchCollection]);

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
      <div className="min-h-screen ">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  const completionPercentage = Math.round(
    (formData.name ? 25 : 0) +
      (formData.description ? 25 : 0) +
      (formData.image ? 40 : 0) +
      10
  );

  return (
    <div className="min-h-screen ">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
            <Link
              href="/admin/collections"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:bg-white hover:text-gray-900 hover:shadow-md transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>

            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:bg-white hover:shadow-md transition-all duration-200"
              >
                <Eye className="h-4 w-4 mr-2" />
                {previewMode ? 'Edit Mode' : 'Preview'}
              </button>

              <button
                type="submit"
                form="collection-form"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:bg-white hover:shadow-md transition-all duration-200"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Save className="h-5 w-5 mr-2" />
                )}
                {isSubmitting ? 'Updating Collection...' : 'Update'}
              </button>
            </div>
          </div>

          {/* Header Content */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl md:text-3xl font-bold">
                      Edit Collection
                    </h1>
                    <p className="text-indigo-100 md:text-lg text-sm">
                      Update your jewelry collection
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="text-center">
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="30"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="transparent"
                      className="text-white/20"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="30"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 30}`}
                      strokeDashoffset={`${
                        2 * Math.PI * 30 * (1 - completionPercentage / 100)
                      }`}
                      className="text-white transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold">
                      {completionPercentage}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-indigo-100 mt-1">Complete</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl p-6 shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-red-800 mb-1">
                  Error updating collection
                </h3>
                <div className="text-red-700 mb-4">{error}</div>
                <button
                  onClick={clearError}
                  className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-all duration-200"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preview Mode */}
        {previewMode && (
          <div className="mb-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <h2 className="text-xl font-semibold">Collection Preview</h2>
            </div>
            <div className="p-8">
              <div className="max-w-sm mx-auto">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="aspect-square bg-gray-100">
                    {formData.image ? (
                      <Image
                        src={formData.image}
                        alt={formData.name || 'Collection preview'}
                        width={400}
                        height={400}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">No image uploaded</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {formData.name || 'Collection Name'}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          formData.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {formData.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {formData.description || 'No description provided'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        {!previewMode && (
          <form
            id="collection-form"
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Basic Information */}
                <div className="bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl border border-white/20 overflow-hidden">
                  <div className="px-6 py-5 bg-gradient-to-r from-indigo-500 to-purple-600">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur mr-3">
                        <Layers className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="md:text-xl font-semibold text-white">
                        Basic Information
                      </h2>
                    </div>
                  </div>
                  <div className="p-8 space-y-8">
                    {/* Collection Name */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        Collection Name *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={e =>
                            handleInputChange('name', e.target.value)
                          }
                          className={`block w-full text-sm px-4 py-3 border-2 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                            validationErrors.name
                              ? 'border-red-300 bg-red-50'
                              : 'border-gray-200 focus:border-indigo-300 group-hover:border-gray-300'
                          }`}
                          placeholder="Enter collection name (e.g., 'Vintage Gold Collection')"
                        />
                        {formData.name && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Check className="h-5 w-5 text-green-500" />
                          </div>
                        )}
                      </div>
                      {validationErrors.name && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {validationErrors.name}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        Description
                      </label>
                      <div className="relative">
                        <textarea
                          rows={4}
                          value={formData.description}
                          onChange={e =>
                            handleInputChange('description', e.target.value)
                          }
                          className="block w-full text-sm px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all duration-200 group-hover:border-gray-300"
                          placeholder="Describe this collection (e.g., 'Elegant vintage-inspired gold jewelry featuring intricate designs...')"
                        />
                        <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                          {formData.description.length} characters
                        </div>
                      </div>
                    </div>

                    {/* Settings Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Sort Order */}
                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Sort Order
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={formData.sortOrder}
                            onChange={e =>
                              handleInputChange(
                                'sortOrder',
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="block text-sm w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 group-hover:border-gray-300"
                            placeholder="0"
                          />
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          Lower numbers appear first
                        </p>
                      </div>

                      {/* Active Status */}
                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Collection Status
                        </label>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              id="isActive"
                              checked={formData.isActive}
                              onChange={e =>
                                handleInputChange('isActive', e.target.checked)
                              }
                              className="sr-only text-sm"
                            />
                            <div
                              className={`relative  w-12 h-6 rounded-full transition-colors duration-200 ${
                                formData.isActive
                                  ? 'bg-indigo-600'
                                  : 'bg-gray-300'
                              }`}
                            >
                              <div
                                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${
                                  formData.isActive ? 'translate-x-6' : ''
                                }`}
                              ></div>
                            </div>
                            <span className="ml-3 text-sm font-medium text-gray-900">
                              {formData.isActive
                                ? 'Active Collection'
                                : 'Inactive Collection'}
                            </span>
                          </label>
                          <p className="mt-2 text-xs text-gray-500">
                            {formData.isActive
                              ? 'Collection is visible to customers'
                              : 'Collection is hidden from customers'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                {/* Collection Image */}
                <div className="bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl border border-white/20 overflow-hidden">
                  <div className="px-6 py-5 bg-gradient-to-r from-purple-500 to-pink-600">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur mr-3">
                        <Upload className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-sm md:text-xl font-semibold text-white">
                        Collection Image *
                      </h2>
                    </div>
                  </div>
                  <div className="p-6 space-y-6">
                    {/* Upload Area */}
                    <div
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                        dragOver
                          ? 'border-indigo-400 bg-indigo-50'
                          : formData.image
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      {formData.image ? (
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <Check className="h-8 w-8 text-green-600" />
                          </div>
                          <p className="text-sm font-medium text-green-800">
                            Image uploaded successfully!
                          </p>
                          <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
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
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                            <Upload className="h-8 w-8 text-gray-400" />
                          </div>
                          <div>
                            <label className="cursor-pointer">
                              <span className="text-lg font-semibold text-gray-900 block mb-1">
                                Upload collection image
                              </span>
                              <span className="text-sm text-gray-500 block mb-3">
                                Drag & drop or click to browse
                              </span>
                              <span className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all">
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
                          <p className="text-xs text-gray-500">
                            PNG, JPG up to 5MB
                          </p>
                        </div>
                      )}
                    </div>

                    {validationErrors.image && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          {validationErrors.image}
                        </p>
                      </div>
                    )}

                    {/* Image Preview */}
                    {formData.image && (
                      <div className="space-y-4">
                        <div className="relative group">
                          <div className="aspect-square w-full max-w-xs mx-auto rounded-xl overflow-hidden shadow-lg">
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
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Summary */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 backdrop-blur-xl shadow-xl rounded-2xl border border-indigo-200 overflow-hidden">
                  <div className="px-6 py-5 bg-gradient-to-r from-indigo-600 to-purple-600">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur mr-3">
                        <Info className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-sm md:text-xl font-semibold text-white">
                        Summary
                      </h2>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="text-sm text-gray-600">
                          Collection Name:
                        </span>
                        <span className="font-semibold text-sm md:text-xl text-gray-900 truncate ml-2">
                          {formData.name || 'Not set'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            formData.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {formData.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="text-sm text-gray-600">
                          Sort Order:
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formData.sortOrder}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="text-sm text-gray-600">Image:</span>
                        <div className="flex items-center">
                          {formData.image ? (
                            <div className="flex items-center text-green-600">
                              <Check className="h-4 w-4 mr-1" />
                              <span className="text-sm font-medium">
                                Uploaded
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">
                              Not set
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="pt-4 border-t border-indigo-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-indigo-800">
                          Completion
                        </span>
                        <span className="text-sm font-bold text-indigo-800">
                          {completionPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-indigo-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${completionPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
