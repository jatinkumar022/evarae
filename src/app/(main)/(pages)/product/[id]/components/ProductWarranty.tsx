'use client';
import { Shield, RotateCcw, Award, Heart } from 'lucide-react';

export function ProductWarranty() {
  return (
    <div className="bg-primary/5 rounded-lg p-4 lg:p-6">
      <div className="flex items-center gap-2 mb-3 lg:mb-4">
        <Shield className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
        <h3 className="text-base lg:text-lg font-semibold text-primary-dark">
          Warranty & Returns
        </h3>
      </div>

      <div className="space-y-3 lg:space-y-4">
        <div className="flex items-center gap-2 lg:gap-3">
          <Award className="w-3 h-3 lg:w-4 lg:h-4 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-xs lg:text-sm font-medium text-primary-dark">
              Lifetime Warranty
            </span>
            <p className="text-xs lg:text-sm text-primary-dark/70">
              On manufacturing defects
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          <RotateCcw className="w-3 h-3 lg:w-4 lg:h-4 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-xs lg:text-sm font-medium text-primary-dark">
              30-Day Returns
            </span>
            <p className="text-xs lg:text-sm text-primary-dark/70">
              Unused items in original packaging
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          <Heart className="w-3 h-3 lg:w-4 lg:h-4 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-xs lg:text-sm font-medium text-primary-dark">
              Quality Guarantee
            </span>
            <p className="text-xs lg:text-sm text-primary-dark/70">
              100% authentic with certification
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          <Shield className="w-3 h-3 lg:w-4 lg:h-4 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-xs lg:text-sm font-medium text-primary-dark">
              Secure Purchase
            </span>
            <p className="text-xs lg:text-sm text-primary-dark/70">
              SSL encrypted transactions
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 lg:mt-6 pt-3 lg:pt-4 border-t border-primary/10">
        <p className="text-xs text-primary-dark/70">
          * Terms and conditions apply. See our warranty policy for details.
        </p>
      </div>
    </div>
  );
}
