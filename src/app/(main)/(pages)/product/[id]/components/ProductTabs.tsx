'use client';
import { Product } from '@/lib/types/product';

interface ProductTabsProps {
  product: Product;
  selectedTab: string;
  onTabChange: (tab: string) => void;
}

export function ProductTabs({
  product,
  selectedTab,
  onTabChange,
}: ProductTabsProps) {
  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'specifications', label: 'Specifications' },
    { id: 'shipping', label: 'Shipping & Returns' },
  ];

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'description':
        return (
          <div className="space-y-4 lg:space-y-6">
            <div>
              <h3 className="text-base text-accent lg:text-lg font-semibold text-dark mb-3 lg:mb-4">
                Product Description
              </h3>
              <p className="text-primary-dark leading-relaxed text-sm lg:text-base">
                {product.description}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <div>
                <h4 className="font-semibold text-dark mb-3 lg:mb-4 text-sm lg:text-base">
                  Key Features
                </h4>
                <ul className="space-y-2 lg:space-y-3 text-xs lg:text-sm text-gray-500">
                  <li className="flex items-start gap-2 lg:gap-3">
                    <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-primary rounded-full mt-1.5 lg:mt-2 flex-shrink-0"></span>
                    <span>Premium quality {product.material}</span>
                  </li>
                  <li className="flex items-start gap-2 lg:gap-3">
                    <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-primary rounded-full mt-1.5 lg:mt-2 flex-shrink-0"></span>
                    <span>Timeless design perfect for any occasion</span>
                  </li>
                  <li className="flex items-start gap-2 lg:gap-3">
                    <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-primary rounded-full mt-1.5 lg:mt-2 flex-shrink-0"></span>
                    <span>Handcrafted with attention to detail</span>
                  </li>
                  <li className="flex items-start gap-2 lg:gap-3">
                    <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-primary rounded-full mt-1.5 lg:mt-2 flex-shrink-0"></span>
                    <span>Comes with authenticity certificate</span>
                  </li>
                  <li className="flex items-start gap-2 lg:gap-3">
                    <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-primary rounded-full mt-1.5 lg:mt-2 flex-shrink-0"></span>
                    <span>Lifetime warranty on manufacturing defects</span>
                  </li>
                  <li className="flex items-start gap-2 lg:gap-3">
                    <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-primary rounded-full mt-1.5 lg:mt-2 flex-shrink-0"></span>
                    <span>Free resizing within 30 days</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-dark mb-3 lg:mb-4 text-sm lg:text-base">
                  Care Instructions
                </h4>
                <ul className="space-y-2 lg:space-y-3 text-xs lg:text-sm text-gray-500">
                  <li className="flex items-start gap-2 lg:gap-3">
                    <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-primary rounded-full mt-1.5 lg:mt-2 flex-shrink-0"></span>
                    <span>Store in a cool, dry place</span>
                  </li>
                  <li className="flex items-start gap-2 lg:gap-3">
                    <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-primary rounded-full mt-1.5 lg:mt-2 flex-shrink-0"></span>
                    <span>Clean with a soft cloth</span>
                  </li>
                  <li className="flex items-start gap-2 lg:gap-3">
                    <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-primary rounded-full mt-1.5 lg:mt-2 flex-shrink-0"></span>
                    <span>Avoid contact with chemicals</span>
                  </li>
                  <li className="flex items-start gap-2 lg:gap-3">
                    <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-primary rounded-full mt-1.5 lg:mt-2 flex-shrink-0"></span>
                    <span>Professional cleaning recommended annually</span>
                  </li>
                  <li className="flex items-start gap-2 lg:gap-3">
                    <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-primary rounded-full mt-1.5 lg:mt-2 flex-shrink-0"></span>
                    <span>Remove before swimming or exercising</span>
                  </li>
                  <li className="flex items-start gap-2 lg:gap-3">
                    <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-primary rounded-full mt-1.5 lg:mt-2 flex-shrink-0"></span>
                    <span>Store separately to prevent scratching</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'specifications':
        return (
          <div className="space-y-4 lg:space-y-6">
            <h3 className="text-base lg:text-lg font-semibold text-primary-dark mb-4 lg:mb-6">
              Product Specifications
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <div>
                <h4 className="font-semibold text-primary-dark mb-3 lg:mb-4 text-sm lg:text-base">
                  Product Details
                </h4>
                <div className="space-y-2 lg:space-y-3">
                  <div className="flex justify-between py-2 lg:py-3 border-b border-primary/10">
                    <span className="text-primary-dark text-xs lg:text-sm">
                      Brand
                    </span>
                    <span className="font-medium text-xs lg:text-sm">
                      {product.brand}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 lg:py-3 border-b border-primary/10">
                    <span className="text-primary-dark text-xs lg:text-sm">
                      Category
                    </span>
                    <span className="font-medium text-xs lg:text-sm">
                      {product.category.name}
                    </span>
                  </div>
                  {product.subcategory && (
                    <div className="flex justify-between py-2 lg:py-3 border-b border-primary/10">
                      <span className="text-primary-dark text-xs lg:text-sm">
                        Subcategory
                      </span>
                      <span className="font-medium text-xs lg:text-sm">
                        {product.subcategory}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 lg:py-3 border-b border-primary/10">
                    <span className="text-primary-dark text-xs lg:text-sm">
                      Material
                    </span>
                    <span className="font-medium text-xs lg:text-sm">
                      {product.material}
                    </span>
                  </div>
                  {product.weight && (
                    <div className="flex justify-between py-2 lg:py-3 border-b border-primary/10">
                      <span className="text-primary-dark text-xs lg:text-sm">
                        Weight
                      </span>
                      <span className="font-medium text-xs lg:text-sm">
                        {product.weight}g
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 lg:py-3 border-b border-primary/10">
                    <span className="text-primary-dark text-xs lg:text-sm">
                      SKU
                    </span>
                    <span className="font-medium text-xs lg:text-sm">
                      {product.sku}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-primary-dark mb-3 lg:mb-4 text-sm lg:text-base">
                  Dimensions
                </h4>
                {product.dimensions ? (
                  <div className="space-y-2 lg:space-y-3">
                    {product.dimensions.length && (
                      <div className="flex justify-between py-2 lg:py-3 border-b border-primary/10">
                        <span className="text-primary-dark text-xs lg:text-sm">
                          Length
                        </span>
                        <span className="font-medium text-xs lg:text-sm">
                          {product.dimensions.length}mm
                        </span>
                      </div>
                    )}
                    {product.dimensions.width && (
                      <div className="flex justify-between py-2 lg:py-3 border-b border-primary/10">
                        <span className="text-primary-dark text-xs lg:text-sm">
                          Width
                        </span>
                        <span className="font-medium text-xs lg:text-sm">
                          {product.dimensions.width}mm
                        </span>
                      </div>
                    )}
                    {product.dimensions.height && (
                      <div className="flex justify-between py-2 lg:py-3 border-b border-primary/10">
                        <span className="text-primary-dark text-xs lg:text-sm">
                          Height
                        </span>
                        <span className="font-medium text-xs lg:text-sm">
                          {product.dimensions.height}mm
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-primary-dark/70 text-xs lg:text-sm">
                    Dimensions not available
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 'shipping':
        return (
          <div className="space-y-4 lg:space-y-6">
            <h3 className="text-base lg:text-lg font-semibold text-dark mb-4 lg:mb-6">
              Shipping & Returns
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <div>
                <h4 className="font-semibold text-primary-dark mb-3 lg:mb-4 text-sm lg:text-base">
                  Shipping Information
                </h4>
                <div className="space-y-3 lg:space-y-4 text-xs lg:text-sm text-gray-500">
                  <div className="flex items-start gap-2 lg:gap-3">
                    <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-primary rounded-full mt-1.5 lg:mt-2 flex-shrink-0"></span>
                    <span>Free shipping on orders above ₹10,000</span>
                  </div>
                  <div className="flex items-start gap-2 lg:gap-3">
                    <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-primary rounded-full mt-1.5 lg:mt-2 flex-shrink-0"></span>
                    <span>Standard delivery: 3-5 business days</span>
                  </div>
                  <div className="flex items-start gap-2 lg:gap-3">
                    <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-primary rounded-full mt-1.5 lg:mt-2 flex-shrink-0"></span>
                    <span>
                      Express delivery: 1-2 business days (additional charges
                      apply)
                    </span>
                  </div>
                  <div className="flex items-start gap-2 lg:gap-3">
                    <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-primary rounded-full mt-1.5 lg:mt-2 flex-shrink-0"></span>
                    <span>
                      All orders are shipped with insurance and tracking
                    </span>
                  </div>
                  <div className="flex items-start gap-2 lg:gap-3">
                    <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-primary rounded-full mt-1.5 lg:mt-2 flex-shrink-0"></span>
                    <span>Delivery available across India</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-primary-dark mb-3 lg:mb-4 text-sm lg:text-base">
                  Return Policy
                </h4>
                <div className="space-y-3 lg:space-y-4 text-xs lg:text-sm text-gray-500">
                  <div className="flex items-start gap-2 lg:gap-3">
                    <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-primary rounded-full mt-1.5 lg:mt-2 flex-shrink-0"></span>
                    <span>
                      30-day return policy for unused items in original
                      packaging
                    </span>
                  </div>
                  <div className="flex items-start gap-2 lg:gap-3">
                    <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-primary rounded-full mt-1.5 lg:mt-2 flex-shrink-0"></span>
                    <span>
                      Return shipping costs are the responsibility of the
                      customer
                    </span>
                  </div>
                  <div className="flex items-start gap-2 lg:gap-3">
                    <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-primary rounded-full mt-1.5 lg:mt-2 flex-shrink-0"></span>
                    <span>
                      Refunds will be processed within 5-7 business days
                    </span>
                  </div>
                  <div className="flex items-start gap-2 lg:gap-3">
                    <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-primary rounded-full mt-1.5 lg:mt-2 flex-shrink-0"></span>
                    <span>Personalized or custom items are non-returnable</span>
                  </div>
                  <div className="flex items-start gap-2 lg:gap-3">
                    <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-primary rounded-full mt-1.5 lg:mt-2 flex-shrink-0"></span>
                    <span>Damaged items must be reported within 48 hours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="border border-primary/10 rounded-lg">
      {/* Tab Headers */}
      <div className="flex border-b border-primary/10 overflow-x-auto scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm font-medium transition-colors whitespace-nowrap ${
              selectedTab === tab.id
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : ' hover:text-primary hover:bg-primary/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4 lg:p-6">{renderTabContent()}</div>
    </div>
  );
}
