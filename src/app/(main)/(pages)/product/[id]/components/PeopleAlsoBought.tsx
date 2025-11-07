'use client';

import Link from 'next/link';
import Image from 'next/image';
import { GiCrystalShine } from 'react-icons/gi';
import { Heart } from '@/app/(main)/assets/Navbar';
import { Cart } from '@/app/(main)/assets/Common';
import { Product } from '@/lib/types/product';
import { useEffect, useState, useMemo } from 'react';

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
          { 
            cache: 'force-cache',
            next: { revalidate: 300 } // Revalidate every 5 minutes
          }
        );
        if (!res.ok) return;
        const data = await res.json();
        type ApiProduct = {
          slug: string;
          name: string;
          description?: string;
          price?: number | null;
          discountPrice?: number | null;
          images?: string[];
          categories?: Array<{
            _id?: string;
            name?: string;
            slug?: string;
          }>;
          material?: string;
          colors?: string[];
          status?: string;
          stockQuantity?: number;
          tags?: string[];
          sku?: string;
        };
        const productsArr = (data.products ?? []) as ApiProduct[];
        const mapped: Product[] = productsArr.map(p => {
          const fallbackImage = '/favicon.ico';
          const productImages = p.images && p.images.length > 0 ? p.images : [fallbackImage];
          return {
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
            images: productImages,
            hoverImage: productImages[1],
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
          };
        });
        const filtered = mapped.filter(p => p.id !== currentProduct.id).slice(0, 8);
        setItems(filtered);
      } catch {}
    })();
  }, [currentProduct.id]);

  // Memoize product cards at top level (Rules of Hooks)
  const memoizedProductCards = useMemo(() => {
    return items.map(product => {
      const primaryImage = product.images[0] as string;
      const secondaryImage = (product.images[1] as string) || primaryImage;

      return (
        <Link
          key={product.id}
          href={`/product/${product.id}`}
          prefetch={true}
          className="group relative flex flex-col rounded-lg border border-primary/10 overflow-hidden hover:shadow-md transition-all"
        >
          <div className="relative aspect-square w-full overflow-hidden">
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-all duration-300 group-hover:opacity-0 group-hover:scale-105"
              loading="lazy"
            />
            {secondaryImage && secondaryImage !== primaryImage && (
              <Image
                src={secondaryImage}
                alt={`${product.name} alternate view`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:scale-105"
                loading="lazy"
              />
            )}
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
      );
    });
  }, [items]);

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
        {memoizedProductCards}
      </div>
    </section>
  );
}
