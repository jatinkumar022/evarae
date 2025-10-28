'use client';

import Link from 'next/link';
import Image from 'next/image';
import { GiCrystalShine } from 'react-icons/gi';
import { Heart } from '@/app/(main)/assets/Navbar';
import { Cart } from '@/app/(main)/assets/Common';
import { Product } from '@/lib/types/product';
import { useEffect, useState } from 'react';

interface PeopleAlsoBoughtProps {
  currentProduct: Product;
}

export function PeopleAlsoBought({ currentProduct }: PeopleAlsoBoughtProps) {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `/api/main/product/${currentProduct.id}/people-also-bought`,
          { cache: 'no-store' }
        );
        if (!res.ok) return;
        const data = await res.json();
        type ApiProduct = {
          slug: string;
          name: string;
          description?: string;
          price?: number | null;
          discountPrice?: number | null;
          thumbnail?: string;
          images?: string[];
          categories?: Array<{
            _id?: string;
            name?: string;
            slug?: string;
          }>;
          material?: string;
          status?: string;
          stockQuantity?: number;
          tags?: string[];
          sku?: string;
        };
        const productsArr = (data.products ?? []) as ApiProduct[];
        const mapped: Product[] = productsArr.map(p => ({
          id: p.slug,
          name: p.name,
          description: p.description || '',
          price:
            p.discountPrice != null &&
            p.price != null &&
            p.discountPrice < p.price
              ? p.discountPrice
              : p.price ?? null,
          originalPrice:
            p.discountPrice != null &&
            p.price != null &&
            p.discountPrice < p.price
              ? p.price
              : null,
          currency: 'INR',
          images: [p.thumbnail || p.images?.[0] || '/favicon.ico'],
          hoverImage: p.images?.[1],
          category: {
            id: p.categories?.[0]?._id || p.categories?.[0]?.slug || '',
            name: p.categories?.[0]?.name || '',
            slug: p.categories?.[0]?.slug || '',
            productCount: 0,
            isActive: true,
          },
          subcategory: '',
          brand: '',
          material: p.material || '',
          colors: p.colors || [],
          inStock: (p.status || 'active') === 'active',
          stockCount: p.stockQuantity ?? 0,
          rating: 0,
          reviews: 0,
          isNew: false,
          isSale:
            p.discountPrice != null &&
            p.price != null &&
            p.discountPrice < p.price,
          isWishlisted: false,
          isFeatured: false,
          tags: p.tags || [],
          sku: p.sku || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        setItems(mapped.filter(p => p.id !== currentProduct.id).slice(0, 8));
      } catch {}
    })();
  }, [currentProduct.id]);

  if (items.length === 0) return null;

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-lg lg:text-2xl font-heading font-semibold text-primary-dark mb-1 lg:mb-2">
          People Also Bought
        </h2>
        <p className="text-primary-dark/70 text-sm">
          Frequently bought together by our customers
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(product => (
          <Link
            key={product.id}
            href={`/product/${product.id}`}
            className="group relative flex flex-col rounded-lg border border-primary/10 overflow-hidden hover:shadow-md transition-all"
          >
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
