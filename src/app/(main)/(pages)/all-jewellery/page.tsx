'use client';
import { useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Container from '@/app/(main)/components/layouts/Container';
import {
  FilterOptions,
  SortOption,
  Product as UiProduct,
} from '@/lib/types/product';
import { ad, Banner, BannerMobile } from '@/app/(main)/assets/Shop-list';
import Image from 'next/image';
import { usePublicProductStore } from '@/lib/data/mainStore/productStore';

// Lazy load heavy components
const ProductFilters = dynamic(
  () => import('@/app/(main)/components/filters/ProductFilters'),
  { ssr: true }
);
const DailywearCardsAd = dynamic(
  () => import('@/app/(main)/components/ads/DailywearCardsAd'),
  { ssr: false }
);
const BannerImage = dynamic(
  () => import('../shop/components/Banner'),
  { ssr: true }
);
const ProductCard = dynamic(
  () => import('../shop/components/ProductCard').then(mod => ({ default: mod.ProductCard })),
  { ssr: true }
);

export default function AllJewelleryPage() {
  const {
    products,
    status,
    error,
    fetchProducts,
    setFilters,
    filters,
    pagination,
  } = usePublicProductStore();

  const [filteredProducts, setFilteredProducts] = useState<UiProduct[]>([]);
  const [columns, setColumns] = useState(3);
  const [visibleProducts, setVisibleProducts] = useState(12);

  useEffect(() => {
    if (status === 'idle') {
      // Ensure a reasonable initial page size
      if (filters.limit < 12) setFilters({ limit: 12 });
      fetchProducts();
    }
  }, [status, fetchProducts, setFilters, filters.limit]);

  useEffect(() => {
    function updateColumns() {
      if (window.innerWidth < 640) {
        setColumns(1);
      } else if (window.innerWidth < 1024) {
        setColumns(2);
      } else {
        setColumns(3);
      }
    }
    updateColumns();
    // Debounce resize handler
    let timeoutId: NodeJS.Timeout;
    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateColumns, 150);
    };
    window.addEventListener('resize', debouncedUpdate);
    return () => {
      window.removeEventListener('resize', debouncedUpdate);
      clearTimeout(timeoutId);
    };
  }, []);

  const mappedProducts: UiProduct[] = useMemo(() => {
    return products.map(p => {
      const mainImage =
        p.thumbnail || (p.images && p.images[0]) || '/favicon.ico';
      const hoverImage = p.images && p.images[1] ? p.images[1] : undefined;
      const hasDiscount =
        p.discountPrice != null && p.price != null && p.discountPrice < p.price;
      const sku = (p as { sku?: string }).sku;
      return {
        id: p.slug, // use slug for URL
        name: p.name,
        description: p.description || '',
        price: hasDiscount ? p.discountPrice! : p.price ?? null,
        originalPrice: hasDiscount ? p.price! : null,
        currency: 'INR',
        images: [mainImage],
        hoverImage,
        category: {
          id: p.categories?.[0]?._id || p.categories?.[0]?.slug || '',
          name: p.categories?.[0]?.name || '',
          slug: p.categories?.[0]?.slug || '',
          description: undefined,
          image: undefined,
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
        isNew: false,
        isSale: hasDiscount,
        isWishlisted: false,
        isFeatured: false,
        tags: p.tags || [],
        sku: sku || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as UiProduct;
    });
  }, [products]);

  useEffect(() => {
    setFilteredProducts(mappedProducts);
  }, [mappedProducts]);

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
      'Jhumkas',
    ],
  };

  const sortOptions: SortOption[] = [
    { value: 'best-matches', label: 'Best Matches' },
    { value: 'price-low-high', label: 'Price: Low to High' },
    { value: 'price-high-low', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  const handleLoadMore = useCallback(async () => {
    // If server has more, increase requested limit and re-fetch
    if (pagination?.hasNext) {
      const newLimit = filters.limit + 12;
      setFilters({ limit: newLimit });
      await fetchProducts();
    }
    setVisibleProducts(prev => prev + 12);
  }, [pagination?.hasNext, filters.limit, setFilters, fetchProducts]);

  const displayedProducts = filteredProducts.slice(0, visibleProducts);
  const hasMoreProducts =
    pagination?.hasNext || visibleProducts < filteredProducts.length;

  const renderProductsWithAds = useMemo(() => {
    const productsRender = displayedProducts;
    const totalItems = productsRender.length;
    const isLargeScreen = columns >= 3;
    if (totalItems < 6) {
      return productsRender.map(product => (
        <div key={product.id} className="h-full">
          <ProductCard product={product} />
        </div>
      ));
    }

    const ad1Index = isLargeScreen ? 3 : 2;
    let ad2Index;

    if (totalItems > 10) {
      ad2Index = isLargeScreen ? 8 : 5;
    } else {
      ad2Index = Math.max(totalItems - 1, ad1Index + 1);
    }

    const items: ReactNode[] = [];
    let productIndex = 0;
    let insertedAd1 = false;
    let insertedAd2 = false;

    for (let i = 0; productIndex < productsRender.length || !insertedAd2; i++) {
      if (!insertedAd1 && i === ad1Index) {
        items.push(
          <div key="ad-1" className="col-span-2">
            <DailywearCardsAd />
          </div>
        );
        insertedAd1 = true;
        continue;
      }

      if (!insertedAd2 && i === ad2Index) {
        items.push(
          <div
            key="ad-2"
            className="col-span-2 flex items-center justify-center h-full border border-primary/20 p-5 rounded-md"
          >
            <Image 
              src={ad} 
              alt="" 
              className="lg:h-auto rounded-xl"
              loading="lazy"
              sizes="(max-width: 1024px) 50vw, 33vw"
            />
          </div>
        );
        insertedAd2 = true;

        if (productIndex >= productsRender.length) break;
        continue;
      }

      if (productIndex < productsRender.length) {
        items.push(
          <div key={productsRender[productIndex].id} className="h-full">
            <ProductCard product={productsRender[productIndex]} />
          </div>
        );
        productIndex++;
      }
    }
    return items;
  }, [displayedProducts, columns]);

  return (
    <>
      <BannerImage desktopSrc={Banner} mobileSrc={BannerMobile} alt="Banner" />
      <Container>
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
              All Jewellery
            </span>
          </div>
        </nav>

        {/* Loading State - Global loader will handle this */}
        {status === 'error' && (
          <div className="text-center text-red-600">
            {error || 'Failed to load products'}
          </div>
        )}

        <div className="font-heading my-6 sm:my-8 md:flex justify-center items-center gap-2 flex-col text-accent">
          <h1 className="text-2xl lg:text-3xl">All Jewellery Collection</h1>
          <h2 className="text-sm sm:text-base">
            ({filteredProducts.length} results)
          </h2>
        </div>

        {status === 'success' && (
          <ProductFilters
            products={mappedProducts}
            filterOptions={filterOptions}
            sortOptions={sortOptions}
            onFiltersChange={setFilteredProducts}
          >
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 items-center">
              {renderProductsWithAds}
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
        )}
      </Container>
    </>
  );
}
