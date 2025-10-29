'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Container from '@/app/(main)/components/layouts/Container';
import ProductFilters from '@/app/(main)/components/filters/ProductFilters';
import DailywearCardsAd from '@/app/(main)/components/ads/DailywearCardsAd';
import {
  FilterOptions,
  SortOption,
  Product as UiProduct,
} from '@/lib/types/product';
import BannerImage from '../components/Banner';
import { ad } from '@/app/(main)/assets/Shop-list';
import { ProductCard } from '../components/ProductCard';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { usePublicCategoryStore } from '@/lib/data/mainStore/categoryStore';
import { List, NoItems } from '@/app/(main)/assets/Common';

export default function ShopCategoryPage() {
  const params = useParams();
  const rawCategory = params?.category;
  const slug = Array.isArray(rawCategory) ? rawCategory[0] : rawCategory || '';

  const { currentCategory, status, error, fetchCategory } =
    usePublicCategoryStore();

  const [filteredProducts, setFilteredProducts] = useState<UiProduct[]>([]);
  const [columns, setColumns] = useState(3);
  const [visibleProducts, setVisibleProducts] = useState(10);
  const [prevPage, setPrevPage] = useState<string | null>(null);

  useEffect(() => {
    if (slug) fetchCategory(slug, true);
  }, [slug, fetchCategory]);

  // Map API products to UI Product type
  const mappedProducts: UiProduct[] = useMemo(() => {
    const apiProducts = (currentCategory?.products ?? []) as Array<{
      _id?: string;
      name: string;
      slug: string;
      images?: string[];
      thumbnail?: string;
      price?: number;
      discountPrice?: number;
    }>;

    return apiProducts.map(p => {
      const mainImage =
        p.thumbnail || (p.images && p.images[0]) || '/favicon.ico';
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
        images: [mainImage],
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
        material: '',
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
