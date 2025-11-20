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
import BannerImage from '../components/Banner';
import { ad } from '@/app/(main)/assets/Shop-list';
import { ProductCard } from '../components/ProductCard';
import Image from '@/app/(main)/components/ui/FallbackImage';
import { useParams } from 'next/navigation';
import { usePublicCategoryStore } from '@/lib/data/mainStore/categoryStore';
import { List, NoItems } from '@/app/(main)/assets/Common';
import PageLoader from '@/app/(main)/components/layouts/PageLoader';
import { FASHION_PRICE_RANGES } from '@/lib/constants/productFilters';

export default function ShopCategoryPage() {
  const params = useParams();
  const rawCategory = params?.category;
  const slug = Array.isArray(rawCategory) ? rawCategory[0] : rawCategory || '';

  const { currentCategory, status, error, fetchCategory } =
    usePublicCategoryStore();

  const [filteredProducts, setFilteredProducts] = useState<UiProduct[]>([]);
  const [columns, setColumns] = useState(3);
  const [visibleProducts, setVisibleProducts] = useState(10);
  const hasFetchedRef = useRef<string | null>(null);

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // Fetch category when slug changes (only fetch if slug is different and not already fetched)
  useEffect(() => {
    if (slug && slug !== hasFetchedRef.current && status !== 'loading') {
      // Only fetch if we haven't fetched this slug yet or if status is idle (not error)
      if (currentCategory?.slug !== slug || (status !== 'error' && status === 'idle')) {
        hasFetchedRef.current = slug;
        fetchCategory(slug, true);
      }
    }
  }, [slug, fetchCategory, currentCategory?.slug, status]);

  // Reset hasFetchedRef when slug changes
  useEffect(() => {
    hasFetchedRef.current = null;
  }, [slug]);

  // Map API products to UI Product type
  const mappedProducts: UiProduct[] = useMemo(() => {
    const apiProducts = (currentCategory?.products ?? []) as Array<{
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
          id: currentCategory?._id || currentCategory?.slug || '',
          name: currentCategory?.name || '',
          slug: currentCategory?.slug || '',
          description: currentCategory?.description,
          image: currentCategory?.image,
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
  }, [currentCategory]);

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

  // Show loader while fetching - AFTER all hooks
  if (status === 'loading') {
    return (
      <div className="h-screen overflow-hidden">
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
    currentCategory?.name ||
    slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');

  // Global loader will handle loading state

  if (status === 'error') {
    return (
      <Container>
        <div className="py-10 text-center text-red-600">
          {error || 'Failed to load category'}
        </div>
      </Container>
    );
  }

  if (!currentCategory) {
    // if (true) {
    return (
      <Container>
        <div className="text-center py-12 text-primary-dark text-lg">
          <List className="w-28 mx-auto " />
          <p className="">Category not found.</p>
        </div>
      </Container>
    );
  }

  return (
    <>
      {currentCategory.banner && (
        <BannerImage
          desktopSrc={currentCategory.banner}
          mobileSrc={currentCategory.mobileBanner || currentCategory.banner}
          alt={currentCategory.name}
        />
      )}
      <Container>
        <nav className="py-4 sm:py-6 text-xs sm:text-sm">
          <div className="flex items-center gap-1 sm:gap-2">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            <Link
              href="/categories"
              className="hover:text-primary transition-colors"
            >
              Categories
            </Link>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-primary-dark cursor-default">
              {headerTitle}
            </span>
          </div>
        </nav>
        <div className="font-heading my-6 sm:my-8 md:flex justify-center items-center gap-2 flex-col text-accent">
          <h1 className="text-2xl lg:text-3xl">{headerTitle} Collection</h1>
          <h2 className="text-sm sm:text-base">
            ({filteredProducts.length} results)
          </h2>
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
              <p className="">No products found in this category.</p>
            </div>
          )}
        </ProductFilters>
      </Container>
    </>
  );
}
