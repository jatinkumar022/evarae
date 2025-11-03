'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Package,
  // Loader2,
  MoreVertical,
} from 'lucide-react';
import { useProductStore, Product } from '@/lib/data/store/productStore';
import { useCategoryStore } from '@/lib/data/store/categoryStore';
import { CustomSelect } from '@/app/admin/components/CustomSelect';
import Modal from '@/app/admin/components/Modal';
import { setDummyProductsInStore, setDummyCategoriesInStore } from '@/lib/data/dummyDataHelper';

export default function ProductsPage() {
  const {
    products,
    filters,
    pagination,
    // status,

    setFilters,
    // fetchProducts,
    deleteProduct,
  } = useProductStore();

  const { categories, // fetchCategories
    } = useCategoryStore();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  // Removed grouped/flat toggle; always show flat grid
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Use dummy data instead of API calls
  useEffect(() => {
    setDummyProductsInStore();
    setDummyCategoriesInStore();
  }, []);

  // Filter products locally when filters change
  useEffect(() => {
    // Filtering will be handled by the component's local state
    // No need to refetch since we're using dummy data
  }, [filters]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);

  const handleDelete = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        await deleteProduct(productToDelete._id);
        setIsDeleteModalOpen(false);
        setProductToDelete(null);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleSearch = (search: string) => setFilters({ search });
  const handleCategoryFilter = (category: string) => setFilters({ category });
  const handleSort = (sortBy: string) => setFilters({ sortBy });
  const handlePageChange = (page: number) => setFilters({ page });

  const renderProductCard = (product: Product) => {
    const isDropdownOpen = openDropdownId === product._id;
    
    return (
    <div
      key={product._id}
      className="group relative bg-white dark:bg-[#1d1d1d] border border-gray-200 dark:border-[#525252] rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Action Dropdown - Top Right Corner */}
      <div className="absolute top-3 right-3 z-10">
        <div className="relative">
          <button
            onClick={() => setOpenDropdownId(isDropdownOpen ? null : product._id)}
            className="inline-flex items-center px-2 py-1 border border-gray-300 dark:border-[#525252] shadow-sm text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-white/90 dark:bg-[#1d1d1d]/90 backdrop-blur-sm hover:bg-white dark:hover:bg-[#525252]"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          
          {isDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setOpenDropdownId(null)}
              />
              <div className="absolute right-0 mt-1 w-32 rounded-md shadow-lg bg-white dark:bg-[#1d1d1d] ring-1 ring-black ring-opacity-5 z-20 border border-gray-200 dark:border-[#525252]">
                <div className="py-1">
                  <Link
                    href={`/admin/products/${product._id}`}
                    onClick={() => setOpenDropdownId(null)}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#525252]"
                  >
                    <Eye className="h-4 w-4 mr-2" /> View
                  </Link>
                  <Link
                    href={`/admin/products/${product._id}/edit`}
                    onClick={() => setOpenDropdownId(null)}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#525252]"
                  >
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Link>
                  <button
                    onClick={() => {
                      setOpenDropdownId(null);
                      handleDelete(product);
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

      {/* Product Image */}
      <div className="aspect-square w-full overflow-hidden rounded-t-lg bg-gray-200 dark:bg-[#525252]">
        <Image
          src={product.thumbnail || product.thumbnail || '/placeholder.jpg'}
          alt={product.name}
          width={300}
          height={300}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {product.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-[#696969] truncate">
              {product.categories.map(cat => cat.name).join(', ')}
            </p>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {product.discountPrice ? (
              <>
                {formatCurrency(product.discountPrice)}
                <span className="ml-2 text-xs text-gray-500 dark:text-[#696969] line-through">
                  {formatCurrency(product.price)}
                </span>
              </>
            ) : (
              <>{formatCurrency(product.price)}</>
            )}
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              product.status === 'active'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                : product.status === 'out_of_stock'
                ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                : 'bg-gray-100 dark:bg-[#525252] text-gray-800 dark:text-gray-300'
            }`}
          >
            {product.status === 'active'
              ? 'Active'
              : product.status === 'out_of_stock'
              ? 'Out of Stock'
              : 'Hidden'}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between text-sm text-gray-500 dark:text-[#696969] flex-wrap gap-1">
          <span>SKU: {product.sku || 'N/A'}</span>
          <span>Stock: {product.stockQuantity}</span>
        </div>

        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {product.tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs rounded-full border border-primary-200 dark:border-primary-800"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

      </div>
    </div>
  );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      {/* Header */}
      <div className="flex md:items-center gap-4 flex-col md:flex-row justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
          <p className="text-gray-600 dark:text-[#696969]">Manage your product catalog</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center text-xs md:text-sm px-4 py-2 border border-transparent font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Product
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#191919] shadow rounded-lg p-6 border border-gray-200 dark:border-[#525252]">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Search
            </label>
            <div className="mt-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[#696969]" />
              <input
                type="text"
                value={filters.search}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Search products..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-[#525252] rounded-md sm:text-sm bg-white dark:bg-[#242424] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#696969] focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-600 dark:focus:border-primary-600"
              />
            </div>
          </div>

          <div>
            <CustomSelect
              label="Category"
              value={filters.category}
              onChange={(v) => handleCategoryFilter(v)}
              options={[{ value: '', label: 'All Categories' }, ...categories.map(cat => ({ value: cat._id, label: cat.name }))]}
            />
          </div>

          <div>
            <CustomSelect
              label="Sort By"
              value={filters.sortBy}
              onChange={(v) => handleSort(v)}
              options={[
                { value: 'createdAt', label: 'Date Created' },
                { value: 'name', label: 'Name' },
                { value: 'price', label: 'Price' },
                { value: 'stockQuantity', label: 'Stock' },
              ]}
            />
          </div>

          <div>
            <CustomSelect
              label="Status"
              value={filters.status}
              onChange={(v) => setFilters({ status: v })}
              options={[
                { value: '', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'out_of_stock', label: 'Out of Stock' },
                { value: 'hidden', label: 'Hidden' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="bg-white dark:bg-[#191919] shadow rounded-lg border border-gray-200 dark:border-[#525252]">
        <div className="px-4 py-5 sm:p-6">
          {/* Global loader will handle loading state */}
          {products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 dark:text-[#696969]" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No products found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-[#696969]">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map(renderProductCard)}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
                of {pagination.total} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#242424] border border-gray-300 dark:border-[#525252] rounded-md hover:bg-gray-50 dark:hover:bg-[#2f2f2f] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
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
        title="Delete Product"
        size="md"
        footer={(
          <>
            <button
              type="button"
              onClick={confirmDelete}
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
              Are you sure you want to delete {productToDelete?.name}? This action cannot be undone.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
