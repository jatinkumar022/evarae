'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  AlertCircle,
  Tag,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCategoryStore } from '@/lib/data/store/categoryStore';
import { useUploadStore } from '@/lib/data/store/uploadStore';

interface CategoryFormData {
  name: string;
  description: string;
  image: string;
  banner: string;
  mobileBanner: string;
  isActive: boolean;
  sortOrder: number;
}

export default function NewCategoryPage() {
  const router = useRouter();
  const { createCategory, error, clearError } = useCategoryStore();
  const { uploadFile } = useUploadStore();

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    image: '',
    banner: '',
    mobileBanner: '',
    isActive: true,
    sortOrder: 0,
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = <K extends keyof CategoryFormData>(
    field: K,
    value: CategoryFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  };

  // Upload image and set URL
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setValidationErrors(prev => ({
        ...prev,
        image: 'Invalid file type',
      }));
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
    if (url) {
      handleInputChange('image', url);
    }
  };

  // Upload banner and set URL
  const handleBannerSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setValidationErrors(prev => ({
        ...prev,
        banner: 'Invalid file type',
      }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setValidationErrors(prev => ({
        ...prev,
        banner: 'File too large (max 5MB)',
      }));
      return;
    }

    await uploadFile(file);
    const url = useUploadStore.getState().fileUrl;
    if (url) {
      handleInputChange('banner', url);
    }
  };

  // Upload mobile banner and set URL
  const handleMobileBannerSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setValidationErrors(prev => ({
        ...prev,
        mobileBanner: 'Invalid file type',
      }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setValidationErrors(prev => ({
        ...prev,
        mobileBanner: 'File too large (max 5MB)',
      }));
      return;
    }

    await uploadFile(file);
    const url = useUploadStore.getState().fileUrl;
    if (url) {
      handleInputChange('mobileBanner', url);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = 'Category name is required';
    if (!formData.image.trim()) errors.image = 'Category image is required';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      await createCategory(formData);
      router.push('/admin/categories');
    } catch (err) {
      console.error('Failed to create category', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d0d0d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/categories"
                className="inline-flex items-center text-sm text-gray-500 dark:text-[#bdbdbd] hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </div>
            <button
              type="submit"
              form="category-form"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSubmitting ? 'Creating Category...' : 'Save '}
            </button>
          </div>

          <div className="mt-4">
            <h1 className=" text-xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Add New Category
            </h1>
            <p className="mt-2 text-gray-600 dark:text-[#bdbdbd] text-sm md:text-base">
              Create a new category for your jewelry catalog
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
                  Error creating category
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

        <form id="category-form" onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
          <div className="grid grid-cols-1 gap-8 md:gap-10 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8 md:space-y-10">
              {/* Basic Information */}
              <div className="bg-white dark:bg-[#191919] shadow-sm rounded-xl border border-gray-200 dark:border-[#3a3a3a] overflow-visible">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1f1f1f]">
                  <div className="flex items-center">
                    <Tag className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                    <h2 className="md:text-lg font-semibold text-gray-900 dark:text-white">
                      Basic Information
                    </h2>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => handleInputChange('name', e.target.value)}
                      className={`block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-[#bdbdbd] focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent bg-white dark:bg-[#242424] text-gray-900 dark:text-white border-gray-300 dark:border-[#525252] text-sm md:text-base ${
                        validationErrors.name
                          ? 'border-red-300 dark:border-red-800'
                          : 'border-gray-300 dark:border-[#525252]'
                      }`}
                      placeholder="Enter category name"
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
                      className={`block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-[#bdbdbd] focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent bg-white dark:bg-[#242424] text-gray-900 dark:text-white border-gray-300 dark:border-[#525252] resize-none text-sm md:text-base`}
                      placeholder="Describe this category"
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
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-[#525252] rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-[#bdbdbd] focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent bg-white dark:bg-[#242424] text-gray-900 dark:text-white text-sm md:text-base"
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
                        Active Category
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8 md:space-y-10">
              {/* Category Image */}
              <div className="bg-white dark:bg-[#191919] shadow-sm rounded-xl border border-gray-200 dark:border-[#3a3a3a] overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1f1f1f]">
                  <div className="flex items-center">
                    <Upload className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                    <h2 className="md:text-lg font-semibold text-gray-900 dark:text-white">
                      Category Image *
                    </h2>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="border-2 border-dashed border-gray-300 dark:border-[#3a3a3a] rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-[#4a4a4a] hover:bg-gray-50 dark:hover:bg-[#1e1e1e] transition-colors">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 dark:text-[#bdbdbd] mb-2" />
                    <label className="cursor-pointer">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Upload image
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 block">
                        PNG, JPG up to 5MB
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleImageSelect(e)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {validationErrors.image && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {validationErrors.image}
                    </p>
                  )}

                  {formData.image && (
                    <>
                      <div className="relative group w-32 h-32 mx-auto">
                        <Image
                          src={formData.image}
                          alt="Category preview"
                          fill
                          className="object-cover rounded-lg border border-gray-200 dark:border-[#2a2a2a]"
                        />
                        <button
                          type="button"
                          onClick={() => handleInputChange('image', '')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 break-all text-center">
                        {formData.image}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Category Banner (optional) */}
              <div className="bg-white dark:bg-[#191919] shadow-sm rounded-xl border border-gray-200 dark:border-[#3a3a3a] overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1f1f1f]">
                  <div className="flex items-center">
                    <Upload className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                    <h2 className="md:text-lg font-semibold text-gray-900 dark:text-white">
                      Category Banner (optional)
                    </h2>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="border-2 border-dashed border-gray-300 dark:border-[#3a3a3a] rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-[#4a4a4a] hover:bg-gray-50 dark:hover:bg-[#1e1e1e] transition-colors">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 dark:text-[#bdbdbd] mb-2" />
                    <label className="cursor-pointer">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Upload banner
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 block">PNG, JPG up to 5MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleBannerSelect(e)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {validationErrors.banner && (
                    <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.banner}</p>
                  )}

                  {formData.banner && (
                    <>
                      <div className="relative group w-full h-32">
                        <Image
                          src={formData.banner}
                          alt="Banner preview"
                          fill
                          className="object-cover rounded-lg border border-gray-200 dark:border-[#2a2a2a]"
                        />
                        <button
                          type="button"
                          onClick={() => handleInputChange('banner', '')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 break-all text-center">
                        {formData.banner}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Category Mobile Banner (optional) */}
              <div className="bg-white dark:bg-[#191919] shadow-sm rounded-xl border border-gray-200 dark:border-[#3a3a3a] overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1f1f1f]">
                  <div className="flex items-center">
                    <Upload className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                    <h2 className="md:text-lg font-semibold text-gray-900 dark:text-white">
                      Mobile Banner (optional)
                    </h2>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="border-2 border-dashed border-gray-300 dark:border-[#3a3a3a] rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-[#4a4a4a] hover:bg-gray-50 dark:hover:bg-[#1e1e1e] transition-colors">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 dark:text-[#bdbdbd] mb-2" />
                    <label className="cursor-pointer">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Upload mobile banner
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 block">PNG, JPG up to 5MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleMobileBannerSelect(e)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {validationErrors.mobileBanner && (
                    <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.mobileBanner}</p>
                  )}

                  {formData.mobileBanner && (
                    <>
                      <div className="relative group w-full h-32">
                        <Image
                          src={formData.mobileBanner}
                          alt="Mobile banner preview"
                          fill
                          className="object-cover rounded-lg border border-gray-200 dark:border-[#2a2a2a]"
                        />
                        <button
                          type="button"
                          onClick={() => handleInputChange('mobileBanner', '')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 break-all text-center">
                        {formData.mobileBanner}
                      </p>
                    </>
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
                    <span className="text-gray-600 dark:text-gray-400">Category Name:</span>
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
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Banner:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">
                      {formData.banner ? 'Uploaded' : 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Mobile Banner:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">
                      {formData.mobileBanner ? 'Uploaded' : 'Not set'}
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
