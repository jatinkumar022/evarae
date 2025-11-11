'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { GoHeart } from 'react-icons/go';
import { motion, AnimatePresence } from 'framer-motion';
import { GiCrystalShine } from 'react-icons/gi';
import Link from 'next/link';
import { useHomepageStore } from '@/lib/data/mainStore/homepageStore';
type Product = {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  images?: string[];
  tags?: string[];
  slug: string;
};

export default function AnimatedCards() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { data, fetchHomepage } = useHomepageStore();
  const [products, setProducts] = useState<Product[]>([]);
  
  useEffect(() => {
    fetchHomepage();
  }, [fetchHomepage]);

  useEffect(() => {
    if (data?.bestsellers && data.bestsellers.length > 0) {
      const mappedProducts: Product[] = data.bestsellers.map(p => ({
        _id: p._id,
        name: p.name,
        price: p.price,
        discountPrice: p.discountPrice,
        images: p.images || [],
        tags: p.tags || [],
        slug: p.slug,
      }));
      setProducts(mappedProducts);
    } else {
      setProducts([]);
    }
  }, [data?.bestsellers]);

  useEffect(() => {
    const container = sliderRef.current;
    if (!container) return;

    const calculatePagination = () => {
      const card = container.querySelector('.scroll-item') as HTMLElement;
      if (!card) return;

      const visibleWidth = container.clientWidth;
      const cardWidth = card.offsetWidth + 16; // include gap
      const cardsFit = Math.floor(visibleWidth / cardWidth) || 1;
      const pages = Math.ceil(products.length / cardsFit);

      setCardsPerPage(cardsFit);
      setTotalPages(pages);
    };

    calculatePagination();
    window.addEventListener('resize', calculatePagination);
    return () => window.removeEventListener('resize', calculatePagination);
  }, []);

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

  const ImageCard = ({ item }: { item: Product }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const primaryImage = item.images?.[0] ?? '/favicon.ico';
    const hoverImage = item.images?.[1] ?? primaryImage;

    // Detect screen size
    useEffect(() => {
      const checkScreen = () => setIsMobile(window.innerWidth < 1024); // lg breakpoint
      checkScreen();
      window.addEventListener('resize', checkScreen);
      return () => window.removeEventListener('resize', checkScreen);
    }, []);
    const variants = {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    };

    return (
      <div
        className="relative w-full aspect-square rounded-xl overflow-hidden cursor-pointer"
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
      >
        <motion.div layout className="relative w-full h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={isHovered ? 'hover' : 'default'}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="w-full h-full relative"
            >
              <Image
                src={isHovered ? hoverImage : primaryImage}
                alt={item.name}
                fill
                className="object-cover rounded-xl"
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>
        {item.tags && (
          <span className="absolute top-0 left-0 best-seller-tag text-white text-[11px] px-3 py-1.5 rounded-tl-xl rounded-br-xl uppercase font-semibold tracking-wide">
            <div className="flex items-center gap-1">
              <GiCrystalShine size={15} /> {item.tags[0]}
            </div>
          </span>
        )}

        <button
          className="absolute top-3 right-3 bg-white/50 backdrop-blur-sm text-foreground/70 hover:bg-white hover:text-foreground rounded-full p-2 transition-all duration-300"
          aria-label={`Add ${item.name} to wishlist`}
        >
          <GoHeart size={18} />
        </button>
      </div>
    );
  };
  // Don't render if no products
  if (!products.length) {
    return null;
  }
  return (
    <section>
      {/* Headings */}
      <div className="heading-component-main-container">
        <h1 className="heading-component-main-heading">Our Bestsellers</h1>
        <h2 className="heading-component-main-subheading">
          Discover our most-loved pieces, adored by our customers.
        </h2>
      </div>

      {/* Mobile Slider */}
      <div className="relative lg:hidden">
        <div
          ref={sliderRef}
          className="flex gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((item, index) => (
            <Link
              href={`/product/${item.slug}`}
              key={item._id + index}
              className="flex-shrink-0 w-64 snap-start scroll-item cursor-pointer"
            >
              <ImageCard item={item} />
              <div className="mt-4 text-center">
                <p className="text-sm font-medium text-foreground truncate">
                  {item.name}
                </p>
                <p className="text-base font-semibold text-accent mt-1">
                  ₹{item.discountPrice || item.price}
                </p>
              </div>
            </Link>
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
                  aria-label={`Go to page ${i + 1} of ${totalPages}`}
                  aria-current={isActive ? 'true' : 'false'}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop Grid */}
      <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        {products.map(item => (
          <Link
            href={`/product/${item.slug}`}
            key={item._id + '-desktop'}
            className="flex flex-col cursor-pointer"
          >
            <ImageCard item={item} />
            <div className="mt-4 text-center">
              <p className="text-sm font-medium text-foreground truncate">
                {item.name}
              </p>
              <p className="text-base font-semibold text-accent mt-1">
                ₹{item.discountPrice || item.price}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
