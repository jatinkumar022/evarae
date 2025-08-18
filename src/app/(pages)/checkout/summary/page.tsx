'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Container from '@/app/components/layouts/Container';
import { allProducts } from '@/lib/data/products';
import { Product } from '@/lib/types/product';
import { adsBg } from '@/app/assets/Common';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

interface CartItem {
  product: Product;
  quantity: number;
}

type Step = 0 | 1 | 2; // 0: Cart, 1: Payment, 2: Summary

const getInitialCart = (): CartItem[] => {
  const candidates: Product[] = [
    allProducts.rings?.[0],
    allProducts.earrings?.[0],
    allProducts.bangles?.[0],
  ].filter(Boolean) as Product[];
  return candidates
    .filter(p => typeof p.price === 'number' && p.price !== null)
    .map(p => ({ product: p, quantity: 1 }));
};

export default function SummaryPage() {
  const [step, setStep] = useState<Step>(2);
  const [cartItems] = useState<CartItem[]>(getInitialCart());

  const totals = useMemo(() => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + (item.product.price ?? 0) * item.quantity,
      0
    );
    const shipping = 0;
    return { subtotal, shipping, total: subtotal + shipping };
  }, [cartItems]);

  const StepBadge = ({ index, label }: { index: Step; label: string }) => {
    const active = step === index;
    const done = step > index;
    return (
      <li
        className={`flex items-center gap-2 text-sm ${
          done
            ? 'text-accent'
            : active
            ? 'text-primary-dark'
            : 'text-primary-dark/70'
        }`}
      >
        <CheckCircle2 className={`w-5 h-5 ${done ? '' : 'opacity-50'}`} />
        <span className="font-medium">{label}</span>
      </li>
    );
  };

  return (
    <Container className="py-8 md:py-12">
      <ol className="flex items-center gap-6 border border-primary/10 rounded-lg p-3 sm:p-4 bg-white/60 backdrop-blur-xl">
        <StepBadge index={0} label="Cart" />
        <StepBadge index={1} label="Payment" />
        <StepBadge index={2} label="Order summary" />
      </ol>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-4 sm:p-5 rounded-lg border border-primary/10 bg-white/60 backdrop-blur-xl">
            <h2 className="text-xl md:text-2xl font-semibold text-primary-dark mb-3">
              Order confirmed
            </h2>
            <p className="text-sm text-primary-dark/80">
              Thank you! Your order has been placed successfully.
            </p>
            <div className="mt-4 space-y-3">
              {cartItems.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-md overflow-hidden border border-primary/10">
                    <Image
                      src={(product.images?.[0] as any) || adsBg}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary-dark truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-primary-dark/80">
                      Qty: {quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-accent">
                    ₹{((product.price ?? 0) * quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1">
          <div className="p-4 sm:p-5 rounded-lg border border-primary/10 bg-white/60 backdrop-blur-xl">
            <h3 className="text-lg md:text-xl font-semibold text-primary-dark mb-4">
              Order total
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-primary-dark">Subtotal</span>
                <span className="text-primary-dark">
                  ₹{totals.subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-primary-dark">Shipping</span>
                <span className="text-primary-dark">
                  ₹{totals.shipping.toLocaleString()}
                </span>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-rose-200/70 to-transparent my-2" />
              <div className="flex items-center justify-between text-base">
                <span className="font-semibold text-primary-dark">
                  Total paid
                </span>
                <span className="font-bold text-accent">
                  ₹{totals.total.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                className="btn btn-outline btn-animated flex items-center gap-2"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button className="btn btn-filled btn-animated flex-1">
                Continue shopping
              </button>
            </div>
            <p className="mt-3 text-[12px] text-primary-dark text-center">
              We have emailed your order details.
            </p>
          </div>
        </aside>
      </div>
    </Container>
  );
}
