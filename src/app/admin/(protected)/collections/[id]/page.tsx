'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Layers,
  Package,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Plus,
  Eye,
  Settings,
  TrendingUp,
  Star,
  Clock,
  Users,
  Grid,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useCollectionStore } from '@/lib/data/store/collectionStore';
import ProductSelectionModal from '@/app/admin/components/ProductSelectionModal';

export default function CollectionViewPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const {
    currentCollection,
    allProducts,
    status,
    error,
    fetchCollection,
    fetchProducts,
    updateCollectionProducts,
    deleteCollection,
    clearError,
  } = useCollectionStore();

  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchCollection(id);
      fetchProducts();
    }
  }, [id, fetchCollection, fetchProducts]);

  useEffect(() => {
    if (currentCollection?.products) {
      setSelectedProducts(
        currentCollection.products.map((p: any) => p._id || p)
      );
    }
  }, [currentCollection]);

  const handleDelete = async () => {
    if (currentCollection) {
      try {
        await deleteCollection(currentCollection._id);
        router.push('/admin/collections');
      } catch (error) {
        console.error('Failed to delete collection:', error);
      }
    }
  };

  const handleUpdateProducts = async (newSelection: string[]) => {
    if (!currentCollection) return;
    try {
      await updateCollectionProducts(currentCollection._id, newSelection);
      setSelectedProducts(newSelection);
      alert('Products updated successfully ✅');
    } catch (error) {
      console.error('Failed to update products', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-sm text-gray-500">Loading collection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-sm md:text-lg  font-medium text-gray-900">
            Something went wrong
          </h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <div className="mt-6 space-y-3">
            <button
              onClick={clearError}
              className="w-full px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-all"
            >
              Dismiss Error
            </button>
            <Link
              href="/admin/collections"
              className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              Back to Collections
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!currentCollection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-sm md:text-lg  font-medium text-gray-900">
            Collection not found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            The collection you're looking for doesn't exist.
          </p>
          <Link
            href="/admin/collections"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Collections
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
                href="/admin/collections"
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href={`/admin/collections/${currentCollection._id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-xs md:text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center px-4 py-2 border border-red-300 text-xs md:text-sm font-medium rounded-md shadow-sm text-red-700 bg-white hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </div>

          <div className="mt-4">
            <h1 className="text-xl md:text-3xl font-bold text-gray-900">
              {currentCollection.name}
            </h1>
            <p className="mt-2 text-gray-600 text-sm md:text-base">
              Collection details and information
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
            {/* Collection Image */}
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm md:text-lg  font-semibold text-gray-900">
                  Collection Image
                </h3>
              </div>
              <div className="p-6">
                {currentCollection.image ? (
                  <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-200">
                    <Image
                      src={currentCollection.image}
                      alt={currentCollection.name}
                      width={800}
                      height={400}
                      className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Layers className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      No image available
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Collection Description */}
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm md:text-lg  font-semibold text-gray-900">
                  Description
                </h3>
              </div>
              <div className="p-6">
                <p className="text-gray-700 whitespace-pre-wrap text-sm md:text-base">
                  {currentCollection.description || 'No description available'}
                </p>
              </div>
            </div>

            {/* Collection Products */}
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm md:text-lg  font-semibold text-gray-900">
                    Products in Collection
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 md:text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors text-xs"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Manage Products
                  </button>
                </div>
              </div>
              <div className="p-6">
                {currentCollection.products &&
                currentCollection.products.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {currentCollection.products.map(
                      (product: any, index: number) => (
                        <div
                          key={product._id || index}
                          className="aspect-square overflow-hidden rounded-lg bg-gray-200 group cursor-pointer"
                        >
                          {product.images && product.images[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name || 'Product'}
                              width={200}
                              height={200}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Package className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          {/* <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-end">
                          <div className="p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <p className="text-xs font-medium truncate">
                              {product.name || 'Product'}
                            </p>
                          </div>
                        </div> */}
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      No products in this collection
                    </p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Products
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Collection Status */}
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm md:text-lg  font-semibold text-gray-900">
                  Collection Status
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
                        currentCollection.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {currentCollection.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      Products Count
                    </span>
                    <span className="text-sm text-gray-900">
                      {currentCollection.products?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Collection Information */}
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm md:text-lg  font-semibold text-gray-900">
                  Collection Information
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      Collection ID
                    </span>
                    <span className="md:text-sm text-gray-900 font-mono text-xs">
                      {currentCollection._id.slice(0, 8)}...
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      Slug
                    </span>
                    <span className="text-sm text-gray-900 font-mono">
                      {currentCollection.slug || 'Not set'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      Sort Order
                    </span>
                    <span className="text-sm text-gray-900">
                      {currentCollection.sortOrder || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      Created
                    </span>
                    <span className="text-sm text-gray-900">
                      {formatDate(currentCollection.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      Updated
                    </span>
                    <span className="text-sm text-gray-900">
                      {formatDate(currentCollection.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm md:text-lg  font-semibold text-gray-900">
                  Quick Actions
                </h3>
              </div>
              <div className="p-6 space-y-3">
                <Link
                  href={`/admin/collections/${currentCollection._id}/edit`}
                  className="flex items-center px-4 py-2 bg-gray-50 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Collection
                </Link>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center w-full px-4 py-2 bg-gray-50 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Manage Products
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center w-full px-4 py-2 bg-red-50 rounded-lg text-red-600 hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Collection
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
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
                        Delete Collection
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete &quot;
                          {currentCollection?.name}&quot;? This action cannot be
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
                    onClick={() => setShowDeleteConfirm(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Selection Modal */}
        <ProductSelectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          products={allProducts}
          selectedProducts={selectedProducts}
          onSave={handleUpdateProducts}
        />
      </div>
    </div>
  );
}
