import type { Category } from '@/lib/data/store/categoryStore';

// Dummy categories data for admin testing
export const dummyCategories: Category[] = [
  {
    _id: 'cat001',
    name: 'Mangalsutra',
    slug: 'mangalsutra',
    description: 'Traditional and modern mangalsutra designs for married women. Includes gold, diamond, and designer mangalsutras.',
    image: 'https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill,q_auto/v1/categories/mangalsutra',
    banner: 'https://res.cloudinary.com/demo/image/upload/w_1200,h_600,c_fill,q_auto/v1/categories/mangalsutra-banner',
    mobileBanner: 'https://res.cloudinary.com/demo/image/upload/w_800,h_400,c_fill,q_auto/v1/categories/mangalsutra-mobile',
    isActive: true,
    sortOrder: 1,
    createdAt: '2024-01-01T10:00:00.000Z',
    updatedAt: '2024-02-15T12:00:00.000Z'
  },
  {
    _id: 'cat002',
    name: 'Earrings',
    slug: 'earrings',
    description: 'Stunning collection of earrings including studs, danglers, jhumkas, and more. Available in gold, silver, and diamond.',
    image: 'https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill,q_auto/v1/categories/earrings',
    banner: 'https://res.cloudinary.com/demo/image/upload/w_1200,h_600,c_fill,q_auto/v1/categories/earrings-banner',
    mobileBanner: 'https://res.cloudinary.com/demo/image/upload/w_800,h_400,c_fill,q_auto/v1/categories/earrings-mobile',
    isActive: true,
    sortOrder: 2,
    createdAt: '2024-01-01T10:05:00.000Z',
    updatedAt: '2024-02-10T11:30:00.000Z'
  },
  {
    _id: 'cat003',
    name: 'Bracelets',
    slug: 'bracelets',
    description: 'Elegant bracelets in various designs - chain, bangle-style, and cuffs. Perfect for daily wear and special occasions.',
    image: 'https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill,q_auto/v1/categories/bracelets',
    banner: 'https://res.cloudinary.com/demo/image/upload/w_1200,h_600,c_fill,q_auto/v1/categories/bracelets-banner',
    mobileBanner: 'https://res.cloudinary.com/demo/image/upload/w_800,h_400,c_fill,q_auto/v1/categories/bracelets-mobile',
    isActive: true,
    sortOrder: 3,
    createdAt: '2024-01-01T10:10:00.000Z',
    updatedAt: '2024-02-12T14:20:00.000Z'
  },
  {
    _id: 'cat004',
    name: 'Pendants',
    slug: 'pendants',
    description: 'Beautiful pendant designs including traditional, modern, and designer styles. Available in various metals and stones.',
    image: 'https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill,q_auto/v1/categories/pendants',
    banner: 'https://res.cloudinary.com/demo/image/upload/w_1200,h_600,c_fill,q_auto/v1/categories/pendants-banner',
    mobileBanner: 'https://res.cloudinary.com/demo/image/upload/w_800,h_400,c_fill,q_auto/v1/categories/pendants-mobile',
    isActive: true,
    sortOrder: 4,
    createdAt: '2024-01-01T10:15:00.000Z',
    updatedAt: '2024-02-08T09:15:00.000Z'
  },
  {
    _id: 'cat005',
    name: 'Necklaces',
    slug: 'necklaces',
    description: 'Exquisite necklaces ranging from simple chains to elaborate statement pieces. Includes chokers, long chains, and traditional designs.',
    image: 'https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill,q_auto/v1/categories/necklaces',
    banner: 'https://res.cloudinary.com/demo/image/upload/w_1200,h_600,c_fill,q_auto/v1/categories/necklaces-banner',
    mobileBanner: 'https://res.cloudinary.com/demo/image/upload/w_800,h_400,c_fill,q_auto/v1/categories/necklaces-mobile',
    isActive: true,
    sortOrder: 5,
    createdAt: '2024-01-01T10:20:00.000Z',
    updatedAt: '2024-02-14T16:45:00.000Z'
  },
  {
    _id: 'cat006',
    name: 'Bangles',
    slug: 'bangles',
    description: 'Traditional and modern bangles in gold, silver, and designer styles. Available as single pieces or sets.',
    image: 'https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill,q_auto/v1/categories/bangles',
    banner: 'https://res.cloudinary.com/demo/image/upload/w_1200,h_600,c_fill,q_auto/v1/categories/bangles-banner',
    mobileBanner: 'https://res.cloudinary.com/demo/image/upload/w_800,h_400,c_fill,q_auto/v1/categories/bangles-mobile',
    isActive: true,
    sortOrder: 6,
    createdAt: '2024-01-01T10:25:00.000Z',
    updatedAt: '2024-02-11T10:30:00.000Z'
  },
  {
    _id: 'cat007',
    name: 'Rings',
    slug: 'rings',
    description: 'Beautiful rings for every occasion - engagement rings, wedding bands, fashion rings, and more. Available in various sizes and designs.',
    image: 'https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill,q_auto/v1/categories/rings',
    banner: 'https://res.cloudinary.com/demo/image/upload/w_1200,h_600,c_fill,q_auto/v1/categories/rings-banner',
    mobileBanner: 'https://res.cloudinary.com/demo/image/upload/w_800,h_400,c_fill,q_auto/v1/categories/rings-mobile',
    isActive: true,
    sortOrder: 7,
    createdAt: '2024-01-01T10:30:00.000Z',
    updatedAt: '2024-02-20T13:00:00.000Z'
  },
  {
    _id: 'cat008',
    name: 'Chains',
    slug: 'chains',
    description: 'Classic and modern chain designs in various lengths and thicknesses. Perfect for layering or wearing alone.',
    image: 'https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill,q_auto/v1/categories/chains',
    banner: 'https://res.cloudinary.com/demo/image/upload/w_1200,h_600,c_fill,q_auto/v1/categories/chains-banner',
    mobileBanner: 'https://res.cloudinary.com/demo/image/upload/w_800,h_400,c_fill,q_auto/v1/categories/chains-mobile',
    isActive: true,
    sortOrder: 8,
    createdAt: '2024-01-01T10:35:00.000Z',
    updatedAt: '2024-02-18T11:00:00.000Z'
  },
  {
    _id: 'cat009',
    name: 'Nose Pins',
    slug: 'nose-pins',
    description: 'Traditional and modern nose pins in various designs. Includes studs, rings, and designer styles.',
    image: 'https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill,q_auto/v1/categories/nose-pins',
    banner: 'https://res.cloudinary.com/demo/image/upload/w_1200,h_600,c_fill,q_auto/v1/categories/nose-pins-banner',
    mobileBanner: 'https://res.cloudinary.com/demo/image/upload/w_800,h_400,c_fill,q_auto/v1/categories/nose-pins-mobile',
    isActive: false,
    sortOrder: 9,
    createdAt: '2024-01-15T09:00:00.000Z',
    updatedAt: '2024-02-01T10:00:00.000Z'
  },
  {
    _id: 'cat010',
    name: 'Anklets',
    slug: 'anklets',
    description: 'Beautiful anklets in traditional and modern designs. Perfect accessory for traditional Indian attire.',
    image: 'https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill,q_auto/v1/categories/anklets',
    banner: 'https://res.cloudinary.com/demo/image/upload/w_1200,h_600,c_fill,q_auto/v1/categories/anklets-banner',
    mobileBanner: 'https://res.cloudinary.com/demo/image/upload/w_800,h_400,c_fill,q_auto/v1/categories/anklets-mobile',
    isActive: true,
    sortOrder: 10,
    createdAt: '2024-01-20T11:00:00.000Z',
    updatedAt: '2024-02-16T15:30:00.000Z'
  }
];


