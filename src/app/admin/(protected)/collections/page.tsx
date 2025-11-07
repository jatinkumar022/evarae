'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Package,
  Layers,
  Search,
} from 'lucide-react';
import { useCollectionStore } from '@/lib/data/store/collectionStore';
import { Collection } from '@/lib/data/store/collectionStore';
import dynamic from 'next/dynamic';

const Modal = dynamic(() => import('@/app/admin/components/Modal'), {
  ssr: false,
});
import { toastApi } from '@/lib/toast';
import InlineSpinner from '@/app/admin/components/InlineSpinner';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const itemsPerPage = 9;

  useEffect(() => {
    if (collections.length === 0) fetchCollections();
  }, [collections.length, fetchCollections]);

  const handleToggleStatus = async (id: string) => {
    setUpdatingStatusId(id);
    try {
      const collection = collections.find(col => col._id === id);
      if (collection) {
        await updateCollection(id, { isActive: !collection.isActive });
        toastApi.success(
          'Status updated successfully',
          `Collection is now ${!collection.isActive ? 'active' : 'inactive'}`
        );
        // Refresh collections after update
        fetchCollections();
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
      toastApi.error('Failed to update status', 'Please try again');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleDeleteCollection = (collection: Collection) => {
    setCollectionToDelete(collection);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (collectionToDelete) {
      setIsDeleting(true);
      try {
        await deleteCollection(collectionToDelete._id);
        toastApi.success('Collection deleted successfully', 'The collection has been removed');
        setIsDeleteModalOpen(false);
        setCollectionToDelete(null);
        // Refresh collections after deletion
        fetchCollections();
      } catch (error) {
        console.error('Failed to delete collection:', error);
        toastApi.error('Failed to delete collection', 'Please try again');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const filteredCollections = collections.filter(
    collection =>
      collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collection.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredCollections.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCollections = filteredCollections.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="space-y-6  mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      {/* Header */}
      <div className="flex md:items-center gap-4 flex-col md:flex-row justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Collections
          </h1>
          <p className="text-gray-600 dark:text-[#bdbdbd]">
            Manage your jewellery collections with style
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <span className="text-sm text-gray-600 dark:text-[#bdbdbd]">
              Active: <span className="font-medium text-green-600 dark:text-green-400">{collections.filter(c => c.isActive).length}</span>
            </span>
            <span className="text-sm text-gray-600 dark:text-[#bdbdbd]">
              Inactive: <span className="font-medium text-gray-500 dark:text-[#bdbdbd]">{collections.filter(c => !c.isActive).length}</span>
            </span>
            <span className="text-sm text-gray-600 dark:text-[#bdbdbd]">
              Products: <span className="font-medium">{collections.reduce((acc, c) => acc + (c.products?.length || 0), 0)}</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/admin/collections/new"
            prefetch={true}
            className="inline-flex items-center text-xs md:text-sm px-4 py-2 border border-transparent font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Collection
          </Link>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
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
              <p className="text-sm text-red-800 dark:text-red-400 font-medium">{error}</p>
              <button
                onClick={clearError}
                className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-[#191919] shadow rounded-lg p-6 border border-gray-200 dark:border-[#525252]">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Search
            </label>
            <div className="mt-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[#bdbdbd]" />
              <input
                type="text"
                placeholder="Search collections..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-[#525252] rounded-md sm:text-sm bg-white dark:bg-[#242424] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#bdbdbd] focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-600 dark:focus:border-primary-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="bg-white dark:bg-[#191919] shadow rounded-lg border border-gray-200 dark:border-[#525252]">
        <div className="px-4 py-5 sm:p-6">
          {status === 'loading' ? (
            <div className="text-center py-12">
              <InlineSpinner size="lg" className="mx-auto mb-4" />
              <p className="mt-2 text-sm text-gray-500 dark:text-[#bdbdbd]">Loading collections...</p>
            </div>
          ) : paginatedCollections.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {paginatedCollections.map(collection => {
                const isDropdownOpen = activeDropdown === collection._id;
                return (
                  <div
                    key={collection._id}
                    className="group relative bg-white dark:bg-[#1d1d1d] border border-gray-200 dark:border-[#525252] rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3 z-10">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          collection.isActive
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                            : 'bg-gray-100 dark:bg-[#525252] text-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {collection.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* Action Dropdown - Top Right Corner */}
                    <div className="absolute top-3 right-3 z-10">
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActiveDropdown(isDropdownOpen ? null : collection._id)
                          }
                          className="inline-flex items-center px-2 py-1 border border-gray-300 dark:border-[#525252] shadow-sm text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-white/90 dark:bg-[#1d1d1d]/90 backdrop-blur-sm hover:bg-white dark:hover:bg-[#525252]"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {isDropdownOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setActiveDropdown(null)}
                            />
                            <div className="absolute right-0 mt-1 w-32 rounded-md shadow-lg bg-white dark:bg-[#1d1d1d] ring-1 ring-black ring-opacity-5 z-20 border border-gray-200 dark:border-[#525252]">
                              <div className="py-1">
                                <Link
                                  href={`/admin/collections/${collection._id}`}
                                  onClick={() => setActiveDropdown(null)}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#525252]"
                                >
                                  <Eye className="h-4 w-4 mr-2" /> View
                                </Link>
                                <Link
                                  href={`/admin/collections/${collection._id}/edit`}
                                  onClick={() => setActiveDropdown(null)}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#525252]"
                                >
                                  <Edit className="h-4 w-4 mr-2" /> Edit
                                </Link>
                                <button
                                  onClick={() => {
                                    handleToggleStatus(collection._id);
                                    setActiveDropdown(null);
                                  }}
                                  disabled={updatingStatusId === collection._id}
                                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#525252] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {updatingStatusId === collection._id ? (
                                    <>
                                      <InlineSpinner size="sm" className="mr-2" />
                                      Updating...
                                    </>
                                  ) : (
                                    collection.isActive ? 'Deactivate' : 'Activate'
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    handleDeleteCollection(collection);
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Image */}
                    <div className="aspect-square w-full overflow-hidden rounded-t-lg bg-gray-200 dark:bg-[#525252]">
                      {collection.image ? (
                        <Image
                          src={collection.image}
                          alt={collection.name}
                          width={400}
                          height={400}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Layers className="h-12 w-12 text-gray-400 dark:text-[#bdbdbd]" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1 truncate">
                        {collection.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-[#bdbdbd] line-clamp-2 mb-2">
                        {collection.description || 'No description available'}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 dark:text-[#bdbdbd]">
                        <Package className="h-4 w-4 mr-1" />
                        <span>{collection.products?.length || 0} products</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Layers className="mx-auto h-12 w-12 text-gray-400 dark:text-[#bdbdbd]" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                {searchTerm ? 'No collections found' : 'No collections yet'}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-[#bdbdbd]">
                {searchTerm
                  ? 'Try adjusting your search criteria.'
                  : 'Get started by creating your first collection.'}
              </p>
              {!searchTerm && (
                <Link
                  href="/admin/collections/new"
            prefetch={true}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-md transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Collection
                </Link>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between px-4 py-4 border-t border-gray-200 dark:border-[#525252]">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredCollections.length)} of{' '}
                {filteredCollections.length} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#242424] border border-gray-300 dark:border-[#525252] rounded-md hover:bg-gray-50 dark:hover:bg-[#2f2f2f] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#242424] border border-gray-300 dark:border-[#525252] rounded-md hover:bg-gray-50 dark:hover:bg-[#2f2f2f] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Collection"
        size="md"
        footer={(
          <>
            <button
              type="button"
              onClick={confirmDelete}
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
              Are you sure you want to delete {collectionToDelete?.name}? This action cannot be undone.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
