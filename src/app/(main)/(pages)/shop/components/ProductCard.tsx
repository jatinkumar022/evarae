'use client';
import { useEffect, useState } from 'react';
import { Heart } from '@/app/(main)/assets/Navbar';
import { Product } from '@/lib/types/product';
import Image from 'next/image';
import { GiCrystalShine } from 'react-icons/gi';
import { motion, AnimatePresence } from 'framer-motion';
import { Cart } from '@/app/(main)/assets/Common';
import Link from 'next/link';
import { useCartStore } from '@/lib/data/mainStore/cartStore';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const addToCart = useCartStore(s => s.add);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 1024); // lg breakpoint
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  const variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product?.id) return;
    const optimisticProduct = {
      _id: product.id,
      id: product.id,
      name: product.name,
      price: product.price ?? 0,
      discountPrice: product.price ?? 0,
      images: product.images as string[],
      thumbnail: (product.images?.[0] as string) || undefined,
      stockQuantity: product.stockCount ?? 1,
    };
    // fire-and-forget add with optimistic UI
    addToCart({
      productSlug: String(product.id),
      quantity: 1,
      optimisticProduct,
    }).catch(() => {});
  };

  return (
    <Link href={`/product/${product.id}`} className="block h-full">
      <div
        className="relative w-full h-full rounded-lg overflow-hidden cursor-pointer border border-primary/10 flex flex-col group"
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
      >
        <div className="relative aspect-square w-full flex-shrink-0 overflow-hidden">
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

          <button
            className="absolute bottom-3 right-3 bg-white/50 backdrop-blur-sm cursor-pointer hover:bg-primary hover:text-white rounded-full sm:p-2 p-1.5 transition-all duration-300"
            aria-label={`Add ${product.name} to wishlist`}
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Heart className="sm:w-4 sm:h-4 w-3 h-3" />
          </button>
        </div>

        {product.isNew && (
          <span className="absolute top-0 right-0 best-seller-tag text-white text-[9px] sm:text-[11px] px-3 py-1 sm:py-1.5 rounded-tr-lg rounded-bl-lg uppercase font-semibold tracking-wide">
            <div className="flex items-center gap-1">
              <GiCrystalShine size={15} /> NEW
            </div>
          </span>
        )}
        {product.isSale && (
          <span className="absolute top-0 right-0 best-seller-tag text-white text-[9px] sm:text-[11px] px-3 py-1.5 rounded-tr-lg rounded-bl-lg uppercase font-semibold tracking-wide">
            <div className="flex items-center gap-1">
              <GiCrystalShine size={15} /> BEST SELLER
            </div>
          </span>
        )}

        <div className="flex-1 flex flex-col p-3 sm:p-4 gap-3">
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-primary-dark truncate text-xs sm:text-sm leading-tight mb-1">
              {product.name}
            </p>
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
                <button className="w-full bg-primary text-white py-2 px-3 rounded-md text-xs sm:text-sm font-medium hover:bg-primary-dark transition-colors">
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
            onClick={handleAddToCart}
            className="w-full bg-primary text-white py-2 px-3 rounded-md text-xs sm:text-sm  hover:bg-primary-dark transition-colors flex items-center justify-center gap-1"
          >
            <span className="text-accent">
              <Cart className="w-4 h-4 text-white" />
            </span>
            Add to Cart
          </button>
          {product.inStock && product.stockCount <= 3 && (
            <p className="text-xs text-primary font-medium text-center flex items-center gap-1 animate-caret-blink ">
              <span className="inline-block w-2 h-2 bg-primary rounded-full "></span>
              Only {product.stockCount} left!
            </p>
          )}
          <p className="text-xs text-primary font-medium text-center flex items-center gap-1 animate-caret-blink "></p>
        </div>
      </div>
    </Link>
  );
};
