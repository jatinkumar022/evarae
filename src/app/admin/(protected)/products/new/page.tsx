'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Trash2,
  Loader2,
  Upload,
  X,
  AlertCircle,
  Package,
  DollarSign,
  Tag,
  Palette,
  Image as ImageIcon,
  Video,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useProductStore, type Product } from '@/lib/data/store/productStore';
import { useCategoryStore } from '@/lib/data/store/categoryStore';
import { useUploadStore } from '@/lib/data/store/uploadStore';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  discountPrice: string;
  categories: string[];
  material: string;
  weight: string;
  colors: string[];
  stockQuantity: string;
  sku: string;
  status: 'active' | 'out_of_stock' | 'hidden';
  metaTitle: string;
  metaDescription: string;
  tags: string[];
  video: string;
  images: string[]; // store URLs only
  wallpaper: string[]; // store URLs only
  thumbnail?: string; // store URL
}
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
  const { createProduct, status, error, clearError } = useProductStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { uploadFile } = useUploadStore();

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    categories: [],
    material: '',
    weight: '',
    colors: [],
    stockQuantity: '0',
    sku: '',
    status: 'active',
    metaTitle: '',
    metaDescription: '',
    tags: [],
    video: '',
    images: [],
    wallpaper: [],
    thumbnail: undefined,
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Auto-generate SKU from name
  useEffect(() => {
    if (formData.name && !formData.sku) {
      const generatedSku =
        formData.name
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '')
          .substring(0, 8) +
        '-' +
        Date.now().toString().slice(-4);
      setFormData(prev => ({ ...prev, sku: generatedSku }));
    }
  }, [formData.name, formData.sku]);

  // Auto-generate meta title from name
  useEffect(() => {
    if (formData.name && !formData.metaTitle) {
      setFormData(prev => ({ ...prev, metaTitle: formData.name }));
    }
  }, [formData.name, formData.metaTitle]);

  const handleInputChange = useCallback(
    <K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      if (validationErrors[field]) {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field as string];
          return newErrors;
        });
      }
    },
    [validationErrors]
  );

  const toggleArray = (field: 'colors' | 'categories', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value],
    }));
  };

  // Upload thumbnail and set URL
  const handleThumbnailSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setValidationErrors(prev => ({
        ...prev,
        thumbnail: 'Invalid file type',
      }));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setValidationErrors(prev => ({
        ...prev,
        thumbnail: 'File too large (max 2MB)',
      }));
      return;
    }

    await uploadFile(file);
    const url = useUploadStore.getState().fileUrl;
    if (url) {
      handleInputChange('thumbnail', url);
    }
  };

  // Upload images/wallpapers and append URLs
  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'images' | 'wallpaper'
  ) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(
      file => file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
    );

    if (validFiles.length !== files.length) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: 'Some files were skipped (only images under 5MB are allowed)',
      }));
    }

    const uploadedUrls: string[] = [];
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      await uploadFile(file);
      const url = useUploadStore.getState().fileUrl;
      if (url) uploadedUrls.push(url);
    }

    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], ...uploadedUrls],
    }));
  };

  const removeFile = (index: number, field: 'images' | 'wallpaper') => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = 'Product name is required';
    if (!formData.description.trim())
      errors.description = 'Description is required';
    if (!formData.price || parseFloat(formData.price) <= 0)
      errors.price = 'Valid price is required';
    if (
      formData.discountPrice &&
      parseFloat(formData.discountPrice) >= parseFloat(formData.price)
    ) {
      errors.discountPrice = 'Discount price must be less than regular price';
    }
    if (formData.categories.length === 0)
      errors.categories = 'At least one category is required';
    if (!formData.stockQuantity || parseInt(formData.stockQuantity) < 0)
      errors.stockQuantity = 'Valid stock quantity is required';
    if (formData.images.length === 0)
      errors.images = 'At least one product image is required';
    if (!formData.thumbnail) errors.thumbnail = 'Thumbnail is required';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const slug = formData.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '');

      // Map selected category ids to objects to satisfy typing
      const selectedCategoryObjects: Product['categories'] = formData.categories
        .map(id => categories.find(c => c._id === id))
        .filter(Boolean)
        .map(c => ({ _id: c!._id, name: c!.name, slug: c!.slug }));

      const productData: Partial<Product> = {
        name: formData.name,
        slug,
        description: formData.description,
        sku: formData.sku,
        categories: selectedCategoryObjects,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice
          ? parseFloat(formData.discountPrice)
          : undefined,
        stockQuantity: parseInt(formData.stockQuantity),
        material: formData.material,
        weight: formData.weight, // product type uses string
        colors: formData.colors,
        images: formData.images,
        wallpaper: formData.wallpaper,
        thumbnail: formData.thumbnail,
        tags: formData.tags,
        video: formData.video,
        status: formData.status,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
      };

      await createProduct(productData);
      router.push('/admin/products');
    } catch (err) {
      console.error('Failed to create product', err);
    } finally {
      setIsSubmitting(false);
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/products"
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </div>
            <button
              type="submit"
              form="product-form"
              disabled={isSubmitting || status === 'loading'}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSubmitting ? 'Creating Product...' : 'Save '}
            </button>
          </div>

          <div className="mt-4">
            <h1 className=" text-xl md:text-3xl font-bold text-gray-900">
              Add New Product
            </h1>
            <p className="mt-2 text-gray-600 text-sm md:text-base">
              Create a new product for your jewelry catalog
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error creating product
                </h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
                <div className="mt-4">
                  <button
                    onClick={clearError}
                    className="bg-red-100 px-3 py-1 rounded-md text-sm text-red-800 hover:bg-red-200 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Basic Information */}
              <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-gray-600 mr-2" />
                    <h2 className="md:text-lg font-semibold text-gray-900">
                      Basic Information
                    </h2>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => handleInputChange('name', e.target.value)}
                      className={`block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base ${
                        validationErrors.name
                          ? 'border-red-300'
                          : 'border-gray-300'
                      }`}
                      placeholder="Enter product name"
                    />
                    {validationErrors.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.description}
                      onChange={e =>
                        handleInputChange('description', e.target.value)
                      }
                      className={`block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm md:text-base  ${
                        validationErrors.description
                          ? 'border-red-300'
                          : 'border-gray-300'
                      }`}
                      placeholder="Describe your product in detail"
                    />
                    {validationErrors.description && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.description}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SKU
                      </label>
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={e => handleInputChange('sku', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base "
                        placeholder="Auto-generated"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={e =>
                          handleInputChange(
                            'status',
                            e.target.value as Product['status']
                          )
                        }
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base "
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-gray-600 mr-2" />
                    <h2 className="md:text-lg font-semibold text-gray-900">
                      Pricing
                    </h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Regular Price *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          ₹
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={formData.price}
                          onChange={e =>
                            handleInputChange('price', e.target.value)
                          }
                          className={`block w-full pl-8 pr-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base  ${
                            validationErrors.price
                              ? 'border-red-300'
                              : 'border-gray-300'
                          }`}
                          placeholder="0.00"
                        />
                      </div>
                      {validationErrors.price && (
                        <p className="mt-1 text-sm text-red-600">
                          {validationErrors.price}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sale Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          ₹
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.discountPrice}
                          onChange={e =>
                            handleInputChange('discountPrice', e.target.value)
                          }
                          className={`block w-full pl-8 pr-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base  ${
                            validationErrors.discountPrice
                              ? 'border-red-300'
                              : 'border-gray-300'
                          }`}
                          placeholder="0.00"
                        />
                      </div>
                      {validationErrors.discountPrice && (
                        <p className="mt-1 text-sm text-red-600">
                          {validationErrors.discountPrice}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center">
                    <Tag className="h-5 w-5 text-gray-600 mr-2" />
                    <h2 className="md:text-lg font-semibold text-gray-900">
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
                          formData.categories.includes(cat._id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.categories.includes(cat._id)}
                          onChange={() => toggleArray('categories', cat._id)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 "
                        />
                        <span className="ml-3 text-sm font-medium text-gray-900">
                          {cat.name}
                        </span>
                      </label>
                    ))}
                  </div>
                  {validationErrors.categories && (
                    <p className="mt-2 text-sm text-red-600">
                      {validationErrors.categories}
                    </p>
                  )}
                </div>
              </div>

              {/* Product Details */}
              <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="md:text-lg font-semibold text-gray-900">
                    Product Details
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Material
                      </label>
                      <select
                        value={formData.material}
                        onChange={e =>
                          handleInputChange('material', e.target.value)
                        }
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base "
                      >
                        <option value="">Select Material</option>
                        {materials.map(material => (
                          <option key={material} value={material}>
                            {material}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight (grams)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.weight}
                        onChange={e =>
                          handleInputChange('weight', e.target.value)
                        }
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base "
                        placeholder="0.0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Available Colors
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {colors.map(color => (
                        <label
                          key={color}
                          className={`flex items-center p-2 md:p-3 rounded-lg border-2 text-sm md:text-base  cursor-pointer transition-all ${
                            formData.colors.includes(color)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.colors.includes(color)}
                            onChange={() => toggleArray('colors', color)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-3 font-medium text-gray-900 text-sm md:text-base">
                            {color}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.stockQuantity}
                      onChange={e =>
                        handleInputChange('stockQuantity', e.target.value)
                      }
                      className={`block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base  ${
                        validationErrors.stockQuantity
                          ? 'border-red-300'
                          : 'border-gray-300'
                      }`}
                      placeholder="0"
                    />
                    {validationErrors.stockQuantity && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.stockQuantity}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* SEO Settings */}
              <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center">
                    <Search className="h-5 w-5 text-gray-600 mr-2" />
                    <h2 className="md:text-lg font-semibold text-gray-900">
                      SEO Settings
                    </h2>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      maxLength={60}
                      value={formData.metaTitle}
                      onChange={e =>
                        handleInputChange('metaTitle', e.target.value)
                      }
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base "
                      placeholder="Auto-generated from product name"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.metaTitle.length}/60 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      maxLength={160}
                      rows={3}
                      value={formData.metaDescription}
                      onChange={e =>
                        handleInputChange('metaDescription', e.target.value)
                      }
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm md:text-base "
                      placeholder="Brief description for search engines"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.metaDescription.length}/160 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <input
                      type="text"
                      value={formData.tags.join(', ')}
                      onChange={e =>
                        handleInputChange(
                          'tags',
                          e.target.value
                            .split(',')
                            .map(t => t.trim())
                            .filter(t => t)
                        )
                      }
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base "
                      placeholder="jewelry, gold, necklace, etc."
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Separate tags with commas
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Product Images */}
              <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center">
                    <ImageIcon className="h-5 w-5 text-gray-600 mr-2" />
                    <h2 className="md:text-lg font-semibold text-gray-900">
                      Product Images *
                    </h2>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <label className="cursor-pointer">
                      <span className="text-sm font-medium text-gray-900">
                        Upload images
                      </span>
                      <span className="text-sm text-gray-500 block">
                        PNG, JPG up to 5MB each
                      </span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={e => handleFileSelect(e, 'images')}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {validationErrors.images && (
                    <p className="text-sm text-red-600">
                      {validationErrors.images}
                    </p>
                  )}

                  {formData.images.length > 0 && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        {formData.images.map((url, index) => (
                          <div key={index} className="relative group">
                            <Image
                              src={url}
                              alt={`Product image ${index + 1}`}
                              width={100}
                              height={100}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeFile(index, 'images')}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-1">
                        {formData.images.map((url, idx) => (
                          <p
                            key={idx}
                            className="text-xs text-gray-600 break-all"
                          >
                            {url}
                          </p>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Thumbnail Image */}
              <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center">
                    <ImageIcon className="h-5 w-5 text-gray-600 mr-2" />
                    <h2 className="md:text-lg font-semibold text-gray-900">
                      Thumbnail Image *
                    </h2>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <label className="cursor-pointer">
                      <span className="text-sm font-medium text-gray-900">
                        Upload thumbnail
                      </span>
                      <span className="text-sm text-gray-500 block">
                        PNG, JPG up to 2MB
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleThumbnailSelect(e)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {formData.thumbnail && (
                    <>
                      <div className="relative group w-32 h-32 mx-auto">
                        <Image
                          src={formData.thumbnail}
                          alt="Thumbnail"
                          fill
                          className="object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleInputChange('thumbnail', undefined)
                          }
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 break-all text-center">
                        {formData.thumbnail}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Wallpaper Images */}
              <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center">
                    <Palette className="h-5 w-5 text-gray-600 mr-2" />
                    <h2 className="md:text-lg font-semibold text-gray-900">
                      Wallpaper Images
                    </h2>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <label className="cursor-pointer">
                      <span className="text-sm font-medium text-gray-900">
                        Upload wallpapers
                      </span>
                      <span className="text-sm text-gray-500 block">
                        PNG, JPG up to 5MB each
                      </span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={e => handleFileSelect(e, 'wallpaper')}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {validationErrors.wallpaper && (
                    <p className="text-sm text-red-600">
                      {validationErrors.wallpaper}
                    </p>
                  )}

                  {formData.wallpaper.length > 0 && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        {formData.wallpaper.map((url, index) => (
                          <div key={index} className="relative group">
                            <Image
                              src={url}
                              alt={`Wallpaper ${index + 1}`}
                              width={100}
                              height={100}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeFile(index, 'wallpaper')}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-1">
                        {formData.wallpaper.map((url, idx) => (
                          <p
                            key={idx}
                            className="text-xs text-gray-600 break-all"
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
              <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center">
                    <Video className="h-5 w-5 text-gray-600 mr-2" />
                    <h2 className="md:text-lg font-semibold text-gray-900">
                      Product Video
                    </h2>
                  </div>
                </div>
                <div className="p-6">
                  <input
                    type="url"
                    value={formData.video}
                    onChange={e => handleInputChange('video', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://www.youtube.com/watch?v=YOUR_VIDEO_ID"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Add a YouTube or Vimeo URL to showcase your product
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="md:text-lg font-semibold text-gray-900">
                    Quick Actions
                  </h2>
                </div>
                <div className="p-6 space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        name: '',
                        description: '',
                        price: '',
                        discountPrice: '',
                        categories: [],
                        material: '',
                        weight: '',
                        colors: [],
                        stockQuantity: '0',
                        sku: '',
                        status: 'active',
                        metaTitle: '',
                        metaDescription: '',
                        tags: [],
                        video: '',
                        images: [],
                        wallpaper: [],
                        thumbnail: undefined,
                      });
                      setValidationErrors({});
                    }}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Form
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const sampleData = {
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
                      setFormData(prev => ({ ...prev, ...sampleData }));
                    }}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Fill Sample Data
                  </button>
                </div>
              </div>

              {/* Form Summary */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm rounded-xl border border-blue-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-blue-200">
                  <h2 className="md:text-lg font-semibold text-blue-900">
                    Form Summary
                  </h2>
                </div>
                <div className="p-6 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product Name:</span>
                    <span className="font-medium text-gray-900">
                      {formData.name || 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-medium text-gray-900">
                      {formData.price ? `₹${formData.price}` : 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Categories:</span>
                    <span className="font-medium text-gray-900">
                      {formData.categories.length || 0} selected
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Images:</span>
                    <span className="font-medium text-gray-900">
                      {formData.images.length} uploaded
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span>{getStatusBadge(formData.status)}</span>
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
