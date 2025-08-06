import { StaticImageData } from 'next/image';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number | null;
  originalPrice: number | null;
  currency: string;
  images: (string | StaticImageData)[];
  hoverImage?: string | StaticImageData;
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
  productCount: number;
  isActive: boolean;
}

// Filter-related interfaces
export interface FilterState {
  priceRange: string;
  material: string[];
  subcategory: string[];
  isNew: boolean;
  isSale: boolean;
  isFeatured: boolean;
}

export interface FilterOptions {
  priceRanges: Array<{ value: string; label: string }>;
  materials: string[];
  subcategories: string[];
}

export interface SortOption {
  value: string;
  label: string;
}

// Product categories mapping for static pages
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
    productCount: 20,
    isActive: true,
  },
  EARRINGS: {
    id: 'earrings',
    name: 'Earrings',
    slug: 'earrings',
    description: 'Stunning earrings for any occasion',
    productCount: 15,
    isActive: true,
  },
  NECKLACES: {
    id: 'necklaces',
    name: 'Necklaces',
    slug: 'necklaces',
    description: 'Elegant necklaces for special moments',
    productCount: 0,
    isActive: true,
  },
  PENDANTS: {
    id: 'pendants',
    name: 'Pendants',
    slug: 'pendants',
    description: 'Beautiful pendants for everyday wear',
    productCount: 0,
    isActive: true,
  },
  MANGALSUTRA: {
    id: 'mangalsutra',
    name: 'Mangalsutra',
    slug: 'mangalsutra',
    description: 'Traditional mangalsutra designs',
    productCount: 0,
    isActive: true,
  },
  CHAINS: {
    id: 'chains',
    name: 'Chains',
    slug: 'chains',
    description: 'Classic chain designs',
    productCount: 0,
    isActive: true,
  },
  BRACELETS: {
    id: 'bracelets',
    name: 'Bracelets',
    slug: 'bracelets',
    description: 'Elegant bracelets for every occasion',
    productCount: 0,
    isActive: true,
  },
} as const;

export type ProductCategoryId = keyof typeof PRODUCT_CATEGORIES;
export type ProductCategorySlug =
  (typeof PRODUCT_CATEGORIES)[ProductCategoryId]['slug'];
