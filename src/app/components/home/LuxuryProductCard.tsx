'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Heart, ShoppingBag, Star, Crown, Sparkles, Zap } from 'lucide-react';

interface LuxuryProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice: number;
    currency: string;
    images: any[];
    hoverImage: any;
    rating: number;
    reviews: number;
    isNew: boolean;
    isSale: boolean;
    isWishlisted: boolean;
    isFeatured: boolean;
    material: string;
    weight: number;
  };
  variant?: 'featured' | 'standard';
}

export default function LuxuryProductCard({
  product,
  variant = 'standard',
}: LuxuryProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(product.isWishlisted);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const discountPercentage = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-white to-gray-50/50 border border-primary/10 ${
        variant === 'featured' ? 'col-span-2 row-span-2' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container - Responsive Height */}
      <div className="relative overflow-hidden aspect-[4/5]">
        <Image
          src={isHovered ? product.hoverImage : product.images[0]}
          alt={product.name}
          fill
          className="object-cover transition-all duration-700 group-hover:scale-110"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNew && (
            <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              NEW
            </div>
          )}
          {product.isSale && (
            <div className="bg-gradient-to-r from-red-500 via-pink-500 to-[var(--color-primary)] text-white px-3 py-1.5 rounded-full text-xs font-bold">
              {discountPercentage}% OFF
            </div>
          )}
          {product.isFeatured && (
            <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
              <Crown className="w-3 h-3" />
              FEATURED
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
            onClick={() => setIsWishlisted(!isWishlisted)}
            className={`p-2 rounded-full backdrop-blur-md transition-all duration-300 ${
              isWishlisted
                ? 'bg-red-500 text-white'
                : 'bg-white/90 text-[var(--text-primary)] hover:bg-white'
            }`}
          >
            <Heart
              size={16}
              className="transition-all duration-300"
              fill={isWishlisted ? 'currentColor' : 'none'}
            />
          </button>
          <button className="p-2 rounded-full bg-white/90 text-[var(--text-primary)] hover:bg-white backdrop-blur-md transition-all duration-300">
            <ShoppingBag size={16} />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 space-y-3">
        {/* Top Section */}
        <div className="space-y-2">
          {/* Category & Rating */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wider bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-primary-dark)]/10 px-2 py-1 rounded-full">
              {product.material}
            </span>
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full w-fit">
              <Star size={12} className="fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                {product.rating} ({product.reviews})
              </span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="text-base font-bold text-[var(--text-heading)] leading-tight line-clamp-2">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-[var(--text-primary)] leading-relaxed line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* Bottom Section */}
        <div className="space-y-3">
          {/* Product Details */}
          <div className="flex items-center gap-2 text-xs text-[var(--text-primary)] bg-gray-50 px-3 py-2 rounded-lg">
            <Zap className="w-3 h-3 text-[var(--color-primary)]" />
            <span>Weight: {product.weight}g</span>
          </div>

          {/* Price Section */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-[var(--text-heading)]">
                  {formatPrice(product.price)}
                </span>
                {product.isSale && (
                  <span className="text-sm text-[var(--text-primary)] line-through opacity-70">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              {product.isSale && (
                <div className="text-xs text-green-600 font-semibold">
                  Save {formatPrice(product.originalPrice - product.price)}
                </div>
              )}
            </div>

            {/* Add to Cart Button */}
            <button className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white px-4 py-2 rounded-full text-sm font-semibold hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] transition-all duration-300">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
