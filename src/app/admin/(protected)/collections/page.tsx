'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Package,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronUp,
  Layers,
  Search,
  Filter,
  Grid,
  List,
} from 'lucide-react';
import { useCollectionStore } from '@/lib/data/store/collectionStore';
import { Collection } from '@/lib/data/store/collectionStore';

export default function CollectionsPage() {
  const {
    collections,
    status,
    error,
    fetchCollections,
    deleteCollection,
    updateCollection,
    clearError,
  } = useCollectionStore();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] =
    useState<Collection | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    fetchCollections();
  }, []); // run once

  const handleToggleStatus = async (id: string) => {
    try {
      const collection = collections.find(col => col._id === id);
      if (collection) {
        // ⚠️ Requires backend to allow partial updates
        await updateCollection(id, { isActive: !collection.isActive });
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const handleDeleteCollection = (collection: Collection) => {
    setCollectionToDelete(collection);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (collectionToDelete) {
      try {
        await deleteCollection(collectionToDelete._id);
        setIsDeleteModalOpen(false);
        setCollectionToDelete(null);
      } catch (error) {
        console.error('Failed to delete collection:', error);
      }
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredCollections = collections.filter(
    collection =>
      collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collection.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 p-4">
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 sm:p-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold">Collections</h1>
            <p className="text-indigo-100 text-base sm:text-lg">
              Manage your jewellery collections with style
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>{collections.filter(c => c.isActive).length} Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span>
                  {collections.filter(c => !c.isActive).length} Inactive
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>
                  {collections.reduce(
                    (acc, c) => acc + (c.products?.length || 0),
                    0
                  )}{' '}
                  Products
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/admin/collections/new"
            className="inline-flex justify-center items-center px-5 py-3 bg-white text-indigo-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 w-full sm:w-auto"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Collection
          </Link>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800 font-medium">{error}</p>
              <button
                onClick={clearError}
                className="mt-2 text-sm text-red-600 hover:text-red-500 underline font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Controls Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          {/* Search and Filters */}
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search collections..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <button className="inline-flex items-center px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
          </div>

          {/* View Controls */}
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-600 font-medium">
              {filteredCollections.length} of {collections.length} collections
            </div>
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {status === 'loading' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600 font-medium">
              Loading collections...
            </p>
          </div>
        </div>
      )}

      {/* Collections Display */}
      {status === 'success' && filteredCollections.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {viewMode === 'grid' ? (
            <div className="p-6">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredCollections.map(collection => (
                  <div
                    key={collection._id}
                    className="group relative bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
                  >
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3 z-10">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          collection.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {collection.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* Dropdown Menu */}
                    <div className="absolute top-3 right-3 z-10">
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActiveDropdown(
                              activeDropdown === collection._id
                                ? null
                                : collection._id
                            )
                          }
                          className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all"
                        >
                          <MoreHorizontal className="h-4 w-4 text-gray-600" />
                        </button>

                        {activeDropdown === collection._id && (
                          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                            <Link
                              href={`/admin/collections/${collection._id}`}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              onClick={() => setActiveDropdown(null)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                            <Link
                              href={`/admin/collections/${collection._id}/edit`}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              onClick={() => setActiveDropdown(null)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                            <button
                              onClick={() => {
                                handleToggleStatus(collection._id);
                                setActiveDropdown(null);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              {collection.isActive ? (
                                <ToggleLeft className="h-4 w-4 mr-2" />
                              ) : (
                                <ToggleRight className="h-4 w-4 mr-2" />
                              )}
                              {collection.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <hr className="my-2" />
                            <button
                              onClick={() => {
                                handleDeleteCollection(collection);
                                setActiveDropdown(null);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Image */}
                    <div className="aspect-square w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                      {collection.image ? (
                        <Image
                          src={collection.image}
                          alt={collection.name}
                          width={400}
                          height={400}
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <div className="text-center">
                            <Layers className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No Image</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {collection.name}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {collection.description || 'No description available'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <Package className="h-4 w-4 mr-1" />
                          <span className="font-medium">
                            {collection.products?.length || 0}
                          </span>
                          <span className="ml-1">products</span>
                        </div>
                      </div>

                      {/* Expand Button */}
                      <button
                        onClick={() => toggleExpand(collection._id)}
                        className="w-full flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
                      >
                        {expanded.has(collection._id) ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-2" />
                            Hide Products
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-2" />
                            Show Products
                          </>
                        )}
                      </button>
                    </div>

                    {/* Expanded Products */}
                    {expanded.has(collection._id) && (
                      <div className="border-t border-gray-200 bg-gray-50 p-6">
                        <h4 className="font-semibold text-gray-900 mb-3">
                          Products in {collection.name}
                        </h4>
                        {collection.products &&
                        collection.products.length > 0 ? (
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {collection.products.map((prod: any) => (
                              <div
                                key={prod._id || prod}
                                className="flex items-center space-x-2 p-2 bg-white rounded-lg"
                              >
                                <Package className="h-4 w-4 text-indigo-500" />
                                <span className="text-sm text-gray-700">
                                  {prod.name || prod}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">
                              No products in this collection
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* List View */
            <div className="divide-y divide-gray-200">
              {filteredCollections.map(collection => (
                <div
                  key={collection._id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                        {collection.image ? (
                          <Image
                            src={collection.image}
                            alt={collection.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Layers className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {collection.name}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            collection.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {collection.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">
                        {collection.description || 'No description'}
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Package className="h-4 w-4 mr-1" />
                        <span>{collection.products?.length || 0} products</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Link
                        href={`/admin/collections/${collection._id}`}
                        className="inline-flex items-center px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Link>
                      <Link
                        href={`/admin/collections/${collection._id}/edit`}
                        className="inline-flex items-center px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {status === 'success' &&
        filteredCollections.length === 0 &&
        collections.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <Search className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No collections found
              </h3>
              <p className="text-gray-600 mb-6">
                No collections match your search criteria. Try adjusting your
                search terms.
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
              >
                Clear Search
              </button>
            </div>
          </div>
        )}

      {status === 'success' && collections.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Layers className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No collections yet
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first collection to organize your
              products.
            </p>
            <Link
              href="/admin/collections/new"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create First Collection
            </Link>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>
            <div className="inline-block bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-6 pt-6 pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Delete Collection
                    </h3>
                    <p className="text-gray-600">
                      Are you sure you want to delete &quot;
                      <span className="font-medium">
                        {collectionToDelete?.name}
                      </span>
                      &quot;? This action cannot be undone and will remove all
                      associated data.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-6 py-3 bg-red-600 text-base font-medium text-white hover:bg-red-700 transition-all sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete Collection
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-6 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 transition-all sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
