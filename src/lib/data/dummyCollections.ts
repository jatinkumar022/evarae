import type { Collection } from '@/lib/data/store/collectionStore';
import { dummyProducts } from './dummyProducts';

// Dummy collections data for admin testing
export const dummyCollections: Collection[] = [
  {
    _id: 'coll001',
    name: 'Wedding Collection',
    slug: 'wedding-collection',
    description: 'Exquisite jewelry pieces perfect for weddings and special occasions. This collection features premium designs that make every moment memorable.',
    image: 'https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill,q_auto/v1/collections/wedding-collection',
    isActive: true,
    sortOrder: 1,
    products: [
      dummyProducts[0], // Traditional Gold Mangalsutra
      dummyProducts[5]  // Diamond Ring for Engagement
    ],
    createdAt: '2024-01-01T08:00:00.000Z',
    updatedAt: '2024-02-20T12:00:00.000Z'
  },
  {
    _id: 'coll002',
    name: 'Diamond Collection',
    slug: 'diamond-collection',
    description: 'Stunning diamond jewelry collection featuring premium quality diamonds. From elegant studs to sophisticated engagement rings.',
    image: 'https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill,q_auto/v1/collections/diamond-collection',
    isActive: true,
    sortOrder: 2,
    products: [
      dummyProducts[1], // Diamond Stud Earrings
      dummyProducts[5]  // Diamond Ring for Engagement
    ],
    createdAt: '2024-01-05T09:00:00.000Z',
    updatedAt: '2024-02-25T14:00:00.000Z'
  },
  {
    _id: 'coll003',
    name: 'Daily Wear Collection',
    slug: 'daily-wear-collection',
    description: 'Comfortable and stylish jewelry for everyday wear. Lightweight designs that complement your daily style without compromising on elegance.',
    image: 'https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill,q_auto/v1/collections/daily-wear-collection',
    isActive: true,
    sortOrder: 3,
    products: [
      dummyProducts[2], // Rose Gold Chain Bracelet
      dummyProducts[8]  // Minimalist Gold Ring
    ],
    createdAt: '2024-01-10T10:00:00.000Z',
    updatedAt: '2024-02-18T11:00:00.000Z'
  },
  {
    _id: 'coll004',
    name: 'Festival Collection',
    slug: 'festival-collection',
    description: 'Traditional and festive jewelry perfect for Indian festivals and celebrations. Vibrant designs that celebrate cultural heritage.',
    image: 'https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill,q_auto/v1/collections/festival-collection',
    isActive: true,
    sortOrder: 4,
    products: [
      dummyProducts[3], // Kundan Pendant Necklace
      dummyProducts[7]  // Temple Gold Chain
    ],
    createdAt: '2024-01-08T07:00:00.000Z',
    updatedAt: '2024-02-22T15:00:00.000Z'
  },
  {
    _id: 'coll005',
    name: 'Gifting Collection',
    slug: 'gifting-collection',
    description: 'Thoughtfully curated jewelry pieces perfect for gifting. Beautiful designs that express love and appreciation for special people in your life.',
    image: 'https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill,q_auto/v1/collections/wedding-collection',
    isActive: true,
    sortOrder: 5,
    products: [
      dummyProducts[4]  // Silver Bangles Set
    ],
    createdAt: '2024-01-12T11:00:00.000Z',
    updatedAt: '2024-02-12T10:00:00.000Z'
  },
  {
    _id: 'coll006',
    name: 'Classic Collection',
    slug: 'classic-collection',
    description: 'Timeless jewelry designs that never go out of style. Classic pieces that can be passed down through generations.',
    image: 'https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill,q_auto/v1/collections/classic-collection',
    isActive: true,
    sortOrder: 6,
    products: [
      dummyProducts[6], // Pearl Choker Necklace
      dummyProducts[9]  // Antique Silver Earrings
    ],
    createdAt: '2024-01-15T12:00:00.000Z',
    updatedAt: '2024-02-20T09:00:00.000Z'
  },
  {
    _id: 'coll007',
    name: 'New Arrivals',
    slug: 'new-arrivals',
    description: 'Latest additions to our jewelry collection. Stay updated with the newest designs and trends.',
    image: 'https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill,q_auto/v1/collections/new-arrivals',
    isActive: true,
    sortOrder: 7,
    products: [
      dummyProducts[2], // Rose Gold Chain Bracelet
      dummyProducts[8], // Minimalist Gold Ring
      dummyProducts[7]  // Temple Gold Chain
    ],
    createdAt: '2024-02-01T08:00:00.000Z',
    updatedAt: '2024-02-22T13:00:00.000Z'
  },
  {
    _id: 'coll008',
    name: 'Premium Collection',
    slug: 'premium-collection',
    description: 'Luxury jewelry pieces crafted with premium materials and exquisite craftsmanship. For those who appreciate the finest jewelry.',
    image: 'https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill,q_auto/v1/collections/diamond-collection',
    isActive: false,
    sortOrder: 8,
    products: [
      dummyProducts[5]  // Diamond Ring for Engagement
    ],
    createdAt: '2024-01-20T09:00:00.000Z',
    updatedAt: '2024-02-10T10:00:00.000Z'
  }
];


