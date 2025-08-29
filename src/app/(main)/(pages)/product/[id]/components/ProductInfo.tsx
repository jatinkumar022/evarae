'use client';
import { useState, useEffect } from 'react';
import { Product } from '@/lib/types/product';
import {
  Star,
  StarHalf,
  Truck,
  Shield,
  RotateCcw,
  Heart,
  Lock,
  Award,
} from 'lucide-react';
import { Cart } from '@/app/(main)/assets/Common';
import CustomSelect from '@/app/(main)/components/filters/CustomSelect';
import { ringsCat } from '@/app/(main)/assets/CategoryGrid';
import Image from 'next/image';
interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState('default');
  const [isStickyVisible, setIsStickyVisible] = useState(false);

  // Mock variants - in real app, this would come from product data
  const variants = [
    { id: 'default', name: 'Default', color: '#FFD700' },
    { id: 'rose-gold', name: 'Rose Gold', color: '#B76E79' },
    { id: 'white-gold', name: 'White Gold', color: '#F5F5DC' },
    { id: 'platinum', name: 'Platinum', color: '#E5E4E2' },
  ];

  // Sticky cart visibility on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsStickyVisible(scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.stockCount) {
      setQuantity(newQuantity);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <StarHalf
          key="half"
          className="w-4 h-4 fill-yellow-400 text-yellow-400"
        />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }

    return stars;
  };

  return (
    <>
      <div className="space-y-4 lg:space-y-6">
        {/* Product Title and Brand */}
        <div>
          <h1 className="text-xl lg:text-2xl xl:text-3xl font-heading font-semibold text-dark mb-1 lg:mb-2">
            {product.name}
          </h1>
          <p className=" font-medium text-accent tracking-wider uppercase text-sm">
            by {product.brand}
          </p>
        </div>

        {/* Rating and Reviews */}
        <div className="flex items-center gap-3 lg:gap-4 flex-wrap">
          <div className="flex items-center gap-1">
            {renderStars(product.rating)}
          </div>
          <span className="text-sm text-dark">
            {product.rating} ({product.reviews} reviews)
          </span>
          <span className="text-sm text-primary hidden sm:inline">|</span>
          <span className="text-sm text-dark">Write a review</span>
        </div>

        {/* Price Section */}
        <div className="space-y-2">
          {product.price ? (
            <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
              <span className="text-2xl lg:text-3xl font-bold ">
                ₹{product.price.toLocaleString()}
              </span>
              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <>
                    <span className="text-lg lg:text-xl text-primary line-through">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                    <span className="text-sm text-primary font-medium bg-primary/10 px-2 py-1 rounded">
                      {Math.round(
                        ((product.originalPrice - product.price) /
                          product.originalPrice) *
                          100
                      )}
                      % OFF
                    </span>
                  </>
                )}
            </div>
          ) : (
            <div className="text-center">
              <button className="w-full bg-primary text-white py-3 px-6 rounded-md text-base lg:text-lg font-medium hover:bg-primary-dark transition-colors">
                REQUEST STORE AVAILABILITY
              </button>
            </div>
          )}
        </div>

        {/* Variant Selector */}
        <div className="space-y-2 lg:space-y-3">
          <label className="block text-sm font-medium text-primary-dark">
            Select Color / Metal
          </label>

          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
            {variants.map(variant => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant.id)}
                className={`relative rounded-lg overflow-hidden border transition-all duration-200 ${
                  selectedVariant === variant.id
                    ? 'border-primary ring-2 ring-primary/30'
                    : 'border-gray-200 hover:border-primary/40'
                }`}
              >
                <Image
                  src={ringsCat}
                  alt={variant.name}
                  className=" h-14 object-cover"
                />
                <span className="absolute bottom-0 inset-x-0 bg-white/80 text-[10px] font-medium text-primary-dark text-center px-1 py-0.5">
                  {variant.name}
                </span>
              </button>
            ))}
          </div>
        </div>
        {/* Quantity Selector */}
        {product.price && (
          <div className="space-y-2 lg:space-y-3">
            <label className="block text-sm font-medium text-primary-dark">
              Quantity
            </label>

            <CustomSelect
              options={Array.from({ length: product.stockCount }, (_, i) => ({
                label: `${i + 1}`,
                value: `${i + 1}`,
              }))}
              value={String(quantity)}
              onChange={val => handleQuantityChange(Number(val))}
              placeholder="Select quantity"
            />

            {product.inStock && (
              <p className="text-xs lg:text-sm text-primary-dark">
                {product.stockCount} items available
              </p>
            )}
          </div>
        )}
        {product.price && (
          <div className="space-y-2 lg:space-y-3">
            {/* Primary CTA - Buy Now */}
            <button className="w-full bg-primary text-white py-2 px-5 rounded-sm text-sm lg:text-base font-medium hover:bg-primary-dark transition-colors">
              Buy Now
            </button>

            {/* Row for secondary actions */}
            <div className="flex gap-2">
              <button className="flex-1 bg-accent text-white py-2 px-5 rounded-sm text-sm lg:text-base font-medium hover:bg-accent/90 transition-colors flex items-center justify-center gap-2">
                <Cart className="w-4 h-4" />
                Add to Cart
              </button>
              <button className="flex-1 border border-primary/40 text-primary py-2 px-5 rounded-sm text-sm lg:text-base font-medium hover:bg-primary hover:!text-white transition-colors flex items-center justify-center gap-2 ">
                <Heart className="w-4 h-4" />
                Wishlist
              </button>
            </div>
          </div>
        )}

        {/* Trust Badges */}
        <div className="bg-gray-50 rounded-lg p-3 lg:p-4 space-y-2 lg:space-y-3">
          <div className="flex items-center gap-2 lg:gap-3 text-xs lg:text-sm text-dark">
            <Lock className="w-4 h-4 lg:w-5 lg:h-5 text-gray-500 flex-shrink-0" />
            <span>Secure Payment</span>
          </div>
          <div className="flex items-center gap-2 lg:gap-3 text-xs lg:text-sm text-dark">
            <Truck className="w-4 h-4 lg:w-5 lg:h-5 text-gray-500 flex-shrink-0" />
            <span>Free shipping on orders above ₹10,000</span>
          </div>
          <div className="flex items-center gap-2 lg:gap-3 text-xs lg:text-sm text-dark">
            <Shield className="w-4 h-4 lg:w-5 lg:h-5 text-gray-500 flex-shrink-0" />
            <span>100% Authentic products with certification</span>
          </div>
          <div className="flex items-center gap-2 lg:gap-3 text-xs lg:text-sm text-dark">
            <RotateCcw className="w-4 h-4 lg:w-5 lg:h-5 text-gray-500 flex-shrink-0" />
            <span>30-day return policy</span>
          </div>
          <div className="flex items-center gap-2 lg:gap-3 text-xs lg:text-sm text-dark">
            <Award className="w-4 h-4 lg:w-5 lg:h-5 text-gray-500 flex-shrink-0" />
            <span>Lifetime warranty</span>
          </div>
        </div>

        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {product.tags.map(tag => (
              <span
                key={tag}
                className="px-2 lg:px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Sticky Mobile Cart Bar */}
      {isStickyVisible && product.price && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 lg:p-4 z-50 md:hidden">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary-dark truncate">
                {product.name}
              </p>
              <p className="text-base lg:text-lg font-bold text-accent">
                ₹{product.price.toLocaleString()}
              </p>
            </div>
            <button className="bg-primary text-white px-4 lg:px-6 py-2 lg:py-3 rounded-md font-medium hover:bg-primary-dark transition-colors whitespace-nowrap">
              Add to Cart
            </button>
          </div>
        </div>
      )}
    </>
  );
}
