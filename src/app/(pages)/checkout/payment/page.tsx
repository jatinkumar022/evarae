'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Container from '@/app/components/layouts/Container';
import { allProducts } from '@/lib/data/products';
import { Product } from '@/lib/types/product';
import {
  CheckCircle2,
  CreditCard,
  Lock,
  Shield,
  Clock,
  Package,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

interface CartItem {
  product: Product;
  quantity: number;
}

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

export default function PaymentPage() {
  const router = useRouter();
  // Cart state
  const [cartItems] = useState<CartItem[]>(getInitialCart());
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    'pending' | 'success' | 'failed'
  >('pending');

  // Check if user came from checkout
  useEffect(() => {
    // Check if user came from checkout page
    const cameFromCart = sessionStorage.getItem('cameFromCart');
    if (!cameFromCart || getInitialCart().length === 0) {
      router.push('/cart');
      return;
    }
  }, [router]);

  // Calculate totals
  const totals = {
    subtotal: cartItems.reduce(
      (sum, item) => sum + (item.product.price ?? 0) * item.quantity,
      0
    ),
    shipping: 0,
    tax: 0,
    total: 0,
  };
  totals.tax = Math.floor(totals.subtotal * 0.18);
  totals.total = totals.subtotal + totals.shipping + totals.tax;

  const handlePayment = async () => {
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setPaymentStatus('success');
      setIsProcessing(false);

      // Redirect to summary after successful payment
      setTimeout(() => {
        router.push('/checkout/summary');
      }, 2000);
    }, 3000);
  };

  if (paymentStatus === 'success') {
    return (
      <Container className="py-8 md:py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary-dark mb-2">
              Payment Successful!
            </h1>
            <p className="text-primary-dark/70">
              Your order has been placed successfully. Redirecting to order
              summary...
            </p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4 md:py-8 lg:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Payment Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Method Selection */}

          <div className="p-4 sm:p-5 rounded-lg border border-primary/10 bg-white/60 backdrop-blur-xl">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-xl md:text-2xl font-semibold text-primary-dark font-heading">
                Payment
              </h1>
              <p className="text-primary-dark/70">
                Complete your purchase securely
              </p>
            </div>
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-primary-dark mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Method
            </h2>

            <div className="space-y-4">
              {/* Credit Card */}
              <div className="border border-primary rounded-lg p-4 bg-primary/5">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="radio"
                    name="payment"
                    checked={true}
                    className="text-primary"
                  />
                  <div>
                    <h3 className="font-semibold text-primary-dark">
                      Credit Card
                    </h3>
                    <p className="text-sm text-primary-dark/70">
                      Pay with your credit card
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-primary-dark mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full rounded-md border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
                      maxLength={19}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-dark mb-1">
                      Name on Card
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full rounded-md border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-dark mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full rounded-md border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-dark mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full rounded-md border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div className="border border-primary/20 rounded-lg p-4">
                <h3 className="font-semibold text-primary-dark mb-3">
                  Billing Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="rounded-md border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    className="rounded-md border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    className="md:col-span-2 rounded-md border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    className="rounded-md border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    placeholder="Postal Code"
                    className="rounded-md border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="border border-primary/20 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1 rounded border-primary/20 text-primary focus:ring-primary/20"
                  />
                  <div className="text-sm text-primary-dark">
                    <span>I agree to the </span>
                    <a href="#" className="text-primary hover:underline">
                      Terms and Conditions
                    </a>
                    <span> and </span>
                    <a href="#" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Security Information */}
          <div className="p-4 sm:p-5 rounded-lg border border-primary/10 bg-white/60 backdrop-blur-xl">
            <h2 className="text-base sm:text-lg font-semibold text-primary-dark mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security & Privacy
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-primary-dark/70">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                <span>256-bit SSL encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>PCI DSS compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                <span>Secure payment gateway</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>24/7 fraud monitoring</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="p-4 sm:p-5 rounded-lg border border-primary/10 bg-white/60 backdrop-blur-xl">
            <h3 className="text-base sm:text-lg font-semibold text-primary-dark mb-4">
              Order Summary
            </h3>

            {/* Items */}
            <div className="space-y-3 mb-4">
              {cartItems.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-md overflow-hidden border border-primary/10">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary-dark truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-primary-dark/70">
                      Qty: {quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-accent">
                    ₹{((product.price ?? 0) * quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 text-sm border-t border-primary/10 pt-3">
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
              <div className="flex items-center justify-between">
                <span className="text-primary-dark">Tax</span>
                <span className="text-primary-dark">
                  ₹{totals.tax.toLocaleString()}
                </span>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-rose-200/70 to-transparent my-2" />
              <div className="flex items-center justify-between text-base">
                <span className="font-semibold text-primary-dark">Total</span>
                <span className="font-bold text-accent">
                  ₹{totals.total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="mt-5 w-full btn btn-filled btn-animated flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing Payment...
                </>
              ) : (
                <>
                  Pay ₹{totals.total.toLocaleString()}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Security Notice */}
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <Shield className="w-4 h-4" />
                <span className="text-xs font-medium">Secure Payment</span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                Your payment is protected by bank-level security
              </p>
            </div>
          </div>

          {/* Back to Checkout */}
          <div className="p-4 rounded-lg border border-primary/10 bg-white/60 backdrop-blur-xl">
            <button
              onClick={() => router.back()}
              className="w-full btn btn-outline btn-animated flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Checkout
            </button>
          </div>
        </aside>
      </div>
    </Container>
  );
}
