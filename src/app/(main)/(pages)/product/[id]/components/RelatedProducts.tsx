'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { GiCrystalShine } from 'react-icons/gi';
import { Heart } from '@/app/(main)/assets/Navbar';
import { Cart } from '@/app/(main)/assets/Common';
import { Product, Category } from '@/lib/types/product';
import {
  ringsProducts,
  earringsProducts,
  banglesProducts,
  braceletsProducts,
  chainsProducts,
  mangalsutrasProducts,
  pendantsProducts,
} from '@/lib/data/products';

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

  const getCategoryProducts = (categorySlug: string) => {
    switch (categorySlug) {
      case 'rings':
        return ringsProducts;
      case 'earrings':
        return earringsProducts;
      case 'bangles':
        return banglesProducts;
      case 'bracelets':
        return braceletsProducts;
      case 'chains':
        return chainsProducts;
      case 'mangalsutra':
        return mangalsutrasProducts;
      case 'pendants':
        return pendantsProducts;
      default:
        return [];
    }
  };

  const categoryProducts = getCategoryProducts(category.slug);

  const relatedProducts = categoryProducts
    .filter((product: Product) => product.id !== currentProduct.id)
    .slice(0, 7); // ✅ limit to 7 products

  useEffect(() => {
    const container = sliderRef.current;
    if (!container) return;

    const calculatePagination = () => {
      const card = container.querySelector('.scroll-item') as HTMLElement;
      if (!card) return;

      const visibleWidth = container.clientWidth;
      const cardWidth = card.offsetWidth + 16;
      const cardsFit = Math.floor(visibleWidth / cardWidth) || 1;
      const pages = Math.ceil(relatedProducts.length / cardsFit);

      setCardsPerPage(cardsFit);
      setTotalPages(pages);
    };

    calculatePagination();
    window.addEventListener('resize', calculatePagination);
    return () => window.removeEventListener('resize', calculatePagination);
  }, [relatedProducts]);

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

  if (relatedProducts.length === 0) return null;

  return (
    <section className="space-y-8">
      {/* Header with "View All" */}
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

      {/* Carousel */}
      <div className="relative">
        <div
          ref={sliderRef}
          className="flex gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory scrollbar-hide"
        >
          {relatedProducts.map(product => (
            <div
              key={product.id}
              className="flex-shrink-0 w-64 snap-start scroll-item"
            >
              {/* ✅ Inline Product Card */}
              <Link
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
                  {/* Wishlist */}
                  <button className="absolute top-2 right-2 bg-white/70 backdrop-blur-sm rounded-full p-1.5 hover:bg-primary hover:text-white transition">
                    <Heart className="w-4 h-4" />
                  </button>
                  {/* Tag */}
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

                  {product.inStock && product.stockCount <= 3 && (
                    <p className="text-xs text-primary font-medium text-center flex items-center gap-1">
                      <span className="inline-block w-2 h-2 bg-primary rounded-full"></span>
                      Only {product.stockCount} left!
                    </p>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            {Array.from({ length: totalPages }).map((_, i) => {
              const isActive = activeIndex === i;
              return (
                <button
                  key={i}
                  onClick={() => scrollToPage(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ease-in-out ${
                    isActive ? 'w-6 bg-primary' : 'w-2.5 bg-primary/30'
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
