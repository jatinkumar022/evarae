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
  Layers,
  Grid2X2,
  Loader2,
} from 'lucide-react';
import { useProductStore, Product } from '@/lib/data/store/productStore';
import { useCategoryStore } from '@/lib/data/store/categoryStore';

export default function ProductsPage() {
  const {
    products,
    productsByCategory,
    filters,
    pagination,
    status,

    setFilters,
    fetchProducts,
    deleteProduct,
  } = useProductStore();

  const { categories, fetchCategories } = useCategoryStore();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'flat' | 'grouped'>('flat');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [filters, fetchProducts]);

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

  const renderProductCard = (product: Product) => (
    <div
      key={product._id}
      className="group relative bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Product Image */}
      <div className="aspect-square w-full overflow-hidden rounded-t-lg bg-gray-200">
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
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {product.name}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {product.categories.map(cat => cat.name).join(', ')}
            </p>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="text-sm font-medium text-gray-900">
            {formatCurrency(product.price)}
            {product.discountPrice && (
              <span className="ml-2 text-xs text-gray-500 line-through">
                {formatCurrency(product.discountPrice)}
              </span>
            )}
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              product.status === 'active'
                ? 'bg-green-100 text-green-800'
                : product.status === 'out_of_stock'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {product.status === 'active'
              ? 'Active'
              : product.status === 'out_of_stock'
              ? 'Out of Stock'
              : 'Hidden'}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between text-sm text-gray-500 flex-wrap gap-1">
          <span>SKU: {product.sku || 'N/A'}</span>
          <span>Stock: {product.stockQuantity}</span>
        </div>

        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {product.tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex space-x-2">
            <Link
              href={`/admin/products/${product._id}`}
              className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
            >
              <Eye className="h-3 w-3 mr-1" /> View
            </Link>
            <Link
              href={`/admin/products/${product._id}/edit`}
              className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
            >
              <Edit className="h-3 w-3 mr-1" /> Edit
            </Link>
          </div>
          <button
            onClick={() => handleDelete(product)}
            className="inline-flex items-center px-2 py-1 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3 mr-1" /> Delete
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex md:items-center gap-4 flex-col md:flex-row justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your product catalog</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setViewMode('grouped')}
            className={`inline-flex items-center px-3 py-2  text-xs md:text-sm  rounded-md border ${
              viewMode === 'grouped'
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-700 border-gray-300'
            }`}
          >
            <Layers className="h-4 w-4 mr-2" /> Grouped
          </button>
          <button
            onClick={() => setViewMode('flat')}
            className={`inline-flex items-center px-3 py-2  text-xs md:text-sm  rounded-md border ${
              viewMode === 'flat'
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-700 border-gray-300'
            }`}
          >
            <Grid2X2 className="h-4 w-4 mr-2" /> Flat
          </button>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center text-xs md:text-sm px-4 py-2 border border-transparent font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Product
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Search
            </label>
            <div className="mt-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Search products..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md sm:text-sm focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              value={filters.category}
              onChange={e => handleCategoryFilter(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md focus:ring-primary focus:border-primary sm:text-sm"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={e => handleSort(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md focus:ring-primary focus:border-primary sm:text-sm"
            >
              <option value="createdAt">Date Created</option>
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="stockQuantity">Stock</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              value={filters.status}
              onChange={e => setFilters({ status: e.target.value })}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md focus:ring-primary focus:border-primary sm:text-sm"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {/* Global loader will handle loading state */}
          {products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No products found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : viewMode === 'grouped' ? (
            Object.entries(productsByCategory).map(([catId, prods]) => (
              <div key={catId} className="mb-6">
                <h4 className="text-md font-semibold mb-2">
                  {categories.find(c => c._id === catId)?.name || 'Category'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {prods.map(renderProductCard)}
                </div>
              </div>
            ))
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(renderProductCard)}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
                of {pagination.total} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
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
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Product
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete &quot;
                        {productToDelete?.name}&quot;? This action cannot be
                        undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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
