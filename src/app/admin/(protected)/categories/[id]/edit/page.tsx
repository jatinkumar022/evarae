'use client';
import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Tag,
  Image as ImageIcon,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCategoryStore } from '@/lib/data/store/categoryStore';
import { useUploadStore } from '@/lib/data/store/uploadStore';
import { toastApi } from '@/lib/toast';
import InlineSpinner from '@/app/admin/components/InlineSpinner';
import UploadProgressModal from '@/app/admin/components/UploadProgressModal';

// Zod schema for category form validation
const categoryFormSchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  image: z.string().min(1, 'Category image is required'),
  banner: z.string().optional(),
  mobileBanner: z.string().optional(),
  isActive: z.boolean(),
  sortOrder: z.string().refine(
    (val) => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 0;
    },
    { message: 'Valid sort order is required' }
  ),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;

  const {
    currentCategory,
    fetchCategory,
    updateCategory,
    status,
    error,
    clearError,
  } = useCategoryStore();
  const { uploadFile } = useUploadStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
      image: '',
      banner: '',
      mobileBanner: '',
      isActive: true,
      sortOrder: '0',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (categoryId) {
      fetchCategory(categoryId);
    }
  }, [categoryId, fetchCategory]);

  useEffect(() => {
    if (currentCategory) {
      reset({
        name: currentCategory.name || '',
        description: currentCategory.description || '',
        image: currentCategory.image || '',
        banner: currentCategory.banner || '',
        mobileBanner: currentCategory.mobileBanner || '',
        isActive: currentCategory.isActive ?? true,
        sortOrder: currentCategory.sortOrder?.toString() || '0',
      });
    }
  }, [currentCategory, reset]);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      toastApi.error('Error updating category', error);
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

  // Upload banner and set URL
  const handleBannerSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setValue('banner', '', { shouldValidate: true });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setValue('banner', '', { shouldValidate: true });
      return;
    }

    await uploadFile(file);
    const uploadState = useUploadStore.getState();
    if (uploadState.error) {
      console.error('Upload error:', uploadState.error);
      return;
    }
    if (uploadState.fileUrl) {
      setValue('banner', uploadState.fileUrl, { shouldValidate: true });
    }
  };

  // Upload mobile banner and set URL
  const handleMobileBannerSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setValue('mobileBanner', '', { shouldValidate: true });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setValue('mobileBanner', '', { shouldValidate: true });
      return;
    }

    await uploadFile(file);
    const uploadState = useUploadStore.getState();
    if (uploadState.error) {
      console.error('Upload error:', uploadState.error);
      return;
    }
    if (uploadState.fileUrl) {
      setValue('mobileBanner', uploadState.fileUrl, { shouldValidate: true });
    }
  };

  const onSubmit = async (data: CategoryFormData) => {
    clearError();

    try {
      const slug = data.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '');

      const categoryData = {
        name: data.name.trim(),
        slug,
        description: data.description?.trim() || undefined,
        image: data.image,
        banner: data.banner && data.banner.trim() !== '' ? data.banner : undefined,
        mobileBanner: data.mobileBanner && data.mobileBanner.trim() !== '' ? data.mobileBanner : undefined,
        isActive: data.isActive,
        sortOrder: parseInt(data.sortOrder, 10) || 0,
      };

      await updateCategory(categoryId, categoryData);
      toastApi.success('Category updated successfully', 'The category has been updated');
      router.push('/admin/categories');
    } catch (err) {
      console.error('Failed to update category', err);
      toastApi.error('Failed to update category', 'Please try again');
    }
  };

  // Show loading state while fetching
  if (status === 'loading') {
    return (
      <div className="h-full bg-gray-50 dark:bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-center">
          <InlineSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-[#bdbdbd]">Loading category...</p>
        </div>
      </div>
    );
  }

  if (!currentCategory) {
    return (
      <div className="text-center py-12">
        <h3 className="text-sm md:text-lg font-medium text-gray-900 dark:text-white">
          Category not found
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-[#bdbdbd]">
          The category you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/admin/categories"
          prefetch={true}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-500"
        >
          Back to Categories
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d0d0d]">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/categories"
                prefetch={true}
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
              className="inline-flex items-center px-6 py-3 border border-transparent text-xs md:text-sm font-medium rounded-lg shadow-sm text-white bg-primary-500 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? (
                <InlineSpinner size="sm" className="mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSubmitting ? 'Updating Category...' : 'Update '}
            </button>
          </div>

          <div className="mt-4">
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Edit Category
            </h1>
            <p className="mt-2 text-gray-600 dark:text-[#bdbdbd] text-sm md:text-base">
              Update category information and settings
            </p>
          </div>
        </div>

        <form id="category-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8 md:space-y-10">
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
                      {...register('name')}
                      className={`block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-[#bdbdbd] focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent bg-white dark:bg-[#242424] text-gray-900 dark:text-white border-gray-300 dark:border-[#525252] text-sm md:text-base ${
                        errors.name
                          ? 'border-red-300 dark:border-red-800'
                          : 'border-gray-300 dark:border-[#525252]'
                      }`}
                      placeholder="Enter category name"
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
                      placeholder="Describe this category"
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
                        Active Category
                      </label>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Category Image */}
              <div className="bg-white dark:bg-[#191919] shadow-sm rounded-xl border border-gray-200 dark:border-[#3a3a3a] overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1f1f1f]">
                  <div className="flex items-center">
                    <ImageIcon className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                    <h2 className="md:text-lg font-semibold text-gray-900 dark:text-white">
                      Category Image *
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
                    <div className="relative group w-32 h-32 mx-auto">
                      <Image
                        src={watch('image')}
                        alt="Category preview"
                        fill
                        className="object-cover rounded-lg border border-gray-200 dark:border-[#2a2a2a]"
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
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
                  )}
                </div>
              </div>

              {/* Category Banner */}
              <div className="bg-white dark:bg-[#191919] shadow-sm rounded-xl border border-gray-200 dark:border-[#3a3a3a] overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1f1f1f]">
                  <div className="flex items-center">
                    <ImageIcon className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                    <h2 className="md:text-lg font-semibold text-gray-900 dark:text-white">
                      Category Banner (optional)
                    </h2>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="border-2 border-dashed border-gray-300 dark:border-[#2a2a2a] rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-[#3a3a3a] transition-colors">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
                    <label className="cursor-pointer">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Upload banner
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 block">
                        PNG, JPG up to 5MB
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerSelect}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {watch('banner') && watch('banner')?.trim() !== '' && (
                    <div className="relative group w-full h-32">
                      <Image
                        src={watch('banner')!}
                        alt="Banner preview"
                        fill
                        className="object-cover rounded-lg border border-gray-200 dark:border-[#2a2a2a]"
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setValue('banner', '', { shouldValidate: true })
                        }
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Banner */}
              <div className="bg-white dark:bg-[#191919] shadow-sm rounded-xl border border-gray-200 dark:border-[#3a3a3a] overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1f1f1f]">
                  <div className="flex items-center">
                    <ImageIcon className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                    <h2 className="md:text-lg font-semibold text-gray-900 dark:text-white">
                      Mobile Banner (optional)
                    </h2>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="border-2 border-dashed border-gray-300 dark:border-[#2a2a2a] rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-[#3a3a3a] transition-colors">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
                    <label className="cursor-pointer">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Upload mobile banner
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 block">
                        PNG, JPG up to 5MB
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleMobileBannerSelect}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {watch('mobileBanner') && watch('mobileBanner')?.trim() !== '' && (
                    <div className="relative group w-full h-32">
                      <Image
                        src={watch('mobileBanner')!}
                        alt="Mobile banner preview"
                        fill
                        className="object-cover rounded-lg border border-gray-200 dark:border-[#2a2a2a]"
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setValue('mobileBanner', '', { shouldValidate: true })
                        }
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
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
                    <span className="text-gray-600 dark:text-gray-400">Category Name:</span>
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
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Banner:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">
                      {watch('banner') ? 'Uploaded' : 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Mobile Banner:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">
                      {watch('mobileBanner') ? 'Uploaded' : 'Not set'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
      <UploadProgressModal />
    </div>
  );
}
