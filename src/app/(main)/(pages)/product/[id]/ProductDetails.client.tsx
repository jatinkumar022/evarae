'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Product } from '@/lib/types/product';
import Container from '@/app/(main)/components/layouts/Container';

// Critical above-the-fold components - load immediately
import { ProductGallery } from './components/ProductGallery';
import { ProductInfo } from './components/ProductInfo';

// Lazy load below-the-fold components for optimization
const ProductTabs = dynamic(() => import('./components/ProductTabs').then(mod => ({ default: mod.ProductTabs })), {
  ssr: true,
});

const RelatedProducts = dynamic(() => import('./components/RelatedProducts').then(mod => ({ default: mod.RelatedProducts })), {
  ssr: true,
});

const ProductReviews = dynamic(() => import('./components/ProductReviews').then(mod => ({ default: mod.ProductReviews })), {
  ssr: true,
});

const ProductSpecifications = dynamic(() => import('./components/ProductSpecifications').then(mod => ({ default: mod.ProductSpecifications })), {
  ssr: true,
});

const ProductDelivery = dynamic(() => import('./components/ProductDelivery').then(mod => ({ default: mod.ProductDelivery })), {
  ssr: true,
});

const ProductWarranty = dynamic(() => import('./components/ProductWarranty').then(mod => ({ default: mod.ProductWarranty })), {
  ssr: true,
});

const ProductFAQ = dynamic(() => import('./components/ProductFAQ').then(mod => ({ default: mod.ProductFAQ })), {
  ssr: true,
});

const PeopleAlsoBought = dynamic(() => import('./components/PeopleAlsoBought').then(mod => ({ default: mod.PeopleAlsoBought })), {
  ssr: true,
});

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedTab, setSelectedTab] = useState('description');
  const [isGallaryModelOpen, setIsGallaryModelOpen] = useState(false);
  
  return (
    <Container>
      {/* Main Product Section */}
      <div className=" my-6 lg:my-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
          {/* LEFT: Product Gallery (scrolls normally) */}
          <div
            className={`${
              isGallaryModelOpen ? '' : 'lg:sticky lg:top-32'
            }  self-start `}
          >
            <ProductGallery
              product={product}
              isModalOpen={isGallaryModelOpen}
              setIsModalOpen={setIsGallaryModelOpen}
            />
          </div>
          <div>
            <ProductInfo product={product} />
          </div>

          {/* RIGHT: Product Info (sticky on desktop, normal on mobile) */}
        </div>
      </div>
      {/* Product Tabs Section */}
      <div className="mb-6 lg:mb-8">
        <ProductTabs
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
          product={product}
        />
      </div>
      <div className=" mb-6 lg:mb-8">
        <RelatedProducts currentProduct={product} category={product.category} />
      </div>
      {/* <div className=" mb-6 lg:mb-8">
       
        <ManufacturerImages images={[one.src, four.src, two.src]} />
      </div> */}
      {/* Product Reviews Section */}
      <div className=" mb-6 lg:mb-8">
        <ProductReviews product={product} />
      </div>
      {/* Additional Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-9">
        <ProductSpecifications />
        <ProductDelivery />
        <ProductWarranty />
      </div>
      {/* FAQ Section */}
      <div className="mb-6 lg:mb-8">
        <ProductFAQ />
      </div>
      <div className="mb-6 lg:mb-8">
        <PeopleAlsoBought currentProduct={product} />
      </div>
    </Container>
  );
}
