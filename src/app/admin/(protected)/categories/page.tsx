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
  Tag,
  Search,
  Layers,
} from 'lucide-react';
import { useCategoryStore, Category } from '@/lib/data/store/categoryStore';
import { CustomSelect } from '@/app/admin/components/CustomSelect';
import Modal from '@/app/admin/components/Modal';
import { toastApi } from '@/lib/toast';
import InlineSpinner from '@/app/admin/components/InlineSpinner';

export default function CategoriesPage() {
  const {
    categories,
    status,
    error,
    fetchCategories,
    deleteCategory,
    updateCategory,
    clearError,
  } = useCategoryStore();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<
    'all' | 'active' | 'inactive'
  >('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const itemsPerPage = 9;

  useEffect(() => {
    // Fetch categories from API
    fetchCategories();
  }, [fetchCategories]);

  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (categoryToDelete) {
      setIsDeleting(true);
      try {
        await deleteCategory(categoryToDelete._id);
        toastApi.success('Category deleted successfully', 'The category has been removed');
        setIsDeleteModalOpen(false);
        setCategoryToDelete(null);
        // Refresh categories after deletion
        fetchCategories();
      } catch (error) {
        console.error('Failed to delete category:', error);
        toastApi.error('Failed to delete category', 'Please try again');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const filteredCategories = categories.filter(category => {
    const matchesSearch =
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterActive === 'all' ||
      (filterActive === 'active' && category.isActive) ||
      (filterActive === 'inactive' && !category.isActive);

    return matchesSearch && matchesFilter;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterActive]);

  const activeCount = categories.filter(cat => cat.isActive).length;
  const inactiveCount = categories.length - activeCount;

  return (
    <div className="space-y-6  mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      {/* Header */}
      <div className="flex md:items-center gap-4 flex-col md:flex-row justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Categories
          </h1>
          <p className="text-gray-600 dark:text-[#bdbdbd]">
            Manage your product categories and organize your inventory
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <span className="text-sm text-gray-600 dark:text-[#bdbdbd]">
              Total: <span className="font-medium">{categories.length}</span>
            </span>
            <span className="text-sm text-gray-600 dark:text-[#bdbdbd]">
              Active: <span className="font-medium text-green-600 dark:text-green-400">{activeCount}</span>
            </span>
            <span className="text-sm text-gray-600 dark:text-[#bdbdbd]">
              Inactive: <span className="font-medium text-gray-500 dark:text-[#bdbdbd]">{inactiveCount}</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/admin/categories/new"
            className="inline-flex items-center text-xs md:text-sm px-4 py-2 border border-transparent font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Category
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#191919] shadow rounded-lg p-6 border border-gray-200 dark:border-[#525252]">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Search
            </label>
            <div className="mt-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[#bdbdbd]" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-[#525252] rounded-md sm:text-sm bg-white dark:bg-[#242424] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#bdbdbd] focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-600 dark:focus:border-primary-600"
              />
            </div>
          </div>

          <div>
            <CustomSelect
              label="Status"
              value={filterActive}
              onChange={(v) => setFilterActive(v as 'all' | 'active' | 'inactive')}
              options={[
                { value: 'all', label: 'All Categories' },
                { value: 'active', label: 'Active Only' },
                { value: 'inactive', label: 'Inactive Only' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="bg-white dark:bg-[#191919] shadow rounded-lg border border-gray-200 dark:border-[#525252]">
        <div className="px-4 py-5 sm:p-6">
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
              <button
                onClick={clearError}
                className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {status === 'loading' ? (
            <div className="text-center py-12">
              <InlineSpinner size="lg" className="mx-auto mb-4" />
              <p className="mt-2 text-sm text-gray-500 dark:text-[#bdbdbd]">Loading categories...</p>
            </div>
          ) : paginatedCategories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {paginatedCategories.map(category => {
                const isDropdownOpen = activeDropdown === category._id;
                return (
                  <div
                    key={category._id}
                    className="group relative bg-white dark:bg-[#1d1d1d] border border-gray-200 dark:border-[#525252] rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3 z-10">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          category.isActive
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                            : 'bg-gray-100 dark:bg-[#525252] text-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* Action Dropdown - Top Right Corner */}
                    <div className="absolute top-3 right-3 z-10">
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActiveDropdown(
                              isDropdownOpen ? null : category._id
                            )
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
                                  href={`/admin/categories/${category._id}`}
                                  onClick={() => setActiveDropdown(null)}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#525252]"
                                >
                                  <Eye className="h-4 w-4 mr-2" /> View
                                </Link>
                                <Link
                                  href={`/admin/categories/${category._id}/edit`}
                                  onClick={() => setActiveDropdown(null)}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#525252]"
                                >
                                  <Edit className="h-4 w-4 mr-2" /> Edit
                                </Link>
                                <button
                                  onClick={async () => {
                                    setUpdatingStatusId(category._id);
                                    try {
                                      await updateCategory(category._id, {
                                        isActive: !category.isActive,
                                      });
                                      toastApi.success(
                                        'Status updated successfully',
                                        `Category is now ${!category.isActive ? 'active' : 'inactive'}`
                                      );
                                      setActiveDropdown(null);
                                      fetchCategories();
                                    } catch (error) {
                                      console.error('Failed to toggle status:', error);
                                      toastApi.error('Failed to update status', 'Please try again');
                                    } finally {
                                      setUpdatingStatusId(null);
                                    }
                                  }}
                                  disabled={updatingStatusId === category._id}
                                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#525252] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {updatingStatusId === category._id ? (
                                    <>
                                      <InlineSpinner size="sm" className="mr-2" />
                                      Updating...
                                    </>
                                  ) : (
                                    category.isActive ? 'Deactivate' : 'Activate'
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    handleDeleteCategory(category);
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
                      {category.image ? (
                        <Image
                          src={category.image}
                          alt={category.name}
                          width={400}
                          height={400}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Layers className="h-12 w-12 text-gray-400 dark:text-[#bdbdbd]" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-[#bdbdbd] line-clamp-2">
                        {category.description || 'No description available'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Tag className="mx-auto h-12 w-12 text-gray-400 dark:text-[#bdbdbd]" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                {searchTerm || filterActive !== 'all'
                  ? 'No categories found'
                  : 'No categories yet'}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-[#bdbdbd]">
                {searchTerm || filterActive !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating your first category.'}
              </p>
              {!searchTerm && filterActive === 'all' && (
                <Link
                  href="/admin/categories/new"
                  className="mt-4 inline-flex items-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-md transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Category
                </Link>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between px-4 py-4 border-t border-gray-200 dark:border-[#525252]">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredCategories.length)} of{' '}
                {filteredCategories.length} results
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
        title="Delete Category"
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
              Are you sure you want to delete {categoryToDelete?.name}? This action cannot be undone.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
