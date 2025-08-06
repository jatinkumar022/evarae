'use client';
import { useState } from 'react';
import { Heart } from '@/app/assets/Navbar';
import { Product } from '@/lib/types/product';
import Image from 'next/image';
import { GiCrystalShine } from 'react-icons/gi';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);

  const variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <div
      className="relative w-full h-full rounded-lg overflow-hidden cursor-pointer border border-primary/10 flex flex-col group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
        <div className="flex flex-col gap-1 lg:items-center lg:text-center">
          <p className="font-semibold text-primary-dark truncate text-xs sm:text-sm leading-tight mb-1">
            {product.name}
          </p>
          {product.price ? (
            <div className="flex items-center gap-2 lg:justify-center">
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
        </div>
        <div className="flex flex-col w-full gap-2 lg:items-center">
          {product.originalPrice &&
            product.price &&
            product.originalPrice > product.price && (
              <div className="w-full inline-flex items-center gap-1 bg-accent/10 text-accent p-1.5 rounded-[5px] text-xs font-bold justify-center">
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
            <p className="text-xs text-primary font-medium text-center flex items-center gap-1 animate-caret-blink ">
              <span className="inline-block w-2 h-2 bg-primary rounded-full "></span>
              Only {product.stockCount} left!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
