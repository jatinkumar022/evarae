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
  Tag,
  Search,
  Filter,
  Grid3X3,
  List,
  XCircle,
  Layers,
} from 'lucide-react';
import { useCategoryStore, Category } from '@/lib/data/store/categoryStore';

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

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<
    'all' | 'active' | 'inactive'
  >('all');

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (categoryToDelete) {
      try {
        await deleteCategory(categoryToDelete._id);
        setIsDeleteModalOpen(false);
        setCategoryToDelete(null);
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  // Filter categories based on search and status
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

  const activeCount = categories.filter(cat => cat.isActive).length;
  const inactiveCount = categories.length - activeCount;

  return (
    <div className="">
      <div className="p-4">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Left Section */}
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Categories
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Manage your product categories and organize your inventory
              </p>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    Total: {categories.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    Active: {activeCount}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    Inactive: {inactiveCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Section - Button */}
            <div className="w-full lg:w-auto">
              <Link
                href="/admin/categories/new"
                className="w-full lg:w-auto inline-flex items-center justify-center px-6 py-3 text-xs md:text-sm
          bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 
          text-white font-medium rounded-lg shadow-md hover:shadow-lg 
          transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add New Category
              </Link>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-400 mr-3" />
              <div className="flex-1">
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

        {/* Controls Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-3">
              {/* Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={filterActive}
                  onChange={e =>
                    setFilterActive(
                      e.target.value as 'all' | 'active' | 'inactive'
                    )
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Loading State */}
          {status === 'loading' && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Loading Categories
              </h3>
              <p className="text-gray-500">
                Please wait while we fetch your categories...
              </p>
            </div>
          )}

          {/* Categories Display */}
          {status === 'success' && filteredCategories.length > 0 && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {filteredCategories.length}{' '}
                  {filteredCategories.length === 1 ? 'Category' : 'Categories'}
                  {searchTerm && (
                    <span className="text-gray-500 font-normal">
                      {' '}
                      matching "{searchTerm}"
                    </span>
                  )}
                </h3>
              </div>

              {viewMode === 'grid' ? (
                <div className="">
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredCategories.map(category => (
                      <div
                        key={category._id}
                        className="group relative bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
                      >
                        {/* Status Badge */}
                        <div className="absolute top-3 left-3 z-10">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              category.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {category.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        {/* Dropdown Menu */}
                        <div className="absolute top-3 right-3 z-10">
                          <div className="relative">
                            <button
                              onClick={() =>
                                setActiveDropdown(
                                  activeDropdown === category._id
                                    ? null
                                    : category._id
                                )
                              }
                              className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all"
                            >
                              <MoreHorizontal className="h-4 w-4 text-gray-600" />
                            </button>

                            {activeDropdown === category._id && (
                              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                                <Link
                                  href={`/admin/categories/${category._id}`}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                  onClick={() => setActiveDropdown(null)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Link>
                                <Link
                                  href={`/admin/categories/${category._id}/edit`}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                  onClick={() => setActiveDropdown(null)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Link>
                                <button
                                  onClick={() => {
                                    updateCategory(category._id, {
                                      isActive: !category.isActive,
                                    });
                                    setActiveDropdown(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  {category.isActive ? (
                                    <ToggleLeft className="h-4 w-4 mr-2" />
                                  ) : (
                                    <ToggleRight className="h-4 w-4 mr-2" />
                                  )}
                                  {category.isActive
                                    ? 'Deactivate'
                                    : 'Activate'}
                                </button>
                                <hr className="my-2" />
                                <button
                                  onClick={() => {
                                    handleDeleteCategory(category);
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
                          {category.image ? (
                            <Image
                              src={category.image}
                              alt={category.name}
                              width={400}
                              height={400}
                              className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Layers className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {category.description || 'No description available'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* List View */
                <div className="divide-y divide-gray-200">
                  {filteredCategories.map(category => (
                    <div
                      key={category._id}
                      className="p-3 md:p-6 hover:bg-gray-200  rounded-md bg-gray-50 border border-primary/10 transition-colors relative"
                    >
                      <div className="flex items-center space-x-3 md:space-x-6">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                            {category.image ? (
                              <Image
                                src={category.image}
                                alt={category.name}
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
                            <h3 className="text-sm md:text-lg font-semibold text-gray-900">
                              {category.name}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                category.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {category.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-gray-600 text-xs md:text-base">
                            {category.description || 'No description'}
                          </p>
                        </div>

                        {/* Dropdown Menu */}
                        <div className="absolute top-3 right-3 z-10">
                          <div className="relative">
                            <button
                              onClick={() =>
                                setActiveDropdown(
                                  activeDropdown === category._id
                                    ? null
                                    : category._id
                                )
                              }
                              className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all"
                            >
                              <MoreHorizontal className="h-4 w-4 text-gray-600" />
                            </button>

                            {activeDropdown === category._id && (
                              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                                <Link
                                  href={`/admin/categories/${category._id}`}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                  onClick={() => setActiveDropdown(null)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Link>
                                <Link
                                  href={`/admin/categories/${category._id}/edit`}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                  onClick={() => setActiveDropdown(null)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Link>
                                <button
                                  onClick={() => {
                                    updateCategory(category._id, {
                                      isActive: !category.isActive,
                                    });
                                    setActiveDropdown(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  {category.isActive ? (
                                    <ToggleLeft className="h-4 w-4 mr-2" />
                                  ) : (
                                    <ToggleRight className="h-4 w-4 mr-2" />
                                  )}
                                  {category.isActive
                                    ? 'Deactivate'
                                    : 'Activate'}
                                </button>
                                <hr className="my-2" />
                                <button
                                  onClick={() => {
                                    handleDeleteCategory(category);
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Empty States */}
          {status === 'success' && categories.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Tag className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No categories yet
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Get started by creating your first category to organize your
                products effectively.
              </p>
              <Link
                href="/admin/categories/new"
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create First Category
              </Link>
            </div>
          )}

          {status === 'success' &&
            categories.length > 0 &&
            filteredCategories.length === 0 && (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No categories found
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm
                    ? `No categories match "${searchTerm}"`
                    : 'No categories match your current filters'}
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterActive('all');
                  }}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
        </div>

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity"></div>

              <div className="inline-block bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-6 pt-6 pb-4">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <Trash2 className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Delete Category
                      </h3>
                      <p className="text-sm text-gray-500">
                        This action cannot be undone
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      Are you sure you want to delete{' '}
                      <span className="font-semibold text-gray-900">
                        "{categoryToDelete?.name}"
                      </span>
                      ? This will permanently remove the category and may affect
                      associated products.
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDelete}
                    className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Category
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
