'use client';
import { useState, useEffect } from 'react';
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
import Image from 'next/image';

import Link from 'next/link';
import { FilterOptions, SortOption } from '@/lib/types/product';
import ProductFilters from '@/app/(main)/components/filters/ProductFilters';
import { ringsProducts } from '@/lib/data/products';
import { ProductCard } from '../shop/components/ProductCard';
import Container from '@/app/(main)/components/layouts/Container';

// Main Component
export default function EnhancedNewArrivalsPage() {
  const [timeRemaining, setTimeRemaining] = useState({
    hours: 23,
    minutes: 45,
    seconds: 30,
  });

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const [filteredProducts, setFilteredProducts] = useState(ringsProducts);
  const [visibleProducts, setVisibleProducts] = useState(10);

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

  const handleLoadMore = () => {
    setVisibleProducts(prev => prev + 10);
  };

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
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[80vh] py-20">
            {/* Left Content */}
            <div className="text-left lg:pr-8">
              {/* New Badge */}
              <div className="flex items-center gap-3 mb-8">
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md border border-white/40 rounded-full px-6 py-3 shadow-lg">
                  <Sparkles className="w-4 h-4 text-[var(--color-primary)] animate-bounce" />
                  <span className="font-medium text-sm tracking-widest uppercase text-[var(--color-primary)]">
                    Fresh Arrivals
                  </span>
                  <Sparkles className="w-4 h-4 text-[var(--color-primary)] animate-bounce delay-300" />
                </div>
              </div>

              {/* Main Heading */}
              <h1
                className="text-4xl md:text-6xl font-semibold mb-6 leading-tight font-heading"
                style={{ color: 'var(--text-heading)' }}
              >
                Discover Our
                <span className="block bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] bg-clip-text text-transparent">
                  Latest Collection
                </span>
              </h1>

              <div
                className="text-xl font-light mb-6 font-serif"
                style={{ color: 'var(--color-primary-dark)' }}
              >
                &ldquo;Where elegance meets affordability.&ldquo;
              </div>

              <p
                className="text-lg leading-relaxed mb-8 max-w-2xl"
                style={{ color: 'var(--text-primary)' }}
              >
                Explore our newest arrivals featuring exquisite imitation
                jewellery designs, premium finishes, and timeless elegance. Each
                piece is crafted to perfection for those who desire luxury at
                affordable prices.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button className="btn btn-filled !px-6 !py-4 flex items-center gap-3 justify-center group !font-medium !text-base !font-sans">
                  <Crown
                    className="w-6 h-6 group-hover:animate-pulse"
                    strokeWidth={1.5}
                  />
                  Explore Collection
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="btn btn-outline !px-6 !py-4 flex items-center gap-3 justify-center !font-medium !text-base !font-sans">
                  <Play className="w-5 h-5" strokeWidth={1.5} />
                  Watch Showcase
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <Award
                    className="w-8 h-8 mx-auto mb-2 text-[var(--color-primary)]"
                    strokeWidth={1.5}
                  />
                  <div
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-heading)' }}
                  >
                    Premium Quality
                  </div>
                </div>
                <div className="text-center">
                  <Truck
                    className="w-8 h-8 mx-auto mb-2 text-[var(--color-primary)]"
                    strokeWidth={1.5}
                  />
                  <div
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-heading)' }}
                  >
                    Free Shipping
                  </div>
                </div>
                <div className="text-center">
                  <Shield
                    className="w-8 h-8 mx-auto mb-2 text-[var(--color-primary)]"
                    strokeWidth={1.5}
                  />
                  <div
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-heading)' }}
                  >
                    Secure Shopping
                  </div>
                </div>
                <div className="text-center">
                  <Users
                    className="w-8 h-8 mx-auto mb-2 text-[var(--color-primary)]"
                    strokeWidth={1.5}
                  />
                  <div
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-heading)' }}
                  >
                    10K+ Customers
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Featured Products Showcase */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-6">
                {ringsProducts.slice(0, 3).map((product, index) => (
                  <div
                    key={product.id}
                    className={`relative group cursor-pointer ${
                      index === 0 ? 'col-span-2' : ''
                    }`}
                  >
                    <div className="aspect-square overflow-hidden rounded-2xl bg-white shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-black/0  transition-all duration-300" />
                      <div className="absolute bottom-4 left-4 right-4 transform translate-y-8 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all z-50">
                        <div className="bg-black/20 backdrop-blur-md rounded-xl p-4">
                          <h4 className="font-medium text-white mb-1">
                            {product.name}
                          </h4>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-medium text-white">
                              ₹{product.price?.toLocaleString()}
                            </span>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-white">
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
              <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="text-center">
                  <div className="text-3xl font-medium text-[var(--color-primary)] mb-1">
                    24+
                  </div>
                  <div className="text-sm text-gray-600">New This Week</div>
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
        className="text-white py-4 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Timer className="w-6 h-6 text-yellow-300 animate-pulse" />
              <div>
                <span className="font-medium text-lg">
                  Limited Time: Up to 40% OFF
                </span>
                <span className="ml-4 text-pink-100">
                  on New Arrivals Collection
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-yellow-300 font-medium">Ends in:</span>
              <div className="flex items-center gap-2">
                <div className="bg-white/20 px-3 py-1 rounded-lg font-mono font-medium">
                  {timeRemaining.hours.toString().padStart(2, '0')}h
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-lg font-mono font-medium">
                  {timeRemaining.minutes.toString().padStart(2, '0')}m
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-lg font-mono font-medium">
                  {timeRemaining.seconds.toString().padStart(2, '0')}s
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Product Section */}
      <div className="py-20" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="py-4 sm:py-6 text-xs sm:text-sm">
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

          <div className="font-heading my-6 sm:my-8 md:flex justify-center items-center gap-2 flex-col text-accent">
            <h1 className="text-2xl lg:text-3xl">New Arrivals</h1>
            <h2 className="text-sm sm:text-base">
              ({ringsProducts.length} results)
            </h2>
          </div>

          <ProductFilters
            products={ringsProducts}
            filterOptions={filterOptions}
            sortOptions={sortOptions}
            onFiltersChange={setFilteredProducts}
          >
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 items-center">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
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
        </div>
      </div>

      {/* Instagram Section */}
      <div className="py-20" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="font-heading my-6 sm:my-8 md:flex justify-center items-center gap-2 flex-col text-accent">
              <h1 className="text-2xl lg:text-3xl">Follow Our Journey</h1>
              <h2 className="text-sm sm:text-base">
                Get inspired by our community and see how our jewelry looks in
                real life
              </h2>
            </div>

            <Link
              href={'https://www.instagram.com/caelvi.store'}
              target="_blank"
              className="flex items-center justify-center gap-2   text-primary"
            >
              <Instagram className="w-4 h-4" />
              CAELVISTORE
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, index) => (
              <div
                key={index}
                className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-[var(--bg-cart)] to-[var(--bg-menu)] group cursor-pointer"
              >
                <Image
                  src={worldOne}
                  alt={`Instagram post ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="btn btn-outline !px-8 !py-4 flex items-center gap-3 mx-auto ">
              <Instagram className="w-5 h-5" />
              Follow Us on Instagram
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
