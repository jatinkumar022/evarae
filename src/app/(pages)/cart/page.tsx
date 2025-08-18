'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Container from '@/app/components/layouts/Container';
import { allProducts } from '@/lib/data/products';
import { Product } from '@/lib/types/product';
import { Plus, Minus } from 'lucide-react';
import { ProductCard } from '@/app/(pages)/shop/components/ProductCard';
import {
  earringsCat,
  mangalsutraCat,
  banglesCat,
  chainsCat,
  ringsCat,
  pendantsCat,
  braceletsCat,
} from '@/app/assets/CategoryGrid';
import { Visa, Mastercard, Paypal, Maestro } from '@/app/assets/Footer';

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

const getInitialSaved = (): CartItem[] => {
  const candidates: Product[] = [
    allProducts.rings?.[2],
    allProducts.bracelets?.[0],
  ].filter(Boolean) as Product[];
  return candidates
    .filter(p => typeof p.price === 'number' && p.price !== null)
    .map(p => ({ product: p, quantity: 1 }));
};

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(getInitialCart());
  const [savedItems, setSavedItems] = useState<CartItem[]>(getInitialSaved());
  const [pincode, setPincode] = useState('');
  const [deliveryMsg, setDeliveryMsg] = useState<string>('');
  const [giftWrap, setGiftWrap] = useState(false);
  const [orderNote, setOrderNote] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponRate, setCouponRate] = useState(0);

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
    const shipping = 0;
    const total = Math.max(0, subtotal - couponDiscount) + shipping;
    return { subtotal, savings, couponDiscount, shipping, total };
  }, [cartItems, couponRate]);

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
    else {
      setCouponRate(0);
    }
  };

  // Simple recommendations from catalog
  const recommended: Product[] = (
    [
      allProducts.pendants?.[0],
      allProducts.necklaces?.[0],
      allProducts.engagementRings?.[0],
      allProducts.chains?.[0],
    ] as (Product | undefined)[]
  ).filter(Boolean) as Product[];
  const categoryTiles = [
    { label: 'Rings', href: '/shop/rings', image: ringsCat },
    { label: 'Earrings', href: '/shop/earrings', image: earringsCat },
    { label: 'Bangles', href: '/shop/bangles', image: banglesCat },
    { label: 'Bracelets', href: '/shop/bracelets', image: braceletsCat },
    { label: 'Pendants', href: '/shop/pendants', image: pendantsCat },
    { label: 'Gold Chains', href: '/shop/gold-chains', image: chainsCat },
    {
      label: 'Mangalsutras',
      href: '/shop/mangalsutras',
      image: mangalsutraCat,
    },
    { label: 'Necklaces', href: '/shop/necklaces', image: pendantsCat },
  ];

  return (
    <Container className="py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Cart List */}
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
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                        priority={false}
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
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-sm">
                        {quantity}
                      </span>
                      <button
                        aria-label="Increase quantity"
                        className="p-2 rounded-md border border-primary/20 hover:bg-primary/10"
                        onClick={() => updateQuantity(product.id, 1)}
                      >
                        <Plus className="w-4 h-4" />
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
                          aria-label="Move to wishlist"
                          onClick={() => moveToSaved(product.id)}
                        >
                          Move to wishlist
                        </button>
                        <button
                          className="btn btn-ghost text-xs"
                          aria-label="Remove item"
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
              <p className="mt-2 text-sm text-primary-dark">{deliveryMsg}</p>
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
                        src={product.images[0]}
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
                <span className="font-semibold text-primary-dark">Total</span>
                <span className="font-bold text-accent">
                  ₹{totals.total.toLocaleString()}
                </span>
              </div>
            </div>
            <Link
              href={'/checkout'}
              className="mt-5 w-full btn btn-filled btn-animated"
            >
              Proceed to Checkout
            </Link>
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
          <div className="mt-4 flex items-center justify-center gap-4 opacity-80">
            <Image src={Visa} alt="Visa" height={18} />
            <Image src={Mastercard} alt="Mastercard" height={18} />
            <Image src={Paypal} alt="Paypal" height={18} />
            <Image src={Maestro} alt="Maestro" height={18} />
          </div>
        </aside>
      </div>

      {/* Explore categories */}
      <div className="mt-10">
        <h3 className="text-xl md:text-2xl font-semibold text-primary-dark mb-4">
          Explore categories
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {categoryTiles.map(tile => (
            <Link key={tile.href} href={tile.href} className="group block">
              <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg border border-primary/10">
                <Image
                  src={tile.image}
                  alt={tile.label}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width:768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <span className="absolute bottom-2 left-2 text-white text-sm sm:text-base font-medium">
                  {tile.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
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
    </Container>
  );
}
