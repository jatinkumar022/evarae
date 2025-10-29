'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Loader2,
  Package,
  Tag,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useProductStore } from '@/lib/data/store/productStore';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const {
    currentProduct,
    fetchProduct,
    deleteProduct,
    status,
    error,
    clearError,
  } = useProductStore();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchProduct(productId);
    }
  }, [productId, fetchProduct]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDelete = async () => {
    if (currentProduct) {
      try {
        await deleteProduct(currentProduct._id);
        router.push('/admin/products');
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  // Global loader will handle loading state

  if (!currentProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">
            Product not found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            The product you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/admin/products"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

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
            <div className="flex items-center space-x-3">
              <Link
                href={`/admin/products/${currentProduct._id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-gray-300  font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors text-xs md:text-sm"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-red-300  font-medium rounded-md shadow-sm text-red-700 bg-white hover:bg-red-50 transition-colors text-xs md:text-sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </div>

          <div className="mt-4">
            <h1 className="text-xl md:text-3xl font-bold text-gray-900">
              {currentProduct.name}
            </h1>
            <p className="mt-2 text-gray-600 text-sm md:text-base">
              Product details and information
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
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

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Product Images */}
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm md:text-lg font-semibold text-gray-900">
                  Product Images
                </h3>
              </div>
              <div className="p-6">
                {currentProduct.images && currentProduct.images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {currentProduct.images.map((image, index) => (
                      <div
                        key={index}
                        className="aspect-square overflow-hidden rounded-lg bg-gray-200"
                      >
                        <Image
                          src={image}
                          alt={`${currentProduct.name} ${index + 1}`}
                          width={200}
                          height={200}
                          className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      No images available
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Product Description */}
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm md:text-lg font-semibold text-gray-900">
                  Description
                </h3>
              </div>
              <div className="p-6">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {currentProduct.description}
                </p>
              </div>
            </div>

            {/* Product Specifications */}
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm md:text-lg font-semibold text-gray-900">
                  Specifications
                </h3>
              </div>
              <div className="p-6">
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Material
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {currentProduct.material || 'Not specified'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Weight
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {currentProduct.weight || 'Not specified'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Available Sizes
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {currentProduct.sizes && currentProduct.sizes.length > 0
                        ? currentProduct.sizes.join(', ')
                        : 'Not specified'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Available Colors
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {currentProduct.colors && currentProduct.colors.length > 0
                        ? currentProduct.colors.join(', ')
                        : 'Not specified'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* SEO Information */}
            {(currentProduct.metaTitle || currentProduct.metaDescription) && (
              <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-sm md:text-lg font-semibold text-gray-900">
                    SEO Information
                  </h3>
                </div>
                <div className="p-6">
                  <dl className="space-y-4">
                    {currentProduct.metaTitle && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Meta Title
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {currentProduct.metaTitle}
                        </dd>
                      </div>
                    )}
                    {currentProduct.metaDescription && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Meta Description
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {currentProduct.metaDescription}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Product Status */}
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm md:text-lg font-semibold text-gray-900">
                  Product Status
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      Status
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        currentProduct.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : currentProduct.status === 'out_of_stock'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {currentProduct.status === 'active'
                        ? 'Active'
                        : currentProduct.status === 'out_of_stock'
                        ? 'Out of Stock'
                        : 'Hidden'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      Stock Quantity
                    </span>
                    <span className="text-sm text-gray-900">
                      {currentProduct.stockQuantity}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Information */}
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm md:text-lg  font-semibold text-gray-900">
                  Pricing
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      Price
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(currentProduct.price)}
                    </span>
                  </div>
                  {currentProduct.discountPrice && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">
                        Discount Price
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(currentProduct.discountPrice)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product Information */}
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm md:text-lg font-semibold text-gray-900">
                  Product Information
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      SKU
                    </span>
                    <span className="text-sm text-gray-900">
                      {currentProduct.sku || 'Not specified'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      Slug
                    </span>
                    <span className="text-sm text-gray-900 font-mono">
                      {currentProduct.slug}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      Created
                    </span>
                    <span className="text-sm text-gray-900">
                      {formatDate(currentProduct.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      Updated
                    </span>
                    <span className="text-sm text-gray-900">
                      {formatDate(currentProduct.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm md:text-lg  font-semibold text-gray-900">
                  Categories
                </h3>
              </div>
              <div className="p-6">
                {currentProduct.categories &&
                currentProduct.categories.length > 0 ? (
                  <div className="space-y-2">
                    {currentProduct.categories.map(category => (
                      <div key={category._id} className="flex items-center">
                        <Tag className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {category.name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No categories assigned
                  </p>
                )}
              </div>
            </div>

            {/* Collections */}
            {currentProduct.collections &&
              currentProduct.collections.length > 0 && (
                <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-sm md:text-lg  font-semibold text-gray-900">
                      Collections
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-2">
                      {currentProduct.collections.map(collection => (
                        <div key={collection._id} className="flex items-center">
                          <Package className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {collection.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <Trash2 className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-sm md:text-lg  leading-6 font-medium text-gray-900">
                        Delete Product
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete &quot;
                          {currentProduct?.name}&quot;? This action cannot be
                          undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
