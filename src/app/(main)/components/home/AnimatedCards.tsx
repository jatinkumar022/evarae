'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from '@/app/(main)/components/ui/FallbackImage';
import { GoHeart } from 'react-icons/go';
import { motion, AnimatePresence } from 'framer-motion';
import { GiCrystalShine } from 'react-icons/gi';
import Link from 'next/link';
import { useHomepageStore } from '@/lib/data/mainStore/homepageStore';
import { useWishlistStore } from '@/lib/data/mainStore/wishlistStore';
import { useUserAccountStore } from '@/lib/data/mainStore/userAccountStore';
import LoginPromptModal from '@/app/(main)/components/ui/LoginPromptModal';
import toastApi from '@/lib/toast';
import { Spinner } from '@/app/(main)/components/ui/ScaleLoader';
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
  const { data } = useHomepageStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const preloadedImagesRef = useRef<Set<string>>(new Set());

  // Homepage data is loaded centrally in Home page, no need to fetch here

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

      // Preload all images to prevent white flash during scroll
      mappedProducts.forEach(product => {
        const imageUrl = product.images?.[0];
        if (imageUrl && !preloadedImagesRef.current.has(imageUrl)) {
          const img = new window.Image();
          img.src = imageUrl;
          preloadedImagesRef.current.add(imageUrl);
        }
      });
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
  }, [products.length]);

  useEffect(() => {
    const container = sliderRef.current;
    if (!container || totalPages <= 1) return;

    const handleScroll = () => {
      const card = container.querySelector('.scroll-item') as HTMLElement;
      if (!card) return;

      const cardWidth = card.offsetWidth + 16; // card width + gap
      const scrollLeft = container.scrollLeft;
      const scrollPosition = scrollLeft + container.clientWidth / 2; // Center of viewport
      const page = Math.min(
        Math.max(0, Math.floor(scrollPosition / cardWidth)),
        totalPages - 1
      );

      setActiveIndex(page);
    };

    // Initial calculation
    handleScroll();

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [cardsPerPage, totalPages]);

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

  const ImageCard = ({
    item,
    index,
    onShowLogin,
  }: {
    item: Product;
    index?: number;
    onShowLogin: () => void;
  }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { user: currentUser } = useUserAccountStore();
    const {
      add: addToWishlist,
      remove: removeFromWishlist,
      products: wishlistProducts,
    } = useWishlistStore();
    const primaryImage = item.images?.[0] ?? '/favicon.ico';
    const hoverImage = item.images?.[1] ?? primaryImage;

    // User and wishlist are loaded centrally via Navbar, no need to fetch here

    // Check if product is wishlisted
    const isProductWishlisted = wishlistProducts.some(
      p => String(p._id) === item.slug || p.slug === item.slug
    );

    // Detect screen size
    useEffect(() => {
      const checkScreen = () => setIsMobile(window.innerWidth < 1024); // lg breakpoint
      checkScreen();
      window.addEventListener('resize', checkScreen);
      return () => window.removeEventListener('resize', checkScreen);
    }, []);

    useEffect(() => {
      if (isMobile) return;
      if (!hoverImage || hoverImage === primaryImage) return;

      const prefetchImage = new window.Image();
      prefetchImage.decoding = 'async';
      prefetchImage.src = hoverImage;

      return () => {
        prefetchImage.src = '';
      };
    }, [hoverImage, isMobile, primaryImage]);

    // Only enable hover on desktop (non-mobile, non-scrollable)
    // On mobile/scrollable screens, disable hover completely to prevent blinking
    const handleMouseEnter = () => {
      // Only allow hover on desktop screens (lg and above)
      if (isMobile) {
        setIsHovered(false);
        return;
      }
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      hoverTimeoutRef.current = setTimeout(() => {
        setIsHovered(true);
      }, 150);
    };

    const handleMouseLeave = () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      setIsHovered(false);
    };

    // Reset hover state when mobile state changes
    useEffect(() => {
      if (isMobile) {
        setIsHovered(false);
      }
    }, [isMobile]);

    // Cleanup timeout on unmount
    useEffect(() => {
      return () => {
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
        }
      };
    }, []);

    // On mobile/scrollable screens, only show primary image - no hover effect at all
    if (isMobile) {
      return (
        <div className="relative w-full aspect-square rounded-xl overflow-hidden cursor-pointer">
          <div className="relative w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
            <Image
              src={primaryImage}
              alt={item.name}
              fill
              className="object-cover rounded-xl"
              priority={(index ?? 0) < 2}
              loading={(index ?? 0) < 2 ? 'eager' : 'lazy'}
              sizes="256px"
            />
          </div>
          {item.tags && (
            <span className="absolute top-0 left-0 best-seller-tag text-white text-[11px] px-3 py-1.5 rounded-tl-xl rounded-br-xl uppercase font-semibold tracking-wide">
              <div className="flex items-center gap-1">
                <GiCrystalShine size={15} /> {item.tags[0]}
              </div>
            </span>
          )}

          <button
            className={`absolute top-3 right-3 backdrop-blur-sm rounded-full p-2 transition-all duration-300 ${
              isProductWishlisted
                ? 'bg-primary text-white hover:bg-primary-dark'
                : 'bg-white/50 text-foreground/70 hover:bg-white hover:text-foreground'
            } ${isWishlistLoading ? 'opacity-80 cursor-wait' : ''}`}
            aria-label={
              isProductWishlisted
                ? `Remove ${item.name} from wishlist`
                : `Add ${item.name} to wishlist`
            }
            type="button"
            onClick={async event => {
              event.preventDefault();
              event.stopPropagation();

              if (!currentUser) {
                onShowLogin();
                return;
              }

              if (isWishlistLoading) return;

              setIsWishlistLoading(true);
              try {
                const productId = item.slug;
                const isCurrentlyWishlisted = isProductWishlisted;

                if (isCurrentlyWishlisted) {
                  await removeFromWishlist(productId);
                  toastApi.success(
                    'Removed from wishlist',
                    'Product removed from your wishlist'
                  );
                } else {
                  await addToWishlist(productId);
                  toastApi.success(
                    'Added to wishlist',
                    'Product added to your wishlist'
                  );
                }
              } catch {
                toastApi.error(
                  'Error',
                  'Failed to update wishlist. Please try again.'
                );
              } finally {
                setIsWishlistLoading(false);
              }
            }}
            disabled={isWishlistLoading}
          >
            <span className="relative flex items-center justify-center">
              <span className={isWishlistLoading ? 'opacity-0' : ''}>
                <GoHeart
                  size={18}
                  className={isProductWishlisted ? 'fill-current' : ''}
                />
              </span>
              {isWishlistLoading && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <Spinner className="text-current" />
                </span>
              )}
            </span>
          </button>
        </div>
      );
    }

    // Desktop: Show hover effect with smooth cross-fade
    return (
      <div
        className="relative w-full aspect-square rounded-xl overflow-hidden cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative w-full h-full">
          {/* Use CSS-based cross-fade - both images always present to prevent blinking */}
          <div className="relative w-full h-full">
            <Image
              src={primaryImage}
              alt={item.name}
              fill
              className="object-cover rounded-xl"
              priority={false}
            />
            {hoverImage !== primaryImage && (
              <Image
                src={hoverImage}
                alt={item.name}
                fill
                className={`object-cover rounded-xl absolute inset-0 transition-opacity duration-500 ease-in-out ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`}
                priority={false}
              />
            )}
          </div>
        </div>
        {item.tags && (
          <span className="absolute top-0 left-0 best-seller-tag text-white text-[11px] px-3 py-1.5 rounded-tl-xl rounded-br-xl uppercase font-semibold tracking-wide">
            <div className="flex items-center gap-1">
              <GiCrystalShine size={15} /> {item.tags[0]}
            </div>
          </span>
        )}

        <button
          className={`absolute top-3 right-3 backdrop-blur-sm rounded-full p-2 transition-all duration-300 ${
            isProductWishlisted
              ? 'bg-primary text-white hover:bg-primary-dark'
              : 'bg-white/50 text-foreground/70 hover:bg-white hover:text-foreground'
          } ${isWishlistLoading ? 'opacity-80 cursor-wait' : ''}`}
          aria-label={
            isProductWishlisted
              ? `Remove ${item.name} from wishlist`
              : `Add ${item.name} to wishlist`
          }
          type="button"
          onClick={async event => {
            event.preventDefault();
            event.stopPropagation();

            if (!currentUser) {
              onShowLogin();
              return;
            }

            if (isWishlistLoading) return;

            setIsWishlistLoading(true);
            try {
              const productId = item.slug;
              const isCurrentlyWishlisted = isProductWishlisted;

              if (isCurrentlyWishlisted) {
                await removeFromWishlist(productId);
                toastApi.success(
                  'Removed from wishlist',
                  'Product removed from your wishlist'
                );
              } else {
                await addToWishlist(productId);
                toastApi.success(
                  'Added to wishlist',
                  'Product added to your wishlist'
                );
              }
            } catch {
              toastApi.error(
                'Error',
                'Failed to update wishlist. Please try again.'
              );
            } finally {
              setIsWishlistLoading(false);
            }
          }}
          disabled={isWishlistLoading}
        >
          <span className="relative flex items-center justify-center">
            <span className={isWishlistLoading ? 'opacity-0' : ''}>
              <GoHeart
                size={18}
                className={isProductWishlisted ? 'fill-current' : ''}
              />
            </span>
            {isWishlistLoading && (
              <span className="absolute inset-0 flex items-center justify-center">
                <Spinner className="text-current" />
              </span>
            )}
          </span>
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
          className="flex gap-4 overflow-x-auto pb-6 scroll-smooth snap-x snap-mandatory no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((item, index) => (
            <Link
              href={`/product/${item.slug}`}
              key={item._id + index}
              className="flex-shrink-0 w-64 snap-start scroll-item cursor-pointer"
            >
              <ImageCard
                item={item}
                index={index}
                onShowLogin={() => setShowLoginModal(true)}
              />
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

        {/* Preload images to prevent white flash during scroll */}

        {/* Pagination Dots - Fixed positioning, not sticky */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6 mb-4 px-4 w-full">
            {Array.from({ length: totalPages }).map((_, i) => {
              // Ensure activeIndex is within bounds
              const safeActiveIndex = Math.min(
                Math.max(0, activeIndex),
                totalPages - 1
              );
              const isActive = safeActiveIndex === i;
              return (
                <button
                  key={i}
                  onClick={() => scrollToPage(i)}
                  className={`h-2 rounded-full transition-all duration-300 ease-in-out flex-shrink-0 ${
                    isActive ? 'w-8 bg-primary' : 'w-2 bg-primary/30'
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
        {products.map((item, index) => (
          <Link
            href={`/product/${item.slug}`}
            key={item._id + '-desktop'}
            className="flex flex-col cursor-pointer"
          >
            <ImageCard
              item={item}
              index={index}
              onShowLogin={() => setShowLoginModal(true)}
            />
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

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        action="wishlist"
      />
    </section>
  );
}
