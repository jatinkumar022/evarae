import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Container from '@/app/components/layouts/Container';
import { earringsProducts } from '@/lib/data/products';
import { ProductCard } from '../components/ProductCard';

export const metadata: Metadata = {
  title: 'Earrings Collection - Caelvi Premium Jewellery',
  description:
    'Discover our stunning collection of earrings at Caelvi. From elegant studs to statement pieces, find your perfect earrings.',
  keywords: 'earrings, diamond earrings, gold earrings, studs, hoops, Caelvi',
  openGraph: {
    title: 'Earrings Collection - Caelvi Premium Jewellery',
    description: 'Discover our stunning collection of earrings at Caelvi.',
    url: 'https://caelvi.com/shop/earrings',
  },
};

export default function EarringsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Container>
        <nav className="py-4 sm:py-6 text-xs sm:text-sm text-primary-dark">
          <div className="flex items-center gap-1 sm:gap-2">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-primary-dark">Earrings</span>
          </div>
        </nav>

        <div className="heading-component-main-container mb-6 sm:mb-8">
          <h1 className="heading-component-main-heading text-lg sm:text-xl md:text-2xl lg:text-3xl">
            Earrings Collection
          </h1>
          <h2 className="heading-component-main-subheading text-sm sm:text-base">
            ({earringsProducts.length} results)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 items-center">
          {earringsProducts.map(product => (
            <div key={product.id} className="h-full">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
