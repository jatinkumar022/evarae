'use client';
import { Truck, Clock, MapPin, Shield } from 'lucide-react';

export function ProductDelivery() {
  return (
    <div className="bg-primary/5 rounded-lg p-4 lg:p-6">
      <div className="flex items-center gap-2 mb-3 lg:mb-4">
        <Truck className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
        <h3 className="text-base lg:text-lg font-semibold text-primary-dark">
          Delivery
        </h3>
      </div>

      <div className="space-y-3 lg:space-y-4">
        <div className="flex items-center gap-2 lg:gap-3">
          <Clock className="w-3 h-3 lg:w-4 lg:h-4 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-xs lg:text-sm font-medium text-primary-dark">
              Standard Delivery
            </span>
            <p className="text-xs lg:text-sm text-primary-dark/70">
              3-5 business days
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          <Truck className="w-3 h-3 lg:w-4 lg:h-4 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-xs lg:text-sm font-medium text-primary-dark">
              Express Delivery
            </span>
            <p className="text-xs lg:text-sm text-primary-dark/70">
              1-2 business days
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          <MapPin className="w-3 h-3 lg:w-4 lg:h-4 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-xs lg:text-sm font-medium text-primary-dark">
              Free Shipping
            </span>
            <p className="text-xs lg:text-sm text-primary-dark/70">
              On orders above ₹10,000
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          <Shield className="w-3 h-3 lg:w-4 lg:h-4 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-xs lg:text-sm font-medium text-primary-dark">
              Secure Packaging
            </span>
            <p className="text-xs lg:text-sm text-primary-dark/70">
              Insured & tracked delivery
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 lg:mt-6 pt-3 lg:pt-4 border-t border-primary/10">
        <p className="text-xs text-primary-dark/70">
          * Delivery times may vary based on location and availability
        </p>
      </div>
    </div>
  );
}
