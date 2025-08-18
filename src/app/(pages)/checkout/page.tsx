'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Container from '@/app/components/layouts/Container';
import { allProducts } from '@/lib/data/products';
import { Product } from '@/lib/types/product';
import {
  CheckCircle2,
  CreditCard,
  Truck,
  User,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { ProductCard } from '@/app/(pages)/shop/components/ProductCard';
import { adsBg } from '@/app/assets/Common';

interface CartItem {
  product: Product;
  quantity: number;
}

type Step = 0 | 1 | 2; // 0: Cart, 1: Payment, 2: Summary

type PaymentMethod = 'UPI' | 'CARD' | 'NETBANKING' | 'COD';

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

const getInitialSaved = (): CartItem[] => {
  const candidates: Product[] = [
    allProducts.rings?.[2],
    allProducts.bracelets?.[0],
  ].filter(Boolean) as Product[];
  return candidates
    .filter(p => typeof p.price === 'number' && p.price !== null)
    .map(p => ({ product: p, quantity: 1 }));
};

export default function CheckoutPage() {
  // Step state
  const [step, setStep] = useState<Step>(0);

  // Cart + Saved (re-used from Cart page style)
  const [cartItems, setCartItems] = useState<CartItem[]>(getInitialCart());
  const [savedItems, setSavedItems] = useState<CartItem[]>(getInitialSaved());

  // Delivery / extras (step 0)
  const [pincode, setPincode] = useState('');
  const [deliveryMsg, setDeliveryMsg] = useState('');
  const [giftWrap, setGiftWrap] = useState(false);
  const [orderNote, setOrderNote] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponRate, setCouponRate] = useState(0);

  // Payment details (step 1)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pin, setPin] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [deliveryType, setDeliveryType] = useState<'STANDARD' | 'EXPRESS'>(
    'STANDARD'
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [upiVpa, setUpiVpa] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Totals
  const totals = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.product.price ?? 0;
      return sum + price * item.quantity;
    }, 0);
    const savings = cartItems.reduce((sum, item) => {
      const price = item.product.price ?? 0;
      const original = item.product.originalPrice ?? price;
      return sum + Math.max(0, original - price) * item.quantity;
    }, 0);
    const couponDiscount = Math.floor(subtotal * couponRate);
    const shipping = deliveryType === 'EXPRESS' ? 299 : 0;
    const total = Math.max(0, subtotal - couponDiscount) + shipping;
    return { subtotal, savings, couponDiscount, shipping, total };
  }, [cartItems, couponRate, deliveryType]);

  // Helpers used in Cart step
  const updateQuantity = (productId: string, delta: number) => {
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const moveToSaved = (productId: string) => {
    setCartItems(prev => {
      const found = prev.find(i => i.product.id === productId);
      if (found) setSavedItems(s => [found, ...s]);
      return prev.filter(i => i.product.id !== productId);
    });
  };

  const moveToCart = (productId: string) => {
    setSavedItems(prev => {
      const found = prev.find(i => i.product.id === productId);
      if (found) setCartItems(s => [found, ...s]);
      return prev.filter(i => i.product.id !== productId);
    });
  };

  const checkDelivery = () => {
    const clean = pincode.replace(/\D/g, '');
    if (clean.length !== 6) {
      setDeliveryMsg('Please enter a valid 6-digit pincode.');
      return;
    }
    setDeliveryMsg(
      `Delivery available to ${clean}. Estimated: 2-4 business days.`
    );
  };

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'SAVE10') setCouponRate(0.1);
    else if (code === 'SAVE5') setCouponRate(0.05);
    else setCouponRate(0);
  };

  // Minimal validation for proceeding to next step
  const canProceedFromCart = cartItems.length > 0;
  const canProceedFromPayment = (() => {
    if (!fullName || !phone || !address || !pin || !city || !stateName)
      return false;
    if (paymentMethod === 'UPI') return upiVpa.length >= 6;
    if (paymentMethod === 'CARD')
      return (
        cardNumber.length >= 12 &&
        cardName.length > 2 &&
        cardExpiry.length >= 4 &&
        cardCvv.length >= 3
      );
    return true;
  })();

  // Simple recommendations
  const recommended: Product[] = (
    [
      allProducts.pendants?.[0],
      allProducts.necklaces?.[0],
      allProducts.engagementRings?.[0],
      allProducts.chains?.[0],
    ] as (Product | undefined)[]
  ).filter(Boolean) as Product[];

  // Stepper UI
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
      {/* Stepper */}
      <ol className="flex items-center gap-6 border border-primary/10 rounded-lg p-3 sm:p-4 bg-white/60 backdrop-blur-xl">
        <StepBadge index={0} label="Cart" />
        <StepBadge index={1} label="Payment" />
        <StepBadge index={2} label="Order summary" />
      </ol>

      {/* Step content */}
      {step === 0 && (
        <>
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Cart Column (mirrors cart page) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="p-4 sm:p-5 rounded-lg border border-primary/10 bg-white/60 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-primary-dark">
                    Your Cart
                  </h2>
                  {cartItems.length > 0 && (
                    <button
                      className="btn btn-outline btn-animated text-sm"
                      onClick={() => setCartItems([])}
                    >
                      Clear Cart
                    </button>
                  )}
                </div>
                {cartItems.length === 0 ? (
                  <div className="text-center py-12 border border-primary/10 rounded-lg">
                    <p className="text-primary-dark">Your cart is empty.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map(({ product, quantity }) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-4 p-3 sm:p-4 border border-primary/10 rounded-lg"
                      >
                        <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 overflow-hidden rounded-md">
                          <Image
                            src={(product.images?.[0] as any) || adsBg}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-semibold text-primary-dark truncate">
                            {product.name}
                          </p>
                          <div className="mt-1 flex items-center gap-3 text-xs sm:text-sm">
                            <p className="font-bold text-accent">
                              ₹{(product.price ?? 0).toLocaleString()}
                            </p>
                            {product.originalPrice &&
                              product.originalPrice > (product.price ?? 0) && (
                                <p className="text-primary-dark line-through">
                                  ₹{product.originalPrice.toLocaleString()}
                                </p>
                              )}
                          </div>
                          {product.inStock && product.stockCount <= 3 && (
                            <p className="text-xs text-primary mt-1">
                              Only {product.stockCount} left!
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            aria-label="Decrease quantity"
                            className="p-2 rounded-md border border-primary/20 hover:bg-primary/10"
                            onClick={() => updateQuantity(product.id, -1)}
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm">
                            {quantity}
                          </span>
                          <button
                            aria-label="Increase quantity"
                            className="p-2 rounded-md border border-primary/20 hover:bg-primary/10"
                            onClick={() => updateQuantity(product.id, 1)}
                          >
                            +
                          </button>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <p className="text-sm font-semibold text-accent">
                            ₹
                            {(
                              (product.price ?? 0) * quantity || 0
                            ).toLocaleString()}
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              className="btn btn-ghost text-xs"
                              onClick={() => moveToSaved(product.id)}
                            >
                              Move to wishlist
                            </button>
                            <button
                              className="btn btn-ghost text-xs"
                              onClick={() => removeItem(product.id)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Delivery & Extras */}
              <div className="p-4 sm:p-5 rounded-lg border border-primary/10 bg-white/60 backdrop-blur-xl">
                <h3 className="text-lg font-semibold text-primary-dark mb-3">
                  Delivery
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    value={pincode}
                    onChange={e => setPincode(e.target.value)}
                    placeholder="Enter pincode"
                    className="flex-1 rounded-md border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <button
                    className="btn btn-filled btn-animated"
                    onClick={checkDelivery}
                  >
                    Check
                  </button>
                </div>
                {deliveryMsg && (
                  <p className="mt-2 text-sm text-primary-dark">
                    {deliveryMsg}
                  </p>
                )}
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center gap-2 text-sm text-primary-dark">
                    <input
                      type="checkbox"
                      checked={giftWrap}
                      onChange={e => setGiftWrap(e.target.checked)}
                    />
                    Add gift wrap (complimentary)
                  </label>
                  <div className="col-span-1 md:col-span-2">
                    <textarea
                      value={orderNote}
                      onChange={e => setOrderNote(e.target.value)}
                      placeholder="Order note (optional)"
                      rows={3}
                      className="w-full rounded-md border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Saved for later */}
              {savedItems.length > 0 && (
                <div className="p-4 sm:p-5 rounded-lg border border-primary/10 bg-white/60 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-primary-dark">
                      Saved for later
                    </h3>
                    <span className="text-xs text-primary-dark">
                      {savedItems.length} item(s)
                    </span>
                  </div>
                  <div className="space-y-4">
                    {savedItems.map(({ product }) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-4 p-3 sm:p-4 border border-primary/10 rounded-lg"
                      >
                        <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-md">
                          <Image
                            src={(product.images?.[0] as any) || adsBg}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-primary-dark truncate">
                            {product.name}
                          </p>
                          <p className="text-xs mt-1 text-accent font-semibold">
                            ₹{(product.price ?? 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            className="btn btn-outline btn-animated text-xs"
                            onClick={() => moveToCart(product.id)}
                          >
                            Move to cart
                          </button>
                          <button
                            className="btn btn-ghost text-xs"
                            onClick={() =>
                              setSavedItems(prev =>
                                prev.filter(i => i.product.id !== product.id)
                              )
                            }
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <aside className="lg:col-span-1">
              <div className="p-4 sm:p-5 rounded-lg border border-primary/10 bg-white/60 backdrop-blur-xl">
                <h3 className="text-lg md:text-xl font-semibold text-primary-dark mb-4">
                  Order Summary
                </h3>
                <div className="flex gap-2 mb-4">
                  <input
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    placeholder="Promo code (e.g., SAVE10)"
                    className="flex-1 rounded-md border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <button
                    className="btn btn-outline btn-animated text-sm"
                    onClick={applyCoupon}
                  >
                    Apply
                  </button>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-primary-dark">Subtotal</span>
                    <span className="font-semibold text-accent">
                      ₹{totals.subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-primary-dark">Savings</span>
                    <span className="text-primary-dark">
                      - ₹{totals.savings.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-primary-dark">Coupon</span>
                    <span className="text-primary-dark">
                      - ₹{totals.couponDiscount.toLocaleString()}
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
                      Total
                    </span>
                    <span className="font-bold text-accent">
                      ₹{totals.total.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <button
                    className="btn btn-outline btn-animated flex items-center gap-2"
                    onClick={() => setStep(0)}
                    disabled={step === 0}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    className="btn btn-filled btn-animated flex-1 flex items-center justify-center gap-2"
                    onClick={() => canProceedFromCart && setStep(1)}
                    disabled={!canProceedFromCart}
                  >
                    Continue to Payment
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <p className="mt-3 text-[12px] text-primary-dark text-center">
                  All taxes included. Free shipping on all orders.
                </p>
              </div>

              {/* Trust/Assurance */}
              <div className="mt-6 p-4 rounded-lg border border-primary/10 bg-white/60 backdrop-blur-xl">
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-primary-dark">
                  <li>• Certified diamonds and hallmarked gold</li>
                  <li>• 7-day return or exchange</li>
                  <li>• Free insured shipping</li>
                  <li>• Secure payments</li>
                </ul>
              </div>
            </aside>
          </div>

          {/* Recommendations */}
          <div className="mt-10">
            <h3 className="text-xl md:text-2xl font-semibold text-primary-dark mb-4">
              You may also like
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 items-stretch">
              {recommended.map(p => (
                <div key={p.id}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {step === 1 && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Payment + Address */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-4 sm:p-5 rounded-lg border border-primary/10 bg-white/60 backdrop-blur-xl">
              <h2 className="text-xl md:text-2xl font-semibold text-primary-dark mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Shipping details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  className="rounded-md border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="Full name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                />
                <input
                  className="rounded-md border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="Email (optional)"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <input
                  className="rounded-md border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="Phone"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
                <input
                  className="md:col-span-2 rounded-md border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="Address"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                />
                <input
                  className="rounded-md border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="Pincode"
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                />
                <input
                  className="rounded-md border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="City"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                />
                <input
                  className="md:col-span-2 rounded-md border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="State"
                  value={stateName}
                  onChange={e => setStateName(e.target.value)}
                />
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-lg border border-primary/10 bg-white/60 backdrop-blur-xl">
              <h2 className="text-xl md:text-2xl font-semibold text-primary-dark mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Delivery options
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label
                  className={`border rounded-md p-3 text-sm cursor-pointer ${
                    deliveryType === 'STANDARD'
                      ? 'border-primary'
                      : 'border-primary/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    className="mr-2"
                    checked={deliveryType === 'STANDARD'}
                    onChange={() => setDeliveryType('STANDARD')}
                  />
                  Standard (Free, 3-5 days)
                </label>
                <label
                  className={`border rounded-md p-3 text-sm cursor-pointer ${
                    deliveryType === 'EXPRESS'
                      ? 'border-primary'
                      : 'border-primary/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    className="mr-2"
                    checked={deliveryType === 'EXPRESS'}
                    onChange={() => setDeliveryType('EXPRESS')}
                  />
                  Express (₹299, 1-2 days)
                </label>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-lg border border-primary/10 bg-white/60 backdrop-blur-xl">
              <h2 className="text-xl md:text-2xl font-semibold text-primary-dark mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment method
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label
                  className={`border rounded-md p-3 text-sm cursor-pointer ${
                    paymentMethod === 'UPI'
                      ? 'border-primary'
                      : 'border-primary/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="pay"
                    className="mr-2"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                  />
                  UPI
                </label>
                <label
                  className={`border rounded-md p-3 text-sm cursor-pointer ${
                    paymentMethod === 'CARD'
                      ? 'border-primary'
                      : 'border-primary/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="pay"
                    className="mr-2"
                    checked={paymentMethod === 'CARD'}
                    onChange={() => setPaymentMethod('CARD')}
                  />
                  Card
                </label>
                <label
                  className={`border rounded-md p-3 text-sm cursor-pointer ${
                    paymentMethod === 'NETBANKING'
                      ? 'border-primary'
                      : 'border-primary/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="pay"
                    className="mr-2"
                    checked={paymentMethod === 'NETBANKING'}
                    onChange={() => setPaymentMethod('NETBANKING')}
                  />
                  Netbanking
                </label>
                <label
                  className={`border rounded-md p-3 text-sm cursor-pointer ${
                    paymentMethod === 'COD'
                      ? 'border-primary'
                      : 'border-primary/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="pay"
                    className="mr-2"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                  />
                  Cash on Delivery
                </label>
              </div>

              {/* Conditional fields */}
              {paymentMethod === 'UPI' && (
                <div className="mt-3 grid grid-cols-1 gap-3">
                  <input
                    className="rounded-md border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
                    placeholder="UPI ID (e.g., name@bank)"
                    value={upiVpa}
                    onChange={e => setUpiVpa(e.target.value)}
                  />
                </div>
              )}
              {paymentMethod === 'CARD' && (
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    className="md:col-span-2 rounded-md border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
                    placeholder="Card number"
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                  />
                  <input
                    className="rounded-md border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
                    placeholder="Name on card"
                    value={cardName}
                    onChange={e => setCardName(e.target.value)}
                  />
                  <input
                    className="rounded-md border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={e => setCardExpiry(e.target.value)}
                  />
                  <input
                    className="rounded-md border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
                    placeholder="CVV"
                    value={cardCvv}
                    onChange={e => setCardCvv(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Summary and navigation */}
          <aside className="lg:col-span-1">
            <div className="p-4 sm:p-5 rounded-lg border border-primary/10 bg-white/60 backdrop-blur-xl">
              <h3 className="text-lg md:text-xl font-semibold text-primary-dark mb-4">
                Order Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-primary-dark">Items</span>
                  <span className="text-primary-dark">{cartItems.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-primary-dark">Subtotal</span>
                  <span className="font-semibold text-accent">
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
                  <span className="font-semibold text-primary-dark">Total</span>
                  <span className="font-bold text-accent">
                    ₹{totals.total.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between gap-3">
                <button
                  className="btn btn-outline btn-animated flex items-center gap-2"
                  onClick={() => setStep(0)}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Cart
                </button>
                <button
                  className="btn btn-filled btn-animated flex-1 flex items-center justify-center gap-2"
                  onClick={() => canProceedFromPayment && setStep(2)}
                  disabled={!canProceedFromPayment}
                >
                  Pay & Place Order
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-3 text-[12px] text-primary-dark text-center">
                Transactions are 100% secure and encrypted.
              </p>
            </div>
          </aside>
        </div>
      )}

      {step === 2 && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-4 sm:p-5 rounded-lg border border-primary/10 bg-white/60 backdrop-blur-xl">
              <h2 className="text-xl md:text-2xl font-semibold text-primary-dark mb-3">
                Order confirmed
              </h2>
              <p className="text-sm text-primary-dark/80">
                Thank you, {fullName || 'Guest'}! Your order has been placed
                successfully.
              </p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-primary/10 rounded-md p-3">
                  <h4 className="font-semibold text-primary-dark mb-2">
                    Shipping address
                  </h4>
                  <p className="text-sm text-primary-dark/80 break-words">
                    {fullName}
                    <br />
                    {address}
                    <br />
                    {city}, {stateName} - {pin}
                    <br />
                    {phone}
                    {email ? ` • ${email}` : ''}
                  </p>
                </div>
                <div className="border border-primary/10 rounded-md p-3">
                  <h4 className="font-semibold text-primary-dark mb-2">
                    Payment
                  </h4>
                  <p className="text-sm text-primary-dark/80">
                    Method: {paymentMethod === 'CARD' ? 'Card' : paymentMethod}
                    {paymentMethod === 'UPI' && upiVpa ? ` • ${upiVpa}` : ''}
                  </p>
                  <p className="text-sm text-primary-dark/80">
                    Delivery:{' '}
                    {deliveryType === 'EXPRESS'
                      ? 'Express (₹299)'
                      : 'Standard (Free)'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-lg border border-primary/10 bg-white/60 backdrop-blur-xl">
              <h3 className="text-lg md:text-xl font-semibold text-primary-dark mb-3">
                Items
              </h3>
              <div className="space-y-3">
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
                An email confirmation will be sent to {email || 'your email'}.
              </p>
            </div>
          </aside>
        </div>
      )}
    </Container>
  );
}
