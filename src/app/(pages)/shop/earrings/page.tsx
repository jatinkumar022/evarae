import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Heart } from 'lucide-react';
import Container from '@/app/components/layouts/Container';
import { Product } from '@/lib/types/product';
import { earringsProducts } from '@/lib/data/products';
import { GiCrystalShine } from 'react-icons/gi';

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

// Using centralized product data from lib/data/products.ts

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden cursor-pointer bg-white border border-primary/10 hover:border-primary/30 transition-all duration-300 flex flex-col">
      <div className="relative aspect-square w-full flex-shrink-0">
        <Image
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover aspect-square"
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
          priority={false}
        />
      </div>

      {product.isNew && (
        <span className="absolute top-3 left-3 best-seller-tag text-white text-[11px] px-3 py-1.5 rounded-tl-xl rounded-br-xl uppercase font-semibold tracking-wide">
          <div className="flex items-center gap-1">
            <GiCrystalShine size={15} /> NEW
          </div>
        </span>
      )}
      {product.isSale && (
        <span className="absolute top-3 left-3 best-seller-tag text-white text-[11px] px-3 py-1.5 rounded-tl-xl rounded-br-xl uppercase font-semibold tracking-wide">
          <div className="flex items-center gap-1">
            <GiCrystalShine size={15} /> BEST SELLER
          </div>
        </span>
      )}

      <button
        className="absolute top-3 right-3 bg-white/50 backdrop-blur-sm cursor-pointer hover:bg-primary hover:text-white rounded-full p-2 transition-all duration-300"
        aria-label={`Add ${product.name} to wishlist`}
      >
        <Heart className="w-4 h-4" />
      </button>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="flex-1 text-left">
            <p className="font-medium text-primary-dark truncate mb-2">
              {product.name}
            </p>
            {product.price ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-base font-semibold text-accent">
                    ₹{product.price.toLocaleString()}
                  </p>
                  {product.originalPrice &&
                    product.originalPrice > product.price && (
                      <p className="text-xs text-primary-dark line-through">
                        ₹{product.originalPrice.toLocaleString()}
                      </p>
                    )}
                </div>
              </div>
            ) : (
              <button className="w-full bg-primary text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-primary-dark transition-colors">
                REQUEST STORE AVAILABILITY
              </button>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            {product.originalPrice &&
              product.price &&
              product.originalPrice > product.price && (
                <div className="inline-flex items-center gap-1 bg-accent/10 text-accent px-3 py-1.5 rounded-full text-xs font-bold">
                  <span className="text-accent">★</span>
                  Flat{' '}
                  {Math.round(
                    ((product.originalPrice - product.price) /
                      product.originalPrice) *
                      100
                  )}
                  % off
                </div>
              )}

            {product.inStock && product.stockCount <= 3 && (
              <p className="text-xs text-accent font-medium">
                Only {product.stockCount} left!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
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
