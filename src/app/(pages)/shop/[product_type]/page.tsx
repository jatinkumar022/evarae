'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Filter, Heart, Loader2 } from 'lucide-react';
import Container from '@/app/components/layouts/Container';
import { ProductService } from '@/lib/services/productService';
import { Product, ProductFilters, Category } from '@/lib/types/product';
import { GiCrystalShine } from 'react-icons/gi';
import { useParams } from 'next/navigation';
import DailywearCarousel from '@/app/components/ads/DailywearCardsAd';
import {
  banglesCat,
  earringsCat,
  mangalsutraCat,
  pendantsCat,
} from '@/app/assets/CategoryGrid';
import ChooseYourLookSlider from '@/app/components/ads/ChooseYourLookSlider';

const productsAD = [
  {
    id: 'dw-earrings',
    name: 'Dailywear Earrings',
    image: earringsCat,
  },
  {
    id: 'dw-mangalsutra',
    name: 'Dailywear Mangalsutra',
    image: mangalsutraCat,
  },
  {
    id: 'dw-pendants',
    name: 'Dailywear Pendants',
    image: pendantsCat,
  },
  {
    id: 'dw-bangles',
    name: 'Dailywear Bangles',
    image: banglesCat,
  },
];

const sortOptions = [
  { value: 'best-matches', label: 'Best Matches' },
  { value: 'price-low-high', label: 'Price: Low to High' },
  { value: 'price-high-low', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popularity', label: 'Most Popular' },
];

interface ProductCardProps {
  product: Product;
  onWishlistToggle: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onWishlistToggle,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div
      className="relative w-full h-full rounded-xl overflow-hidden cursor-pointer bg-white border border-primary/10 hover:border-primary/30 transition-all duration-300 flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square w-full flex-shrink-0">
        <motion.div layout className="relative h-full w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={isHovered ? 'hover' : 'default'}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="h-full w-full"
            >
              <Image
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover aspect-square"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {product.isNew && (
        <span className="absolute top-3 left-3 best-seller-tag text-white text-[11px] px-3 py-1.5 rounded-tl-xl rounded-br-xl uppercase font-semibold tracking-wide">
          <div className="flex items-center gap-1">
            <GiCrystalShine size={15} /> NEW
          </div>
        </span>
      )}
      {product.isSale && (
        <span className="absolute top-3 left-3 best-seller-tag text-white text-[11px] px-3 py-1.5 rounded-tl-xl rounded-br-xl uppercase font-semibold tracking-wide">
          <div className="flex items-center gap-1">
            <GiCrystalShine size={15} /> BEST SELLER
          </div>
        </span>
      )}

      <button
        onClick={() => onWishlistToggle(product.id)}
        className={`absolute top-3 right-3 bg-white/50 backdrop-blur-sm cursor-pointer hover:bg-primary hover:text-white rounded-full p-2 transition-all duration-300 ${
          product.isWishlisted ? 'bg-primary text-white' : ''
        }`}
        aria-label={`Add ${product.name} to wishlist`}
      >
        <Heart
          className={`w-4 h-4 ${product.isWishlisted ? 'fill-current' : ''}`}
        />
      </button>

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

export default function ProductListingPage() {
  const params = useParams();
  const productType = params.product_type as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('best-matches');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({});
  const [totalResults, setTotalResults] = useState(0);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const filterOptions = {
    priceRanges: [
      { label: 'Under ₹25,000', value: '0-25000', min: 0, max: 25000 },
      {
        label: '₹25,000 - ₹50,000',
        value: '25000-50000',
        min: 25000,
        max: 50000,
      },
      {
        label: '₹50,000 - ₹1,00,000',
        value: '50000-100000',
        min: 50000,
        max: 100000,
      },
      { label: 'Above ₹1,00,000', value: '100000+', min: 100000, max: 999999 },
    ],
    materials: [
      { label: 'Gold', value: 'gold' },
      { label: 'Silver', value: 'silver' },
      { label: 'Platinum', value: 'platinum' },
      { label: 'Diamond', value: 'diamond' },
      { label: 'Pearl', value: 'pearl' },
      { label: 'Crystal', value: 'crystal' },
    ],
    occasions: [
      { label: 'Wedding', value: 'wedding' },
      { label: 'Everyday', value: 'everyday' },
      { label: 'Party', value: 'party' },
      { label: 'Traditional', value: 'traditional' },
      { label: 'Modern', value: 'modern' },
      { label: 'Gifting', value: 'gifting' },
    ],
    availability: [
      { label: 'In Stock', value: 'inStock' },
      { label: 'New Arrivals', value: 'new' },
      { label: 'On Sale', value: 'sale' },
      { label: 'Best Sellers', value: 'featured' },
    ],
  };

  const handleFilterToggle = (filterType: string, value: string) => {
    setActiveFilters(prev => {
      const filterKey = `${filterType}-${value}`;
      if (prev.includes(filterKey)) {
        return prev.filter(f => f !== filterKey);
      } else {
        return [...prev, filterKey];
      }
    });
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
  };

  const handleWishlistToggle = (productId: string) => {
    setProducts(prev =>
      prev.map(product =>
        product.id === productId
          ? { ...product, isWishlisted: !product.isWishlisted }
          : product
      )
    );
  };

  const loadMoreProducts = async () => {
    if (loadingMore || !hasMoreProducts) return;

    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const response = await ProductService.getProductsByCategory(
        productType,
        filters,
        sortBy,
        nextPage,
        12
      );

      if (response.products.length > 0) {
        setProducts(prev => [...prev, ...response.products]);
        setCurrentPage(nextPage);
        setHasMoreProducts(response.hasNextPage);
      } else {
        setHasMoreProducts(false);
      }
    } catch (err) {
      console.error('Failed to load more products:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const renderProductsWithBanners = () => {
    const items: React.ReactNode[] = [];

    products.forEach((product, index) => {
      items.push(
        <div key={product.id} className="h-full">
          <ProductCard
            product={product}
            onWishlistToggle={handleWishlistToggle}
          />
        </div>
      );

      if (index === 5) {
        items.push(
          <div
            key="ad-1"
            className="h-full col-span-1 sm:col-span-2 items-center flex"
          >
            <DailywearCarousel products={productsAD} />
          </div>
        );
      }

      if (index === 15) {
        items.push(
          <div key="ad-2" className="h-full col-span-1 sm:col-span-2">
            <ChooseYourLookSlider
              products={[
                { id: '1', name: 'Office Look', image: banglesCat },
                { id: '2', name: 'Modern Look', image: earringsCat },
                { id: '3', name: 'Classic Look', image: mangalsutraCat },
                { id: '4', name: 'Casual Look', image: pendantsCat },
                { id: '5', name: 'Evening Look', image: banglesCat },
              ]}
            />
          </div>
        );
      }

      if (index === 26) {
        items.push(
          <div key="ad-3" className="h-full col-span-1">
            {/* <DailywearCardsAd /> */}
          </div>
        );
      }
    });

    return items;
  };

  useEffect(() => {
    const fetchData = async () => {
      const startTime = performance.now();
      try {
        setLoading(true);
        setError(null);

        const categoryData = await ProductService.getCategory(productType);
        if (!categoryData) {
          setError('Category not found');
          return;
        }
        setCategory(categoryData);

        const response = await ProductService.getProductsByCategory(
          productType,
          filters,
          sortBy,
          1,
          12
        );

        setProducts(response.products);
        setTotalResults(response.totalCount);
        setHasMoreProducts(response.hasNextPage);

        const endTime = performance.now();
        console.log(`Data fetched in ${endTime - startTime}ms`);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load products'
        );
      } finally {
        setLoading(false);
      }
    };

    if (productType) {
      fetchData();
    }
  }, [productType, filters, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-lg text-muted-foreground">
            Loading products...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Container>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Link
            href="/"
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Container>
        <nav className="py-4 sm:py-6 text-xs sm:text-sm text-primary-dark">
          <div className="flex items-center gap-1 sm:gap-2">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-primary-dark">
              {category?.name || productType}
            </span>
          </div>
        </nav>

        <div className="heading-component-main-container mb-6 sm:mb-8">
          <h1 className="heading-component-main-heading text-lg sm:text-xl md:text-2xl lg:text-3xl">
            {category?.name || productType}
          </h1>
          <h2 className="heading-component-main-subheading text-sm sm:text-base">
            ({totalResults} results)
          </h2>
        </div>

        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1 sm:gap-2 bg-white border border-primary text-primary px-3 sm:px-4 py-2 rounded-full hover:bg-primary hover:text-white transition-colors text-sm"
              >
                <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Filter</span>
                <ChevronRight
                  className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${
                    showFilters ? 'rotate-90' : ''
                  }`}
                />
              </button>

              {activeFilters.length > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs sm:text-sm text-accent hover:text-primary-dark transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-primary-dark text-xs sm:text-sm">
                Sort By:
              </span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-primary rounded-full px-3 sm:px-4 py-2 pr-6 sm:pr-8 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronRight className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-primary pointer-events-none rotate-90" />
              </div>
            </div>
          </div>

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
              {activeFilters.map(filter => (
                <span
                  key={filter}
                  className="inline-flex items-center gap-1 sm:gap-2 bg-primary/10 text-primary px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm"
                >
                  {filter.split('-')[1]}
                  <button
                    onClick={() =>
                      handleFilterToggle(
                        filter.split('-')[0],
                        filter.split('-')[1]
                      )
                    }
                    className="hover:text-primary-dark"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-bg-cart rounded-xl border border-primary/20 p-4 sm:p-6 mb-6"
            >
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="font-semibold text-primary-dark mb-2 sm:mb-3 text-sm sm:text-base">
                    Price Range
                  </h3>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {filterOptions.priceRanges.map(range => (
                      <button
                        key={range.value}
                        onClick={() => handleFilterToggle('price', range.value)}
                        className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm border transition-colors ${
                          activeFilters.includes(`price-${range.value}`)
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-primary-dark border-primary/30 hover:border-primary'
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-primary-dark mb-2 sm:mb-3 text-sm sm:text-base">
                    Material
                  </h3>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {filterOptions.materials.map(material => (
                      <button
                        key={material.value}
                        onClick={() =>
                          handleFilterToggle('material', material.value)
                        }
                        className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm border transition-colors ${
                          activeFilters.includes(`material-${material.value}`)
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-primary-dark border-primary/30 hover:border-primary'
                        }`}
                      >
                        {material.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-primary-dark mb-2 sm:mb-3 text-sm sm:text-base">
                    Occasion
                  </h3>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {filterOptions.occasions
                      .slice(0, showMoreFilters ? undefined : 4)
                      .map(occasion => (
                        <button
                          key={occasion.value}
                          onClick={() =>
                            handleFilterToggle('occasion', occasion.value)
                          }
                          className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm border transition-colors ${
                            activeFilters.includes(`occasion-${occasion.value}`)
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-primary-dark border-primary/30 hover:border-primary'
                          }`}
                        >
                          {occasion.label}
                        </button>
                      ))}
                  </div>
                  {filterOptions.occasions.length > 4 && (
                    <button
                      onClick={() => setShowMoreFilters(!showMoreFilters)}
                      className="text-xs sm:text-sm text-accent hover:text-primary-dark transition-colors mt-2"
                    >
                      {showMoreFilters ? 'Show Less' : 'Show More'}
                    </button>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-primary-dark mb-2 sm:mb-3 text-sm sm:text-base">
                    Availability
                  </h3>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {filterOptions.availability.map(availability => (
                      <button
                        key={availability.value}
                        onClick={() =>
                          handleFilterToggle('availability', availability.value)
                        }
                        className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm border transition-colors ${
                          activeFilters.includes(
                            `availability-${availability.value}`
                          )
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-primary-dark border-primary/30 hover:border-primary'
                        }`}
                      >
                        {availability.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 items-center">
          {renderProductsWithBanners()}
        </div>

        <div className="text-center mt-8 sm:mt-12">
          {hasMoreProducts ? (
            <button
              onClick={loadMoreProducts}
              disabled={loadingMore}
              className="btn btn-filled disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base px-6 sm:px-8 py-2 sm:py-3"
            >
              {loadingMore ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Loading...</span>
                </div>
              ) : (
                'Load More Products'
              )}
            </button>
          ) : (
            <p className="text-primary-dark/70 text-sm sm:text-base">
              No more products to load
            </p>
          )}
        </div>
      </Container>
    </div>
  );
}
