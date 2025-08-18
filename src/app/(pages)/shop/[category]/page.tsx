'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Container from '@/app/components/layouts/Container';
import ProductFilters from '@/app/components/filters/ProductFilters';
import DailywearCardsAd from '@/app/components/ads/DailywearCardsAd';
import { FilterOptions, SortOption } from '@/lib/types/product';
import { banglesProducts, ringsProducts } from '@/lib/data/products';
import BannerImage from '../components/Banner';
import { ad, Banner, BannerMobile } from '@/app/assets/Shop-list';
import { ProductCard } from '../components/ProductCard';
import Image from 'next/image';
import { useParams } from 'next/navigation';

export default function ShopCategoryPage() {
  const [filteredProducts, setFilteredProducts] = useState(ringsProducts);
  const [columns, setColumns] = useState(3);
  const [visibleProducts, setVisibleProducts] = useState(10);
  const params = useParams();
  const rawCategory = params?.category;
  const [prevPage, setPrevPage] = useState<string | null>(null);

  useEffect(() => {
    if (document.referrer) {
      try {
        const url = new URL(document.referrer);
        const segments = url.pathname.split('/').filter(Boolean);
        let lastSegment = segments[segments.length - 1] || null;

        if (lastSegment) {
          lastSegment =
            lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
        }

        setPrevPage(lastSegment);
      } catch {
        setPrevPage(null);
      }
    }
  }, []);
  // Ensure it's a string
  const category = Array.isArray(rawCategory)
    ? rawCategory[0]
    : rawCategory || '';

  // Capitalize first letter and replace hyphens with spaces
  const headerTitle =
    category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ');

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

  const filterOptions: FilterOptions = {
    priceRanges: [
      { value: 'under-50k', label: 'Under ₹50,000' },
      { value: '50k-100k', label: '₹50,000 - ₹100,000' },
      { value: '100k-200k', label: '₹100,000 - ₹200,000' },
      { value: 'above-200k', label: 'Above ₹200,000' },
    ],
    materials: [
      '18K Gold with Diamond',
      '18K Gold with Crystals',
      '22K Gold',
      '18K Gold with Pearls',
      '18K Gold',
    ],
    subcategories: [
      'Gold Bangles',
      'Diamond Bangles',
      'Crystal Bangles',
      'Designer Bangles',
      'Traditional Bangles',
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

    const ad1Index = isLargeScreen ? 3 : 2;
    let ad2Index;

    if (totalItems > 10) {
      ad2Index = isLargeScreen ? 8 : 5;
    } else {
      ad2Index = Math.max(totalItems - 1, ad1Index + 1);
    }

    const items = [];
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
          <div key="ad-2" className="col-span-2">
            <Image src={ad} alt="" className="lg:h-[490px] rounded-xl" />
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

  return (
    <>
      <BannerImage desktopSrc={Banner} mobileSrc={BannerMobile} alt="Banner" />
      <Container>
        <nav className="py-4 sm:py-6 text-xs sm:text-sm">
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href={`/${prevPage?.toLocaleLowerCase()}`}
              prefetch={true}
              className="hover:text-primary transition-colors"
            >
              {prevPage}
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
          products={banglesProducts}
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
            <div className="text-center py-12">
              <p className="text-primary-dark text-lg">
                No products match your filters.
              </p>
            </div>
          )}
        </ProductFilters>
      </Container>
    </>
  );
}
