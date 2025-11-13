'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  ChevronRight,
  Sparkles,
  Star,
  Crown,
  ArrowRight,
  Award,
  Truck,
  Shield,
  Users,
  Timer,
  Play,
  Instagram,
} from 'lucide-react';
import { worldOne } from '@/app/(main)/assets/Home/World';
import Image from '@/app/(main)/components/ui/FallbackImage';

import Link from 'next/link';
import {
  FilterOptions,
  SortOption,
  Product as UiProduct,
} from '@/lib/types/product';
import ProductFilters from '@/app/(main)/components/filters/ProductFilters';
import { ProductCard } from '../shop/components/ProductCard';
import Container from '@/app/(main)/components/layouts/Container';
import { useNewArrivalsStore, type NewArrivalProduct } from '@/lib/data/mainStore/newArrivalsStore';

type NewArrivalsTimer = {
  hours: number;
  minutes: number;
  seconds: number;
};

// Main Component
export default function EnhancedNewArrivalsPage() {
  const [timeRemaining, setTimeRemaining] = useState<NewArrivalsTimer>({
    hours: 23,
    minutes: 45,
    seconds: 30,
  });

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0)
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0)
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { products: newArrivalsProducts, fetchNewArrivals } = useNewArrivalsStore();
  const [filteredProducts, setFilteredProducts] = useState<UiProduct[]>([]);
  const [visibleProducts, setVisibleProducts] = useState(12);

  // Load new arrivals once on mount
  useEffect(() => {
    fetchNewArrivals();
  }, [fetchNewArrivals]);

  // Map new arrivals to UiProduct format
  const allProducts = useMemo(() => {
    if (!newArrivalsProducts || newArrivalsProducts.length === 0) return [];
    
    return newArrivalsProducts.map((p: NewArrivalProduct) => {
          const hasDiscount =
            p.discountPrice != null &&
            p.price != null &&
            p.discountPrice < p.price;
          const primaryImage = p.images?.[0] || '/favicon.ico';
          const secondaryImage = p.images?.[1];
          return {
            id: p.slug,
            name: p.name,
            description: p.description || '',
            price: hasDiscount ? p.discountPrice : p.price ?? null,
            originalPrice: hasDiscount ? p.price : null,
            currency: 'INR',
            images: secondaryImage
              ? [primaryImage, secondaryImage]
              : [primaryImage],
            hoverImage: secondaryImage,
            category: {
              id: p.categories?.[0]?._id || p.categories?.[0]?.slug || '',
              name: p.categories?.[0]?.name || '',
              slug: p.categories?.[0]?.slug || '',
              productCount: 0,
              isActive: true,
            },
            subcategory: '',
            brand: '',
            material: p.material || '',
            colors: p.colors || [],
            inStock: (p.status || 'active') === 'active',
            stockCount: p.stockQuantity ?? 0,
            rating: 0,
            reviews: 0,
            isNew: true,
            isSale: hasDiscount,
            isWishlisted: false,
            isFeatured: false,
            tags: p.tags || [],
            sku: p.sku || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as UiProduct;
    });
  }, [newArrivalsProducts]);

  // Update filtered products when allProducts changes
  useEffect(() => {
    setFilteredProducts(allProducts);
  }, [allProducts]);

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
      'Stainless Steel Alloy (Gold Tone)',
      'Zinc Alloy with American Diamond (CZ)',
      'Crystal Stone Alloy',
      'Alloy with Pearl Beads',
      'Oxidised Alloy',
    ],
    subcategories: [
      'American Diamond (CZ) Rings',
      'Crystal Rings',
      'Gold Color Alloy Rings',
      'Designer Statement Rings',
      'Pearl Bead Rings',
      'Oxidised Rings',
    ],
  };

  const sortOptions: SortOption[] = [
    { value: 'best-matches', label: 'Best Matches' },
    { value: 'price-low-high', label: 'Price: Low to High' },
    { value: 'price-high-low', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  const handleLoadMore = () => setVisibleProducts(prev => prev + 12);

  const displayedProducts = filteredProducts.slice(0, visibleProducts);
  const hasMoreProducts = visibleProducts < filteredProducts.length;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Enhanced Hero Section */}
      <div
        className="relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, var(--bg-cart) 0%, var(--bg-menu) 50%, var(--bg-cart) 100%)',
        }}
      >
        {/* Animated Background Elements */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <div
            className="absolute top-20 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-30 animate-pulse"
            style={{ backgroundColor: 'var(--color-primary)' }}
          />
          <div
            className="absolute bottom-20 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"
            style={{ backgroundColor: 'var(--color-primary-dark)' }}
          />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-yellow-400/20 to-pink-400/20 rounded-full blur-2xl animate-pulse delay-500" />
        </div>

        <Container className="relative z-10">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center min-h-[60vh] sm:min-h-[70vh] py-8 sm:py-12 lg:py-16">
            {/* Left Content */}
            <div className="text-left lg:pr-6">
              {/* New Badge */}
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <div className="flex items-center gap-1.5 sm:gap-2 bg-white/80 backdrop-blur-md border border-white/40 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 shadow-lg">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[var(--color-primary)] animate-bounce" />
                  <span className="font-medium text-xs sm:text-sm tracking-wider uppercase text-[var(--color-primary)]">
                    Fresh Arrivals
                  </span>
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[var(--color-primary)] animate-bounce delay-300" />
                </div>
              </div>

              {/* Main Heading */}
              <h1
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold mb-3 sm:mb-4 leading-tight font-heading"
                style={{ color: 'var(--text-heading)' }}
              >
                Discover Our
                <span className="block bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] bg-clip-text text-transparent">
                  Latest Collection
                </span>
              </h1>

              <div
                className="text-base sm:text-lg md:text-xl font-light mb-3 sm:mb-4 font-serif"
                style={{ color: 'var(--color-primary-dark)' }}
              >
                &ldquo;Where elegance meets affordability.&ldquo;
              </div>

              <p
                className="text-sm sm:text-base lg:text-lg leading-relaxed mb-4 sm:mb-6 max-w-2xl"
                style={{ color: 'var(--text-primary)' }}
              >
                Explore our newest arrivals featuring exquisite imitation
                jewellery designs, premium finishes, and timeless elegance. Each
                piece is crafted to perfection for those who desire luxury at
                affordable prices.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-6 sm:mb-8">
                <button className="btn btn-filled !px-4 !py-2 sm:!px-5 sm:!py-2.5 flex items-center gap-2 justify-center group !font-medium !text-sm sm:!text-base !font-sans">
                  <Crown
                    className="w-4 h-4 sm:w-5 sm:h-5 group-hover:animate-pulse"
                    strokeWidth={1.5}
                  />
                  Explore Collection
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="btn btn-outline !px-4 !py-2 sm:!px-5 sm:!py-2.5 flex items-center gap-2 justify-center !font-medium !text-sm sm:!text-base !font-sans">
                  <Play className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.5} />
                  Watch Showcase
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                <div className="text-center">
                  <Award
                    className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mx-auto mb-1 sm:mb-2 text-[var(--color-primary)]"
                    strokeWidth={1.5}
                  />
                  <div
                    className="text-xs sm:text-sm font-medium"
                    style={{ color: 'var(--text-heading)' }}
                  >
                    Premium Quality
                  </div>
                </div>
                <div className="text-center">
                  <Truck
                    className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mx-auto mb-1 sm:mb-2 text-[var(--color-primary)]"
                    strokeWidth={1.5}
                  />
                  <div
                    className="text-xs sm:text-sm font-medium"
                    style={{ color: 'var(--text-heading)' }}
                  >
                    Free Shipping
                  </div>
                </div>
                <div className="text-center">
                  <Shield
                    className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mx-auto mb-1 sm:mb-2 text-[var(--color-primary)]"
                    strokeWidth={1.5}
                  />
                  <div
                    className="text-xs sm:text-sm font-medium"
                    style={{ color: 'var(--text-heading)' }}
                  >
                    Secure Shopping
                  </div>
                </div>
                <div className="text-center">
                  <Users
                    className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mx-auto mb-1 sm:mb-2 text-[var(--color-primary)]"
                    strokeWidth={1.5}
                  />
                  <div
                    className="text-xs sm:text-sm font-medium"
                    style={{ color: 'var(--text-heading)' }}
                  >
                    10K+ Customers
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Featured Products Showcase */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                {allProducts.slice(0, 3).map((product: UiProduct, index: number) => (
                  <div
                    key={product.id}
                    className={`relative group cursor-pointer ${
                      index === 0 ? 'col-span-2' : ''
                    }`}
                  >
                    <div className="relative aspect-square overflow-hidden rounded-lg sm:rounded-xl lg:rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-100">
                      <Image
                        src={String(product.images[0] || '/favicon.ico')}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-black/0  transition-all duration-300" />
                      <div className="absolute bottom-2 sm:bottom-3 lg:bottom-4 left-2 sm:left-3 lg:left-4 right-2 sm:right-3 lg:right-4 transform translate-y-8 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all z-50">
                        <div className="bg-black/20 backdrop-blur-md rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4">
                          <h4 className="font-medium text-white mb-1 text-xs sm:text-sm lg:text-base">
                            {product.name}
                          </h4>
                          <div className="flex items-center justify-between">
                            <span className="text-sm sm:text-base lg:text-lg font-medium text-white">
                              ₹{product.price?.toLocaleString()}
                            </span>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                              <span className="text-xs sm:text-sm text-white">
                                {product.rating}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Floating Stats */}
              <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 lg:-top-6 lg:-right-6 bg-white rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-4 lg:p-6 border border-gray-100">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-medium text-[var(--color-primary)] mb-0.5 sm:mb-1">
                    24+
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">New This Week</div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Limited Time Offer Banner */}
      <div
        style={{
          background:
            'linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
        }}
        className="text-white py-2.5 sm:py-3 lg:py-4 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 sm:gap-3 lg:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              <Timer className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-300 animate-pulse flex-shrink-0" />
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
                <span className="font-medium text-sm sm:text-base lg:text-lg">
                  Limited Time: Up to 40% OFF
                </span>
                <span className="sm:ml-2 lg:ml-4 text-pink-100 text-xs sm:text-sm lg:text-base">
                  on New Arrivals Collection
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              <span className="text-yellow-300 font-medium text-xs sm:text-sm lg:text-base">Ends in:</span>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="bg-white/20 px-2 sm:px-2.5 lg:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg font-mono font-medium text-xs sm:text-sm">
                  {timeRemaining.hours.toString().padStart(2, '0')}h
                </div>
                <div className="bg-white/20 px-2 sm:px-2.5 lg:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg font-mono font-medium text-xs sm:text-sm">
                  {timeRemaining.minutes.toString().padStart(2, '0')}m
                </div>
                <div className="bg-white/20 px-2 sm:px-2.5 lg:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg font-mono font-medium text-xs sm:text-sm">
                  {timeRemaining.seconds.toString().padStart(2, '0')}s
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Product Section */}
      <div className="py-8 sm:py-12 lg:py-16" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          {/* Breadcrumb */}
          <nav className="py-2 sm:py-3 lg:py-4 text-xs sm:text-sm">
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/"
                prefetch={true}
                className="hover:text-primary transition-colors"
              >
                Home
              </Link>
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-primary-dark cursor-default">
                New Arrivals
              </span>
            </div>
          </nav>

          <div className="font-heading my-4 sm:my-5 lg:my-6 md:flex justify-center items-center gap-1.5 sm:gap-2 flex-col text-accent">
            <h1 className="text-xl sm:text-2xl lg:text-3xl">New Arrivals</h1>
            <h2 className="text-xs sm:text-sm lg:text-base">
              ({allProducts.length} results)
            </h2>
          </div>

          <ProductFilters
            products={allProducts}
            filterOptions={filterOptions}
            sortOptions={sortOptions}
            onFiltersChange={setFilteredProducts}
          >
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 items-center">
              {filteredProducts.slice(0, visibleProducts).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {hasMoreProducts && (
              <div className="flex justify-center mt-6 sm:mt-8">
                <button
                  onClick={handleLoadMore}
                  className="btn btn-filled btn-animated !px-4 !py-2 sm:!px-5 sm:!py-2.5 !text-sm sm:!text-base"
                >
                  Load More ({displayedProducts.length} of{' '}
                  {filteredProducts.length})
                </button>
              </div>
            )}

            {filteredProducts.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <p className="text-primary-dark text-sm sm:text-base lg:text-lg">
                  No products match your filters.
                </p>
              </div>
            )}
          </ProductFilters>
        </div>
      </div>

      {/* Instagram Section */}
      <div className="py-12 sm:py-16 lg:py-20" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <div className="font-heading my-4 sm:my-5 lg:my-6 md:flex justify-center items-center gap-1.5 sm:gap-2 flex-col text-accent">
              <h1 className="text-xl sm:text-2xl lg:text-3xl">Follow Our Journey</h1>
              <h2 className="text-xs sm:text-sm lg:text-base">
                Get inspired by our community and see how our jewelry looks in
                real life
              </h2>
            </div>

            <Link
              href={'https://www.instagram.com/caelvi.store'}
              target="_blank"
              className="flex items-center justify-center gap-2 text-primary text-sm sm:text-base"
            >
              <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              CAELVISTORE
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
            {[...Array(12)].map((_, index) => (
              <div
                key={index}
                className="aspect-square rounded-lg sm:rounded-xl overflow-hidden bg-gradient-to-br from-[var(--bg-cart)] to-[var(--bg-menu)] group cursor-pointer"
              >
                <Image
                  src={worldOne}
                  alt={`Instagram post ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-10 lg:mt-12">
            <button className="btn btn-outline !px-5 !py-2.5 sm:!px-6 sm:!py-3 lg:!px-8 lg:!py-4 flex items-center gap-2 sm:gap-3 mx-auto !text-sm sm:!text-base">
              <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
              Follow Us on Instagram
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
