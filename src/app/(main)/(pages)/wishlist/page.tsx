'use client';
import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Heart, Share2, Trash2 } from 'lucide-react';
import Container from '@/app/(main)/components/layouts/Container';
import { FilterOptions, SortOption, Product } from '@/lib/types/product';
import Image from 'next/image';
import { GiCrystalShine } from 'react-icons/gi';
import { motion, AnimatePresence } from 'framer-motion';
import { Cart } from '@/app/(main)/assets/Common';
import { useWishlistStore } from '@/lib/data/mainStore/wishlistStore';
import { useCartStore } from '@/lib/data/mainStore/cartStore';
import toastApi from '@/lib/toast';
import Link from 'next/link';

// Lazy load heavy components to reduce initial bundle size
const ProductFilters = dynamic(() => import('@/app/(main)/components/filters/ProductFilters'), {
  ssr: false,
});

const ProductOptionsModal = dynamic(() => import('@/app/(main)/components/ui/ProductOptionsModal'), {
  ssr: false,
});

export default function WishlistPage() {
  const { products: wishlistProducts, load: loadWishlist, remove: removeFromWishlist, status } = useWishlistStore();
  const { add: addToCart } = useCartStore();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [visibleProducts, setVisibleProducts] = useState(12);
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  // Load wishlist on mount
  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // Detect screen size
  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 1024);
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  // Map wishlist products to Product type
  const mappedProducts = useMemo(() => {
    return wishlistProducts.map((p): Product => ({
      id: String(p._id),
      name: p.name,
      description: '',
      price: p.discountPrice ?? p.price ?? null,
      originalPrice: p.price ?? null,
      currency: 'INR',
      images: p.images || [],
      hoverImage: p.images?.[1],
      category: {
        id: String(p.categories?.[0]?._id || p.categories?.[0] || ''),
        name: p.categories?.[0]?.name || '',
        slug: p.categories?.[0]?.slug || '',
        productCount: 0,
        isActive: true,
      },
      brand: 'Caelvi',
      material: p.material || '',
      colors: p.colors || [],
      inStock: (p.stockQuantity || 0) > 0,
      stockCount: p.stockQuantity || 0,
      rating: 0,
      reviews: 0,
      isNew: p.tags?.includes('new') || false,
      isSale: !!p.discountPrice,
      isWishlisted: true, // All products here are wishlisted
      isFeatured: false,
      tags: p.tags || [],
      sku: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }, [wishlistProducts]);

  // Update filtered products when mapped products change
  useEffect(() => {
    setFilteredProducts(mappedProducts);
  }, [mappedProducts]);

  // Generate filter options based on actual products
  const filterOptions: FilterOptions = useMemo(() => {
    const materials = new Set<string>();
    const subcategories = new Set<string>();
    const priceRanges = [
      { value: 'under-1k', label: 'Under ₹1,000' },
      { value: '1k-2k', label: '₹1,000 - ₹2,000' },
      { value: '2k-5k', label: '₹2,000 - ₹5,000' },
      { value: 'above-5k', label: 'Above ₹5,000' },
    ];

    mappedProducts.forEach(product => {
      if (product.material) materials.add(product.material);
      if (product.category.name) subcategories.add(product.category.name);
    });

    return {
      priceRanges,
      materials: Array.from(materials).sort(),
      subcategories: Array.from(subcategories).sort(),
    };
  }, [mappedProducts]);

  const sortOptions: SortOption[] = [
    { value: 'best-matches', label: 'Best Matches' },
    { value: 'price-low-high', label: 'Price: Low to High' },
    { value: 'price-high-low', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' },
  ];

  const handleLoadMore = () => {
    setVisibleProducts(prev => prev + 12);
  };

  const handleRemoveFromWishlist = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsRemoving(productId);
    try {
      await removeFromWishlist(productId);
      toastApi.success('Removed from wishlist', 'Product removed successfully');
    } catch (error) {
      toastApi.error('Failed to remove', 'Could not remove product from wishlist');
    } finally {
      setIsRemoving(null);
    }
  };

  const handleAddToCart = (product: Product, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const displayedProducts = filteredProducts.slice(0, visibleProducts);
  const hasMoreProducts = visibleProducts < filteredProducts.length;
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);

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
          <div className="absolute top-20 left-1/4 w-32 h-32 bg-gradient-to-br from-pink-200/40 to-rose-300/30 rounded-full blur-3xl animate-pulse opacity-60" />
          <div
            className="absolute bottom-32 right-1/4 w-40 h-40 bg-gradient-to-br from-purple-200/30 to-pink-200/40 rounded-full blur-3xl animate-pulse opacity-40"
            style={{ animationDelay: '2s' }}
          />
          <div
            className="absolute top-1/2 left-1/6 w-24 h-24 bg-gradient-to-br from-rose-200/50 to-pink-300/30 rounded-full blur-2xl animate-pulse opacity-50"
            style={{ animationDelay: '1s' }}
          />
        </div>

        <div className="relative z-10">
          <div className="text-center pt-16 sm:pt-24 pb-16 sm:pb-24 px-6">
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

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm sm:text-base">
              <div className="flex items-center gap-3 bg-white/60 backdrop-blur-xl px-6 py-3 rounded-full shadow-lg border border-white/20 hover:bg-white/70 transition-all duration-300">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-400 to-rose-400"></div>
                <span className="font-light text-gray-700 tracking-wide">
                  {wishlistProducts.length} Precious {wishlistProducts.length === 1 ? 'Item' : 'Items'}
                </span>
              </div>
              {wishlistProducts.length > 0 && (
                <div className="flex items-center gap-3 bg-white/60 backdrop-blur-xl px-6 py-3 rounded-full shadow-lg border border-white/20 hover:bg-white/70 transition-all duration-300 cursor-pointer">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"></div>
                  <span className="font-light text-gray-700 tracking-wide flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    Share Collection
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
      </div>

      <Container>
        {wishlistProducts.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Start adding products you love to your wishlist</p>
            <Link
              href="/all-jewellery"
              className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <ProductFilters
            products={mappedProducts}
            filterOptions={filterOptions}
            sortOptions={sortOptions}
            onFiltersChange={setFilteredProducts}
          >
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 items-center">
              {displayedProducts.map((product) => (
                <Link
                  href={`/product/${product.id}`}
                  key={product.id}
                  className="block h-full"
                >
                  <div
                    className="relative w-full h-full rounded-lg overflow-hidden cursor-pointer border border-primary/10 flex flex-col group"
                    onMouseEnter={() => !isMobile && setHoveredProductId(product.id)}
                    onMouseLeave={() => !isMobile && setHoveredProductId(null)}
                  >
                    <div className="relative aspect-square w-full flex-shrink-0 overflow-hidden">
                      <motion.div layout className="relative w-full h-full">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={hoveredProductId === product.id ? 'hover' : 'default'}
                            variants={variants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="w-full h-full"
                          >
                            <Image
                              src={
                                hoveredProductId === product.id && product.hoverImage
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
                        className="absolute bottom-3 right-3 bg-white/50 backdrop-blur-sm cursor-pointer hover:bg-red-500 hover:text-white rounded-full sm:p-2 p-1.5 transition-all duration-300 z-10"
                        aria-label={`Remove ${product.name} from wishlist`}
                        onClick={(e) => handleRemoveFromWishlist(product.id, e)}
                        disabled={isRemoving === product.id}
                      >
                        {isRemoving === product.id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                        ) : (
                          <Trash2 className="sm:w-4 sm:h-4 w-3 h-3" />
                        )}
                      </button>
                    </div>

                    {product.isNew && (
                      <span className="absolute top-0 right-0 best-seller-tag text-white text-[9px] sm:text-[11px] px-3 py-1 sm:py-1.5 rounded-tr-lg rounded-bl-lg uppercase font-semibold tracking-wide z-10">
                        <div className="flex items-center gap-1">
                          <GiCrystalShine size={15} /> NEW
                        </div>
                      </span>
                    )}
                    {product.isSale && (
                      <span className="absolute top-0 right-0 best-seller-tag text-white text-[9px] sm:text-[11px] px-3 py-1.5 rounded-tr-lg rounded-bl-lg uppercase font-semibold tracking-wide z-10">
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
                            <div className="flex items-center gap-2">
                              <p className="text-sm sm:text-base font-bold text-accent">
                                ₹{product.price.toLocaleString()}
                              </p>
                              {product.originalPrice && product.originalPrice > product.price && (
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

                          {product.originalPrice && product.price && product.originalPrice > product.price && (
                            <div className="text-xs sm:text-sm text-primary-dark">
                              Flat{' '}
                              {Math.round(
                                ((product.originalPrice - product.price) / product.originalPrice) * 100
                              )}
                              % off
                            </div>
                          )}
                        </div>
                      </div>
                      <div
                        className="w-full bg-primary text-white py-2 px-3 rounded-md text-xs sm:text-sm hover:bg-primary-dark transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        onClick={(e) => handleAddToCart(product, e)}
                      >
                        <span className="text-accent">
                          <Cart className="w-4 h-4 text-white" />
                        </span>
                        Add to Cart
                      </div>
                      {product.inStock && product.stockCount !== undefined && product.stockCount < 10 && (
                        <p className="text-xs text-primary font-medium text-center flex items-center gap-1 animate-caret-blink">
                          <span className="inline-block w-2 h-2 bg-primary rounded-full"></span>
                          Only {product.stockCount} left!
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {hasMoreProducts && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleLoadMore}
                  className="btn btn-filled btn-animated"
                >
                  Load More ({displayedProducts.length} of {filteredProducts.length})
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
        )}
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
