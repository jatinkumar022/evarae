'use client';
import { useState } from 'react';
import { Product } from '@/lib/types/product';
import { ProductGallery } from './ProductGallery';
import { ProductInfo } from './ProductInfo';
import { ProductTabs } from './ProductTabs';
import { RelatedProducts } from './RelatedProducts';
import { ProductReviews } from './ProductReviews';
import { ProductSpecifications } from './ProductSpecifications';
import { ProductDelivery } from './ProductDelivery';
import { ProductWarranty } from './ProductWarranty';
import { ProductFAQ } from './ProductFAQ';
import Container from '@/app/components/layouts/Container';
import { ManufacturerImages } from './ManufacturerImages';
import { one, two, four } from '@/app/assets/Home/CAROUSEL';
import { PeopleAlsoBought } from './PeopleAlsoBought';

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
      <div className=" mb-6 lg:mb-8">
        {/* Manufacturer Images Section */}
        <ManufacturerImages images={[one.src, four.src, two.src]} />
      </div>
      {/* Product Reviews Section */}
      <div className=" mb-6 lg:mb-8">
        <ProductReviews product={product} />
      </div>
      {/* Additional Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-9">
        <ProductSpecifications product={product} />
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
