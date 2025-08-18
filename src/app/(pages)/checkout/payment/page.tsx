'use client';
import { useMemo, useState } from 'react';
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

export default function PaymentPage() {
  const [step, setStep] = useState<Step>(1);

  // Cart
  const [cartItems] = useState<CartItem[]>(getInitialCart());

  // Payment details
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

  const totals = useMemo(() => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + (item.product.price ?? 0) * item.quantity,
      0
    );
    const shipping = deliveryType === 'EXPRESS' ? 299 : 0;
    return { subtotal, shipping, total: subtotal + shipping };
  }, [cartItems, deliveryType]);

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

      {/* Recommendations */}
      <div className="mt-10">
        <h3 className="text-xl md:text-2xl font-semibold text-primary-dark mb-4">
          You may also like
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 items-stretch">
          {(
            [
              allProducts.pendants?.[0],
              allProducts.necklaces?.[0],
              allProducts.engagementRings?.[0],
              allProducts.chains?.[0],
            ] as (Product | undefined)[]
          )
            .filter(Boolean)
            .map(p => (
              <div key={(p as Product).id}>
                <ProductCard product={p as Product} />
              </div>
            ))}
        </div>
      </div>
    </Container>
  );
}
