'use client';
import { useEffect, useState } from 'react';
import { Heart, Share2 } from 'lucide-react';
import Container from '@/app/(main)/components/layouts/Container';
import ProductFilters from '@/app/(main)/components/filters/ProductFilters';
import { FilterOptions, SortOption, Product } from '@/lib/types/product';
import { allProducts } from '@/lib/data/products';
import Image from 'next/image';
import { GiCrystalShine } from 'react-icons/gi';
import { motion, AnimatePresence } from 'framer-motion';
import { Cart } from '@/app/(main)/assets/Common';
import ProductOptionsModal from '@/app/(main)/components/ui/ProductOptionsModal';
import { useCartStore } from '@/lib/data/mainStore/cartStore';

// Combine all products from different categories
const allJewelleryProducts = [
  ...allProducts.rings,
  ...allProducts.earrings,
  ...allProducts.bangles,
  ...allProducts.bracelets,
  ...allProducts.chains,
  ...allProducts.mangalsutras,
  ...allProducts.pendants,
  ...allProducts.necklaces,
  ...allProducts.nosePins,
  ...allProducts.kadas,
  ...allProducts.engagementRings,
  ...allProducts.jhumkas,
];

export default function AllJewelleryPage() {
  const [filteredProducts, setFilteredProducts] =
    useState(allJewelleryProducts);
  const [visibleProducts, setVisibleProducts] = useState(10);
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const addToCart = useCartStore(s => s.add);

  // Detect screen size
  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 1024); // lg breakpoint
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  const handleAddToCart = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };
  const filterOptions: FilterOptions = {
    priceRanges: [
      { value: 'under-1k', label: 'Under ₹1,000' },
      { value: '1k-2k', label: '₹1,000 - ₹2,000' },
      { value: '2k-5k', label: '₹2,000 - ₹5,000' },
      { value: 'above-5k', label: 'Above ₹5,000' },
    ],
    materials: [
      'Brass Alloy (Gold Color)',
      'Copper Alloy (Gold Color)',
      'Zinc Alloy (Gold Color)',
      'Stainless Steel Alloy (Gold Tone)',
      'American Diamond (CZ)',
      'Crystal Stones',
      'Pearl Beads',
      'Oxidised Alloy',
    ],
    subcategories: [
      'Rings',
      'Earrings',
      'Bangles',
      'Bracelets',
      'Chains',
      'Mangalsutras',
      'Pendants',
      'Necklaces',
      'Nose Pins',
      'Kadas',
      'Engagement Rings',
      'Jhumkas',
      'Diamond Rings',
      'Gold Rings',
      'Crystal Rings',
      'Designer Rings',
      'Pearl Rings',
      'Diamond Earrings',
      'Gold Earrings',
      'Pearl Earrings',
      'Crystal Earrings',
      'Traditional Earrings',
      'Gold Bangles',
      'Diamond Bangles',
      'Crystal Bangles',
      'Designer Bangles',
      'Traditional Bangles',
      'Gold Bracelets',
      'Diamond Bracelets',
      'Crystal Bracelets',
      'Designer Bracelets',
      'Tennis Bracelets',
      'Gold Chains',
      'Diamond Chains',
      'Crystal Chains',
      'Designer Chains',
      'Traditional Chains',
      'Traditional Mangalsutras',
      'Diamond Mangalsutras',
      'Designer Mangalsutras',
      'Modern Mangalsutras',
      'Sacred Mangalsutras',
      'Diamond Pendants',
      'Gold Pendants',
      'Crystal Pendants',
      'Designer Pendants',
      'Traditional Pendants',
      'Diamond Necklaces',
      'Gold Necklaces',
      'Crystal Necklaces',
      'Designer Necklaces',
      'Traditional Necklaces',
      'Diamond Nose Pins',
      'Gold Nose Pins',
      'Crystal Nose Pins',
      'Designer Nose Pins',
      'Traditional Nose Pins',
      'Gold Kadas',
      'Diamond Kadas',
      'Designer Kadas',
      'Traditional Kadas',
      'Modern Kadas',
      'Diamond Engagement Rings',
      'Solitaire Engagement Rings',
      'Halo Engagement Rings',
      'Designer Engagement Rings',
      'Traditional Engagement Rings',
      'Gold Jhumkas',
      'Diamond Jhumkas',
      'Crystal Jhumkas',
      'Designer Jhumkas',
      'Traditional Jhumkas',
    ],
  };

  const sortOptions: SortOption[] = [
    { value: 'best-matches', label: 'Best Matches' },
    { value: 'price-low-high', label: 'Price: Low to High' },
    { value: 'price-high-low', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  const handleLoadMore = () => {
    setVisibleProducts(prev => prev + 10);
  };

  const displayedProducts = filteredProducts.slice(0, visibleProducts);
  const hasMoreProducts = visibleProducts < filteredProducts.length;
  const [isHovered, setIsHovered] = useState(false);

  const variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };
  return (
    <>
      <div className="relative overflow-hidden bg-gradient-to-br from-pink-50/80 via-rose-50/60 to-purple-50/40 backdrop-blur-sm">
        {/* Luxurious Floating Elements */}
        <div className="pointer-events-none absolute inset-0 z-0">
          {/* Main decorative orbs */}
          <div className="absolute top-20 left-1/4 w-32 h-32 bg-gradient-to-br from-pink-200/40 to-rose-300/30 rounded-full blur-3xl animate-pulse opacity-60" />
          <div
            className="absolute bottom-32 right-1/4 w-40 h-40 bg-gradient-to-br from-purple-200/30 to-pink-200/40 rounded-full blur-3xl animate-pulse opacity-40"
            style={{ animationDelay: '2s' }}
          />
          <div
            className="absolute top-1/2 left-1/6 w-24 h-24 bg-gradient-to-br from-rose-200/50 to-pink-300/30 rounded-full blur-2xl animate-pulse opacity-50"
            style={{ animationDelay: '1s' }}
          />

          {/* Subtle sparkle effects */}
          <div
            className="absolute top-1/3 right-1/3 w-3 h-3 bg-white rounded-full opacity-70 animate-pulse"
            style={{ animationDelay: '0.5s' }}
          />
          <div
            className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-pink-200 rounded-full opacity-60 animate-pulse"
            style={{ animationDelay: '1.5s' }}
          />
          <div
            className="absolute top-2/3 right-1/5 w-4 h-4 bg-gradient-to-br from-purple-200 to-transparent rounded-full opacity-40 animate-pulse"
            style={{ animationDelay: '2.5s' }}
          />
        </div>

        <div className="relative z-10">
          <div className="text-center pt-16 sm:pt-24 pb-16 sm:pb-24 px-6">
            {/* Main Heading */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center mb-8">
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent"></div>
                <div className="mx-4 w-3 h-3 rounded-full bg-gradient-to-br from-pink-300 to-rose-300"></div>
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent"></div>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-gray-800 mb-6 tracking-tight leading-tight">
                <span className="bg-gradient-to-r from-pink-500 via-rose-400 to-purple-500 bg-clip-text text-transparent">
                  My Wishlist
                </span>
              </h1>

              <div className="w-32 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent mx-auto mb-8"></div>

              <p className="text-gray-600 text-lg md:text-xl font-light max-w-3xl mx-auto leading-relaxed mb-8">
                Your carefully curated collection of exquisite jewelry pieces,
                each telling its own story of elegance
              </p>
            </div>

            {/* Luxury Badges */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm sm:text-base">
              <div className="flex items-center gap-3 bg-white/60 backdrop-blur-xl px-6 py-3 rounded-full shadow-lg border border-white/20 hover:bg-white/70 transition-all duration-300">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-400 to-rose-400"></div>
                <span className="font-light text-gray-700 tracking-wide">
                  {allJewelleryProducts.length} Precious Items
                </span>
              </div>
              <div className="flex items-center gap-3 bg-white/60 backdrop-blur-xl px-6 py-3 rounded-full shadow-lg border border-white/20 hover:bg-white/70 transition-all duration-300 cursor-pointer">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"></div>
                <span className="font-light text-gray-700 tracking-wide flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Share Collection
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
      </div>
      <Container>
        <ProductFilters
          products={allJewelleryProducts}
          filterOptions={filterOptions}
          sortOptions={sortOptions}
          onFiltersChange={setFilteredProducts}
        >
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 items-center">
            {displayedProducts.map((product, index) => (
              <div
                className="relative w-full h-full rounded-lg overflow-hidden cursor-pointer border border-primary/10 flex flex-col "
                onMouseEnter={() => !isMobile && setIsHovered(true)}
                onMouseLeave={() => !isMobile && setIsHovered(false)}
                key={index}
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
                  <div 
                    className="w-full bg-primary text-white py-2 px-3 rounded-md text-xs sm:text-sm hover:bg-primary-dark transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    onClick={() => handleAddToCart(product)}
                  >
                    <span className="text-accent">
                      <Cart className="w-4 h-4 text-white" />
                    </span>
                    Add to Cart
                  </div>
                  {product.inStock && product.stockCount !== undefined && product.stockCount < 10 && (
                    <p className="text-xs text-primary font-medium text-center flex items-center gap-1 animate-caret-blink ">
                      <span className="inline-block w-2 h-2 bg-primary rounded-full "></span>
                      Only {product.stockCount} left!
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {hasMoreProducts && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleLoadMore}
                className="btn btn-filled btn-animated"
              >
                Load More ({displayedProducts.length} of{' '}
                {filteredProducts.length})
              </button>
            </div>
          )}

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-primary-dark text-lg">
                No products match your filters.
              </p>
            </div>
          )}
        </ProductFilters>
      </Container>
      
      {/* Product Options Modal */}
      <ProductOptionsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
      />
    </>
  );
}
