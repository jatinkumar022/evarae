'use client';

import Link from 'next/link';
import Image from 'next/image';
import { GiCrystalShine } from 'react-icons/gi';
import { Heart } from '@/app/(main)/assets/Navbar';
import { Cart } from '@/app/(main)/assets/Common';
import { Product } from '@/lib/types/product';

// ✅ Import all product arrays
import {
  ringsProducts,
  earringsProducts,
  banglesProducts,
  braceletsProducts,
  chainsProducts,
  mangalsutrasProducts,
  pendantsProducts,
} from '@/lib/data/products';

interface PeopleAlsoBoughtProps {
  currentProduct: Product;
}

export function PeopleAlsoBought({ currentProduct }: PeopleAlsoBoughtProps) {
  // ✅ Combine all products
  const allProducts: Product[] = [
    ...ringsProducts,
    ...earringsProducts,
    ...banglesProducts,
    ...braceletsProducts,
    ...chainsProducts,
    ...mangalsutrasProducts,
    ...pendantsProducts,
  ];

  // ✅ Filter by category, remove current product, randomize & limit
  const relatedProducts = allProducts
    .filter(
      p =>
        p.id !== currentProduct.id &&
        p.category?.id === currentProduct.category?.id
    )
    .sort(() => Math.random() - 0.5)
    .slice(0, 7);

  if (!relatedProducts || relatedProducts.length === 0) return null;

  return (
    <section className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-lg lg:text-2xl font-heading font-semibold text-primary-dark mb-1 lg:mb-2">
          People Also Bought
        </h2>
        <p className="text-primary-dark/70 text-sm">
          Frequently bought together by our customers
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {relatedProducts.map(product => (
          <Link
            key={product.id}
            href={`/product/${product.id}`}
            className="group relative flex flex-col rounded-lg border border-primary/10 overflow-hidden hover:shadow-md transition-all"
          >
            {/* Image */}
            <div className="relative aspect-square w-full overflow-hidden">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <button className="absolute top-2 right-2 bg-white/70 backdrop-blur-sm rounded-full p-1.5 hover:bg-primary hover:text-white transition">
                <Heart className="w-4 h-4" />
              </button>
              {product.isNew && (
                <span className="absolute top-2 left-2 bg-primary text-white text-[10px] px-2 py-1 rounded-md font-semibold flex items-center gap-1">
                  <GiCrystalShine size={12} /> NEW
                </span>
              )}
              {product.isSale && (
                <span className="absolute top-2 left-2 bg-accent text-white text-[10px] px-2 py-1 rounded-md font-semibold flex items-center gap-1">
                  <GiCrystalShine size={12} /> SALE
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col flex-1 p-3 gap-2">
              <p className="font-medium text-primary-dark text-sm truncate">
                {product.name}
              </p>

              {product.price ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-accent">
                    ₹{product.price.toLocaleString()}
                  </span>
                  {product.originalPrice &&
                    product.originalPrice > product.price && (
                      <>
                        <span className="text-xs text-primary-dark line-through">
                          ₹{product.originalPrice.toLocaleString()}
                        </span>
                        <span className="text-xs text-primary font-semibold">
                          {Math.round(
                            ((product.originalPrice - product.price) /
                              product.originalPrice) *
                              100
                          )}
                          % off
                        </span>
                      </>
                    )}
                </div>
              ) : (
                <button className="w-full bg-primary text-white py-2 px-3 rounded-md text-xs font-medium hover:bg-primary-dark transition-colors">
                  REQUEST STORE AVAILABILITY
                </button>
              )}

              {product.price && (
                <button className="w-full bg-primary text-white py-2 rounded-md text-xs sm:text-sm font-medium flex items-center justify-center gap-1 hover:bg-primary-dark transition-colors">
                  <Cart className="w-4 h-4" />
                  Add to Cart
                </button>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
