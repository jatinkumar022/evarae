'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Container from '@/app/(main)/components/layouts/Container';
import DailywearCardsAd from '@/app/(main)/components/ads/DailywearCardsAd';

// Lazy load ProductFilters to reduce initial bundle size
const ProductFilters = dynamic(() => import('@/app/(main)/components/filters/ProductFilters'), {
  ssr: false, // Filters are interactive, can be client-only
});
import {
  FilterOptions,
  SortOption,
  Product as UiProduct,
} from '@/lib/types/product';
import { ad } from '@/app/(main)/assets/Shop-list';
import { ProductCard } from '../../shop/components/ProductCard';
import Image from '@/app/(main)/components/ui/FallbackImage';
import { useParams } from 'next/navigation';
import { usePublicCollectionStore } from '@/lib/data/mainStore/collectionStore';
import { List, NoItems } from '@/app/(main)/assets/Common';
import PageLoader from '@/app/(main)/components/layouts/PageLoader';
import { FASHION_PRICE_RANGES } from '@/lib/constants/productFilters';

export default function CollectionDetailPage() {
  const params = useParams();
  const rawSlug = params?.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug || '';

  const { currentCollection, status, error, fetchCollection } =
    usePublicCollectionStore();

  const [filteredProducts, setFilteredProducts] = useState<UiProduct[]>([]);
  const [columns, setColumns] = useState(3);
  const [visibleProducts, setVisibleProducts] = useState(10);
  const hasFetchedRef = useRef<string | null>(null);

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // Fetch collection when slug changes (only fetch if slug is different and not already fetched)
  useEffect(() => {
    if (slug && slug !== hasFetchedRef.current && status !== 'loading') {
      // Only fetch if we haven't fetched this slug yet or if status is error/idle
      if (currentCollection?.slug !== slug || (status !== 'error' && status === 'idle')) {
        hasFetchedRef.current = slug;
        fetchCollection(slug);
      }
    }
  }, [slug, fetchCollection, currentCollection?.slug, status]);

  // Map API products to UI Product type
  const mappedProducts: UiProduct[] = useMemo(() => {
    const apiProducts = (currentCollection?.products ?? []) as Array<{
      _id?: string;
      name: string;
      slug: string;
      images?: string[];
      price?: number;
      discountPrice?: number;
    }>;

    return apiProducts.map(p => {
      const mainImage = (p.images && p.images[0]) || '/favicon.ico';
      const hoverImage = p.images && p.images[1] ? p.images[1] : undefined;
      const hasDiscount =
        p.discountPrice != null && p.price != null && p.discountPrice < p.price;
      return {
        id: p.slug,
        name: p.name,
        description: '',
        price: hasDiscount ? p.discountPrice! : p.price ?? null,
        originalPrice: hasDiscount ? p.price! : null,
        currency: 'INR',
        images: hoverImage ? [mainImage, hoverImage] : [mainImage],
        hoverImage,
        category: {
          id: currentCollection?._id || currentCollection?.slug || '',
          name: currentCollection?.name || '',
          slug: currentCollection?.slug || '',
          description: currentCollection?.description,
          image: currentCollection?.image,
          productCount: apiProducts.length,
          isActive: true,
        },
        subcategory: '',
        brand: '',
        inStock: true,
        stockCount: 10,
        rating: 0,
        reviews: 0,
        isNew: false,
        isSale: hasDiscount,
        isWishlisted: false,
        isFeatured: false,
        tags: [],
        sku: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as UiProduct;
    });
  }, [currentCollection]);

  useEffect(() => {
    setFilteredProducts(mappedProducts);
  }, [mappedProducts]);

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
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // Reset hasFetchedRef when slug changes
  useEffect(() => {
    hasFetchedRef.current = null;
  }, [slug]);

  // Show loader while fetching - AFTER all hooks
  if (status === 'loading') {
    return (
      <div className="min-h-screen">
        <PageLoader fullscreen showLogo />
      </div>
    );
  }

  const filterOptions: FilterOptions = {
    priceRanges: FASHION_PRICE_RANGES,
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

  const handleLoadMore = () => {
    setVisibleProducts(prev => prev + 10);
  };

  const displayedProducts = filteredProducts.slice(0, visibleProducts);
  const hasMoreProducts = visibleProducts < filteredProducts.length;

  const renderProductsWithAds = () => {
    const products = displayedProducts;
    const totalItems = products.length;
    const isLargeScreen = columns >= 3;
    if (totalItems < 6) {
      return products.map(product => (
        <div key={product.id} className="h-full">
          <ProductCard product={product} />
        </div>
      ));
    }
    // If no products, return only products (no ads)
    if (totalItems === 0) {
      return [];
    }

    const ad1Index = isLargeScreen ? 3 : 2;
    let ad2Index;
    if (totalItems > 10) {
      ad2Index = isLargeScreen ? 8 : 5;
    } else {
      ad2Index = Math.max(totalItems - 1, ad1Index + 1);
    }

    const items: React.ReactNode[] = [];
    let productIndex = 0;
    let insertedAd1 = false;
    let insertedAd2 = false;

    for (let i = 0; productIndex < products.length || !insertedAd2; i++) {
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
            <Image src={ad} alt="" className="lg:h-auto rounded-xl" />
          </div>
        );
        insertedAd2 = true;

        if (productIndex >= products.length) break;
        continue;
      }

      if (productIndex < products.length) {
        items.push(
          <div key={products[productIndex].id} className="h-full">
            <ProductCard product={products[productIndex]} />
          </div>
        );
        productIndex++;
      }
    }

    return items;
  };

  const headerTitle =
    currentCollection?.name ||
    slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');

  // Global loader will handle loading state

  if (status === 'error') {
    return (
      <Container>
        <div className="py-10 text-center text-red-600">
          {error || 'Failed to load collection'}
        </div>
      </Container>
    );
  }

  if (!currentCollection) {
    return (
      <Container>
        <div className="text-center py-12 text-primary-dark text-lg">
          <List className="w-28 mx-auto " />
          <p className="">Collection not found.</p>
        </div>
      </Container>
    );
  }

  return (
    <>
      <Container>
        {/* Breadcrumb Navigation */}
        <nav className="py-3 sm:py-4 text-xs sm:text-sm text-primary/70">
          <div className="flex items-center gap-1 sm:gap-2">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            <Link
              href="/collections"
              className="hover:text-primary transition-colors"
            >
              Collections
            </Link>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-primary-dark">
              {headerTitle}
            </span>
          </div>
        </nav>

        {/* Collection Header with Image and Details */}
        <div className="border-b border-primary/10 pb-6 mb-6">
          <div className="flex gap-4 sm:gap-6">
            {/* Left: Collection Image */}
            {currentCollection.image && (
              <div className="flex-shrink-0">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-lg overflow-hidden border border-primary/10">
                  <Image
                    src={currentCollection.image}
                    alt={currentCollection.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, 160px"
                  />
                </div>
              </div>
            )}

            {/* Right: Collection Details */}
            <div className="flex-1 flex flex-col justify-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-heading text-primary-dark">
                {headerTitle}
              </h1>

              {currentCollection.description && (
                <p className="text-sm sm:text-base text-primary/70 line-clamp-2">
                  {currentCollection.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm text-primary/60">
                <span>
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <ProductFilters
          products={mappedProducts}
          filterOptions={filterOptions}
          sortOptions={sortOptions}
          onFiltersChange={setFilteredProducts}
        >
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 items-center">
            {renderProductsWithAds()}
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
            <div className="text-center py-12 text-primary-dark text-lg">
              <NoItems className="w-38 mx-auto " />
              <p className="">No products found in this collection.</p>
            </div>
          )}
        </ProductFilters>
      </Container>
    </>
  );
}