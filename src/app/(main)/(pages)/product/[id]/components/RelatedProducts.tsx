'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { GiCrystalShine } from 'react-icons/gi';
import { Heart } from '@/app/(main)/assets/Navbar';
import { Cart } from '@/app/(main)/assets/Common';
import { Product, Category } from '@/lib/types/product';

interface RelatedProductsProps {
  currentProduct: Product;
  category: Category;
}

export function RelatedProducts({
  currentProduct,
  category,
}: RelatedProductsProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `/api/main/product/${currentProduct.id}/related`,
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
        setItems(mapped.filter(p => p.id !== currentProduct.id).slice(0, 12));
      } catch {}
    })();
  }, [currentProduct.id]);

  useEffect(() => {
    const container = sliderRef.current;
    if (!container) return;

    const calculatePagination = () => {
      const card = container.querySelector('.scroll-item') as HTMLElement;
      if (!card) return;
      const visibleWidth = container.clientWidth;
      const cardWidth = card.offsetWidth + 16;
      const cardsFit = Math.floor(visibleWidth / cardWidth) || 1;
      const pages = Math.ceil(items.length / cardsFit);
      setCardsPerPage(cardsFit);
      setTotalPages(pages);
    };

    calculatePagination();
    window.addEventListener('resize', calculatePagination);
    return () => window.removeEventListener('resize', calculatePagination);
  }, [items]);

  useEffect(() => {
    const container = sliderRef.current;
    if (!container) return;
    const handleScroll = () => {
      const card = container.querySelector('.scroll-item') as HTMLElement;
      if (!card) return;
      const cardWidth = card.offsetWidth + 16;
      const scrollLeft = container.scrollLeft;
      const page = Math.round(scrollLeft / (cardWidth * cardsPerPage));
      setActiveIndex(page);
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [cardsPerPage]);

  const scrollToPage = (index: number) => {
    const container = sliderRef.current;
    const card = container?.querySelector('.scroll-item') as HTMLElement;
    if (!container || !card) return;
    const cardWidth = card.offsetWidth + 16;
    container.scrollTo({
      left: index * cardWidth * cardsPerPage,
      behavior: 'smooth',
    });
  };

  if (items.length === 0) return null;

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-lg lg:text-2xl flex items-center justify-between font-heading font-semibold text-primary-dark mb-1 lg:mb-2">
          You Might Also Like
          <Link
            href={`/shop/${category.slug}`}
            className="inline-block max-md:underline md:bg-primary text-primary-dark md:!text-white px-3 py-2 md:px-5  whitespace-nowrap rounded-md hover:bg-primary-dark transition-colors font-medium text-xs md:text-sm lg:text-base"
          >
            View All
          </Link>
        </h2>
        <p className="text-primary-dark/70 text-sm">
          Discover more beautiful pieces from our {category.name} collection
        </p>
      </div>
      <div className="relative">
        <div
          ref={sliderRef}
          className="flex gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory scrollbar-hide"
        >
          {items.map(product => (
            <div
              key={product.id}
              className="flex-shrink-0 w-64 snap-start scroll-item"
            >
              <Link
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
                <div className="flex flex-col flex-1 p-3 sm:p-4 gap-2">
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
            </div>
          ))}
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToPage(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ease-in-out ${
                  activeIndex === i ? 'w-6 bg-primary' : 'w-2.5 bg-primary/30'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
