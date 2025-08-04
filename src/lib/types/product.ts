import { StaticImageData } from 'next/image';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number | null;
  originalPrice: number | null;
  currency: string;
  images: (string | StaticImageData)[];
  category: Category;
  subcategory?: string;
  brand: string;
  material: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  inStock: boolean;
  stockCount: number;
  rating: number;
  reviews: number;
  isNew: boolean;
  isSale: boolean;
  isWishlisted: boolean;
  isFeatured: boolean;
  tags: string[];
  sku: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  children?: Category[];
  productCount: number;
  isActive: boolean;
}

export interface ProductFilters {
  category?: string;
  subcategory?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  material?: string[];
  brand?: string[];
  inStock?: boolean;
  isNew?: boolean;
  isSale?: boolean;
  rating?: number;
  tags?: string[];
}

export interface SortOption {
  value: string;
  label: string;
  field: string;
  order: 'asc' | 'desc';
}

export interface ProductListResponse {
  products: Product[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  filters: ProductFilters;
  sortBy: string;
}

export interface CategoryListResponse {
  categories: Category[];
  totalCount: number;
}

// Product categories mapping
export const PRODUCT_CATEGORIES = {
  BANGLES: {
    id: 'bangles',
    name: 'Bangles',
    slug: 'bangles',
    description: 'Elegant bangles for every occasion',
    productCount: 0,
    isActive: true,
  },
  RINGS: {
    id: 'rings',
    name: 'Rings',
    slug: 'rings',
    description: 'Beautiful rings for special moments',
    productCount: 0,
    isActive: true,
  },
  EARRINGS: {
    id: 'earrings',
    name: 'Earrings',
    slug: 'earrings',
    description: 'Stunning earrings to complement your style',
    productCount: 0,
    isActive: true,
  },
  NECKLACES: {
    id: 'necklaces',
    name: 'Necklaces',
    slug: 'necklaces',
    description: 'Timeless necklaces for every outfit',
    productCount: 0,
    isActive: true,
  },
  PENDANTS: {
    id: 'pendants',
    name: 'Pendants',
    slug: 'pendants',
    description: 'Elegant pendants to enhance your look',
    productCount: 0,
    isActive: true,
  },
  CHAINS: {
    id: 'chains',
    name: 'Chains',
    slug: 'chains',
    description: 'Classic chains for everyday wear',
    productCount: 0,
    isActive: true,
  },
  MANGALSUTRA: {
    id: 'mangalsutra',
    name: 'Mangalsutra',
    slug: 'mangalsutra',
    description: 'Sacred mangalsutra designs',
    productCount: 0,
    isActive: true,
  },
  BRACELETS: {
    id: 'bracelets',
    name: 'Bracelets',
    slug: 'bracelets',
    description: 'Stylish bracelets for your wrist',
    productCount: 0,
    isActive: true,
  },
} as const;

export type ProductCategoryId = keyof typeof PRODUCT_CATEGORIES;
export type ProductCategorySlug =
  (typeof PRODUCT_CATEGORIES)[ProductCategoryId]['slug'];
