'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Search, Grid3X3, List, ArrowLeft, ChevronRight } from 'lucide-react';
import Container from '@/app/components/layouts/Container';
import ProductFilters from '@/app/components/filters/ProductFilters';
import { FilterOptions, SortOption, Product } from '@/lib/types/product';
import { ProductCard } from '../shop/components/ProductCard';
import { allProducts } from '@/lib/data/products';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Loader from '@/app/components/layouts/Loader';

// Build a single array of products from asset-backed data
const allProductsArray: Product[] = Object.values(
  allProducts
).flat() as Product[];

// Rotating placeholder phrases defined once at module scope
const PLACEHOLDER_PHRASES = [
  'Search Gold Jewellery',
  'Search Diamond Jewellery',
  'Search Rings, Earrings & more...',
];

// Memoized child that updates its own state, preventing parent re-renders
const RotatingPlaceholder = memo(function RotatingPlaceholder() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setIndex(prev => (prev + 1) % PLACEHOLDER_PHRASES.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="text-base text-gray-400">
      {PLACEHOLDER_PHRASES[index]}
    </span>
  );
});

export default function SearchPage() {
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] =
    useState<Product[]>(allProductsArray);
  const [results, setResults] = useState<Product[]>(allProductsArray);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const router = useRouter();

  const filterOptions: FilterOptions = useMemo(
    () => ({
      priceRanges: [
        { value: 'under-25k', label: 'Under ₹25,000' },
        { value: '25k-40k', label: '₹25,000 - ₹40,000' },
        { value: '40k-55k', label: '₹40,000 - ₹55,000' },
        { value: 'above-55k', label: 'Above ₹55,000' },
      ],
      materials: [
        '18K Gold with Diamond',
        '18K Gold with Crystals',
        '22K Gold',
        '18K Gold with Pearls',
        '18K Gold',
      ],
      subcategories: [
        'Diamond Rings',
        'Gold Chains',
        'Pearl Earrings',
        'Designer Bracelets',
        'Traditional Pendants',
      ],
    }),
    []
  );

  const sortOptions: SortOption[] = useMemo(
    () => [
      { value: 'best-matches', label: 'Best Matches' },
      { value: 'price-low-high', label: 'Price: Low to High' },
      { value: 'price-high-low', label: 'Price: High to Low' },
      { value: 'newest', label: 'Newest First' },
      { value: 'rating', label: 'Highest Rated' },
    ],
    []
  );

  const performSearch = async (searchTerm: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 400));

    let filtered = allProductsArray;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        item =>
          item.name.toLowerCase().includes(term) ||
          item.category.name.toLowerCase().includes(term) ||
          (item.description || '').toLowerCase().includes(term)
      );
    }

    setSearchResults(filtered);
    setResults(filtered);
    setIsLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchValue);
  };

  useEffect(() => {
    performSearch('');
  }, []);

  // Stable callback for ProductFilters to avoid re-runs
  const handleFiltersChange = useCallback((filteredProducts: Product[]) => {
    setResults(filteredProducts);
  }, []);

  // Simple list-row component for list view
  const ListProductRow = ({ product }: { product: Product }) => {
    const primaryImage =
      product.images && product.images.length > 0
        ? product.images[0]
        : undefined;

    return (
      <div className="bg-white border-b border-gray-100 p-2 sm:p-3 flex items-start gap-3 w-full max-w-full">
        {/* Image */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-md overflow-hidden">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              loading="lazy"
              className="object-cover"
              sizes="80px"
              priority={false}
            />
          ) : null}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-500">
                <span className="truncate">{product.brand}</span>
                <span className="text-gray-300">•</span>
                <span className="capitalize truncate">
                  {product.category.name}
                </span>
              </div>
              <h3 className="font-medium text-gray-900 text-xs sm:text-sm leading-tight line-clamp-2">
                {product.name}
              </h3>
            </div>
          </div>

          {/* Description (hidden on tiny screens for space) */}
          <p className="hidden sm:block text-xs text-gray-600 line-clamp-2 mb-1">
            {product.description}
          </p>

          <div className="flex items-center justify-between gap-2 mt-1">
            <div className="flex items-center gap-1">
              {product.price !== null ? (
                <span className="text-sm sm:text-base font-bold text-gray-900">
                  ₹{product.price.toLocaleString()}
                </span>
              ) : (
                <span className="text-xs text-gray-500">Price on request</span>
              )}
              {product.originalPrice &&
                product.price &&
                product.originalPrice > product.price && (
                  <span className="text-[10px] sm:text-xs text-gray-500 line-through">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                )}
            </div>
            <button className="px-2 py-1 md:px-3 rounded bg-primary text-white text-[10px] text-xs md:text-lg hover:bg-primary-dark transition-colors">
              Add
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Container>
      {/* Header */}
      {/* Navigation */}
      <nav className="py-4 sm:py-6 text-xs sm:text-sm">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="text-primary-dark cursor-default">Search</span>
        </div>
      </nav>
      {/* Search Box with Dynamic Placeholder */}
      <div className="flex items-center justify-center py-3 px-4">
        <form onSubmit={handleSearch} className="relative w-full max-w-2xl">
          {/* Search Icon */}
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />

          {/* Input */}
          <input
            type="text"
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            placeholder=""
            className="w-full pl-12 pr-28 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-base shadow-sm"
          />

          {/* Dynamic Placeholder */}
          {searchValue === '' && (
            <div className="absolute left-12 right-28 inset-y-0 flex items-center pointer-events-none overflow-hidden">
              <span className="text-gray-400 text-sm truncate">
                <RotatingPlaceholder />
              </span>
            </div>
          )}

          {/* Search Button */}
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1.5 rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium whitespace-nowrap"
          >
            Search
          </button>
        </form>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 my-6 sm:my-8 font-heading text-accent">
        {/* Left side: Title + Count */}
        <div className="text-center md:text-left">
          <h1 className="text-2xl lg:text-3xl font-semibold">Search</h1>
          <h2 className="text-sm sm:text-base text-gray-600 mt-1">
            ({results.length} {results.length === 1 ? 'item' : 'items'} found)
          </h2>
        </div>

        {/* Right side: Controls */}
        <div className="flex items-center justify-center md:justify-end gap-3">
          {/* Redesigned View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm font-medium flex items-center gap-1 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm font-medium flex items-center gap-1 transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}

      {/* Product Filters and Results */}
      <ProductFilters
        products={searchResults}
        filterOptions={filterOptions}
        sortOptions={sortOptions}
        onFiltersChange={handleFiltersChange}
      >
        {isLoading ? (
          <Loader text="Searching..." />
        ) : results.length === 0 ? (
          <div className="text-center py-20">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No results found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms or filters
            </p>
            <button
              onClick={() => {
                setSearchValue('');
                performSearch('');
              }}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              View All Items
            </button>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'
                : 'space-y-3 sm:space-y-4'
            }
          >
            {results.map(product =>
              viewMode === 'grid' ? (
                <div key={product.id} className="h-full">
                  <ProductCard product={product} />
                </div>
              ) : (
                <ListProductRow key={product.id} product={product} />
              )
            )}
          </div>
        )}
      </ProductFilters>
    </Container>
  );
}
