import { Heart } from '@/app/assets/Navbar';
import { Product } from '@/lib/types/product';
import Image from 'next/image';
import { GiCrystalShine } from 'react-icons/gi';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden cursor-pointer bg-white border border-primary/10 hover:border-primary/30 transition-all duration-300 flex flex-col">
      <div className="relative aspect-square w-full flex-shrink-0 ">
        <Image
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover aspect-square"
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
          priority={false}
        />
        <button
          className="absolute bottom-3 right-3 bg-white/50 backdrop-blur-sm cursor-pointer hover:bg-primary hover:text-white rounded-full p-2 transition-all duration-300"
          aria-label={`Add ${product.name} to wishlist`}
        >
          <Heart className="w-4 h-4" />
        </button>
      </div>

      {product.isNew && (
        <span className="absolute top-0 right-0 best-seller-tag text-white text-[11px] px-3 py-1.5 rounded-tr-xl rounded-bl-xl uppercase font-semibold tracking-wide">
          <div className="flex items-center gap-1">
            <GiCrystalShine size={15} /> NEW
          </div>
        </span>
      )}
      {product.isSale && (
        <span className="absolute top-0 right-0 best-seller-tag text-white text-[11px] px-3 py-1.5 rounded-tr-xl rounded-bl-xl uppercase font-semibold tracking-wide">
          <div className="flex items-center gap-1">
            <GiCrystalShine size={15} /> BEST SELLER
          </div>
        </span>
      )}

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="flex-1 text-left">
            <p className="font-medium text-primary-dark truncate mb-2">
              {product.name}
            </p>
            {product.price ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-base font-semibold text-accent">
                    ₹{product.price.toLocaleString()}
                  </p>
                  {product.originalPrice &&
                    product.originalPrice > product.price && (
                      <p className="text-xs text-primary-dark line-through">
                        ₹{product.originalPrice.toLocaleString()}
                      </p>
                    )}
                </div>
              </div>
            ) : (
              <button className="w-full bg-primary text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-primary-dark transition-colors">
                REQUEST STORE AVAILABILITY
              </button>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            {product.originalPrice &&
              product.price &&
              product.originalPrice > product.price && (
                <div className="inline-flex items-center gap-1 bg-accent/10 text-accent px-3 py-1.5 rounded-full text-xs font-bold">
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
              <p className="text-xs text-accent font-medium">
                Only {product.stockCount} left!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
