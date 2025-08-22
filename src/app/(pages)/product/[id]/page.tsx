import { notFound } from 'next/navigation';
import { ProductDetails } from './components/ProductDetails';
import {
  ringsProducts,
  earringsProducts,
  banglesProducts,
  braceletsProducts,
  chainsProducts,
  mangalsutrasProducts,
  pendantsProducts,
} from '@/lib/data/products';

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  // Combine all products to search for the specific product
  const allProducts = [
    ...ringsProducts,
    ...earringsProducts,
    ...banglesProducts,
    ...braceletsProducts,
    ...chainsProducts,
    ...mangalsutrasProducts,
    ...pendantsProducts,
  ];

  const product = allProducts.find(p => p.id === id);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <ProductDetails product={product} />
    </div>
  );
}

// Generate static params for all products
export async function generateStaticParams() {
  const allProducts = [
    ...ringsProducts,
    ...earringsProducts,
    ...banglesProducts,
    ...braceletsProducts,
    ...chainsProducts,
    ...mangalsutrasProducts,
    ...pendantsProducts,
  ];

  return allProducts.map(product => ({
    id: product.id,
  }));
}
