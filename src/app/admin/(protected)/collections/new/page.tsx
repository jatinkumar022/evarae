'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Save,
  Trash2,
  Upload,
  X,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCollectionStore } from '@/lib/data/store/collectionStore';
import { useUploadStore } from '@/lib/data/store/uploadStore';
import { toastApi } from '@/lib/toast';
import InlineSpinner from '@/app/admin/components/InlineSpinner';

// Zod schema for collection form validation
const collectionFormSchema = z.object({
  name: z.string().min(1, 'Collection name is required'),
  description: z.string().optional(),
  image: z.string().min(1, 'Collection image is required'),
  isActive: z.boolean(),
  sortOrder: z.string().refine(
    (val) => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 0;
    },
    { message: 'Valid sort order is required' }
  ),
});

type CollectionFormData = z.infer<typeof collectionFormSchema>;

export default function NewCollectionPage() {
  const router = useRouter();
  const { createCollection, error, clearError } = useCollectionStore();
  const { uploadFile } = useUploadStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CollectionFormData>({
    resolver: zodResolver(collectionFormSchema),
    defaultValues: {
      name: '',
      description: '',
      image: '',
      isActive: true,
      sortOrder: '0',
    },
    mode: 'onChange',
  });

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      toastApi.error('Error creating collection', error);
      clearError();
    }
  }, [error, clearError]);

  // Upload image and set URL
  const handleImageSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setValue('image', '', { shouldValidate: true });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setValue('image', '', { shouldValidate: true });
      return;
    }

    await uploadFile(file);
    const uploadState = useUploadStore.getState();
    if (uploadState.error) {
      console.error('Upload error:', uploadState.error);
      return;
    }
    if (uploadState.fileUrl) {
      setValue('image', uploadState.fileUrl, { shouldValidate: true });
    }
  };

  const onSubmit = async (data: CollectionFormData) => {
    clearError();

    try {
      const slug = data.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '');

      const collectionData = {
        name: data.name.trim(),
        slug,
        description: data.description?.trim() || undefined,
        image: data.image,
        isActive: data.isActive,
        sortOrder: parseInt(data.sortOrder, 10) || 0,
      };

      await createCollection(collectionData);
      toastApi.success('Collection created successfully', 'The collection has been added to your catalog');
      router.push('/admin/collections');
    } catch (err) {
      console.error('Failed to create collection', err);
      toastApi.error('Failed to create collection', 'Please try again');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d0d0d]">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/collections"
                className="inline-flex items-center text-sm text-gray-500 dark:text-[#bdbdbd] hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </div>
            <button
              type="submit"
              form="collection-form"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? (
                <InlineSpinner size="sm" className="mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSubmitting ? 'Creating Collection...' : 'Save '}
            </button>
          </div>

          <div className="mt-4">
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Add New Collection
            </h1>
            <p className="mt-2 text-gray-600 dark:text-[#bdbdbd] text-sm md:text-base">
              Create a new collection for your jewelry catalog
            </p>
          </div>
        </div>

        <form id="collection-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8 md:space-y-10">
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
                      {...register('name')}
                      className={`block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-[#bdbdbd] focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent bg-white dark:bg-[#242424] text-gray-900 dark:text-white border-gray-300 dark:border-[#525252] text-sm md:text-base ${
                        errors.name
                          ? 'border-red-300 dark:border-red-800'
                          : 'border-gray-300 dark:border-[#525252]'
                      }`}
                      placeholder="Enter collection name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      {...register('description')}
                      className="block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-[#bdbdbd] focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent bg-white dark:bg-[#242424] text-gray-900 dark:text-white border-gray-300 dark:border-[#525252] resize-none text-sm md:text-base"
                      placeholder="Describe this collection"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Sort Order
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        {...register('sortOrder', {
                          onChange: (e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            setValue('sortOrder', value, { shouldValidate: true });
                          },
                        })}
                        className={`block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-[#bdbdbd] focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent bg-white dark:bg-[#242424] text-gray-900 dark:text-white border-gray-300 dark:border-[#525252] text-sm md:text-base ${
                          errors.sortOrder
                            ? 'border-red-300 dark:border-red-800'
                            : 'border-gray-300 dark:border-[#525252]'
                        }`}
                        placeholder="0"
                      />
                      {errors.sortOrder && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.sortOrder.message}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isActive"
                        {...register('isActive')}
                        className="h-4 w-4 text-primary-600 dark:text-primary-400 border-gray-300 dark:border-[#3a3a3a] rounded focus:ring-primary-500 dark:focus:ring-primary-600 bg-white dark:bg-[#242424]"
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
            <div className="space-y-8">
              {/* Collection Image */}
              <div className="bg-white dark:bg-[#191919] shadow-sm rounded-xl border border-gray-200 dark:border-[#3a3a3a] overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1f1f1f]">
                  <div className="flex items-center">
                    <ImageIcon className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                    <h2 className="md:text-lg font-semibold text-gray-900 dark:text-white">
                      Collection Image *
                    </h2>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="border-2 border-dashed border-gray-300 dark:border-[#2a2a2a] rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-[#3a3a3a] transition-colors">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
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
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {errors.image && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errors.image.message}
                    </p>
                  )}

                  {watch('image') && (
                    <>
                      <div className="relative group w-32 h-32 mx-auto">
                        <Image
                          src={watch('image')}
                          alt="Collection preview"
                          fill
                          className="object-cover rounded-lg border border-gray-200 dark:border-[#2a2a2a]"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setValue('image', '', { shouldValidate: true })
                          }
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 break-all text-center">
                        {watch('image')}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-[#191919] shadow-sm rounded-xl border border-gray-200 dark:border-[#3a3a3a] overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1f1f1f]">
                  <h2 className="md:text-lg font-semibold text-gray-900 dark:text-white">
                    Quick Actions
                  </h2>
                </div>
                <div className="p-6 space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      reset();
                    }}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-[#3a3a3a] text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-[#242424] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Form
                  </button>
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
                      {watch('name') || 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        watch('isActive')
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : 'bg-gray-100 dark:bg-[#2a2a2a] text-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {watch('isActive') ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Sort Order:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">
                      {watch('sortOrder') || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Image:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">
                      {watch('image') ? 'Uploaded' : 'Not set'}
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
