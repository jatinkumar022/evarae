import type { Product } from '@/lib/data/store/productStore';

// Dummy products data for admin testing
export const dummyProducts: Product[] = [
  {
    _id: 'prod001',
    name: 'Traditional Gold Mangalsutra',
    slug: 'traditional-gold-mangalsutra',
    description: 'A beautiful traditional gold mangalsutra with intricate design patterns. Perfect for wedding ceremonies and special occasions. Features premium 22K gold plating with detailed craftsmanship.',
    sku: 'MANG-22K-001',
    categories: [
      { _id: 'cat001', name: 'Mangalsutra', slug: 'mangalsutra' }
    ],
    collections: [
      { _id: 'coll001', name: 'Wedding Collection', slug: 'wedding-collection' }
    ],
    price: 12999,
    discountPrice: 9999,
    stockQuantity: 15,
    material: '22K Gold Plated',
    weight: '25g',
    colors: ['Gold', 'Rose Gold'],
    sizes: ['Standard'],
    images: [
      'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/mangalsutra-gold-1',
      'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/mangalsutra-gold-2',
      'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/mangalsutra-gold-3'
    ],
    thumbnail: 'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/mangalsutra-gold-1',
    wallpaper: [
      'https://res.cloudinary.com/demo/image/upload/w_1200,h_800,c_fill,q_auto/v1/jewelry/mangalsutra-gold-wallpaper-1',
      'https://res.cloudinary.com/demo/image/upload/w_1200,h_800,c_fill,q_auto/v1/jewelry/mangalsutra-gold-wallpaper-2'
    ],
    video: 'https://example.com/videos/mangalsutra-001.mp4',
    tags: ['traditional', 'wedding', 'gold', 'mangalsutra', 'premium'],
    status: 'active',
    metaTitle: 'Traditional Gold Mangalsutra - Caelvi',
    metaDescription: 'Buy traditional gold mangalsutra online at Caelvi. Premium 22K gold plated mangalsutra with intricate designs.',
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-02-20T14:30:00.000Z'
  },
  {
    _id: 'prod002',
    name: 'Diamond Stud Earrings',
    slug: 'diamond-stud-earrings',
    description: 'Elegant diamond stud earrings featuring premium quality diamonds. Perfect for daily wear and special occasions. Crafted with precision and attention to detail.',
    sku: 'EARR-DIAM-002',
    categories: [
      { _id: 'cat002', name: 'Earrings', slug: 'earrings' }
    ],
    collections: [
      { _id: 'coll002', name: 'Diamond Collection', slug: 'diamond-collection' }
    ],
    price: 24999,
    discountPrice: 19999,
    stockQuantity: 8,
    material: 'Sterling Silver with Diamond',
    weight: '5g',
    colors: ['Silver', 'White Gold'],
    sizes: ['Standard'],
    images: [
      'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/diamond-earrings-1',
      'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/diamond-earrings-2',
      'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/diamond-earrings-3'
    ],
    thumbnail: 'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/diamond-earrings-1',
    wallpaper: [
      'https://res.cloudinary.com/demo/image/upload/w_1200,h_800,c_fill,q_auto/v1/jewelry/diamond-earrings-wallpaper'
    ],
    video: '',
    tags: ['diamond', 'earrings', 'silver', 'premium', 'daily-wear'],
    status: 'active',
    metaTitle: 'Diamond Stud Earrings - Caelvi',
    metaDescription: 'Shop elegant diamond stud earrings at Caelvi. Premium quality diamonds in sterling silver settings.',
    createdAt: '2024-01-20T09:15:00.000Z',
    updatedAt: '2024-02-18T11:20:00.000Z'
  },
  {
    _id: 'prod003',
    name: 'Rose Gold Chain Bracelet',
    slug: 'rose-gold-chain-bracelet',
    description: 'Beautiful rose gold chain bracelet with delicate links. Comfortable to wear all day long. Modern design perfect for contemporary fashion.',
    sku: 'BRAC-RG-003',
    categories: [
      { _id: 'cat003', name: 'Bracelets', slug: 'bracelets' }
    ],
    collections: [
      { _id: 'coll003', name: 'Daily Wear Collection', slug: 'daily-wear-collection' }
    ],
    price: 5999,
    discountPrice: undefined as number | undefined,
    stockQuantity: 25,
    material: 'Rose Gold Plated',
    weight: '12g',
    colors: ['Rose Gold'],
    sizes: ['Small', 'Medium', 'Large'],
    images: [
      'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/rose-gold-bracelet-1',
      'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/rose-gold-bracelet-2'
    ],
    thumbnail: 'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/rose-gold-bracelet-1',
    wallpaper: [],
    video: '',
    tags: ['rose-gold', 'bracelet', 'chain', 'daily-wear', 'modern'],
    status: 'active',
    metaTitle: 'Rose Gold Chain Bracelet - Caelvi',
    metaDescription: 'Buy rose gold chain bracelet online. Comfortable daily wear jewelry with modern design.',
    createdAt: '2024-02-01T12:00:00.000Z',
    updatedAt: '2024-02-15T10:45:00.000Z'
  },
  {
    _id: 'prod004',
    name: 'Kundan Pendant Necklace',
    slug: 'kundan-pendant-necklace',
    description: 'Exquisite kundan pendant necklace with traditional Indian design. Features colorful kundan stones set in intricate gold work. Perfect for festivals and celebrations.',
    sku: 'PEND-KUND-004',
    categories: [
      { _id: 'cat004', name: 'Pendants', slug: 'pendants' },
      { _id: 'cat005', name: 'Necklaces', slug: 'necklaces' }
    ],
    collections: [
      { _id: 'coll004', name: 'Festival Collection', slug: 'festival-collection' }
    ],
    price: 15999,
    discountPrice: 12499,
    stockQuantity: 3,
    material: '22K Gold Plated with Kundan Stones',
    weight: '30g',
    colors: ['Gold', 'Multicolor'],
    sizes: ['Standard'],
    images: [
      'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/kundan-pendant-1',
      'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/kundan-pendant-2',
      'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/kundan-pendant-3',
      'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/kundan-pendant-4'
    ],
    thumbnail: 'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/kundan-pendant-1',
    wallpaper: [
      'https://res.cloudinary.com/demo/image/upload/w_1200,h_800,c_fill,q_auto/v1/jewelry/kundan-pendant-wallpaper'
    ],
    video: '',
    tags: ['kundan', 'pendant', 'traditional', 'festival', 'gold', 'premium'],
    status: 'active',
    metaTitle: 'Kundan Pendant Necklace - Caelvi',
    metaDescription: 'Shop exquisite kundan pendant necklace online. Traditional Indian design with colorful kundan stones.',
    createdAt: '2024-01-10T08:30:00.000Z',
    updatedAt: '2024-02-10T16:20:00.000Z'
  },
  {
    _id: 'prod005',
    name: 'Silver Bangles Set',
    slug: 'silver-bangles-set',
    description: 'Set of 6 sterling silver bangles with beautiful engraved patterns. Each bangle features unique traditional Indian motifs. Perfect gift for loved ones.',
    sku: 'BANG-SIL-005',
    categories: [
      { _id: 'cat006', name: 'Bangles', slug: 'bangles' }
    ],
    collections: [
      { _id: 'coll005', name: 'Gifting Collection', slug: 'gifting-collection' }
    ],
    price: 8999,
    discountPrice: 6999,
    stockQuantity: 12,
    material: 'Sterling Silver',
    weight: '45g',
    colors: ['Silver'],
    sizes: ['Standard'],
    images: [
      'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/silver-bangles-1',
      'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/silver-bangles-2',
      'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/silver-bangles-3'
    ],
    thumbnail: 'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/silver-bangles-1',
    wallpaper: [],
    video: '',
    tags: ['silver', 'bangles', 'set', 'traditional', 'gift'],
    status: 'active',
    metaTitle: 'Silver Bangles Set - Caelvi',
    metaDescription: 'Buy sterling silver bangles set online. Set of 6 bangles with traditional designs.',
    createdAt: '2024-02-05T14:00:00.000Z',
    updatedAt: '2024-02-12T09:30:00.000Z'
  },
  {
    _id: 'prod006',
    name: 'Diamond Ring for Engagement',
    slug: 'diamond-ring-engagement',
    description: 'Stunning diamond engagement ring with solitaire center stone. Premium quality diamond set in elegant gold band. A perfect symbol of eternal love and commitment.',
    sku: 'RING-DIAM-006',
    categories: [
      { _id: 'cat007', name: 'Rings', slug: 'rings' }
    ],
    collections: [
      { _id: 'coll001', name: 'Wedding Collection', slug: 'wedding-collection' },
      { _id: 'coll002', name: 'Diamond Collection', slug: 'diamond-collection' }
    ],
    price: 59999,
    discountPrice: 49999,
    stockQuantity: 5,
    material: '18K Gold with Diamond',
    weight: '8g',
    colors: ['Gold', 'White Gold', 'Rose Gold'],
    sizes: ['5', '6', '7', '8', '9'],
    images: [
      'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/diamond-ring-1',
      'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/diamond-ring-2',
      'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/diamond-ring-3',
      'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/diamond-ring-4'
    ],
    thumbnail: 'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/diamond-ring-1',
    wallpaper: [
      'https://res.cloudinary.com/demo/image/upload/w_1200,h_800,c_fill,q_auto/v1/jewelry/diamond-ring-wallpaper-1',
      'https://res.cloudinary.com/demo/image/upload/w_1200,h_800,c_fill,q_auto/v1/jewelry/diamond-ring-wallpaper-2'
    ],
    video: 'https://example.com/videos/engagement-ring-006.mp4',
    tags: ['diamond', 'ring', 'engagement', 'wedding', 'solitaire', 'premium', 'luxury'],
    status: 'active',
    metaTitle: 'Diamond Engagement Ring - Caelvi',
    metaDescription: 'Shop stunning diamond engagement rings online. Premium solitaire diamond rings in gold settings.',
    createdAt: '2024-01-05T11:00:00.000Z',
    updatedAt: '2024-02-25T13:15:00.000Z'
  },
  {
    _id: 'prod007',
    name: 'Pearl Choker Necklace',
    slug: 'pearl-choker-necklace',
    description: 'Elegant pearl choker necklace with lustrous freshwater pearls. Classic design that never goes out of style. Perfect for formal occasions and evening wear.',
    sku: 'NECK-PEARL-007',
    categories: [
      { _id: 'cat005', name: 'Necklaces', slug: 'necklaces' }
    ],
    collections: [
      { _id: 'coll006', name: 'Classic Collection', slug: 'classic-collection' }
    ],
    price: 17999,
    discountPrice: undefined as number | undefined,
    stockQuantity: 7,
    material: 'Freshwater Pearls with Silver',
    weight: '35g',
    colors: ['White', 'Cream'],
    sizes: ['Standard'],
    images: [
      'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/pearl-choker-1',
      'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/pearl-choker-2'
    ],
    thumbnail: 'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/pearl-choker-1',
    wallpaper: [],
    video: '',
    tags: ['pearl', 'choker', 'necklace', 'classic', 'formal', 'pearls'],
    status: 'active',
    metaTitle: 'Pearl Choker Necklace - Caelvi',
    metaDescription: 'Buy elegant pearl choker necklace online. Freshwater pearls in classic choker design.',
    createdAt: '2024-01-25T15:30:00.000Z',
    updatedAt: '2024-02-20T10:00:00.000Z'
  },
  {
    _id: 'prod008',
    name: 'Temple Gold Chain',
    slug: 'temple-gold-chain',
    description: 'Traditional temple design gold chain with intricate workmanship. Features detailed temple motifs and patterns. A timeless piece of jewelry.',
    sku: 'CHAIN-TEMP-008',
    categories: [
      { _id: 'cat008', name: 'Chains', slug: 'chains' }
    ],
    collections: [
      { _id: 'coll004', name: 'Festival Collection', slug: 'festival-collection' }
    ],
    price: 21999,
    discountPrice: 17999,
    stockQuantity: 4,
    material: '22K Gold Plated',
    weight: '50g',
    colors: ['Gold'],
    sizes: ['22 inches', '24 inches', '26 inches'],
    images: [
      'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/temple-chain-1',
      'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/temple-chain-2',
      'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/temple-chain-3'
    ],
    thumbnail: 'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/temple-chain-1',
    wallpaper: [
      'https://res.cloudinary.com/demo/image/upload/w_1200,h_800,c_fill,q_auto/v1/jewelry/temple-chain-wallpaper'
    ],
    video: '',
    tags: ['temple', 'chain', 'gold', 'traditional', 'festival'],
    status: 'active',
    metaTitle: 'Temple Gold Chain - Caelvi',
    metaDescription: 'Shop traditional temple design gold chains online. Intricate workmanship with temple motifs.',
    createdAt: '2024-01-30T09:45:00.000Z',
    updatedAt: '2024-02-22T14:30:00.000Z'
  },
  {
    _id: 'prod009',
    name: 'Minimalist Gold Ring',
    slug: 'minimalist-gold-ring',
    description: 'Simple and elegant minimalist gold ring. Perfect for daily wear. Clean design that complements any outfit.',
    sku: 'RING-MIN-009',
    categories: [
      { _id: 'cat007', name: 'Rings', slug: 'rings' }
    ],
    collections: [
      { _id: 'coll003', name: 'Daily Wear Collection', slug: 'daily-wear-collection' }
    ],
    price: 3499,
    discountPrice: 2999,
    stockQuantity: 30,
    material: 'Gold Plated',
    weight: '3g',
    colors: ['Gold', 'Rose Gold'],
    sizes: ['5', '6', '7', '8'],
    images: [
      'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/minimalist-ring-1',
      'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/minimalist-ring-2'
    ],
    thumbnail: 'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/minimalist-ring-1',
    wallpaper: [],
    video: '',
    tags: ['minimalist', 'ring', 'daily-wear', 'simple', 'elegant'],
    status: 'active',
    metaTitle: 'Minimalist Gold Ring - Caelvi',
    metaDescription: 'Buy minimalist gold rings online. Simple and elegant designs for daily wear.',
    createdAt: '2024-02-10T10:00:00.000Z',
    updatedAt: '2024-02-18T11:30:00.000Z'
  },
  {
    _id: 'prod010',
    name: 'Antique Silver Earrings',
    slug: 'antique-silver-earrings',
    description: 'Vintage style antique silver earrings with intricate traditional patterns. Perfect for special occasions and traditional attire.',
    sku: 'EARR-ANT-010',
    categories: [
      { _id: 'cat002', name: 'Earrings', slug: 'earrings' }
    ],
    collections: [
      { _id: 'coll006', name: 'Classic Collection', slug: 'classic-collection' }
    ],
    price: 12999,
    discountPrice: 9999,
    stockQuantity: 0,
    material: 'Sterling Silver',
    weight: '15g',
    colors: ['Silver'],
    sizes: ['Standard'],
    images: [
      'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/antique-earrings-1',
      'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/antique-earrings-2',
      'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/antique-earrings-3'
    ],
    thumbnail: 'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/antique-earrings-1',
    wallpaper: [],
    video: '',
    tags: ['antique', 'silver', 'earrings', 'vintage', 'traditional'],
    status: 'out_of_stock',
    metaTitle: 'Antique Silver Earrings - Caelvi',
    metaDescription: 'Shop vintage antique silver earrings online. Traditional patterns with intricate designs.',
    createdAt: '2024-01-18T13:20:00.000Z',
    updatedAt: '2024-02-28T09:00:00.000Z'
  }
];


