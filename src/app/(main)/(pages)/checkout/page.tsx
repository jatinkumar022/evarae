'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Container from '@/app/(main)/components/layouts/Container';
import {
  MapPin,
  CreditCard,
  Shield,
  AlertCircle,
  CheckCircle,
  X,
} from 'lucide-react';
import { Visa, Mastercard, Paypal, Maestro } from '@/app/(main)/assets/Footer';
import { useRouter } from 'next/navigation';
import toastApi from '@/lib/toast';

type Address = {
  id?: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefaultShipping?: boolean;
  savedForFuture?: boolean;
};

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
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [adding, setAdding] = useState(false);
  const [newAddress, setNewAddress] = useState<Address>({
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'IN',
  });
  const [saveForFuture, setSaveForFuture] = useState<boolean>(true);
  const [setAsDefault, setSetAsDefault] = useState<boolean>(false);
  const [coupon, setCoupon] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [razorpayAvailable, setRazorpayAvailable] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/checkout', { credentials: 'include' });
        const data = (await res.json()) as {
          items?: Item[];
          addresses?: Array<
            Omit<Address, 'id' | 'savedForFuture'> & {
              _id?: string;
              id?: string;
            }
          >;
        };
        setItems((data.items || []) as Item[]);
        const addrs = (data.addresses || []).map(a => ({
          id: (a as { _id?: string; id?: string })._id || a.id,
          fullName: a.fullName,
          phone: a.phone,
          line1: a.line1,
          line2: a.line2,
          city: a.city,
          state: a.state,
          postalCode: a.postalCode,
          country: a.country,
          isDefaultShipping: a.isDefaultShipping,
          savedForFuture: true,
        })) as Address[];
        setAddresses(addrs);
        const def = addrs.find(a => a.isDefaultShipping) || addrs[0];
        if (def?.id) setSelectedAddressId(def.id);
      } catch {
        setError('Failed to load checkout data');
        toastApi.error(
          'Failed to load checkout',
          'Please refresh and try again.'
        );
      }
    })();
  }, []);

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
      if (!response.ok)
        throw new Error(data?.error || 'Failed to create payment order');

      // Check if Razorpay is available
      if (data.fallback) {
        setRazorpayAvailable(false);
        setError(
          data?.message ||
            'Payment gateway is temporarily unavailable. Please try again later or contact support.'
        );
        toastApi.warning('Gateway unavailable', 'Please try again later.');
        setLoading(false);
        return;
      }

      // Load Razorpay script
      await loadRazorpay();

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
              '/checkout/payment-failure?error=verification_failed&error_description=Payment verification failed'
            );
          }
        },
        prefill: {
          name: addresses.find(a => a.id === selectedAddressId)?.fullName || '',
          email: '',
          contact: addresses.find(a => a.id === selectedAddressId)?.phone || '',
        },
        theme: {
          color: '#B8860B',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e: unknown) {
      const message =
        typeof e === 'object' && e && 'message' in e
          ? String((e as { message?: unknown }).message)
          : 'Failed to initiate payment';
      setError(message);
      toastApi.error('Payment initiation failed', message);
      setLoading(false);
    }
  };

  const addAddress = async () => {
    try {
      setError(null);

      if (saveForFuture) {
        const beforeIds = new Set(
          addresses.map(a => a.id).filter(Boolean) as string[]
        );
        // Persist to server
        const response = await fetch('/api/account/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            fullName: newAddress.fullName,
            phone: newAddress.phone,
            line1: newAddress.line1,
            line2: newAddress.line2,
            city: newAddress.city,
            state: newAddress.state,
            postalCode: newAddress.postalCode,
            country: newAddress.country,
            isDefaultShipping: false,
          }),
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(data?.error || 'Failed to save address');

        type ApiAddress = {
          _id?: string;
          id?: string;
          fullName: string;
          phone: string;
          line1: string;
          line2?: string;
          city: string;
          state: string;
          postalCode: string;
          country?: string;
          isDefaultShipping?: boolean;
          createdAt?: string | number | Date;
        };
        const serverAddrs = (data.addresses || []) as ApiAddress[];
        const mapped: Address[] = serverAddrs.map(a => ({
          id: a._id || a.id,
          fullName: a.fullName,
          phone: a.phone,
          line1: a.line1,
          line2: a.line2,
          city: a.city,
          state: a.state,
          postalCode: a.postalCode,
          country: a.country || 'IN',
          isDefaultShipping: a.isDefaultShipping,
          savedForFuture: true,
        }));
        setAddresses(mapped);

        // Find the newly added address id
        const latest = serverAddrs.reduce<ApiAddress | null>((acc, cur) => {
          const accTs = acc ? new Date(acc.createdAt || 0).getTime() : 0;
          const curTs = new Date(cur.createdAt || 0).getTime();
          return curTs > accTs ? cur : acc;
        }, null);
        let newId = (latest && (latest._id || latest.id)) as string | undefined;

        if (!newId) {
          // Fallback: pick the id that wasn't present before
          const candidate = serverAddrs.find(
            a => !beforeIds.has((a._id || a.id) as string)
          );
          newId = (candidate && (candidate._id || candidate.id)) as
            | string
            | undefined;
        }

        if (setAsDefault && newId) {
          const patchResp = await fetch(`/api/account/addresses/${newId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          });
          const patchData = await patchResp.json();
          if (!patchResp.ok)
            throw new Error(patchData?.error || 'Failed to set default');
          const patchedAddrs = (patchData.addresses || []) as ApiAddress[];
          const mappedPatched: Address[] = patchedAddrs.map(a => ({
            id: a._id || a.id,
            fullName: a.fullName,
            phone: a.phone,
            line1: a.line1,
            line2: a.line2,
            city: a.city,
            state: a.state,
            postalCode: a.postalCode,
            country: a.country || 'IN',
            isDefaultShipping: a.isDefaultShipping,
            savedForFuture: true,
          }));
          setAddresses(mappedPatched);
          setSelectedAddressId(newId);
          toastApi.success('Address saved', 'Your address has been added.');
        } else if (newId) {
          setSelectedAddressId(newId);
          toastApi.success('Address saved', 'Your address has been added.');
        }
      } else {
        // Local-only add (not persisted)
        const id = `${Date.now()}`;
        const isDefault = false;
        const addr: Address = {
          ...newAddress,
          id,
          savedForFuture: false,
          isDefaultShipping: isDefault,
        };
        setAddresses([addr, ...addresses]);
        setSelectedAddressId(id);
        toastApi.success('Address added');
      }

      setAdding(false);

      // reset form state
      setNewAddress({
        fullName: '',
        phone: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'IN',
      });
      setSaveForFuture(true);
      setSetAsDefault(false);
    } catch (e: unknown) {
      const message =
        typeof e === 'object' && e && 'message' in e
          ? String((e as { message?: unknown }).message)
          : 'Failed to add address';
      setError(message);
      toastApi.error('Address save failed', message);
    }
  };

  return (
    <Container className="py-4 md:py-8 lg:py-12">
      {/* Page Header */}
      <div className="mb-4 sm:mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-primary-dark font-heading">
            Checkout
          </h1>
          <p className="text-sm text-primary-dark/70 mt-1">
            Review your address and order, then pay securely with Razorpay
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white/60 px-3 py-1.5 text-xs text-primary-dark/80">
          <Shield className="w-4 h-4 text-primary" />
          <span>Secure checkout</span>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-4 -mt-2 hidden sm:block">
        <ol className="grid grid-cols-3 gap-2 text-xs text-primary-dark/70">
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-primary-dark flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Shipping Address
              </h2>
              {!adding && (
                <button
                  onClick={() => setAdding(true)}
                  className="btn btn-outline hover:!text-primary btn-animated text-sm"
                >
                  + Add New
                </button>
              )}
            </div>

            {!adding ? (
              <div className="space-y-3">
                {addresses.length === 0 && (
                  <p className="text-sm text-primary-dark/70 text-center py-4">
                    No saved addresses. Add one to continue.
                  </p>
                )}
                {addresses.map(a => (
                  <label
                    key={a.id}
                    className="flex gap-3 items-start p-3 border border-primary/10 rounded-lg cursor-pointer hover:bg-white/30 transition-colors"
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === a.id}
                      onChange={() => setSelectedAddressId(a.id || '')}
                      className="mt-1"
                    />
                    <div className="text-sm flex-1">
                      <div className="font-medium text-primary-dark flex items-center gap-2">
                        <span>
                          {a.fullName} · {a.phone}
                        </span>
                        {a.isDefaultShipping && (
                          <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Default
                          </span>
                        )}
                        {a.savedForFuture && !a.isDefaultShipping && (
                          <span className="inline-flex items-center gap-1 text-primary text-[11px] font-medium">
                            Saved
                          </span>
                        )}
                      </div>
                      <div className="text-primary-dark/70 mt-1">
                        {a.line1}
                        {a.line2 ? `, ${a.line2}` : ''}
                      </div>
                      <div className="text-primary-dark/70">
                        {a.city}, {a.state} {a.postalCode}, {a.country}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              // Inline form replaced by modal. Keep list visible by closing and reopening modal if needed.
              <div className="space-y-3">
                {addresses.length === 0 && (
                  <p className="text-sm text-primary-dark/70 text-center py-4">
                    Use the form in the modal to add your first address.
                  </p>
                )}
                {addresses.map(a => (
                  <label
                    key={a.id}
                    className="flex gap-3 items-start p-3 border border-primary/10 rounded-lg cursor-pointer hover:bg-white/30 transition-colors"
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === a.id}
                      onChange={() => setSelectedAddressId(a.id || '')}
                      className="mt-1"
                    />
                    <div className="text-sm flex-1">
                      <div className="font-medium text-primary-dark flex items-center gap-2">
                        <span>
                          {a.fullName} · {a.phone}
                        </span>
                        {a.isDefaultShipping && (
                          <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Default
                          </span>
                        )}
                        {a.savedForFuture && !a.isDefaultShipping && (
                          <span className="inline-flex items-center gap-1 text-primary text-[11px] font-medium">
                            Saved
                          </span>
                        )}
                      </div>
                      <div className="text-primary-dark/70 mt-1">
                        {a.line1}
                        {a.line2 ? `, ${a.line2}` : ''}
                      </div>
                      <div className="text-primary-dark/70">
                        {a.city}, {a.state} {a.postalCode}, {a.country}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
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
                    <div className="text-sm font-medium text-primary-dark line-clamp-2">
                      {it.name}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2 items-center text-xs">
                      <span className="inline-flex items-center rounded-full border border-primary/20 px-2 py-0.5 text-primary-dark/80">
                        Qty: {it.quantity}
                      </span>
                      {it.selectedColor && (
                        <span className="inline-flex items-center rounded-full border border-primary/20 px-2 py-0.5 text-primary-dark/80">
                          {it.selectedColor}
                        </span>
                      )}
                      {it.selectedSize && (
                        <span className="inline-flex items-center rounded-full border border-primary/20 px-2 py-0.5 text-primary-dark/80">
                          {it.selectedSize}
                        </span>
                      )}
                    </div>
                    {(it.selectedColor || it.selectedSize) && (
                      <div className="text-xs text-primary-dark/70">
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
                        <div className="text-[11px] text-primary-dark line-through">
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
                  <p className="text-sm text-primary-dark/70 mb-3">
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
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm text-primary-dark">
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
                className="p-1 px-2 rounded-md flex gap-2 items-center btn-outline btn-animated text-xs"
                onClick={() => {}}
              >
                Apply
              </button>
              <div className="text-[11px] text-primary-dark/60 w-full">
                Tip: Use SAVE10 for 10% off select items
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span className="text-primary-dark">Original Subtotal</span>
                <span className="text-primary-dark line-through">
                  ₹{totals.originalSubtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-primary-dark">Discounted Subtotal</span>
                <span className="font-semibold text-accent">
                  ₹{totals.subtotal.toLocaleString()}
                </span>
              </div>
              {totals.discount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-primary-dark">Discount</span>
                  <span className="text-green-600">
                    -₹{totals.discount.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-primary-dark">GST (3%)</span>
                <span className="text-primary-dark">
                  ₹{totals.gst.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-primary-dark">
                  Payment Charges (Razorpay + GST)
                </span>
                <span className="text-primary-dark">
                  ₹{totals.paymentCharges.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-primary-dark">Shipping</span>
                <span className="text-primary-dark">
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
              className="mt-4 sm:mt-5 w-full btn btn-filled btn-animated text-sm sm:text-base flex items-center justify-center gap-2"
              onClick={initiatePayment}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Pay Securely with Razorpay
                </>
              )}
            </button>

            {/* Terms & Help */}
            <div className="mt-3 text-[10px] sm:text-xs text-primary-dark/70 text-center">
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

            <p className="mt-3 text-[10px] sm:text-xs text-primary-dark text-center">
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
      {adding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setAdding(false)}
          />
          <div className="relative z-10 w-[95%] sm:w-[560px] max-h-[85vh] overflow-auto rounded-xl border border-primary/10 bg-white/95 backdrop-blur-xl p-4 sm:p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-primary-dark">
                Add New Address
              </h3>
              <button
                className="p-1 rounded-md hover:bg-black/5"
                onClick={() => setAdding(false)}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                className="border border-primary/20 rounded-md px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="Full name"
                value={newAddress.fullName}
                onChange={e =>
                  setNewAddress({ ...newAddress, fullName: e.target.value })
                }
              />
              <input
                className="border border-primary/20 rounded-md px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="Phone"
                value={newAddress.phone}
                onChange={e =>
                  setNewAddress({ ...newAddress, phone: e.target.value })
                }
              />
              <input
                className="border border-primary/20 rounded-md px-3 py-2 text-sm outline-none focus:border-primary md:col-span-2"
                placeholder="Address line 1"
                value={newAddress.line1}
                onChange={e =>
                  setNewAddress({ ...newAddress, line1: e.target.value })
                }
              />
              <input
                className="border border-primary/20 rounded-md px-3 py-2 text-sm outline-none focus:border-primary md:col-span-2"
                placeholder="Address line 2 (optional)"
                value={newAddress.line2}
                onChange={e =>
                  setNewAddress({ ...newAddress, line2: e.target.value })
                }
              />
              <input
                className="border border-primary/20 rounded-md px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="City"
                value={newAddress.city}
                onChange={e =>
                  setNewAddress({ ...newAddress, city: e.target.value })
                }
              />
              <input
                className="border border-primary/20 rounded-md px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="State"
                value={newAddress.state}
                onChange={e =>
                  setNewAddress({ ...newAddress, state: e.target.value })
                }
              />
              <input
                className="border border-primary/20 rounded-md px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="Postal Code"
                value={newAddress.postalCode}
                onChange={e =>
                  setNewAddress({ ...newAddress, postalCode: e.target.value })
                }
              />
              <input
                className="border border-primary/20 rounded-md px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="Country"
                value={newAddress.country}
                onChange={e =>
                  setNewAddress({ ...newAddress, country: e.target.value })
                }
              />

              <div className="md:col-span-2 mt-1 space-y-2">
                <label className="flex items-center gap-2 text-sm text-primary-dark">
                  <input
                    type="checkbox"
                    checked={saveForFuture}
                    onChange={e => {
                      const checked = e.target.checked;
                      setSaveForFuture(checked);
                      if (!checked) setSetAsDefault(false);
                    }}
                  />
                  <span>Save this address for future use</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-primary-dark">
                  <input
                    type="checkbox"
                    checked={setAsDefault}
                    onChange={e => setSetAsDefault(e.target.checked)}
                    disabled={!saveForFuture}
                  />
                  <span className={!saveForFuture ? 'opacity-50' : ''}>
                    Set as default shipping address
                  </span>
                </label>
              </div>

              <div className="md:col-span-2 flex gap-2 pt-1">
                <button
                  className="btn btn-filled btn-animated text-sm"
                  onClick={addAddress}
                >
                  Save Address
                </button>
                <button
                  className="btn btn-outline btn-animated text-sm"
                  onClick={() => setAdding(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
