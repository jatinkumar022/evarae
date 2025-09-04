'use client';
import { useEffect } from 'react';
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
} from 'lucide-react';
import { useCategoryStore } from '@/lib/data/store/categoryStore'; // Make sure this exists
import { useProductStore } from '@/lib/data/store/productStore';

export default function CategoryViewPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const {
    currentCategory,
    status,
    error,
    fetchCategory,
    deleteCategory,
    clearError,
  } = useCategoryStore();
  const {
    productsByCategory,
    fetchProductsByCategory,
    // status: productStatus,
  } = useProductStore();

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchCategory(id);
    }
  }, [id, fetchCategory]);
  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchCategory(id);
      fetchProductsByCategory(id); // fetch products linked to this category
    }
  }, [id, fetchCategory, fetchProductsByCategory]);

  const products = productsByCategory[id as string] || [];
  const handleDelete = async () => {
    if (
      currentCategory &&
      confirm(`Are you sure you want to delete "${currentCategory.name}"?`)
    ) {
      try {
        await deleteCategory(currentCategory._id);
        router.push('/admin/categories');
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading category...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 max-w-md">
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={clearError}
              className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentCategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-sm md:text-lg font-medium text-gray-900">
            Category not found
          </h2>
          <Link
            href="/admin/categories"
            className="mt-2 inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/categories"
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Link>
            </div>
            <div className="flex space-x-3">
              <Link
                href={`/admin/categories/${currentCategory._id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-xs md:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-xs md:text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Category Details */}
        <div className="mt-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {/* Image Section */}
            <div className="aspect-video w-full overflow-hidden bg-gray-200">
              {currentCategory.image ? (
                <Image
                  src={currentCategory.image}
                  alt={currentCategory.name}
                  width={800}
                  height={400}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Layers className="h-24 w-24 text-gray-400" />
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                        {currentCategory.name}
                      </h2>
                      <p className="text-gray-600 mt-1 text-sm md:text-base">
                        {currentCategory.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {currentCategory.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <ToggleRight className="h-3 w-3 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <ToggleLeft className="h-3 w-3 mr-1" />
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Category Stats */}
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <Package className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Products
                          </p>
                          <p className="text-xl md:text-2xl font-bold text-gray-900">
                            {products?.length || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Products Section */}
                  <div className="mt-8">
                    <h3 className="text-sm md:text-lg font-medium text-gray-900 mb-4">
                      Products in this Category
                    </h3>
                    {products?.length ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {products.map(product => (
                          <div
                            key={product._id}
                            className="border rounded-lg p-3 flex flex-col items-center bg-white shadow-sm"
                          >
                            {product.images?.[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                width={120}
                                height={120}
                                className="object-cover rounded-md"
                              />
                            ) : (
                              <div className="w-[120px] h-[120px] bg-gray-100 flex items-center justify-center rounded-md">
                                <Package className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                            <p className="mt-2 text-sm font-medium text-gray-700 text-center">
                              {product.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No products in this category.
                      </p>
                    )}
                  </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      Category Details
                    </h3>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Slug
                        </dt>
                        <dd className="text-sm text-gray-900 font-mono">
                          {currentCategory.slug}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Created
                        </dt>
                        <dd className="text-sm text-gray-900 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(
                            currentCategory.createdAt
                          ).toLocaleDateString()}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Last Updated
                        </dt>
                        <dd className="text-sm text-gray-900 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(
                            currentCategory.updatedAt
                          ).toLocaleDateString()}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
