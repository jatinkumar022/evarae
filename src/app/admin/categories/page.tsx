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
  Tag,
  Package,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Product } from '@/lib/types/product';
import { allProducts } from '@/lib/data/products';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount: number;
  isActive: boolean;
}

const mockCategories: Category[] = [
  {
    id: 'rings',
    name: 'Rings',
    slug: 'rings',
    description: 'Beautiful rings for every occasion',
    productCount: 20,
    isActive: true,
  },
  {
    id: 'earrings',
    name: 'Earrings',
    slug: 'earrings',
    description: 'Elegant earrings collection',
    productCount: 15,
    isActive: true,
  },
  {
    id: 'bangles',
    name: 'Bangles',
    slug: 'bangles',
    description: 'Traditional and modern bangles',
    productCount: 12,
    isActive: true,
  },
  {
    id: 'bracelets',
    name: 'Bracelets',
    slug: 'bracelets',
    description: 'Stylish bracelets for women',
    productCount: 18,
    isActive: true,
  },
  {
    id: 'gold-chains',
    name: 'Gold Chains',
    slug: 'gold-chains',
    description: 'Premium gold chain collection',
    productCount: 15,
    isActive: true,
  },
  {
    id: 'mangalsutras',
    name: 'Mangalsutras',
    slug: 'mangalsutras',
    description: 'Sacred mangalsutra designs',
    productCount: 8,
    isActive: true,
  },
  {
    id: 'pendants',
    name: 'Pendants',
    slug: 'pendants',
    description: 'Elegant pendant collection',
    productCount: 12,
    isActive: true,
  },
  {
    id: 'necklaces',
    name: 'Necklaces',
    slug: 'necklaces',
    description: 'Stunning necklace designs',
    productCount: 10,
    isActive: true,
  },
  {
    id: 'nosePins',
    name: 'Nose Pins',
    slug: 'nosePins',
    description: 'Traditional nose pin collection',
    productCount: 8,
    isActive: true,
  },
  {
    id: 'kadas',
    name: 'Kadas',
    slug: 'kadas',
    description: 'Traditional kada designs',
    productCount: 6,
    isActive: true,
  },
  {
    id: 'engagement-rings',
    name: 'Engagement Rings',
    slug: 'engagement-rings',
    description: 'Perfect engagement rings',
    productCount: 8,
    isActive: true,
  },
  {
    id: 'jhumkas',
    name: 'Jhumkas',
    slug: 'jhumkas',
    description: 'Traditional jhumka earrings',
    productCount: 10,
    isActive: true,
  },
];

function mapCategoryToProductsKey(
  category: Category
): keyof typeof allProducts | null {
  const byIdOrSlug = category.id || category.slug;
  switch (byIdOrSlug) {
    case 'rings':
      return 'rings';
    case 'earrings':
      return 'earrings';
    case 'bangles':
      return 'bangles';
    case 'bracelets':
      return 'bracelets';
    case 'gold-chains':
    case 'chains':
      return 'chains';
    case 'mangalsutras':
      return 'mangalsutras';
    case 'pendants':
      return 'pendants';
    case 'necklaces':
      return 'necklaces';
    case 'nosePins':
      return 'nosePins';
    case 'kadas':
      return 'kadas';
    case 'engagement-rings':
    case 'engagementRings':
      return 'engagementRings';
    case 'jhumkas':
      return 'jhumkas';
    default:
      return null;
  }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [productsByCategory, setProductsByCategory] = useState<
    Partial<Record<keyof typeof allProducts, Product[]>>
  >({});

  useEffect(() => {
    // Initialize local product copies by category key
    const initial: Partial<Record<keyof typeof allProducts, Product[]>> = {};
    (Object.keys(allProducts) as Array<keyof typeof allProducts>).forEach(k => {
      initial[k] = [...allProducts[k]];
    });
    setProductsByCategory(initial);
  }, []);

  const handleToggleStatus = (categoryId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId ? { ...cat, isActive: !cat.isActive } : cat
      )
    );
  };

  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      setCategories(prev => prev.filter(cat => cat.id !== categoryToDelete.id));
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  const toggleExpand = (categoryId: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

  const handleDeleteProduct = (category: Category, productId: string) => {
    const key = mapCategoryToProductsKey(category);
    if (!key) return;
    setProductsByCategory(prev => {
      const copy = { ...prev };
      copy[key] = (copy[key] || []).filter(p => p.id !== productId);
      return copy;
    });
  };

  const getProductsForCategory = (category: Category): Product[] => {
    const key = mapCategoryToProductsKey(category);
    if (!key) return [];
    return productsByCategory[key] || [];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600">Manage your product categories</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Link>
      </div>

      {/* Categories Grid */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {categories.length} Categories
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map(category => (
              <>
                <div
                  key={category.id}
                  className="group relative bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Category Image */}
                  <div className="aspect-square w-full overflow-hidden rounded-t-lg bg-gray-200">
                    <div className="h-full w-full flex items-center justify-center">
                      <Tag className="h-12 w-12 text-gray-400" />
                    </div>
                  </div>

                  {/* Category Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          {category.description}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0">
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Package className="h-4 w-4 mr-1" />
                        {category.productCount} products
                      </div>
                      <div className="flex items-center">
                        {category.isActive ? (
                          <ToggleRight className="h-4 w-4 text-green-500" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex space-x-2">
                        <Link
                          href={`/admin/categories/${category.id}`}
                          className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Link>
                        <Link
                          href={`/admin/categories/${category.id}/edit`}
                          className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Link>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleStatus(category.id)}
                          className={`inline-flex items-center px-2 py-1 border text-xs font-medium rounded ${
                            category.isActive
                              ? 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                          }`}
                        >
                          {category.isActive ? 'Active' : 'Inactive'}
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category)}
                          className="inline-flex items-center px-2 py-1 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </button>
                        <button
                          onClick={() => toggleExpand(category.id)}
                          className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          {expanded.has(category.id) ? (
                            <>
                              <ChevronUp className="h-3 w-3 mr-1" /> Close
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3 w-3 mr-1" /> Open
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {expanded.has(category.id) && (
                  <div className="col-span-full">
                    <div className="mt-2 rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">
                          {category.name} Products
                        </h4>
                        <Link
                          href={`/admin/products/new?category=${category.slug}`}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90"
                        >
                          <Plus className="h-3 w-3 mr-1" /> Add Product
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {getProductsForCategory(category).map(product => (
                          <div
                            key={product.id}
                            className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                          >
                            <div className="aspect-square w-full bg-gray-100">
                              <Image
                                src={
                                  product.images[0] ??
                                  product.hoverImage ??
                                  '/placeholder.jpg'
                                }
                                alt={product.name}
                                width={300}
                                height={300}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="p-3">
                              <div className="flex items-start justify-between">
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {product.name}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    SKU: {product.sku}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
                                <span>Stock: {product.stockCount}</span>
                                <span>
                                  {product.inStock ? (
                                    <span className="text-green-600">
                                      In Stock
                                    </span>
                                  ) : (
                                    <span className="text-red-600">Out</span>
                                  )}
                                </span>
                              </div>
                              <div className="mt-3 flex items-center justify-between">
                                <div className="flex space-x-2">
                                  <Link
                                    href={`/admin/products/${product.id}`}
                                    className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                                  >
                                    <Eye className="h-3 w-3 mr-1" /> View
                                  </Link>
                                  <Link
                                    href={`/admin/products/${product.id}/edit`}
                                    className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                                  >
                                    <Edit className="h-3 w-3 mr-1" /> Edit
                                  </Link>
                                </div>
                                <button
                                  onClick={() =>
                                    handleDeleteProduct(category, product.id)
                                  }
                                  className="inline-flex items-center px-2 py-1 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50"
                                >
                                  <Trash2 className="h-3 w-3 mr-1" /> Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

                        {getProductsForCategory(category).length === 0 && (
                          <div className="col-span-full text-center py-8 text-sm text-gray-600">
                            No products in this category.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ))}
          </div>

          {categories.length === 0 && (
            <div className="text-center py-12">
              <Tag className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No categories found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first category.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
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
                      Delete Category
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete &quot;
                        {categoryToDelete?.name}&quot;? This action cannot be
                        undone.
                      </p>
                      {categoryToDelete &&
                        categoryToDelete.productCount > 0 && (
                          <p className="text-sm text-red-600 mt-2">
                            Warning: This category has{' '}
                            {categoryToDelete.productCount} products. Deleting
                            it will affect those products.
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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
