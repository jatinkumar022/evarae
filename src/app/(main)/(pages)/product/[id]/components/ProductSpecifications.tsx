'use client';
import { Shield, Sparkles, HeartHandshake, Gift } from 'lucide-react';

export function ProductSpecifications() {
  return (
    <div className="bg-primary/5 rounded-lg p-4 lg:p-6">
      <div className="flex items-center gap-2 mb-3 lg:mb-4">
        <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
        <h3 className="text-base lg:text-lg font-semibold text-primary-dark">
          Craft & Quality
        </h3>
      </div>

      <div className="space-y-3 lg:space-y-4">
        <div className="flex items-center gap-2 lg:gap-3">
          <Shield className="w-3 h-3 lg:w-4 lg:h-4 text-primary" />
          <div>
            <span className="text-xs lg:text-sm text-primary-dark/70">
              Hypoallergenic
            </span>
            <p className="font-medium text-primary-dark text-xs lg:text-sm">
              Nickel-free & skin safe for everyday comfort.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          <Sparkles className="w-3 h-3 lg:w-4 lg:h-4 text-primary" />
          <div>
            <span className="text-xs lg:text-sm text-primary-dark/70">
              Long-lasting Shine
            </span>
            <p className="font-medium text-primary-dark text-xs lg:text-sm">
              Premium plating with anti-tarnish coating.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          <HeartHandshake className="w-3 h-3 lg:w-4 lg:h-4 text-primary" />
          <div>
            <span className="text-xs lg:text-sm text-primary-dark/70">
              Handcrafted Detail
            </span>
            <p className="font-medium text-primary-dark text-xs lg:text-sm">
              Designed with precision & artisanal finishing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          <Gift className="w-3 h-3 lg:w-4 lg:h-4 text-primary" />
          <div>
            <span className="text-xs lg:text-sm text-primary-dark/70">
              Perfect for Gifting
            </span>
            <p className="font-medium text-primary-dark text-xs lg:text-sm">
              Comes in elegant packaging, ideal for special occasions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
