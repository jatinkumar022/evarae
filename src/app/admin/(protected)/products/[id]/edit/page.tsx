'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Save,
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
import { CustomSelect } from '@/app/admin/components/CustomSelect';
import { useUploadStore } from '@/lib/data/store/uploadStore';
import { setDummyProductsInStore, setDummyCategoriesInStore } from '@/lib/data/dummyDataHelper';
import { dummyProducts } from '@/lib/data/dummyProducts';

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

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const {
    currentProduct,
    // fetchProduct,
    updateProduct,
    // status,
    error,
    clearError,
  } = useProductStore();
  const { categories, // fetchCategories
    } = useCategoryStore();
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
    // Load dummy data
    setDummyCategoriesInStore();
    if (productId) {
      setDummyProductsInStore();
      const product = dummyProducts.find((p) => p._id === productId);
      if (product) {
        useProductStore.setState({ currentProduct: product, status: 'success', error: null });
      } else {
        useProductStore.setState({ currentProduct: null, status: 'error', error: 'Product not found' });
      }
    }
  }, [productId]);

  useEffect(() => {
    if (currentProduct) {
      setFormData({
        name: currentProduct.name || '',
        description: currentProduct.description || '',
        price: currentProduct.price?.toString() || '',
        discountPrice: currentProduct.discountPrice?.toString() || '',
        categories: currentProduct.categories?.map(cat => cat._id) || [],
        material: currentProduct.material || '',
        weight: currentProduct.weight || '',
        colors: currentProduct.colors || [],
        stockQuantity: currentProduct.stockQuantity?.toString() || '0',
        sku: currentProduct.sku || '',
        status: currentProduct.status || 'active',
        metaTitle: currentProduct.metaTitle || '',
        metaDescription: currentProduct.metaDescription || '',
        tags: currentProduct.tags || [],
        video: currentProduct.video || '',
        images: currentProduct.images || [],
        wallpaper: currentProduct.wallpaper || [],
        thumbnail: currentProduct.thumbnail,
      });
    }
  }, [currentProduct]);

  const handleInputChange = <K extends keyof ProductFormData>(
    field: K,
    value: ProductFormData[K]
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
        weight: formData.weight,
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

      await updateProduct(productId, productData);
      router.push('/admin/products');
    } catch (err) {
      console.error('Failed to update product', err);
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

  // Global loader will handle loading state

  if (!currentProduct) {
    return (
      <div className="text-center py-12">
                    <h3 className="text-sm md:text-lg font-medium text-gray-900 dark:text-white">
          Product not found
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-[#696969]">
          The product you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/admin/products"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-500"
        >
          Back to Products
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
                href="/admin/products"
                className="inline-flex items-center text-sm text-gray-500 dark:text-[#696969] hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </div>
            <button
              type="submit"
              form="product-form"
              disabled={isSubmitting}
              className="inline-flex items-center px-6 py-3 border border-transparent text-xs md:text-sm font-medium rounded-lg shadow-sm text-white bg-primary-500 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSubmitting ? 'Updating Product...' : 'Update '}
            </button>
          </div>

          <div className="mt-4">
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Edit Product
            </h1>
            <p className="mt-2 text-gray-600 dark:text-[#696969] text-sm md:text-base">
              Update product information and settings
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
                  Error updating product
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

        <form id="product-form" onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
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
                      required
                      value={formData.name}
                      onChange={e => handleInputChange('name', e.target.value)}
                      className={`block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-[#696969] focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent bg-white dark:bg-[#242424] text-gray-900 dark:text-white border-gray-300 dark:border-[#525252] text-sm md:text-base ${
                        validationErrors.name
                          ? 'border-red-300'
                          : 'border-gray-300'
                      }`}
                      placeholder="Enter product name"
                    />
                    {validationErrors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {validationErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.description}
                      onChange={e =>
                        handleInputChange('description', e.target.value)
                      }
                      className={`block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-[#696969] focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent bg-white dark:bg-[#242424] text-gray-900 dark:text-white border-gray-300 dark:border-[#525252] resize-none text-sm md:text-base  ${
                        validationErrors.description
                          ? 'border-red-300'
                          : 'border-gray-300'
                      }`}
                      placeholder="Describe your product in detail"
                    />
                    {validationErrors.description && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {validationErrors.description}
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
                        value={formData.sku}
                        onChange={e => handleInputChange('sku', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-[#525252] rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-[#696969] focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent bg-white dark:bg-[#242424] text-gray-900 dark:text-white text-sm md:text-base "
                        placeholder="Auto-generated"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Status
                      </label>
                      <CustomSelect
                        value={formData.status}
                        onChange={(v) =>
                          handleInputChange('status', v as Product['status'])
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
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={formData.price}
                          onChange={e =>
                            handleInputChange('price', e.target.value)
                          }
                          className={`block w-full pl-8 pr-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-[#777777] focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent text-sm md:text-base bg-white dark:bg-[#242424] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-[#3a3a3a] ${
                            validationErrors.price
                              ? 'border-red-300 dark:border-red-800'
                              : 'border-gray-300 dark:border-[#3a3a3a]'
                          }`}
                          placeholder="0.00"
                        />
                      </div>
                      {validationErrors.price && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {validationErrors.price}
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
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.discountPrice}
                          onChange={e =>
                            handleInputChange('discountPrice', e.target.value)
                          }
                          className={`block w-full pl-8 pr-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-[#777777] focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent text-sm md:text-base bg-white dark:bg-[#242424] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-[#3a3a3a] ${
                            validationErrors.discountPrice
                              ? 'border-red-300 dark:border-red-800'
                              : 'border-gray-300 dark:border-[#3a3a3a]'
                          }`}
                          placeholder="0.00"
                        />
                      </div>
                      {validationErrors.discountPrice && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {validationErrors.discountPrice}
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
                          formData.categories.includes(cat._id)
                            ? 'border-gray-300 bg-gray-100 dark:border-[#333333] dark:bg-[#1e1e1e]'
                            : 'border-gray-200 dark:border-[#2a2a2a] hover:border-gray-300 dark:hover:border-[#3a3a3a]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.categories.includes(cat._id)}
                          onChange={() => toggleArray('categories', cat._id)}
                          className="h-4 w-4 text-primary-600 dark:text-primary-400 border-gray-300 dark:border-[#3a3a3a] rounded focus:ring-primary-500 dark:focus:ring-primary-600 "
                        />
                        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                          {cat.name}
                        </span>
                      </label>
                    ))}
                  </div>
                  {validationErrors.categories && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {validationErrors.categories}
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
                        value={formData.material}
                        onChange={(v) => handleInputChange('material', v)}
                        options={[{ value: '', label: 'Select Material' }, ...materials.map(m => ({ value: m, label: m }))]}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-[#525252] rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-[#696969] focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent bg-white dark:bg-[#242424] text-gray-900 dark:text-white text-sm md:text-base "
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
                            formData.colors.includes(color)
                              ? 'border-gray-300 bg-gray-100 dark:border-[#333333] dark:bg-[#1e1e1e]'
                              : 'border-gray-200 dark:border-[#2a2a2a] hover:border-gray-300 dark:hover:border-[#3a3a3a]'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.colors.includes(color)}
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
                      type="number"
                      min="0"
                      required
                      value={formData.stockQuantity}
                      onChange={e =>
                        handleInputChange('stockQuantity', e.target.value)
                      }
                      className={`block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-[#696969] focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent bg-white dark:bg-[#242424] text-gray-900 dark:text-white border-gray-300 dark:border-[#525252] text-sm md:text-base  ${
                        validationErrors.stockQuantity
                          ? 'border-red-300'
                          : 'border-gray-300'
                      }`}
                      placeholder="0"
                    />
                    {validationErrors.stockQuantity && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {validationErrors.stockQuantity}
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
                      value={formData.metaTitle}
                      onChange={e =>
                        handleInputChange('metaTitle', e.target.value)
                      }
                      className="block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-[#777777] focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent text-sm md:text-base bg-white dark:bg-[#242424] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-[#3a3a3a]"
                      placeholder="Auto-generated from product name"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {formData.metaTitle.length}/60 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      maxLength={160}
                      rows={3}
                      value={formData.metaDescription}
                      onChange={e =>
                        handleInputChange('metaDescription', e.target.value)
                      }
                      className="block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-[#777777] focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent resize-none text-sm md:text-base bg-white dark:bg-[#242424] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-[#3a3a3a]"
                      placeholder="Brief description for search engines"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {formData.metaDescription.length}/160 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                      className="block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-[#777777] focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent text-sm md:text-base bg-white dark:bg-[#242424] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-[#3a3a3a]"
                      placeholder="jewelry, gold, necklace, etc."
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Separate tags with commas
                    </p>
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
                        onChange={e => handleFileSelect(e, 'images')}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {validationErrors.images && (
                    <p className="text-sm text-red-600 dark:text-red-400">
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
                              className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-[#2a2a2a]"
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

              {/* Thumbnail Image */}
              <div className="bg-white dark:bg-[#191919] shadow-sm rounded-xl border border-gray-200 dark:border-[#3a3a3a] overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1f1f1f]">
                  <div className="flex items-center">
                    <ImageIcon className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                    <h2 className="md:text-lg font-semibold text-gray-900 dark:text-white">
                      Thumbnail Image *
                    </h2>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="border-2 border-dashed border-gray-300 dark:border-[#2a2a2a] rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-[#3a3a3a] transition-colors">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
                    <label className="cursor-pointer">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Upload thumbnail
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 block">
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
                          className="object-cover rounded-lg border border-gray-200 dark:border-[#2a2a2a]"
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
                      <p className="text-xs text-gray-600 dark:text-gray-400 break-all text-center">
                        {formData.thumbnail}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Wallpaper Images */}
              <div className="bg-white dark:bg-[#191919] shadow-sm rounded-xl border border-gray-200 dark:border-[#3a3a3a] overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1f1f1f]">
                  <div className="flex items-center">
                    <Palette className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                    <h2 className="md:text-lg font-semibold text-gray-900 dark:text-white">
                      Wallpaper Images
                    </h2>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="border-2 border-dashed border-gray-300 dark:border-[#2a2a2a] rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-[#3a3a3a] transition-colors">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
                    <label className="cursor-pointer">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Upload wallpapers
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 block">
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
                    <p className="text-sm text-red-600 dark:text-red-400">
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
                              className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-[#2a2a2a]"
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
                    value={formData.video}
                    onChange={e => handleInputChange('video', e.target.value)}
                      className="block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-[#777777] focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent bg-white dark:bg-[#242424] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-[#3a3a3a]"
                    placeholder="https://www.youtube.com/watch?v=YOUR_VIDEO_ID"
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Add a YouTube or Vimeo URL to showcase your product
                  </p>
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
                      {formData.name || 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Price:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">
                      {formData.price ? `₹${formData.price}` : 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Categories:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">
                      {formData.categories.length || 0} selected
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Images:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">
                      {formData.images.length} uploaded
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
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
