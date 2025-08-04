import {
  Product,
  Category,
  ProductListResponse,
  ProductFilters,
  CategoryListResponse,
  PRODUCT_CATEGORIES,
} from '../types/product';

// Import ring images from assets
import { ringsCat } from '@/app/assets/CategoryGrid';
import {
  star,
  starWhite,
  dazzling,
  dazzlingWhite,
} from '@/app/assets/Animatedgrid';
import {
  SparklingAvenues,
  StunningEveryEar,
  Dailywear,
} from '@/app/assets/GridImages';

// Mock product data - Rings only
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Diamond Solitaire Ring',
    description: 'Classic diamond solitaire ring in a timeless setting.',
    price: 150000,
    originalPrice: 180000,
    currency: 'INR',
    images: [star],
    category: PRODUCT_CATEGORIES.RINGS,
    subcategory: 'Diamond Rings',
    brand: 'Caelvi',
    material: '18K Gold with Diamond',
    weight: 8.5,
    inStock: true,
    stockCount: 2,
    rating: 4.9,
    reviews: 25,
    isNew: false,
    isSale: true,
    isWishlisted: false,
    isFeatured: true,
    tags: ['diamond', 'solitaire', 'engagement', 'sale'],
    sku: 'RNG-001',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Dazzling Grace Ring',
    description: 'Elegant ring with dazzling crystal design.',
    price: 85000,
    originalPrice: 95000,
    currency: 'INR',
    images: [dazzling],
    category: PRODUCT_CATEGORIES.RINGS,
    subcategory: 'Crystal Rings',
    brand: 'Caelvi',
    material: '18K Gold with Crystals',
    weight: 6.2,
    inStock: true,
    stockCount: 5,
    rating: 4.7,
    reviews: 18,
    isNew: true,
    isSale: true,
    isWishlisted: false,
    isFeatured: false,
    tags: ['crystal', 'elegant', 'new', 'sale'],
    sku: 'RNG-002',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: '3',
    name: 'Classic Gold Ring',
    description: 'Timeless gold ring perfect for everyday wear.',
    price: 65000,
    originalPrice: 75000,
    currency: 'INR',
    images: [ringsCat],
    category: PRODUCT_CATEGORIES.RINGS,
    subcategory: 'Gold Rings',
    brand: 'Caelvi',
    material: '22K Gold',
    weight: 7.8,
    inStock: true,
    stockCount: 8,
    rating: 4.6,
    reviews: 22,
    isNew: false,
    isSale: true,
    isWishlisted: true,
    isFeatured: false,
    tags: ['gold', 'classic', 'everyday', 'sale'],
    sku: 'RNG-003',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
  },
  {
    id: '4',
    name: 'Modern Design Ring',
    description: 'Contemporary ring with geometric patterns.',
    price: 95000,
    originalPrice: 110000,
    currency: 'INR',
    images: [starWhite],
    category: PRODUCT_CATEGORIES.RINGS,
    subcategory: 'Designer Rings',
    brand: 'Caelvi',
    material: '18K Gold',
    weight: 9.2,
    inStock: true,
    stockCount: 3,
    rating: 4.8,
    reviews: 15,
    isNew: true,
    isSale: false,
    isWishlisted: false,
    isFeatured: true,
    tags: ['modern', 'geometric', 'designer', 'new'],
    sku: 'RNG-004',
    createdAt: '2024-01-25T10:00:00Z',
    updatedAt: '2024-01-25T10:00:00Z',
  },
  {
    id: '5',
    name: 'Elegant Pearl Ring',
    description: 'Sophisticated ring featuring natural pearls.',
    price: 72000,
    originalPrice: 85000,
    currency: 'INR',
    images: [dazzlingWhite],
    category: PRODUCT_CATEGORIES.RINGS,
    subcategory: 'Pearl Rings',
    brand: 'Caelvi',
    material: '18K Gold with Pearls',
    weight: 5.5,
    inStock: true,
    stockCount: 4,
    rating: 4.5,
    reviews: 12,
    isNew: false,
    isSale: true,
    isWishlisted: false,
    isFeatured: false,
    tags: ['pearl', 'elegant', 'sophisticated', 'sale'],
    sku: 'RNG-005',
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-12T10:00:00Z',
  },
  {
    id: '6',
    name: 'Vintage Style Ring',
    description: 'Beautiful vintage-inspired ring with intricate details.',
    price: 88000,
    originalPrice: 98000,
    currency: 'INR',
    images: [ringsCat],
    category: PRODUCT_CATEGORIES.RINGS,
    subcategory: 'Vintage Rings',
    brand: 'Caelvi',
    material: '18K Gold',
    weight: 8.1,
    inStock: true,
    stockCount: 2,
    rating: 4.9,
    reviews: 19,
    isNew: false,
    isSale: true,
    isWishlisted: false,
    isFeatured: false,
    tags: ['vintage', 'intricate', 'sale'],
    sku: 'RNG-006',
    createdAt: '2024-01-08T10:00:00Z',
    updatedAt: '2024-01-08T10:00:00Z',
  },
  {
    id: '7',
    name: 'Royal Diamond Ring',
    description: 'Exquisite diamond ring with royal elegance.',
    price: 125000,
    originalPrice: 150000,
    currency: 'INR',
    images: [StunningEveryEar],
    category: PRODUCT_CATEGORIES.RINGS,
    subcategory: 'Premium Rings',
    brand: 'Caelvi',
    material: '18K Gold with Diamonds',
    weight: 10.5,
    inStock: true,
    stockCount: 1,
    rating: 4.9,
    reviews: 28,
    isNew: false,
    isSale: true,
    isWishlisted: false,
    isFeatured: true,
    tags: ['premium', 'diamond', 'royal', 'sale'],
    sku: 'RNG-007',
    createdAt: '2024-01-05T10:00:00Z',
    updatedAt: '2024-01-05T10:00:00Z',
  },
  {
    id: '8',
    name: 'Sparkling Crystal Ring',
    description: 'Stunning crystal ring with brilliant sparkle.',
    price: 68000,
    originalPrice: 78000,
    currency: 'INR',
    images: [SparklingAvenues],
    category: PRODUCT_CATEGORIES.RINGS,
    subcategory: 'Crystal Rings',
    brand: 'Caelvi',
    material: '18K Gold with Crystals',
    weight: 6.8,
    inStock: true,
    stockCount: 6,
    rating: 4.6,
    reviews: 16,
    isNew: true,
    isSale: true,
    isWishlisted: false,
    isFeatured: false,
    tags: ['crystal', 'sparkling', 'new', 'sale'],
    sku: 'RNG-008',
    createdAt: '2024-01-22T10:00:00Z',
    updatedAt: '2024-01-22T10:00:00Z',
  },
  {
    id: '9',
    name: 'Traditional Gold Ring',
    description: 'Classic traditional gold ring with heritage design.',
    price: 92000,
    originalPrice: 105000,
    currency: 'INR',
    images: [Dailywear],
    category: PRODUCT_CATEGORIES.RINGS,
    subcategory: 'Traditional Rings',
    brand: 'Caelvi',
    material: '22K Gold',
    weight: 9.5,
    inStock: true,
    stockCount: 3,
    rating: 4.7,
    reviews: 21,
    isNew: false,
    isSale: true,
    isWishlisted: false,
    isFeatured: false,
    tags: ['traditional', 'heritage', 'gold', 'sale'],
    sku: 'RNG-009',
    createdAt: '2024-01-14T10:00:00Z',
    updatedAt: '2024-01-14T10:00:00Z',
  },
  {
    id: '10',
    name: 'Contemporary Design Ring',
    description: 'Modern contemporary ring with sleek design.',
    price: 78000,
    originalPrice: 88000,
    currency: 'INR',
    images: [star],
    category: PRODUCT_CATEGORIES.RINGS,
    subcategory: 'Modern Rings',
    brand: 'Caelvi',
    material: '18K Gold',
    weight: 7.2,
    inStock: true,
    stockCount: 4,
    rating: 4.8,
    reviews: 14,
    isNew: true,
    isSale: true,
    isWishlisted: false,
    isFeatured: false,
    tags: ['contemporary', 'modern', 'new', 'sale'],
    sku: 'RNG-010',
    createdAt: '2024-01-28T10:00:00Z',
    updatedAt: '2024-01-28T10:00:00Z',
  },
  {
    id: '11',
    name: 'Elegant Pearl Solitaire',
    description: 'Timeless pearl solitaire ring for special occasions.',
    price: 85000,
    originalPrice: 95000,
    currency: 'INR',
    images: [dazzling],
    category: PRODUCT_CATEGORIES.RINGS,
    subcategory: 'Pearl Rings',
    brand: 'Caelvi',
    material: '18K Gold with Pearls',
    weight: 8.8,
    inStock: true,
    stockCount: 2,
    rating: 4.9,
    reviews: 18,
    isNew: false,
    isSale: true,
    isWishlisted: true,
    isFeatured: false,
    tags: ['pearl', 'solitaire', 'elegant', 'sale'],
    sku: 'RNG-011',
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
  },
  {
    id: '12',
    name: 'Diamond Cluster Ring',
    description: 'Stunning diamond cluster ring with multiple stones.',
    price: 110000,
    originalPrice: 130000,
    currency: 'INR',
    images: [starWhite],
    category: PRODUCT_CATEGORIES.RINGS,
    subcategory: 'Diamond Rings',
    brand: 'Caelvi',
    material: '18K Gold with Diamonds',
    weight: 9.8,
    inStock: true,
    stockCount: 1,
    rating: 4.9,
    reviews: 24,
    isNew: false,
    isSale: true,
    isWishlisted: false,
    isFeatured: true,
    tags: ['diamond', 'cluster', 'premium', 'sale'],
    sku: 'RNG-012',
    createdAt: '2024-01-11T10:00:00Z',
    updatedAt: '2024-01-11T10:00:00Z',
  },
  {
    id: '13',
    name: 'Rose Gold Ring',
    description: 'Beautiful rose gold ring with modern elegance.',
    price: 72000,
    originalPrice: 82000,
    currency: 'INR',
    images: [ringsCat],
    category: PRODUCT_CATEGORIES.RINGS,
    subcategory: 'Rose Gold Rings',
    brand: 'Caelvi',
    material: '18K Rose Gold',
    weight: 6.5,
    inStock: true,
    stockCount: 5,
    rating: 4.7,
    reviews: 17,
    isNew: true,
    isSale: true,
    isWishlisted: false,
    isFeatured: false,
    tags: ['rose-gold', 'modern', 'elegant', 'new', 'sale'],
    sku: 'RNG-013',
    createdAt: '2024-01-24T10:00:00Z',
    updatedAt: '2024-01-24T10:00:00Z',
  },
  {
    id: '14',
    name: 'Vintage Diamond Ring',
    description: 'Exquisite vintage diamond ring with antique charm.',
    price: 135000,
    originalPrice: 160000,
    currency: 'INR',
    images: [StunningEveryEar],
    category: PRODUCT_CATEGORIES.RINGS,
    subcategory: 'Vintage Rings',
    brand: 'Caelvi',
    material: '18K Gold with Diamonds',
    weight: 11.2,
    inStock: true,
    stockCount: 1,
    rating: 4.9,
    reviews: 26,
    isNew: false,
    isSale: true,
    isWishlisted: false,
    isFeatured: true,
    tags: ['vintage', 'diamond', 'antique', 'sale'],
    sku: 'RNG-014',
    createdAt: '2024-01-07T10:00:00Z',
    updatedAt: '2024-01-07T10:00:00Z',
  },
  {
    id: '15',
    name: 'Crystal Studded Ring',
    description: 'Glamorous ring with crystal studded design.',
    price: 65000,
    originalPrice: 75000,
    currency: 'INR',
    images: [SparklingAvenues],
    category: PRODUCT_CATEGORIES.RINGS,
    subcategory: 'Crystal Rings',
    brand: 'Caelvi',
    material: '18K Gold with Crystals',
    weight: 7.1,
    inStock: true,
    stockCount: 7,
    rating: 4.6,
    reviews: 13,
    isNew: false,
    isSale: true,
    isWishlisted: false,
    isFeatured: false,
    tags: ['crystal', 'glamorous', 'sale'],
    sku: 'RNG-015',
    createdAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-01-18T10:00:00Z',
  },
  {
    id: '16',
    name: 'Traditional Kundan Ring',
    description: 'Authentic traditional kundan ring with heritage design.',
    price: 95000,
    originalPrice: 110000,
    currency: 'INR',
    images: [Dailywear],
    category: PRODUCT_CATEGORIES.RINGS,
    subcategory: 'Traditional Rings',
    brand: 'Caelvi',
    material: '22K Gold with Kundan',
    weight: 10.1,
    inStock: true,
    stockCount: 2,
    rating: 4.8,
    reviews: 20,
    isNew: false,
    isSale: true,
    isWishlisted: false,
    isFeatured: false,
    tags: ['kundan', 'traditional', 'heritage', 'sale'],
    sku: 'RNG-016',
    createdAt: '2024-01-13T10:00:00Z',
    updatedAt: '2024-01-13T10:00:00Z',
  },
  {
    id: '17',
    name: 'Modern Minimalist Ring',
    description: 'Clean minimalist ring with contemporary design.',
    price: 58000,
    originalPrice: 68000,
    currency: 'INR',
    images: [star],
    category: PRODUCT_CATEGORIES.RINGS,
    subcategory: 'Modern Rings',
    brand: 'Caelvi',
    material: '18K Gold',
    weight: 5.8,
    inStock: true,
    stockCount: 8,
    rating: 4.7,
    reviews: 15,
    isNew: true,
    isSale: true,
    isWishlisted: false,
    isFeatured: false,
    tags: ['minimalist', 'modern', 'clean', 'new', 'sale'],
    sku: 'RNG-017',
    createdAt: '2024-01-26T10:00:00Z',
    updatedAt: '2024-01-26T10:00:00Z',
  },
  {
    id: '18',
    name: 'Diamond Eternity Ring',
    description: 'Timeless diamond eternity ring symbolizing forever love.',
    price: 145000,
    originalPrice: 170000,
    currency: 'INR',
    images: [dazzling],
    category: PRODUCT_CATEGORIES.RINGS,
    subcategory: 'Diamond Rings',
    brand: 'Caelvi',
    material: '18K Gold with Diamonds',
    weight: 12.3,
    inStock: true,
    stockCount: 1,
    rating: 4.9,
    reviews: 29,
    isNew: false,
    isSale: true,
    isWishlisted: true,
    isFeatured: true,
    tags: ['diamond', 'eternity', 'love', 'premium', 'sale'],
    sku: 'RNG-018',
    createdAt: '2024-01-04T10:00:00Z',
    updatedAt: '2024-01-04T10:00:00Z',
  },
  {
    id: '19',
    name: 'Pearl and Diamond Ring',
    description: 'Elegant combination of pearls and diamonds.',
    price: 89000,
    originalPrice: 99000,
    currency: 'INR',
    images: [starWhite],
    category: PRODUCT_CATEGORIES.RINGS,
    subcategory: 'Pearl Rings',
    brand: 'Caelvi',
    material: '18K Gold with Pearls and Diamonds',
    weight: 8.9,
    inStock: true,
    stockCount: 3,
    rating: 4.8,
    reviews: 19,
    isNew: false,
    isSale: true,
    isWishlisted: false,
    isFeatured: false,
    tags: ['pearl', 'diamond', 'elegant', 'sale'],
    sku: 'RNG-019',
    createdAt: '2024-01-17T10:00:00Z',
    updatedAt: '2024-01-17T10:00:00Z',
  },
  {
    id: '20',
    name: 'Art Deco Ring',
    description: 'Stunning art deco ring with geometric patterns.',
    price: 120000,
    originalPrice: 140000,
    currency: 'INR',
    images: [ringsCat],
    category: PRODUCT_CATEGORIES.RINGS,
    subcategory: 'Designer Rings',
    brand: 'Caelvi',
    material: '18K Gold with Diamonds',
    weight: 10.8,
    inStock: true,
    stockCount: 1,
    rating: 4.9,
    reviews: 22,
    isNew: false,
    isSale: true,
    isWishlisted: false,
    isFeatured: true,
    tags: ['art-deco', 'geometric', 'designer', 'sale'],
    sku: 'RNG-020',
    createdAt: '2024-01-06T10:00:00Z',
    updatedAt: '2024-01-06T10:00:00Z',
  },
];

// Mock categories - keep all but only rings has products
const mockCategories: Category[] = Object.values(PRODUCT_CATEGORIES).map(
  cat => ({
    ...cat,
    productCount: cat.id === 'rings' ? mockProducts.length : 0,
    isActive: true,
  })
);

export class ProductService {
  // Get products by category (by ID or slug)
  static async getProductsByCategory(
    categoryIdOrSlug: string,
    filters: ProductFilters = {},
    sortBy: string = 'best-matches',
    page: number = 1,
    limit: number = 12
  ): Promise<ProductListResponse> {
    // Find category by ID or slug
    const category = mockCategories.find(
      cat => cat.id === categoryIdOrSlug || cat.slug === categoryIdOrSlug
    );

    if (!category) {
      throw new Error(`Category not found: ${categoryIdOrSlug}`);
    }

    // For now, only rings category has products
    if (category.id !== 'rings') {
      return {
        products: [],
        totalCount: 0,
        currentPage: page,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
        filters,
        sortBy,
      };
    }

    // Filter products by category
    const filteredProducts = mockProducts.filter(
      product => product.category.id === category.id
    );

    // Apply filters
    let finalProducts = [...filteredProducts];

    if (filters.priceRange) {
      finalProducts = finalProducts.filter(product => {
        if (!product.price) return false;
        return (
          product.price >= filters.priceRange!.min &&
          product.price <= filters.priceRange!.max
        );
      });
    }

    if (filters.material && filters.material.length > 0) {
      finalProducts = finalProducts.filter(product =>
        filters.material!.some(material =>
          product.material.toLowerCase().includes(material.toLowerCase())
        )
      );
    }

    if (filters.inStock !== undefined) {
      finalProducts = finalProducts.filter(
        product => product.inStock === filters.inStock
      );
    }

    if (filters.isNew !== undefined) {
      finalProducts = finalProducts.filter(
        product => product.isNew === filters.isNew
      );
    }

    if (filters.isSale !== undefined) {
      finalProducts = finalProducts.filter(
        product => product.isSale === filters.isSale
      );
    }

    if (filters.rating) {
      finalProducts = finalProducts.filter(
        product => product.rating >= filters.rating!
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low-high':
        finalProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high-low':
        finalProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'newest':
        finalProducts.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'rating':
        finalProducts.sort((a, b) => b.rating - a.rating);
        break;
      case 'popularity':
        finalProducts.sort((a, b) => b.reviews - a.reviews);
        break;
      default: // best-matches
        finalProducts.sort((a, b) => {
          // Prioritize featured, then new, then sale items
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          if (a.isNew && !b.isNew) return -1;
          if (!a.isNew && b.isNew) return 1;
          if (a.isSale && !b.isSale) return -1;
          if (!a.isSale && b.isSale) return 1;
          return b.rating - a.rating;
        });
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = finalProducts.slice(startIndex, endIndex);

    const totalCount = finalProducts.length;
    const totalPages = Math.ceil(totalCount / limit);

    return {
      products: paginatedProducts,
      totalCount,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      filters,
      sortBy,
    };
  }

  // Get all categories
  static async getCategories(): Promise<CategoryListResponse> {
    return {
      categories: mockCategories,
      totalCount: mockCategories.length,
    };
  }

  // Get category by ID or slug
  static async getCategory(categoryIdOrSlug: string): Promise<Category | null> {
    return (
      mockCategories.find(
        cat => cat.id === categoryIdOrSlug || cat.slug === categoryIdOrSlug
      ) || null
    );
  }

  // Get product by ID
  static async getProduct(productId: string): Promise<Product | null> {
    return mockProducts.find(product => product.id === productId) || null;
  }

  // Search products
  static async searchProducts(
    query: string,
    filters: ProductFilters = {},
    sortBy: string = 'best-matches',
    page: number = 1,
    limit: number = 12
  ): Promise<ProductListResponse> {
    const filteredProducts = mockProducts.filter(
      product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.tags.some(tag =>
          tag.toLowerCase().includes(query.toLowerCase())
        )
    );

    const totalCount = filteredProducts.length;
    const totalPages = Math.ceil(totalCount / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return {
      products: paginatedProducts,
      totalCount,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      filters,
      sortBy,
    };
  }
}
