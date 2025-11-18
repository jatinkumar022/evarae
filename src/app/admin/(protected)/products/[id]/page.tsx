'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  Trash2,
  // Loader2,
  Package,
  Tag,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useProductStore } from '@/lib/data/store/productStore';
import Modal from '@/app/admin/components/Modal';
import { toastApi } from '@/lib/toast';
import InlineSpinner from '@/app/admin/components/InlineSpinner';

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

  const [isDeleting, setIsDeleting] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    // Fetch product from API
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
      setIsDeleting(true);
      try {
        await deleteProduct(currentProduct._id);
        toastApi.success('Product deleted successfully', 'The product has been removed from your catalog');
        router.push('/admin/products');
      } catch (error) {
        console.error('Delete failed:', error);
        toastApi.error('Failed to delete product', 'Please try again');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Show loading state while fetching
  if (status === 'loading') {
    return (
      <div className="h-full bg-gray-50 dark:bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-center">
          <InlineSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-[#bdbdbd]">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div className="h-full bg-gray-50 dark:bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Product not found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-[#bdbdbd]">
            The product you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/admin/products"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d0d0d]">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 relative" >
        {/* Header */}
        <div className="mb-6 pb-6 border-b border-gray-100 dark:border-[#1f1f1f]">
          <div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-[#777777]">
                <Link href="/admin/products" className="inline-flex items-center hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Link>
                <span>•</span>
                <span className="font-mono">{currentProduct.sku || 'SKU-N/A'}</span>
              </div>
              <div className="mt-1 flex items-center gap-3 flex-wrap">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white truncate">
                  {currentProduct.name}
                </h1>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    currentProduct.status === 'active'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                      : currentProduct.status === 'out_of_stock'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      : 'bg-gray-100 dark:bg-[#2a2a2a] text-gray-800 dark:text-gray-300'
                  }`}
                >
                  {currentProduct.status === 'active'
                    ? 'Active'
                    : currentProduct.status === 'out_of_stock'
                    ? 'Out of Stock'
                    : 'Hidden'}
                </span>
                <span className="px-2 py-1 rounded-md text-xs font-semibold bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300">
                  {formatCurrency(currentProduct.discountPrice || currentProduct.price)}
                </span>
              </div>
              <div className="mt-5 text-xs md:text-sm text-gray-600 dark:text-[#999999] flex flex-wrap gap-3">
                <span>Stock: <strong className="text-gray-800 dark:text-gray-200">{currentProduct.stockQuantity}</strong></span>
                {currentProduct.categories?.length ? (
                  <span>Categories: {currentProduct.categories.length}</span>
                ) : null}
              </div>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href={`/admin/products/${currentProduct._id}/edit`}
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 dark:border-[#333333] font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1b1b1b] hover:bg-gray-50 dark:hover:bg-[#232323] transition-colors text-sm"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-red-300 dark:border-red-800 font-medium rounded-md shadow-sm text-red-700 dark:text-red-400 bg-white dark:bg-[#1b1b1b] hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-400">Error</h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>{error}</p>
                </div>
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

        <div className="space-y-6">
          {/* Main Content */}
          <div>
            <div className="space-y-8 rounded-xl border border-gray-200 dark:border-[#1f1f1f] bg-white/70 dark:bg-[#121212] p-4">
            {/* Product Images */}
            <div className="bg-white dark:bg-[#151515] shadow-sm rounded-xl overflow-hidden border border-gray-200 dark:border-[#1f1f1f]">
              <div className="px-6 py-4 bg-gray-50 dark:bg-[#1e1e1e]">
                <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white">
                  Product Images
                </h3>
              </div>
              <div className="p-6">
                {currentProduct.images && currentProduct.images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {currentProduct.images.map((image, index) => (
                      <div
                        key={index}
                        className="aspect-square overflow-hidden rounded-lg bg-gray-200 dark:bg-[#191919]"
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
                    <Package className="mx-auto h-12 w-12 text-gray-400 dark:text-[#bdbdbd]" />
                    <p className="mt-2 text-sm text-gray-500 dark:text-[#bdbdbd]">
                      No images available
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Product Description */}
            <div className="bg-white dark:bg-[#151515] shadow-sm rounded-xl overflow-hidden border border-gray-200 dark:border-[#1f1f1f]">
              <div className="px-6 py-4 bg-gray-50 dark:bg-[#1e1e1e]">
                <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white">
                  Description
                </h3>
              </div>
              <div className="p-6">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {currentProduct.description}
                </p>
              </div>
            </div>

            {/* Product Specifications */}
            <div className="bg-white dark:bg-[#151515] shadow-sm rounded-xl overflow-hidden border border-gray-200 dark:border-[#1f1f1f]">
              <div className="px-6 py-4 bg-gray-50 dark:bg-[#1e1e1e]">
                <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white">
                  Specifications
                </h3>
              </div>
              <div className="p-6">
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-[#bdbdbd]">
                      Weight
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {currentProduct.weight || 'Not specified'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* SEO Information */}
            {(currentProduct.metaTitle || currentProduct.metaDescription) && (
              <div className="bg-white dark:bg-[#151515] shadow-sm rounded-xl overflow-hidden border border-gray-200 dark:border-[#1f1f1f]">
                <div className="px-6 py-4 bg-gray-50 dark:bg-[#1e1e1e]">
                  <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white">
                    SEO Information
                  </h3>
                </div>
                <div className="p-6">
                  <dl className="space-y-4">
                    {currentProduct.metaTitle && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-[#bdbdbd]">
                          Meta Title
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                          {currentProduct.metaTitle}
                        </dd>
                      </div>
                    )}
                    {currentProduct.metaDescription && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-[#bdbdbd]">
                          Meta Description
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                          {currentProduct.metaDescription}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar (now stacked below) */}
          <div>
            <div className="space-y-8 lg:pl-6 lg:border-l lg:border-gray-200 dark:lg:border-[#1f1f1f] rounded-xl bg-white/60 dark:bg-[#121212]/60 p-4">
            {/* Product Status */}
            <div className="bg-white dark:bg-[#151515] shadow-sm rounded-xl overflow-hidden border border-gray-200 dark:border-[#1f1f1f]">
              <div className="px-6 py-4 bg-gray-50 dark:bg-[#1e1e1e]">
                <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white">
                  Product Status
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-[#bdbdbd]">
                      Status
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        currentProduct.status === 'active'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : currentProduct.status === 'out_of_stock'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                          : 'bg-gray-100 dark:bg-[#191919] text-gray-800 dark:text-gray-300'
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
                    <span className="text-sm font-medium text-gray-500 dark:text-[#bdbdbd]">
                      Stock Quantity
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {currentProduct.stockQuantity}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Information */}
            <div className="bg-white dark:bg-[#151515] shadow-sm rounded-xl overflow-hidden border border-gray-200 dark:border-[#1f1f1f]">
              <div className="px-6 py-4 bg-gray-50 dark:bg-[#1e1e1e]">
                <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white">
                  Pricing
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-[#bdbdbd]">
                      Price
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(currentProduct.price)}
                    </span>
                  </div>
                  {currentProduct.discountPrice && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500 dark:text-[#bdbdbd]">
                        Discount Price
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(currentProduct.discountPrice)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product Information */}
            <div className="bg-white dark:bg-[#151515] shadow-sm rounded-xl overflow-hidden border border-gray-200 dark:border-[#1f1f1f]">
              <div className="px-6 py-4 bg-gray-50 dark:bg-[#1e1e1e]">
                <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white">
                  Product Information
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-[#bdbdbd]">
                      SKU
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {currentProduct.sku || 'Not specified'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-[#bdbdbd]">
                      Slug
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white font-mono">
                      {currentProduct.slug}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-[#bdbdbd]">
                      Created
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {formatDate(currentProduct.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-[#bdbdbd]">
                      Updated
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {formatDate(currentProduct.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white dark:bg-[#151515] shadow-sm rounded-xl overflow-hidden border border-gray-200 dark:border-[#1f1f1f]">
              <div className="px-6 py-4 bg-gray-50 dark:bg-[#1e1e1e]">
                <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white">
                  Categories
                </h3>
              </div>
              <div className="p-6">
                {currentProduct.categories &&
                currentProduct.categories.length > 0 ? (
                  <div className="space-y-2">
                    {currentProduct.categories.map(category => (
                      <div key={category._id} className="flex items-center">
                        <Tag className="h-4 w-4 text-gray-400 dark:text-[#bdbdbd] mr-2" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {category.name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-[#bdbdbd]">
                    No categories assigned
                  </p>
                )}
              </div>
            </div>

            {/* Collections */}
            {currentProduct.collections &&
              currentProduct.collections.length > 0 && (
                <div className="bg-white dark:bg-[#2a2a2a] shadow-sm rounded-xl overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 dark:bg-[#242424]">
                    <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white">
                      Collections
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-2">
                      {currentProduct.collections.map(collection => (
                        <div key={collection._id} className="flex items-center">
                          <Package className="h-4 w-4 text-gray-400 dark:text-[#bdbdbd] mr-2" />
                          <span className="text-sm text-gray-900 dark:text-white">
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
        </div>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Product"
          size="md"
          footer={(
            <>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md border border-transparent shadow-sm px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: isDeleting ? '#c0231a' : '#d92d20' }}
                onMouseEnter={(e) => !isDeleting && (e.currentTarget.style.backgroundColor = '#c0231a')}
                onMouseLeave={(e) => !isDeleting && (e.currentTarget.style.backgroundColor = '#d92d20')}
              >
                {isDeleting ? (
                  <>
                    <InlineSpinner size="sm" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 dark:border-[#3a3a3a] shadow-sm px-4 py-2 bg-white dark:bg-[#242424] text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
              >
                Cancel
              </button>
            </>
          )}
        >
          <div className="sm:flex sm:items-start">
            <div className="mx-auto sm:mx-0 flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
              <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Are you sure you want to delete &quot;{currentProduct?.name}&quot;? This action cannot be undone.
              </p>
            </div>
          </div>
        </Modal>
      </div>
    </div>
    </div>
  );
}
