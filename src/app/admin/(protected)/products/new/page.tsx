'use client';
import { useState, useEffect } from 'react';
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
  Package,
  DollarSign,
  Tag,
  Image as ImageIcon,
  Video,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useProductStore } from '@/lib/data/store/productStore';
import { useCategoryStore } from '@/lib/data/store/categoryStore';
import { CustomSelect } from '@/app/admin/components/CustomSelect';
import { useUploadStore } from '@/lib/data/store/uploadStore';
import { toastApi } from '@/lib/toast';
import InlineSpinner from '@/app/admin/components/InlineSpinner';

// Zod schema for product form validation
const productFormSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    { message: 'Valid price is required' }
  ),
  discountPrice: z.string().optional(),
  categories: z.array(z.string()).min(1, 'At least one category is required'),
  material: z.string().optional(),
  weight: z.string().optional(),
  colors: z.array(z.string()),
  stockQuantity: z.string().refine(
    (val) => {
      if (!val || val.trim() === '') return false;
      const num = parseInt(val);
      return !isNaN(num) && num >= 0;
    },
    { message: 'Valid stock quantity is required' }
  ),
  sku: z.string().optional(),
  status: z.enum(['active', 'out_of_stock', 'hidden']),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  tags: z.array(z.string()),
  video: z.string().optional(),
  images: z.array(z.string()).min(1, 'At least one product image is required'),
}).refine(
  (data) => {
    if (data.discountPrice && data.discountPrice.trim() !== '') {
      const discount = parseFloat(data.discountPrice);
      const price = parseFloat(data.price);
      return !isNaN(discount) && !isNaN(price) && discount < price;
    }
    return true;
  },
  {
    message: 'Discount price must be less than regular price',
    path: ['discountPrice'],
  }
);

type ProductFormData = z.infer<typeof productFormSchema>;
const materials = [
  'Brass Alloy (Gold Color)',
  'Copper Alloy (Gold Color)',
  'Zinc Alloy (Gold Color)',
  'Stainless Steel Alloy (Gold Tone)',
  'American Diamond (CZ)',
  'Crystal Stones',
  'Pearl Beads',
  'Oxidised Alloy',
];

const colors = [
  'Rose Gold',
  'Silver',
  'Gold',
  'Platinum',
  'White Gold',
  'Yellow Gold',
];

const statusOptions = [
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
  {
    value: 'out_of_stock',
    label: 'Out of Stock',
    color: 'bg-yellow-100 text-yellow-800',
  },
  { value: 'hidden', label: 'Hidden', color: 'bg-gray-100 text-gray-800' },
];

export default function NewProductPage() {
  const router = useRouter();
  const { createProduct, error, clearError } = useProductStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { uploadFile } = useUploadStore();

  const [tagInput, setTagInput] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    categories: [],
    material: '',
    weight: '',
    colors: [],
      stockQuantity: '',
    sku: '',
    status: 'active',
    metaTitle: '',
    metaDescription: '',
    tags: [],
    video: '',
    images: [],
    },
    mode: 'onChange',
  });

  const formValues = watch();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      toastApi.error('Error creating product', error);
      clearError();
    }
  }, [error, clearError]);

  // Auto-generate SKU from name
  useEffect(() => {
    if (formValues.name && !formValues.sku) {
      const generatedSku =
        formValues.name
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '')
          .substring(0, 8) +
        '-' +
        Date.now().toString().slice(-4);
      setValue('sku', generatedSku);
    }
  }, [formValues.name, formValues.sku, setValue]);

  // Auto-generate meta title from name
  useEffect(() => {
    if (formValues.name && !formValues.metaTitle) {
      setValue('metaTitle', formValues.name);
    }
  }, [formValues.name, formValues.metaTitle, setValue]);

  const toggleArray = (field: 'colors' | 'categories', value: string) => {
    const current = watch(field);
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setValue(field, updated, { shouldValidate: true });
  };

  // Upload images and append URLs
  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(
      file => file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
    );

    const uploadedUrls: string[] = [];
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      await uploadFile(file);
      const uploadState = useUploadStore.getState();
      if (uploadState.error) {
        console.error('Upload error:', uploadState.error);
        continue;
      }
      if (uploadState.fileUrl) {
        uploadedUrls.push(uploadState.fileUrl);
      }
    }

    if (uploadedUrls.length > 0) {
      const currentImages = watch('images');
      setValue('images', [...currentImages, ...uploadedUrls], { shouldValidate: true });
    }
  };

  const removeFile = (index: number) => {
    const currentImages = watch('images');
    setValue('images', currentImages.filter((_, i) => i !== index), { shouldValidate: true });
  };

  const onSubmit = async (data: ProductFormData) => {
    clearError();

    try {
      const slug = data.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '');

      const productData = {
        name: data.name.trim(),
        slug,
        description: data.description.trim(),
        sku: data.sku?.trim() || undefined,
        categories: data.categories as unknown as Array<{ _id: string; name: string; slug: string }>,
        price: parseFloat(data.price) || 0,
        discountPrice: data.discountPrice && data.discountPrice.trim() !== ''
          ? parseFloat(data.discountPrice)
          : undefined,
        stockQuantity: data.stockQuantity && data.stockQuantity.trim() !== ''
          ? parseInt(data.stockQuantity, 10)
          : 0,
        material: data.material?.trim() || undefined,
        weight: data.weight?.trim() || undefined,
        colors: data.colors,
        images: data.images,
        tags: data.tags.filter(tag => tag.trim().length > 0),
        video: data.video?.trim() && data.video.trim().length > 0 ? data.video.trim() : undefined,
        status: data.status,
        metaTitle: data.metaTitle?.trim() || undefined,
        metaDescription: data.metaDescription?.trim() || undefined,
      };

      await createProduct(productData as Parameters<typeof createProduct>[0]);
      toastApi.success('Product created successfully', 'The product has been added to your catalog');
      router.push('/admin/products');
    } catch (err) {
      console.error('Failed to create product', err);
      toastApi.error('Failed to create product', 'Please try again');
    }
  };

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${option?.color}`}
      >
        {option?.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d0d0d]">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/products"
                className="inline-flex items-center text-sm text-gray-500 dark:text-[#bdbdbd] hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </div>
            <button
              type="submit"
              form="product-form"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? (
                <InlineSpinner size="sm" className="mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSubmitting ? 'Creating Product...' : 'Save '}
            </button>
          </div>

          <div className="mt-4">
            <h1 className=" text-xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Add New Product
            </h1>
            <p className="mt-2 text-gray-600 dark:text-[#bdbdbd] text-sm md:text-base">
              Create a new product for your jewelry catalog
            </p>
          </div>
        </div>

        <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8 md:space-y-10">
          <div className="grid grid-cols-1 gap-8 md:gap-10 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8 md:space-y-10">
              {/* Basic Information */}
              <div className="bg-white dark:bg-[#191919] shadow-sm rounded-xl border border-gray-200 dark:border-[#3a3a3a] overflow-visible">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1f1f1f]">
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                    <h2 className="md:text-lg font-semibold text-gray-900 dark:text-white">
                      Basic Information
                    </h2>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      {...register('name')}
                      className={`block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-[#bdbdbd] focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent bg-white dark:bg-[#242424] text-gray-900 dark:text-white border-gray-300 dark:border-[#525252] text-sm md:text-base ${
                        errors.name
                          ? 'border-red-300'
                          : 'border-gray-300'
                      }`}
                      placeholder="Enter product name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      rows={4}
                      {...register('description')}
                      className={`block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-[#bdbdbd] focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent bg-white dark:bg-[#242424] text-gray-900 dark:text-white border-gray-300 dark:border-[#525252] resize-none text-sm md:text-base  ${
                        errors.description
                          ? 'border-red-300'
                          : 'border-gray-300'
                      }`}
                      placeholder="Describe your product in detail"
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        SKU
                      </label>
                      <input
                        type="text"
                        {...register('sku')}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-[#525252] rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-[#bdbdbd] focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent bg-white dark:bg-[#242424] text-gray-900 dark:text-white text-sm md:text-base "
                        placeholder="Auto-generated"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Status
                      </label>
                      <CustomSelect
                        value={watch('status')}
                        onChange={(v) =>
                          setValue('status', v as ProductFormData['status'], { shouldValidate: true })
                        }
                        options={[
                          { value: 'active', label: 'Active' },
                          { value: 'out_of_stock', label: 'Out of Stock' },
                          { value: 'hidden', label: 'Hidden' },
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-white dark:bg-[#191919] shadow-sm rounded-xl border border-gray-200 dark:border-[#3a3a3a] overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1f1f1f]">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                    <h2 className="md:text-lg font-semibold text-gray-900 dark:text-white">
                      Pricing
                    </h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Regular Price *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                          ₹
                        </span>
                        <input
                          type="text"
                          inputMode="decimal"
                          {...register('price', {
                            onChange: (e) => {
                              let value = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                              // If starts with dot, prefix with 0
                              if (value.startsWith('.')) {
                                value = '0' + value;
                              }
                              setValue('price', value, { shouldValidate: true });
                            },
                          })}
                          className={`block w-full pl-8 pr-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-[#777777] focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent text-sm md:text-base bg-white dark:bg-[#242424] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-[#3a3a3a] ${
                            errors.price
                              ? 'border-red-300 dark:border-red-800'
                              : 'border-gray-300 dark:border-[#3a3a3a]'
                          }`}
                          placeholder="0.00"
                        />
                      </div>
                      {errors.price && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.price.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Sale Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                          ₹
                        </span>
                        <input
                          type="text"
                          inputMode="decimal"
                          {...register('discountPrice', {
                            onChange: (e) => {
                              let value = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                              // If starts with dot, prefix with 0
                              if (value.startsWith('.')) {
                                value = '0' + value;
                              }
                              setValue('discountPrice', value, { shouldValidate: true });
                            },
                          })}
                          className={`block w-full pl-8 pr-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-[#777777] focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent text-sm md:text-base bg-white dark:bg-[#242424] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-[#3a3a3a] ${
                            errors.discountPrice
                              ? 'border-red-300 dark:border-red-800'
                              : 'border-gray-300 dark:border-[#3a3a3a]'
                          }`}
                          placeholder="0.00"
                        />
                      </div>
                      {errors.discountPrice && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.discountPrice.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="bg-white dark:bg-[#191919] shadow-sm rounded-xl border border-gray-200 dark:border-[#3a3a3a] overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1f1f1f]">
                  <div className="flex items-center">
                    <Tag className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                    <h2 className="md:text-lg font-semibold text-gray-900 dark:text-white">
                      Categories *
                    </h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {categories.map(cat => (
                      <label
                        key={cat._id}
                        className={`flex items-center p-3 rounded-lg border-2 text-sm md:text-base  cursor-pointer transition-all ${
                          watch('categories').includes(cat._id)
                            ? 'border-gray-300 bg-gray-100 dark:border-[#333333] dark:bg-[#1e1e1e]'
                            : 'border-gray-200 dark:border-[#2a2a2a] hover:border-gray-300 dark:hover:border-[#3a3a3a]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={watch('categories').includes(cat._id)}
                          onChange={() => toggleArray('categories', cat._id)}
                          className="h-4 w-4 text-primary-600 dark:text-primary-400 border-gray-300 dark:border-[#3a3a3a] rounded focus:ring-primary-500 dark:focus:ring-primary-600"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                          {cat.name}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.categories && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {errors.categories.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Product Details */}
              <div className="bg-white dark:bg-[#191919] shadow-sm rounded-xl border border-gray-200 dark:border-[#3a3a3a] overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1f1f1f]">
                  <h2 className="md:text-lg font-semibold text-gray-900 dark:text-white">
                    Product Details
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Material
                      </label>
                      <CustomSelect
                        value={watch('material') || ''}
                        onChange={(v) => setValue('material', v, { shouldValidate: true })}
                        options={[{ value: '', label: 'Select Material' }, ...materials.map(m => ({ value: m, label: m }))]}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Weight (grams)
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        {...register('weight', {
                          onChange: (e) => {
                            let value = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                            // If starts with dot, prefix with 0
                            if (value.startsWith('.')) {
                              value = '0' + value;
                            }
                            setValue('weight', value, { shouldValidate: true });
                          },
                        })}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-[#525252] rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-[#bdbdbd] focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent bg-white dark:bg-[#242424] text-gray-900 dark:text-white text-sm md:text-base"
                        placeholder="0.0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Available Colors
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {colors.map(color => (
                        <label
                          key={color}
                          className={`flex items-center p-2 md:p-3 rounded-lg border-2 text-sm md:text-base  cursor-pointer transition-all ${
                            watch('colors').includes(color)
                              ? 'border-gray-300 bg-gray-100 dark:border-[#333333] dark:bg-[#1e1e1e]'
                              : 'border-gray-200 dark:border-[#2a2a2a] hover:border-gray-300 dark:hover:border-[#3a3a3a]'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={watch('colors').includes(color)}
                            onChange={() => toggleArray('colors', color)}
                            className="h-4 w-4 text-primary-600 dark:text-primary-400 border-gray-300 dark:border-[#3a3a3a] rounded focus:ring-primary-500 dark:focus:ring-primary-600"
                          />
                          <span className="ml-3 font-medium text-gray-900 dark:text-gray-100 text-sm md:text-base">
                            {color}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Stock Quantity *
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      {...register('stockQuantity', {
                        onChange: (e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          setValue('stockQuantity', value, { shouldValidate: true });
                        },
                      })}
                      className={`block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-[#bdbdbd] focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent bg-white dark:bg-[#242424] text-gray-900 dark:text-white border-gray-300 dark:border-[#525252] text-sm md:text-base ${
                        errors.stockQuantity
                          ? 'border-red-300'
                          : 'border-gray-300'
                      }`}
                      placeholder="Enter stock quantity"
                    />
                    {errors.stockQuantity && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.stockQuantity.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* SEO Settings */}
              <div className="bg-white dark:bg-[#191919] shadow-sm rounded-xl border border-gray-200 dark:border-[#3a3a3a] overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1f1f1f]">
                  <div className="flex items-center">
                    <Search className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                    <h2 className="md:text-lg font-semibold text-gray-900 dark:text-white">
                      SEO Settings
                    </h2>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      maxLength={60}
                      {...register('metaTitle')}
                      className="block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-[#777777] focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent text-sm md:text-base bg-white dark:bg-[#242424] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-[#3a3a3a]"
                      placeholder="Auto-generated from product name"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {(watch('metaTitle') || '').length}/60 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      maxLength={160}
                      rows={3}
                      {...register('metaDescription')}
                      className="block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-[#777777] focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent resize-none text-sm md:text-base bg-white dark:bg-[#242424] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-[#3a3a3a]"
                      placeholder="Brief description for search engines"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {(watch('metaDescription') || '').length}/160 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tags
                    </label>
                    <div className="space-y-2">
                    <input
                      type="text"
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === ',' || e.key === 'Enter') {
                            e.preventDefault();
                            const trimmed = tagInput.trim();
                            const currentTags = watch('tags');
                            if (trimmed && trimmed.length > 0 && !currentTags.includes(trimmed)) {
                              setValue('tags', [...currentTags, trimmed], { shouldValidate: true });
                              setTagInput('');
                            }
                          }
                        }}
                      className="block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-[#777777] focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent text-sm md:text-base bg-white dark:bg-[#242424] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-[#3a3a3a]"
                        placeholder="Type tag and press comma or Enter"
                      />
                      {watch('tags').length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {watch('tags').map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded-full text-sm font-medium"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => {
                                  const currentTags = watch('tags');
                                  setValue('tags', currentTags.filter((_, i) => i !== index), { shouldValidate: true });
                                }}
                                className="hover:bg-primary-200 dark:hover:bg-primary-900/50 rounded-full p-0.5 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Type tag and press comma or Enter to add
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Product Images */}
              <div className="bg-white dark:bg-[#191919] shadow-sm rounded-xl border border-gray-200 dark:border-[#3a3a3a] overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1f1f1f]">
                  <div className="flex items-center">
                    <ImageIcon className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                    <h2 className="md:text-lg font-semibold text-gray-900 dark:text-white">
                      Product Images *
                    </h2>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="border-2 border-dashed border-gray-300 dark:border-[#2a2a2a] rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-[#3a3a3a] transition-colors">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
                    <label className="cursor-pointer">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Upload images
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 block">
                        PNG, JPG up to 5MB each
                      </span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {errors.images && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errors.images.message}
                    </p>
                  )}

                  {watch('images').length > 0 && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        {watch('images').map((url, index) => (
                          <div key={index} className="relative group">
                            <Image
                              src={url}
                              alt={`Product image ${index + 1}`}
                              width={100}
                              height={100}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-[#2a2a2a]"
                            />
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-1">
                        {watch('images').map((url, idx) => (
                          <p
                            key={idx}
                            className="text-xs text-gray-600 dark:text-gray-400 break-all"
                          >
                            {url}
                          </p>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Video URL */}
              <div className="bg-white dark:bg-[#191919] shadow-sm rounded-xl border border-gray-200 dark:border-[#3a3a3a] overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1f1f1f]">
                  <div className="flex items-center">
                    <Video className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                    <h2 className="md:text-lg font-semibold text-gray-900 dark:text-white">
                      Product Video
                    </h2>
                  </div>
                </div>
                <div className="p-6">
                    <input
                    type="url"
                    {...register('video')}
                      className="block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-[#777777] focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent bg-white dark:bg-[#242424] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-[#3a3a3a]"
                    placeholder="https://www.youtube.com/watch?v=YOUR_VIDEO_ID"
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Add a YouTube or Vimeo URL to showcase your product
                  </p>
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
                      setTagInput('');
                    }}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-[#3a3a3a] text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-[#242424] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Form
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const sampleData: Partial<ProductFormData> = {
                        name: 'Sample Gold Necklace',
                        description:
                          'Beautiful handcrafted gold necklace perfect for special occasions',
                        price: '25000',
                        material: 'Copper Alloy (Gold Color)',
                        weight: '15.5',
                        colors: ['Gold'],
                        stockQuantity: '10',
                        categories:
                          categories.length > 0 ? [categories[0]._id] : [],
                        metaTitle: 'Sample Gold Necklace - Premium Jewelry',
                        metaDescription:
                          'Discover our beautiful handcrafted gold necklace collection',
                        tags: ['jewelry', 'gold', 'necklace', 'handcrafted'],
                      };
                      Object.entries(sampleData).forEach(([key, value]) => {
                        setValue(key as keyof ProductFormData, value, { shouldValidate: true });
                      });
                    }}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-[#3a3a3a] text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-[#242424] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                  >
                    Fill Sample Data
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
                    <span className="text-gray-600 dark:text-gray-400">Product Name:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">
                      {watch('name') || 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Price:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">
                      {watch('price') ? `₹${watch('price')}` : 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Categories:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">
                      {watch('categories').length || 0} selected
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Images:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">
                      {watch('images').length} uploaded
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span>{getStatusBadge(watch('status'))}</span>
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
