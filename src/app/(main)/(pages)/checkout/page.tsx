'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from '@/app/(main)/components/ui/FallbackImage';
import Container from '@/app/(main)/components/layouts/Container';
import {
  MapPin,
  CreditCard,
  Shield,
  AlertCircle,
  CheckCircle,
  X,
  Phone,
} from 'lucide-react';
import { Visa, Mastercard, Paypal, Maestro } from '@/app/(main)/assets/Footer';
import { useRouter } from 'next/navigation';
import toastApi from '@/lib/toast';
import { Spinner } from '@/app/(main)/components/ui/ScaleLoader';
import { Controller } from 'react-hook-form';
import { useAddressForm, type Address as AddressType } from '@/app/(main)/hooks/useAddressForm';
import { useAddressData } from '@/app/(main)/hooks/useAddressData';

type Item = {
  productId: string;
  name: string;
  slug?: string;
  sku?: string;
  image?: string;
  price: number;
  quantity: number;
  selectedColor?: string | null;
  selectedSize?: string | null;
  originalPrice?: number;
};

type RazorpayInstance = {
  open: () => void;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

export default function CheckoutPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<Partial<AddressType>>({});
  const { addresses, refetch } = useAddressData();
  const [coupon, setCoupon] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [razorpayAvailable, setRazorpayAvailable] = useState(true);
  const [couponApplying, setCouponApplying] = useState(false);
  const router = useRouter();

  const { form, onSubmit, isSubmitting, isValid } = useAddressForm({
    initialData,
    editingId,
    onSuccess: async () => {
      setIsModalOpen(false);
      setEditingId(null);
      setInitialData({});
      await refetch();
      // Address selection will be handled by the useEffect that watches addresses
    },
  });

  // Reset modal state when closed
  useEffect(() => {
    if (!isModalOpen) {
      setEditingId(null);
      setInitialData({});
      form.reset();
    }
  }, [isModalOpen, form]);

  // Handle body scroll lock when modal is open
  useEffect(() => {
    if (isModalOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsModalOpen(false);
        }
      };
      document.addEventListener('keydown', handleEscape);

      return () => {
        document.body.style.overflow = originalStyle;
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isModalOpen]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/checkout', { credentials: 'include' });
        const data = (await res.json()) as {
          items?: Item[];
        };
        setItems((data.items || []) as Item[]);
      } catch {
        setError('Failed to load checkout data');
        toastApi.error(
          'Failed to load checkout',
          'Please refresh and try again.'
        );
      }
    })();
  }, []);

  // Set default address when addresses are loaded
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const def = addresses.find(a => a.isDefaultShipping) || addresses[0];
      if (def?._id) setSelectedAddressId(def._id);
    }
  }, [addresses, selectedAddressId]);

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (s, it: Item) => s + (it.price || 0) * (it.quantity || 1),
      0
    );
    const originalSubtotal = items.reduce(
      (s, it: Item) =>
        s + (it.originalPrice ?? it.price ?? 0) * (it.quantity || 1),
      0
    );
    const discount = Math.max(0, originalSubtotal - subtotal);

    // 3% GST on discounted subtotal
    const gst = Math.round(subtotal * 0.03);

    // Razorpay fee approx: 2% + 18% GST on fee (common test assumption)
    const rpFee = Math.round(subtotal * 0.02);
    const rpFeeGst = Math.round(rpFee * 0.18);
    const paymentCharges = rpFee + rpFeeGst;

    const shipping = 0;
    const total = Math.max(0, subtotal + gst + shipping + paymentCharges);

    return {
      subtotal,
      originalSubtotal,
      discount,
      gst,
      shipping,
      paymentCharges,
      total,
    };
  }, [items]);

  const loadRazorpay = () => {
    return new Promise(resolve => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initiatePayment = async () => {
    if (loading) return;
    try {
      setLoading(true);
      setError(null);

      // Create Razorpay order
      const response = await fetch('/api/checkout/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          addressId: selectedAddressId || undefined,
          couponCode: coupon || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        const errorMsg = data?.error || 'Failed to create payment order';
        toastApi.error('Payment initiation failed', errorMsg);
        router.push(
          `/checkout/payment-failure?error=order_creation_failed&error_description=${encodeURIComponent(errorMsg)}`
        );
        setLoading(false);
        return;
      }

      // Check if Razorpay is available
      if (data.fallback) {
        setRazorpayAvailable(false);
        const errorMsg = data?.message ||
          'Payment gateway is temporarily unavailable. Please try again later or contact support.';
        setError(errorMsg);
        toastApi.warning('Gateway unavailable', 'Please try again later.');
        router.push(
          `/checkout/payment-failure?error=gateway_unavailable&error_description=${encodeURIComponent(errorMsg)}`
        );
        setLoading(false);
        return;
      }

      // Load Razorpay script
      const razorpayLoaded = await loadRazorpay();
      if (!razorpayLoaded) {
        throw new Error('Failed to load payment gateway. Please refresh and try again.');
      }

      const options = {
        key: data.key,
        amount: data.amount * 100,
        currency: data.currency,
        name: 'Caelvi',
        description: 'Premium Jewellery Collection',
        order_id: data.razorpayOrderId,
        handler: async function (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          try {
          // Verify payment
          const verifyResponse = await fetch(
            '/api/checkout/razorpay/verify-payment',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            }
          );
          const verifyData = await verifyResponse.json();
          if (verifyData.success) {
            toastApi.success('Payment successful');
            router.push(
              `/checkout/payment-success?orderId=${verifyData.orderId}`
            );
          } else {
            toastApi.error('Payment verification failed');
            router.push(
                '/checkout/payment-failure?error=verification_failed&error_description=Payment verification failed. Please try again.'
              );
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            router.push(
              '/checkout/payment-failure?error=verification_error&error_description=An error occurred while verifying your payment. Please contact support.'
            );
          }
        },
        prefill: {
          name: addresses.find(a => a._id === selectedAddressId)?.fullName || '',
          email: '',
          contact: addresses.find(a => a._id === selectedAddressId)?.phone || '',
        },
        theme: {
          color: '#B8860B',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            // Redirect to payment failure when user dismisses the modal
            router.push(
              '/checkout/payment-failure?error=payment_cancelled&error_description=Payment was cancelled. No charges have been made.'
            );
          },
        },
      };

      const rzp = new window.Razorpay(options);
      
      // Handle payment failure events
      if (rzp.on) {
        rzp.on('payment.failed', function (...args: unknown[]) {
          setLoading(false);
          const response = args[0] as { error?: { description?: string; reason?: string } };
          const errorMsg = response?.error?.description || response?.error?.reason || 'Payment failed';
          toastApi.error('Payment failed', errorMsg);
          router.push(
            `/checkout/payment-failure?error=payment_failed&error_description=${encodeURIComponent(errorMsg)}`
          );
        });
      }

      rzp.open();
    } catch (e: unknown) {
      const message =
        typeof e === 'object' && e && 'message' in e
          ? String((e as { message?: unknown }).message)
          : 'Failed to initiate payment';
      setError(message);
      toastApi.error('Payment initiation failed', message);
      router.push(
        `/checkout/payment-failure?error=payment_initiation_failed&error_description=${encodeURIComponent(message)}`
      );
      setLoading(false);
    }
  };

  const handleApplyCoupon = () => {
    if (couponApplying) return;
    setCouponApplying(true);
    const code = coupon.trim().toUpperCase();
    if (code === 'SAVE10') {
      toastApi.success('Coupon applied', '10% discount applied');
    } else if (code === 'SAVE5') {
      toastApi.success('Coupon applied', '5% discount applied');
    } else if (code) {
      toastApi.error('Invalid coupon', 'Please enter a valid code');
    }
    setTimeout(() => {
      setCouponApplying(false);
    }, 400);
  };

  const openAddModal = () => {
    setEditingId(null);
    setInitialData({});
    setIsModalOpen(true);
  };

  return (
    <Container className="py-4 md:py-8 lg:py-12">
      {/* Page Header */}
      <div className="mb-4 sm:mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-primary-dark font-heading">
            Checkout
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Review your address and order, then pay securely with Razorpay
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white/60 px-3 py-1.5 text-xs text-dark">
          <Shield className="w-4 h-4 text-primary" />
          <span>Secure checkout</span>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-4 -mt-2 hidden sm:block">
        <ol className="grid grid-cols-3 gap-2 text-xs text-gray-600">
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-primary text-white grid place-items-center">
              1
            </span>
            Cart
          </li>
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-primary text-white grid place-items-center">
              2
            </span>
            Address & Summary
          </li>
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-primary text-white grid place-items-center">
              3
            </span>
            Payment
          </li>
        </ol>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        {/* Left: Address and Items */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Address Selection */}
          <div className="p-3 sm:p-4 md:p-5 rounded-lg border border-primary/10 bg-white/60 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-0 mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-primary-dark flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Shipping Address
              </h2>
              {!isModalOpen && (
                <button
                  onClick={openAddModal}
                  className="w-full sm:w-auto btn btn-outline hover:!text-primary btn-animated text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
                >
                  + Add New
                </button>
              )}
            </div>

              <div className="space-y-3">
                {addresses.length === 0 && (
                <p className="text-sm text-gray-600 text-center py-4">
                    No saved addresses. Add one to continue.
                  </p>
                )}
                {addresses.map(a => (
                  <label
                  key={a._id}
                    className="flex gap-3 items-start p-3 border border-primary/10 rounded-lg cursor-pointer hover:bg-white/30 transition-colors"
                  >
                    <input
                      type="radio"
                      name="address"
                    checked={selectedAddressId === a._id}
                    onChange={() => setSelectedAddressId(a._id || '')}
                      className="mt-1"
                    />
                    <div className="text-sm flex-1">
                    <div className="font-medium text-dark flex items-center gap-2">
                        <span>
                          {a.fullName} · {a.phone}
                        </span>
                        {a.isDefaultShipping && (
                          <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Default
                          </span>
                        )}
                      </div>
                    <div className="text-gray-600 mt-1">
                        {a.line1}
                        {a.line2 ? `, ${a.line2}` : ''}
                      </div>
                    <div className="text-gray-600">
                        {a.city}, {a.state} {a.postalCode}, {a.country}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
          </div>

          {/* Order Items */}
          <div className="p-3 sm:p-4 md:p-5 rounded-lg border border-primary/10 bg-white/60 backdrop-blur-xl">
            <h2 className="text-lg sm:text-xl font-semibold text-primary-dark mb-4">
              Order Items ({items.length})
            </h2>
            <div className="space-y-3">
              {items.map(it => (
                <div
                  key={it.productId}
                  className="flex items-start gap-3 p-3 border border-primary/10 rounded-lg bg-white/30"
                >
                  {it.image && (
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 overflow-hidden rounded-md">
                      <Image
                        src={it.image}
                        alt={it.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 64px, 80px"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-dark line-clamp-2">
                      {it.name}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2 items-center text-xs">
                      <span className="inline-flex items-center rounded-full border border-primary/20 px-2 py-0.5 text-gray-600">
                        Qty: {it.quantity}
                      </span>
                      {it.selectedColor && (
                        <span className="inline-flex items-center rounded-full border border-primary/20 px-2 py-0.5 text-gray-600">
                          {it.selectedColor}
                        </span>
                      )}
                      {it.selectedSize && (
                        <span className="inline-flex items-center rounded-full border border-primary/20 px-2 py-0.5 text-gray-600">
                          {it.selectedSize}
                        </span>
                      )}
                    </div>
                    {(it.selectedColor || it.selectedSize) && (
                      <div className="text-xs text-gray-600">
                        {it.selectedColor || ''} {it.selectedSize || ''}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-accent">
                      ₹{(it.price * it.quantity).toLocaleString()}
                    </div>
                    {typeof it.originalPrice === 'number' &&
                      it.originalPrice > it.price && (
                        <div className="text-[11px] text-gray-500 line-through">
                          ₹{(it.originalPrice * it.quantity).toLocaleString()}
                        </div>
                      )}
                    {typeof it.originalPrice === 'number' &&
                      it.originalPrice > it.price && (
                        <div className="mt-0.5 inline-flex items-center rounded-full bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 text-[10px]">
                          Save ₹
                          {(
                            (it.originalPrice - it.price) *
                            it.quantity
                          ).toLocaleString()}
                        </div>
                      )}
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="text-center py-8 border border-primary/10 rounded-lg">
                  <p className="text-sm text-gray-600 mb-3">
                    Your cart is empty.
                  </p>
                  <Link
                    href="/all-jewellery"
                    className="btn btn-filled btn-animated text-sm"
                  >
                    Continue Shopping
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Trust/Assurance */}
          <div className="p-3 sm:p-4 rounded-lg border border-primary/10 bg-white/60 backdrop-blur-xl">
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm text-dark">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>
                Certified diamonds and hallmarked gold
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>
                7-day return or exchange
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>
                Free insured shipping
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>
                Secure payments
              </li>
            </ul>
          </div>
        </div>

        {/* Right: Order Summary */}
        <aside className="lg:col-span-1 space-y-4 md:space-y-6 lg:sticky lg:top-20 self-start">
          <div className="p-3 sm:p-4 md:p-5 rounded-lg border border-primary/10 bg-white/60 backdrop-blur-xl">
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-primary-dark mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Order Summary
            </h3>

            <div className="flex gap-2 mb-4 flex-wrap">
              <input
                value={coupon}
                onChange={e => setCoupon(e.target.value)}
                placeholder="Promo code (e.g., SAVE10)"
                className="flex-1 rounded-md border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <button
                className="relative inline-flex items-center justify-center gap-2 rounded-md btn-outline btn-animated text-xs px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleApplyCoupon}
                disabled={couponApplying}
              >
                <span className={couponApplying ? 'opacity-0' : ''}>Apply</span>
                {couponApplying && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Spinner className="h-4 w-4 text-current" />
                  </span>
                )}
              </button>
              <div className="text-[11px] text-gray-600 w-full">
                Tip: Use SAVE10 for 10% off select items
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span className="text-dark">Original Subtotal</span>
                <span className="text-gray-500 line-through">
                  ₹{totals.originalSubtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark">Discounted Subtotal</span>
                <span className="font-semibold text-accent">
                  ₹{totals.subtotal.toLocaleString()}
                </span>
              </div>
              {totals.discount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-dark">Discount</span>
                  <span className="text-green-600">
                    -₹{totals.discount.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-dark">GST (3%)</span>
                <span className="text-dark">
                  ₹{totals.gst.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark">
                  Payment Charges (Razorpay + GST)
                </span>
                <span className="text-dark">
                  ₹{totals.paymentCharges.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark">Shipping</span>
                <span className="text-dark">
                  ₹{totals.shipping.toLocaleString()}
                </span>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-rose-200/70 to-transparent my-2" />
              <div className="flex items-center justify-between text-sm sm:text-base">
                <span className="font-semibold text-primary-dark">Total</span>
                <span className="font-bold text-accent">
                  ₹{totals.total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-md flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Payment Gateway Status */}
            {!razorpayAvailable && (
              <div className="mt-4 text-sm text-yellow-600 bg-yellow-50 p-3 rounded-md flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Payment Gateway Unavailable</p>
                  <p className="text-xs mt-1">
                    Please contact support or try again later.
                  </p>
                </div>
              </div>
            )}

            <button
              disabled={
                !selectedAddressId ||
                items.length === 0 ||
                loading ||
                !razorpayAvailable
              }
              className="relative mt-4 sm:mt-5 w-full btn btn-filled btn-animated text-sm sm:text-base flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              onClick={initiatePayment}
            >
              <span className={loading ? 'opacity-0 flex items-center gap-2' : 'flex items-center gap-2'}>
                <Shield className="w-4 h-4" />
                Pay Securely with Razorpay
              </span>
              {loading && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <Spinner className="text-white" />
                </span>
              )}
            </button>

            {/* Terms & Help */}
            <div className="mt-3 text-[10px] sm:text-xs text-gray-600 text-center">
              By placing your order you agree to our
              <Link
                href="/terms-conditions"
                className="text-primary underline ml-1"
              >
                Terms
              </Link>
              <span className="mx-1">and</span>
              <Link href="/privacy" className="text-primary underline">
                Privacy Policy
              </Link>
              .
              <div className="mt-1">
                Need help? Email{' '}
                <a
                  className="text-primary underline"
                  href="mailto:support@caelvi.com"
                >
                  support@caelvi.com
                </a>
              </div>
            </div>

            <p className="mt-3 text-[10px] sm:text-xs text-gray-600 text-center">
              All taxes included. Free shipping on all orders.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 sm:gap-4 opacity-60">
            <Visa className="h-3 sm:h-4" />
            <Mastercard className="h-3 sm:h-4" />
            <Paypal className="h-3 sm:h-4" />
            <Maestro className="h-3 sm:h-4" />
          </div>
        </aside>
      </div>

      {/* Add Address Modal */}
      {isModalOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity z-40"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-end sm:items-center justify-center p-2 sm:p-4 pointer-events-none z-50">
            <div
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl max-h-[90vh] flex flex-col pointer-events-auto border border-primary/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header - Fixed */}
              <div className="flex items-center rounded-t-2xl justify-between p-5 border-b border-primary/10 bg-white flex-shrink-0">
                <h2 className="text-lg font-medium text-gray-900">
                  {editingId ? 'Edit Address' : 'Add New Address'}
                </h2>
              <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                  <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

              {/* Form Content - Scrollable */}
              <form
                id="address-form"
                onSubmit={onSubmit}
                className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5"
              >
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <Controller
                    name="fullName"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <div>
              <input
                          {...field}
                type="text"
                          autoComplete="name"
                          className={`w-full rounded-xl border border-primary/20 bg-white px-4 py-2 sm:py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors relative z-10 ${
                            fieldState.error ? 'border-red-300' : ''
                          }`}
                          placeholder="Enter full name"
                maxLength={50}
                          style={{ WebkitAppearance: 'none' }}
                        />
                        {fieldState.error && (
                          <p className="text-xs text-red-600 mt-1.5">
                            {fieldState.error.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <Controller
                    name="phone"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <div className="relative">
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 z-10 pointer-events-none" />
              <input
                            {...field}
                type="tel"
                            onChange={(e) => {
                              const value = e.target.value
                                .replace(/\D/g, '')
                                .slice(0, 10);
                              field.onChange(value);
                }}
                maxLength={10}
                            className={`w-full rounded-xl border border-primary/20 bg-white px-10 py-2 sm:py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors relative z-10 ${
                              fieldState.error ? 'border-red-300' : ''
                            }`}
                            placeholder="Enter 10 digit phone number"
                            autoComplete="tel"
                inputMode="numeric"
                            style={{ WebkitAppearance: 'none' }}
                          />
                        </div>
                        {fieldState.error && (
                          <div className="mt-1.5 min-h-[20px]">
                            <p className="text-xs text-red-600 relative z-20">
                              {fieldState.error.message}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  />
                </div>

                {/* Address Line 1 */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Address Line 1
                  </label>
                  <Controller
                    name="line1"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <div>
              <input
                          {...field}
                type="text"
                          autoComplete="street-address"
                          className={`w-full rounded-xl border border-primary/20 bg-white px-4 py-2 sm:py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors relative z-10 ${
                            fieldState.error ? 'border-red-300' : ''
                          }`}
                          placeholder="Street address, P.O. box"
                maxLength={100}
                          style={{ WebkitAppearance: 'none' }}
                        />
                        {fieldState.error && (
                          <p className="text-xs text-red-600 mt-1.5">
                            {fieldState.error.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>

                {/* Address Line 2 */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Address Line 2 (Optional)
                  </label>
                  <Controller
                    name="line2"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <div>
              <input
                          {...field}
                type="text"
                          autoComplete="address-line2"
                          className={`w-full rounded-xl border border-primary/20 bg-white px-4 py-2 sm:py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors relative z-10 ${
                            fieldState.error ? 'border-red-300' : ''
                          }`}
                          placeholder="Apartment, suite, unit, building, floor"
                maxLength={100}
                          style={{ WebkitAppearance: 'none' }}
                        />
                        {fieldState.error && (
                          <p className="text-xs text-red-600 mt-1.5">
                            {fieldState.error.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>

                {/* City and State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <Controller
                      name="city"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <div>
              <input
                            {...field}
                type="text"
                            autoComplete="address-level2"
                            className={`w-full rounded-xl border border-primary/20 bg-white px-4 py-2 sm:py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors relative z-10 ${
                              fieldState.error ? 'border-red-300' : ''
                            }`}
                placeholder="City"
                maxLength={50}
                            style={{ WebkitAppearance: 'none' }}
                          />
                          {fieldState.error && (
                            <p className="text-xs text-red-600 mt-1.5">
                              {fieldState.error.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <Controller
                      name="state"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <div>
              <input
                            {...field}
                type="text"
                            autoComplete="address-level1"
                            className={`w-full rounded-xl border border-primary/20 bg-white px-4 py-2 sm:py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors relative z-10 ${
                              fieldState.error ? 'border-red-300' : ''
                            }`}
                placeholder="State"
                maxLength={50}
                            style={{ WebkitAppearance: 'none' }}
                          />
                          {fieldState.error && (
                            <p className="text-xs text-red-600 mt-1.5">
                              {fieldState.error.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                </div>

                {/* Postal Code and Country */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Postal Code
                    </label>
                    <Controller
                      name="postalCode"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <div>
              <input
                            {...field}
                type="text"
                            onChange={(e) => {
                              const value = e.target.value
                                .replace(/\D/g, '')
                                .slice(0, 6);
                              field.onChange(value);
                }}
                maxLength={6}
                            autoComplete="postal-code"
                            className={`w-full rounded-xl border border-primary/20 bg-white px-4 py-2 sm:py-3 text-sm text-left tracking-widest font-mono focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors relative z-10 ${
                              fieldState.error ? 'border-red-300' : ''
                            }`}
                            placeholder="123456"
                inputMode="numeric"
                            style={{ WebkitAppearance: 'none' }}
                          />
                          {fieldState.error && (
                            <p className="text-xs text-red-600 mt-1.5">
                              {fieldState.error.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <Controller
                      name="country"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <div>
              <input
                            {...field}
                type="text"
                            autoComplete="country"
                            className={`w-full rounded-xl border border-primary/20 bg-white px-4 py-2 sm:py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors relative z-10 ${
                              fieldState.error ? 'border-red-300' : ''
                            }`}
                placeholder="Country"
                maxLength={50}
                            style={{ WebkitAppearance: 'none' }}
                          />
                          {fieldState.error && (
                            <p className="text-xs text-red-600 mt-1.5">
                              {fieldState.error.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                </div>

                {/* Default Checkboxes */}
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Controller
                    name="isDefaultShipping"
                    control={form.control}
                    render={({ field }) => (
                      <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                        />
                        <span className="text-xs sm:text-sm text-gray-700">
                    Set as default shipping address
                  </span>
                </label>
                    )}
                  />
              </div>

              </form>

              {/* Footer Buttons - Fixed at Bottom */}
              <div className="rounded-b-2xl border-t border-primary/10 bg-gray-50 p-5 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-normal rounded-md hover:bg-white transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="address-form"
                  disabled={!isValid || isSubmitting}
                  className={`px-5 py-2.5 text-white text-sm font-normal rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    !isValid || isSubmitting
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg hover:shadow-primary/25'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2 justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </span>
                  ) : editingId ? (
                    'Update Address'
                  ) : (
                    'Save Address'
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </Container>
  );
}
