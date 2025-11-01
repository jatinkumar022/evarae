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
  Plus,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useCollectionStore } from '@/lib/data/store/collectionStore';
import ProductSelectionModal from '@/app/admin/components/ProductSelectionModal';
import { setDummyCollectionsInStore, setDummyProductsInStore } from '@/lib/data/dummyDataHelper';
import { dummyCollections } from '@/lib/data/dummyCollections';
import Modal from '@/app/admin/components/Modal';

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    // Load dummy data instead of API calls
    setDummyCollectionsInStore();
    setDummyProductsInStore();
    
    if (id && typeof id === 'string') {
      // Find collection from dummy data
      const collection = dummyCollections.find(c => c._id === id);
      if (collection) {
        useCollectionStore.setState({ 
          currentCollection: collection, 
          status: 'success', 
          error: null 
        });
      } else {
        useCollectionStore.setState({ 
          currentCollection: null, 
          status: 'error', 
          error: 'Collection not found' 
        });
      }
    }
  }, [id]);

  useEffect(() => {
    if (currentCollection?.products) {
      setSelectedProducts(
        currentCollection.products.map((p: { _id?: string } | string) =>
          typeof p === 'string' ? p : p._id || ''
        )
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

  if (!currentCollection) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Collection not found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-[#696969]">
            The collection you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/admin/collections"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700"
          >
            Back to Collections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d0d0d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 relative">
        {/* Header */}
        <div className="mb-6 pb-6 border-b border-gray-100 dark:border-[#1f1f1f]">
          <div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-[#777777]">
                <Link href="/admin/collections" className="inline-flex items-center hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Link>
                <span>•</span>
                <span className="font-mono">{currentCollection._id.slice(0, 8)}...</span>
              </div>
              <div className="mt-1 flex items-center gap-3 flex-wrap">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white truncate">
                  {currentCollection.name}
                </h1>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    currentCollection.isActive
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-[#2a2a2a] text-gray-800 dark:text-gray-300'
                  }`}
                >
                  {currentCollection.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="mt-5 text-xs md:text-sm text-gray-600 dark:text-[#999999] flex flex-wrap gap-3">
                <span>Products: <strong className="text-gray-800 dark:text-gray-200">{currentCollection.products?.length || 0}</strong></span>
                {currentCollection.sortOrder ? (
                  <span>Sort Order: <strong className="text-gray-800 dark:text-gray-200">{currentCollection.sortOrder}</strong></span>
                ) : null}
            </div>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href={`/admin/collections/${currentCollection._id}/edit`}
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
            {/* Collection Image */}
              <div className="bg-white dark:bg-[#151515] shadow-sm rounded-xl overflow-hidden border border-gray-200 dark:border-[#1f1f1f]">
                <div className="px-6 py-4 bg-gray-50 dark:bg-[#1e1e1e]">
                  <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white">
                  Collection Image
                </h3>
              </div>
              <div className="p-6">
                {currentCollection.image ? (
                    <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-200 dark:bg-[#191919]">
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
                      <Layers className="mx-auto h-12 w-12 text-gray-400 dark:text-[#696969]" />
                      <p className="mt-2 text-sm text-gray-500 dark:text-[#696969]">
                      No image available
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Collection Description */}
              <div className="bg-white dark:bg-[#151515] shadow-sm rounded-xl overflow-hidden border border-gray-200 dark:border-[#1f1f1f]">
                <div className="px-6 py-4 bg-gray-50 dark:bg-[#1e1e1e]">
                  <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white">
                  Description
                </h3>
              </div>
              <div className="p-6">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {currentCollection.description || 'No description available'}
                </p>
              </div>
            </div>

            {/* Collection Products */}
              <div className="bg-white dark:bg-[#151515] shadow-sm rounded-xl overflow-hidden border border-gray-200 dark:border-[#1f1f1f]">
                <div className="px-6 py-4 bg-gray-50 dark:bg-[#1e1e1e]">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white">
                    Products in Collection
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(true)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-[#333333] md:text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1b1b1b] hover:bg-gray-50 dark:hover:bg-[#232323] transition-colors text-xs"
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
                      (
                        product:
                          | { _id?: string; images?: string[]; name?: string }
                          | string,
                        index: number
                      ) => (
                        <div
                          key={
                            (typeof product === 'string'
                              ? product
                              : product._id) || index
                          }
                            className="aspect-square overflow-hidden rounded-lg bg-gray-200 dark:bg-[#191919] group cursor-pointer"
                        >
                          {typeof product !== 'string' &&
                          product.images &&
                          product.images[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={(product.name || 'Product') as string}
                              width={200}
                              height={200}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                                <Package className="h-8 w-8 text-gray-400 dark:text-[#696969]" />
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                      <Package className="mx-auto h-12 w-12 text-gray-400 dark:text-[#696969]" />
                      <p className="mt-2 text-sm text-gray-500 dark:text-[#696969]">
                      No products in this collection
                    </p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Products
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

            {/* Sidebar (now stacked below) */}
            <div>
              <div className="space-y-8 lg:pl-6 lg:border-l lg:border-gray-200 dark:lg:border-[#1f1f1f] rounded-xl bg-white/60 dark:bg-[#121212]/60 p-4 mt-6">
            {/* Collection Status */}
                <div className="bg-white dark:bg-[#151515] shadow-sm rounded-xl overflow-hidden border border-gray-200 dark:border-[#1f1f1f]">
                  <div className="px-6 py-4 bg-gray-50 dark:bg-[#1e1e1e]">
                    <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white">
                  Collection Status
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-[#696969]">
                      Status
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        currentCollection.isActive
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                              : 'bg-gray-100 dark:bg-[#191919] text-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {currentCollection.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-[#696969]">
                      Products Count
                    </span>
                        <span className="text-sm text-gray-900 dark:text-white">
                      {currentCollection.products?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Collection Information */}
                <div className="bg-white dark:bg-[#151515] shadow-sm rounded-xl overflow-hidden border border-gray-200 dark:border-[#1f1f1f]">
                  <div className="px-6 py-4 bg-gray-50 dark:bg-[#1e1e1e]">
                    <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white">
                  Collection Information
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-[#696969]">
                      Collection ID
                    </span>
                        <span className="md:text-sm text-gray-900 dark:text-white font-mono text-xs">
                      {currentCollection._id.slice(0, 8)}...
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-[#696969]">
                      Slug
                    </span>
                        <span className="text-sm text-gray-900 dark:text-white font-mono">
                      {currentCollection.slug || 'Not set'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-[#696969]">
                      Sort Order
                    </span>
                        <span className="text-sm text-gray-900 dark:text-white">
                      {currentCollection.sortOrder || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-[#696969]">
                      Created
                    </span>
                        <span className="text-sm text-gray-900 dark:text-white">
                      {formatDate(currentCollection.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-[#696969]">
                      Updated
                    </span>
                        <span className="text-sm text-gray-900 dark:text-white">
                      {formatDate(currentCollection.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Collection"
          size="md"
          footer={(
            <>
                  <button
                    type="button"
                    onClick={handleDelete}
                className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-sm font-medium text-white transition-colors"
                style={{ backgroundColor: '#d92d20' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c0231a'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#d92d20'}
                  >
                    Delete
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
                Are you sure you want to delete &quot;{currentCollection?.name}&quot;? This action cannot be undone.
              </p>
            </div>
          </div>
        </Modal>

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
