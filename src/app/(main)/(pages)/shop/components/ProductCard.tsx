'use client';
import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { Product } from '@/lib/types/product';
import Image from 'next/image';
import { GiCrystalShine } from 'react-icons/gi';
import { motion, AnimatePresence } from 'framer-motion';
import { Cart } from '@/app/(main)/assets/Common';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useWishlistStore } from '@/lib/data/mainStore/wishlistStore';
import toastApi from '@/lib/toast';
import { Spinner } from '@/app/(main)/components/ui/ScaleLoader';

// Dynamically import ProductOptionsModal to reduce initial bundle size
const ProductOptionsModal = dynamic(() => import('@/app/(main)/components/ui/ProductOptionsModal'), {
  ssr: false,
});

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const { load: loadWishlist, add: addToWishlist, remove: removeFromWishlist, isWishlisted } = useWishlistStore();

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 1024); // lg breakpoint
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  // Load wishlist on mount to check initial state
  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const handleAddToCart = () => {
    setIsModalOpen(true);
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isWishlistLoading) return;
    
    setIsWishlistLoading(true);
    try {
      const productId = product.id;
      const isCurrentlyWishlisted = isWishlisted(productId);
      
      if (isCurrentlyWishlisted) {
        await removeFromWishlist(productId);
        toastApi.success('Removed from wishlist', 'Product removed from your wishlist');
      } else {
        await addToWishlist(productId);
        toastApi.success('Added to wishlist', 'Product added to your wishlist');
      }
    } catch {
      toastApi.error('Error', 'Failed to update wishlist. Please try again.');
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const isProductWishlisted = isWishlisted(product.id);

  return (
    <>
      <article className="relative w-full h-full rounded-lg overflow-hidden border border-primary/10 flex flex-col">
        <div
          className="relative aspect-square w-full flex-shrink-0 overflow-hidden"
          onMouseEnter={() => !isMobile && setIsHovered(true)}
          onMouseLeave={() => !isMobile && setIsHovered(false)}
        >
          <Link href={`/product/${product.id}`} className="block h-full">
            <motion.div layout className="relative w-full h-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isHovered ? 'hover' : 'default'}
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="w-full h-full"
                >
                  <Image
                    src={
                      isHovered && product.hoverImage
                        ? product.hoverImage
                        : product.images[0]
                    }
                    alt={product.name}
                    className="w-full h-full object-cover aspect-square rounded-t-lg"
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    loading="lazy"
                    priority={false}
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </Link>

          {product.tags?.includes('best-seller') && (
            <span className="absolute top-0 left-0 best-seller-tag text-white text-[9px] sm:text-[11px] px-3 py-1 sm:py-1.5 rounded-tr-lg rounded-bl-lg uppercase font-semibold tracking-wide">
              <div className="flex items-center gap-1">
                <GiCrystalShine size={15} /> BEST SELLER
              </div>
            </span>
          )}

          <button
            className={`absolute bottom-3 right-3 flex items-center justify-center rounded-full sm:p-2 p-1.5 transition-all duration-300 z-10 ${
              isProductWishlisted
                ? 'bg-primary text-white hover:bg-primary-dark'
                : 'bg-white/50 hover:bg-primary hover:text-white'
            } ${isWishlistLoading ? 'opacity-80 cursor-wait' : ''}`}
            aria-label={isProductWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            onClick={handleWishlistToggle}
            disabled={isWishlistLoading}
            type="button"
          >
            <span className="relative flex items-center justify-center">
              <span className={isWishlistLoading ? 'opacity-0' : ''}>
                <Heart
                  className={`sm:w-4 sm:h-4 w-3 h-3 ${
                    isProductWishlisted ? 'fill-current' : ''
                  }`}
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

        <div className="flex-1 flex flex-col p-3 sm:p-4 gap-3">
          <Link href={`/product/${product.id}`} className="flex flex-col gap-1">
            <p className="font-semibold text-primary-dark truncate text-xs sm:text-sm leading-tight mb-1">
              {product.name}
            </p>
          </Link>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 flex-wrap">
              {product.price ? (
                <div className="flex items-center gap-2 ">
                  <p className="text-sm sm:text-base font-bold text-accent">
                    ₹{product.price.toLocaleString()}
                  </p>
                  {product.originalPrice &&
                    product.originalPrice > product.price && (
                      <p className="text-xs sm:text-sm text-primary-dark line-through">
                        ₹{product.originalPrice.toLocaleString()}
                      </p>
                    )}
                </div>
              ) : (
                <button
                  type="button"
                  className="w-full bg-primary text-white py-2 px-3 rounded-md text-xs sm:text-sm font-medium hover:bg-primary-dark transition-colors"
                >
                  REQUEST STORE AVAILABILITY
                </button>
              )}

              {product.originalPrice &&
                product.price &&
                product.originalPrice > product.price && (
                  <div className="text-xs sm:text-sm text-primary-dark">
                    Flat{' '}
                    {Math.round(
                      ((product.originalPrice - product.price) /
                        product.originalPrice) *
                        100
                    )}
                    % off
                  </div>
                )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full bg-primary text-white py-2 px-3 rounded-md text-xs sm:text-sm hover:bg-primary-dark transition-colors flex items-center justify-center gap-1"
          >
            <span className="text-accent">
              <Cart className="w-4 h-4 text-white" />
            </span>
            Add to Cart
          </button>
          {product.inStock && product.stockCount !== undefined && product.stockCount < 10 && (
            <p className="text-xs text-primary font-medium text-center flex items-center gap-1 animate-caret-blink ">
              <span className="inline-block w-2 h-2 bg-primary rounded-full "></span>
              Only {product.stockCount} left!
            </p>
          )}
          <p className="text-xs text-primary font-medium text-center flex items-center gap-1 animate-caret-blink "></p>
        </div>
      </article>

      {/* Product Options Modal */}
      <ProductOptionsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={product}
      />
    </>
  );
};
