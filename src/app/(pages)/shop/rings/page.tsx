'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Heart } from 'lucide-react';
import Container from '@/app/components/layouts/Container';
import ProductFilters from '@/app/components/filters/ProductFilters';
import DailywearCardsAd from '@/app/components/ads/DailywearCardsAd';
import ChooseYourLookSlider from '@/app/components/ads/ChooseYourLookSlider';
import { Product, FilterOptions, SortOption } from '@/lib/types/product';
import { GiCrystalShine } from 'react-icons/gi';
import { ringsProducts } from '@/lib/data/products';
import { star, dazzling, mangalsutra } from '@/app/assets/Animatedgrid';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden cursor-pointer bg-white border border-primary/10 hover:border-primary/30 transition-all duration-300 flex flex-col">
      <div className="relative aspect-square w-full flex-shrink-0 ">
        <Image
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover aspect-square"
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
          priority={false}
        />
        <button
          className="absolute bottom-3 right-3 bg-white/50 backdrop-blur-sm cursor-pointer hover:bg-primary hover:text-white rounded-full p-2 transition-all duration-300"
          aria-label={`Add ${product.name} to wishlist`}
        >
          <Heart className="w-4 h-4" />
        </button>
      </div>

      {product.isNew && (
        <span className="absolute top-0 right-0 best-seller-tag text-white text-[11px] px-3 py-1.5 rounded-tr-xl rounded-bl-xl uppercase font-semibold tracking-wide">
          <div className="flex items-center gap-1">
            <GiCrystalShine size={15} /> NEW
          </div>
        </span>
      )}
      {product.isSale && (
        <span className="absolute top-0 right-0 best-seller-tag text-white text-[11px] px-3 py-1.5 rounded-tr-xl rounded-bl-xl uppercase font-semibold tracking-wide">
          <div className="flex items-center gap-1">
            <GiCrystalShine size={15} /> BEST SELLER
          </div>
        </span>
      )}

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

  // Sample data for ChooseYourLookSlider
  const lookProducts = [
    {
      id: 'look-1',
      name: 'Elegant Diamond Look',
      image: star,
    },
    {
      id: 'look-2',
      name: 'Classic Gold Look',
      image: dazzling,
    },
    {
      id: 'look-3',
      name: 'Traditional Mangalsutra',
      image: mangalsutra,
    },
    {
      id: 'look-4',
      name: 'Modern Crystal Look',
      image: star,
    },
    {
      id: 'look-5',
      name: 'Premium Pearl Look',
      image: dazzling,
    },
  ];

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
            <ChooseYourLookSlider products={lookProducts} />
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
    <Container>
      <nav className="py-4 sm:py-6 text-xs sm:text-sm ">
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            prefetch={true}
            className="hover:text-primary transition-colors"
          >
            Home
          </Link>
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-primary-dark" />
          <span className="text-primary-dark cursor-default">Rings</span>
        </div>
      </nav>

      <div className="heading-component-main-container mb-6 sm:mb-8">
        <h1 className="heading-component-main-heading text-lg sm:text-xl md:text-2xl lg:text-3xl">
          Rings Collection
        </h1>
        <h2 className="heading-component-main-subheading text-sm sm:text-base">
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
  );
}
