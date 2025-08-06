'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Container from '@/app/components/layouts/Container';
import ProductFilters from '@/app/components/filters/ProductFilters';
import DailywearCardsAd from '@/app/components/ads/DailywearCardsAd';
import { FilterOptions, SortOption } from '@/lib/types/product';
import { ringsProducts } from '@/lib/data/products';
import BannerImage from '../components/Banner';
import { ad, Banner, BannerMobile } from '@/app/assets/Shop-list';
import { ProductCard } from '../components/ProductCard';
import Image from 'next/image';

export default function RingsPage() {
  const [filteredProducts, setFilteredProducts] = useState(ringsProducts);
  const [columns, setColumns] = useState(3); // default to 3 columns

  // Responsive columns detection
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

  // Filter options for rings
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
      'Diamond Rings',
      'Crystal Rings',
      'Gold Rings',
      'Designer Rings',
      'Pearl Rings',
    ],
  };

  // Sort options
  const sortOptions: SortOption[] = [
    { value: 'best-matches', label: 'Best Matches' },
    { value: 'price-low-high', label: 'Price: Low to High' },
    { value: 'price-high-low', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  // Function to render products with ads at row-based positions
  const renderProductsWithAds = () => {
    const products = filteredProducts;
    const totalItems = products.length;

    // Ad positions (0-based index)
    const ad1Index = columns; // first item in 2nd row
    let ad2Index;
    if (totalItems >= columns * 4) {
      ad2Index = columns * 3; // first item in 4th row
    } else {
      ad2Index = columns * Math.floor((totalItems - 1) / columns); // first item in last row
    }
    // If ad2Index would overlap ad1Index, place second ad after last product
    if (ad2Index <= ad1Index) {
      ad2Index = totalItems + 1; // after last product
    }

    const items = [];
    let productIndex = 0;
    let insertedAd1 = false;
    let insertedAd2 = false;

    for (let i = 0; productIndex < products.length || !insertedAd2; i++) {
      // Insert first ad at start of 2nd row
      if (!insertedAd1 && i === ad1Index) {
        items.push(
          <div key="ad-1" className="col-span-1 sm:col-span-2 ">
            <DailywearCardsAd />
          </div>
        );
        insertedAd1 = true;
        continue;
      }
      // Insert second ad at calculated position or after last product
      if (!insertedAd2 && i === ad2Index) {
        items.push(
          <div key="ad-2" className="col-span-1 sm:col-span-2 ">
            <Image src={ad} alt="" className="h-[490px] rounded-xl" />
          </div>
        );
        insertedAd2 = true;
        // If we're after the last product, break
        if (productIndex >= products.length) break;
        continue;
      }
      // Add product
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
              href="/"
              prefetch={true}
              className=" hover:text-primary transition-colors"
            >
              Home
            </Link>

            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 " />

            <span className="text-primary-dark cursor-default">Rings</span>
          </div>
        </nav>
        <div className="font-heading my-6 sm:my-8 md:flex justify-center items-center gap-2 flex-col text-accent">
          <h1 className="text-2xl lg:text-3xl">Rings Collection</h1>
          <h2 className=" text-sm sm:text-base">
            ({filteredProducts.length} results)
          </h2>
        </div>

        <ProductFilters
          products={ringsProducts}
          filterOptions={filterOptions}
          sortOptions={sortOptions}
          onFiltersChange={setFilteredProducts}
        >
          {/* Product Grid with Ads */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 items-center">
            {renderProductsWithAds()}
          </div>

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
