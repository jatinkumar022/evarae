'use client';
import { Product } from '@/lib/types/product';
import { Gem, Scale, Ruler } from 'lucide-react';

interface ProductSpecificationsProps {
  product: Product;
}

export function ProductSpecifications({ product }: ProductSpecificationsProps) {
  return (
    <div className="bg-primary/5 rounded-lg p-4 lg:p-6">
      <div className="flex items-center gap-2 mb-3 lg:mb-4">
        <Gem className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
        <h3 className="text-base lg:text-lg font-semibold text-primary-dark">
          Specifications
        </h3>
      </div>

      <div className="space-y-3 lg:space-y-4">
        <div className="flex items-center gap-2 lg:gap-3">
          <Scale className="w-3 h-3 lg:w-4 lg:h-4 text-primary" />
          <div>
            <span className="text-xs lg:text-sm text-primary-dark/70">
              Weight
            </span>
            <p className="font-medium text-primary-dark text-xs lg:text-sm">
              {product.weight ? `${product.weight}g` : 'Not specified'}
            </p>
          </div>
        </div>

        {product.dimensions && (
          <div className="flex items-center gap-2 lg:gap-3">
            <Ruler className="w-3 h-3 lg:w-4 lg:h-4 text-primary" />
            <div>
              <span className="text-xs lg:text-sm text-primary-dark/70">
                Dimensions
              </span>
              <p className="font-medium text-primary-dark text-xs lg:text-sm">
                {product.dimensions.length && `${product.dimensions.length}mm`}
                {product.dimensions.width && ` × ${product.dimensions.width}mm`}
                {product.dimensions.height &&
                  ` × ${product.dimensions.height}mm`}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 lg:gap-3">
          <Gem className="w-3 h-3 lg:w-4 lg:h-4 text-primary" />
          <div>
            <span className="text-xs lg:text-sm text-primary-dark/70">
              Material
            </span>
            <p className="font-medium text-primary-dark text-xs lg:text-sm">
              {product.material}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          <div className="w-3 h-3 lg:w-4 lg:h-4 text-primary flex items-center justify-center">
            <span className="text-xs font-bold">SKU</span>
          </div>
          <div>
            <span className="text-xs lg:text-sm text-primary-dark/70">
              Product Code
            </span>
            <p className="font-medium text-primary-dark text-xs lg:text-sm">
              {product.sku}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          <div className="w-3 h-3 lg:w-4 lg:h-4 text-primary flex items-center justify-center">
            <span className="text-xs font-bold">BR</span>
          </div>
          <div>
            <span className="text-xs lg:text-sm text-primary-dark/70">
              Brand
            </span>
            <p className="font-medium text-primary-dark text-xs lg:text-sm">
              {product.brand}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
