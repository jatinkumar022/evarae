import { notFound } from 'next/navigation';
import { ProductDetails } from './ProductDetails.client';
import type {
  Product as UiProduct,
  Category as UiCategory,
} from '@/lib/types/product';
import { connect } from '@/dbConfig/dbConfig';
import Product from '@/models/productModel';

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

type ApiProduct = {
  _id?: string;
  slug?: string;
  sku?: string;
  name?: string;
  description?: string;
  price?: number | null;
  discountPrice?: number | null;
  images?: string[];
  brand?: string;
  weight?: number | string;
  stockQuantity?: number;
  rating?: number;
  reviewsCount?: number;
  categories?: Array<{ _id?: string; name?: string; slug?: string }>;
};

function mapApiToUiProduct(api: ApiProduct): UiProduct {
  const category: UiCategory = {
    id:
      Array.isArray(api.categories) && api.categories[0]?._id
        ? String(api.categories[0]?._id)
        : api.categories?.[0]?.slug || 'uncategorized',
    name: api.categories?.[0]?.name || 'Uncategorized',
    slug: api.categories?.[0]?.slug || 'uncategorized',
    productCount: 0,
    isActive: true,
  };

  const price =
    typeof api.discountPrice === 'number' && api.discountPrice > 0
      ? api.discountPrice
      : api.price ?? 0;
  const originalPrice = api.price ?? null;

  const imagesArray =
    Array.isArray(api.images) && api.images.length > 0
      ? api.images
      : ['/favicon.ico'];
  const hoverImage = imagesArray[1];

  return {
    id: String(api.sku || api._id || api.slug),
    name: api.name || '',
    description: api.description || '',
    price,
    originalPrice,
    currency: 'INR',
    images: imagesArray,
    hoverImage,
    category,
    subcategory: undefined,
    brand: api.brand || '',
    weight: api.weight
      ? Number(String(api.weight).replace(/[^0-9.]/g, ''))
      : undefined,
    dimensions: {},
    inStock:
      typeof api.stockQuantity === 'number' && api.stockQuantity > 0,
    stockCount: typeof api.stockQuantity === 'number' ? api.stockQuantity : 0,
    rating: typeof api.rating === 'number' ? api.rating : 0,
    reviews: typeof api.reviewsCount === 'number' ? api.reviewsCount : 0,
    isNew: false,
    isSale:
      typeof api.discountPrice === 'number' &&
      typeof api.price === 'number' &&
      api.discountPrice < api.price,
    isWishlisted: false,
    isFeatured: false,
    tags: [],
    sku: String(api.sku || ''),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params; // treated as sku when provided

  await connect();

  const isObjectId = /^[a-f0-9]{24}$/i.test(id);

  // Try by SKU first
  let doc = await Product.findOne({ status: 'active', sku: id })
    .populate('categories', 'name slug')
    .lean();

  if (!doc) {
    const query = isObjectId ? { _id: id } : { slug: id };
    doc = await Product.findOne({ status: 'active', ...query })
      .populate('categories', 'name slug')
      .lean();
  }

  if (!doc) notFound();

  const product: UiProduct = mapApiToUiProduct(doc as unknown as ApiProduct);
  return <ProductDetails product={product} />;
}
