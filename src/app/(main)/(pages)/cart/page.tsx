'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Container from '@/app/(main)/components/layouts/Container';
import { Product } from '@/lib/types/product';
import { Plus, Minus, Trash2, Heart } from 'lucide-react';
import { ProductCard } from '@/app/(main)/(pages)/shop/components/ProductCard';
import { Visa, Mastercard, Paypal, Maestro } from '@/app/(main)/assets/Footer';
import { useCartStore } from '@/lib/data/mainStore/cartStore';
import type { CartItem, SavedItem } from '@/lib/data/mainStore/cartStore';

export default function CartPage() {
  const { items, savedItems, load, update, remove, save, unsave } =
    useCartStore();
  const [pincode, setPincode] = useState('');
  const [deliveryMsg, setDeliveryMsg] = useState<string>('');
  const [couponCode, setCouponCode] = useState('');
  const [couponRate, setCouponRate] = useState(0);

  useEffect(() => {
    load();
  }, [load]);

  // Dynamic: "You may also like" products
  const [recommended, setRecommended] = useState<Product[] | null>(null);
  // Dynamic: Explore categories tiles
  const [categoryTiles, setCategoryTiles] = useState<
    { label: string; href: string; image: string }[] | null
  >(null);

  useEffect(() => {
    // Fetch recommended products
    (async () => {
      try {
        const res = await fetch('/api/main/dashboard/best-sellers');
        const data = (await res.json()) as {
          products?: Array<{
            _id?: string;
            slug?: string;
            name?: string;
            images?: string[];
            thumbnail?: string;
            price?: number;
            discountPrice?: number;
          }>;
        };
        const mapped: Product[] = (data.products || []).map(p => ({
          id: String(p.slug || p._id || ''),
          name: p.name || '',
          description: '',
          price: (p.discountPrice ?? p.price ?? 0) || 0,
          originalPrice: p.price ?? null,
          currency: 'INR',
          images: (p.images && p.images.length
            ? p.images
            : [p.thumbnail || '']
          ).filter(Boolean) as string[],
          hoverImage:
            (p.images && p.images.length > 1 ? p.images[1] : p.thumbnail) ||
            undefined,
          category: {
            id: '',
            name: '',
            slug: '',
            productCount: 0,
            isActive: true,
          },
          brand: '',
          material: '',
          inStock: true,
          stockCount: 1,
          rating: 0,
          reviews: 0,
          isNew: false,
          isSale: false,
          isWishlisted: false,
          isFeatured: false,
          tags: [],
          sku: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          thumbnail: p.thumbnail,
        }));
        setRecommended(mapped);
      } catch {
        setRecommended([]);
      }
    })();

    // Fetch categories
    (async () => {
      try {
        const res = await fetch('/api/main/categories');
        const data = (await res.json()) as {
          categories?: Array<{ name?: string; slug?: string; image?: string }>;
        };
        const mapped = (data.categories || []).map(c => ({
          label: c.name || '',
          href: `/shop/${c.slug || ''}`,
          image: (c.image || '') as string,
        }));
        setCategoryTiles(mapped);
      } catch {
        setCategoryTiles([]);
      }
    })();
  }, []);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum: number, item: CartItem) => {
      const price = item?.product?.discountPrice ?? item?.product?.price ?? 0;
      return sum + price * (item.quantity || 1);
    }, 0);
    const originalSubtotal = items.reduce((sum: number, item: CartItem) => {
      const original =
        (item?.product as Product | undefined)?.price ??
        item?.product?.price ??
        0;
      return sum + original * (item.quantity || 1);
    }, 0);
    const savings = Math.max(0, originalSubtotal - subtotal);
    const couponDiscount = Math.floor(subtotal * couponRate);
    const discountedSubtotal = Math.max(0, subtotal - couponDiscount);

    // 3% GST on discounted subtotal
    const gst = Math.round(discountedSubtotal * 0.03);

    // Razorpay fee approx: 2% + 18% GST on fee
    const rpFee = Math.round(discountedSubtotal * 0.02);
    const rpFeeGst = Math.round(rpFee * 0.18);
    const paymentCharges = rpFee + rpFeeGst;

    const shipping = 0;
    const total = Math.max(
      0,
      discountedSubtotal + gst + shipping + paymentCharges
    );
    return {
      subtotal,
      originalSubtotal,
      savings,
      couponDiscount,
      gst,
      paymentCharges,
      shipping,
      total,
    };
  }, [items, couponRate]);

  const updateQuantity = async (productId: string, delta: number) => {
    const current = items.find(
      (ci: CartItem) =>
        String(ci?.product?._id || ci?.product?.id) === productId
    );
    const newQty = Math.max(1, (current?.quantity || 1) + delta);
    await update(productId, newQty);
  };

  const removeItem = async (productId: string) => {
    await remove(productId);
  };

  const moveToSaved = async (productId: string) => {
    await save(productId);
  };

  const moveToCart = async (productId: string) => {
    await unsave(productId);
    await fetch('/api/account/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ productId, quantity: 1 }),
    }).catch(() => {});
    await load();
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

  const cartItems = items.map((ci: CartItem) => ({
    product: {
      id: String(ci?.product?._id || ci?.product?.id || ''),
      name: (ci?.product as Product | undefined)?.name || '',
      images:
        (ci?.product?.images?.length ? ci.product.images : []) ||
        ([ci?.product?.thumbnail].filter(Boolean) as string[]),
      price: ci?.product?.discountPrice ?? ci?.product?.price ?? 0,
      originalPrice:
        (ci?.product as Product | undefined)?.price ??
        ci?.product?.price ??
        null,
      inStock: true,
      stockCount: (ci?.product as Product | undefined)?.stockCount ?? 1,
    } as Product,
    quantity: ci.quantity || 1,
  }));

  const savedLocal = (savedItems as SavedItem[]).map(si => ({
    product: {
      id: String(si?.product?._id || si?.product?.id || ''),
      name: (si?.product as Product | undefined)?.name || '',
      images:
        (si?.product?.images?.length ? si.product.images : []) ||
        ([si?.product?.thumbnail].filter(Boolean) as string[]),
      price: si?.product?.discountPrice ?? si?.product?.price ?? 0,
    } as Product,
    quantity: 1,
  }));

  return (
    <Container className="py-4 md:py-8 lg:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        {/* Cart List */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <div className="p-3 sm:p-4 md:p-5 rounded-lg border border-primary/10 bg-white/60 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-primary-dark font-heading">
                Your Cart ({cartItems.length}{' '}
                {cartItems.length === 1 ? 'item' : 'items'})
              </h2>
            </div>

            {cartItems.length === 0 ? (
              <div className="text-center py-8 md:py-12 border border-primary/10 rounded-lg">
                <p className="text-primary-dark text-sm md:text-base">
                  Your cart is empty.
                </p>
                <Link
                  href="/all-jewellery"
                  className="btn btn-filled btn-animated mt-3"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {cartItems.map(entry => {
                  const product = entry.product as Product;
                  const quantity = entry.quantity as number;
                  return (
                    <div
                      key={product.id}
                      className="flex  items-start sm:items-center gap-3 p-3 sm:p-4 border border-primary/10 rounded-lg bg-white/30"
                    >
                      {/* Product Image */}
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex-shrink-0 overflow-hidden rounded-md">
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 112px"
                          priority={false}
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0 w-full sm:w-auto ">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base font-semibold text-primary-dark line-clamp-2">
                              {product.name}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                              <p className="font-bold text-accent">
                                ₹{(product.price ?? 0).toLocaleString()}
                              </p>
                              {product.originalPrice &&
                                product.originalPrice >
                                  (product.price ?? 0) && (
                                  <p className="text-primary-dark line-through">
                                    ₹{product.originalPrice.toLocaleString()}
                                  </p>
                                )}
                            </div>
                            {product.inStock &&
                              product.stockCount !== undefined &&
                              product.stockCount <= 3 && (
                                <p className="text-xs text-primary mt-1">
                                  Only {product.stockCount} left!
                                </p>
                              )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            <button
                              aria-label="Decrease quantity"
                              className="p-1.5 sm:p-2 rounded-md border border-primary/20 hover:bg-primary/10 transition-colors"
                              onClick={() => updateQuantity(product.id, -1)}
                            >
                              <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <span className="w-6 sm:w-8 text-center text-sm font-medium">
                              {quantity}
                            </span>
                            <button
                              aria-label="Increase quantity"
                              className="p-1.5 sm:p-2 rounded-md border border-primary/20 hover:bg-primary/10 transition-colors"
                              onClick={() => updateQuantity(product.id, 1)}
                            >
                              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          </div>

                          {/* Total Price */}
                          <div className="flex flex-col items-start sm:items-end gap-1 self-start sm:self-auto">
                            <p className="text-sm sm:text-base font-semibold text-accent">
                              ₹
                              {(
                                (product.price ?? 0) * quantity
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 mt-3 sm:mt-4">
                          <button
                            className="p-1 px-2 rounded-full flex gap-2 items-center btn-outline btn-animated text-xs"
                            aria-label="Move to wishlist"
                            onClick={() => moveToSaved(product.id)}
                          >
                            <Heart className="w-3 h-3" />
                            <span className="hidden sm:inline">
                              Move to wishlist
                            </span>
                            <span className="sm:hidden">Wishlist</span>
                          </button>
                          <button
                            className="p-1 px-2 rounded-full flex gap-2 items-center btn-outline btn-animated text-xs"
                            aria-label="Remove item"
                            onClick={() => removeItem(product.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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

        {/* Order Summary */}
        <aside className="lg:col-span-1 space-y-4 md:space-y-6">
          {/* Delivery & Extras */}
          <div className="p-3 sm:p-4 md:p-5 rounded-lg border border-primary/10 bg-white/60 backdrop-blur-xl">
            <h3 className="text-base sm:text-lg font-semibold text-primary-dark mb-3">
              Delivery
            </h3>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <input
                value={pincode}
                onChange={e => setPincode(e.target.value)}
                placeholder="Enter pincode"
                className="flex-1 rounded-md border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
                maxLength={6}
              />
              <button
                className="btn btn-filled btn-animated text-sm !py-2.5"
                onClick={checkDelivery}
              >
                Check
              </button>
            </div>
            {deliveryMsg && (
              <p className="mt-2 text-xs sm:text-sm text-primary-dark">
                {deliveryMsg}
              </p>
            )}
          </div>

          <div className="p-3 sm:p-4 md:p-5 rounded-lg border border-primary/10 bg-white/60 backdrop-blur-xl">
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-primary-dark mb-4">
              Order Summary
            </h3>
            <div className="flex gap-2 mb-4 flex-wrap">
              <input
                value={couponCode}
                onChange={e => setCouponCode(e.target.value)}
                placeholder="Promo code (e.g., SAVE10)"
                className="flex-1 rounded-md border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <button
                className="p-1 px-2 rounded-md flex gap-2 items-center btn-outline btn-animated text-xs"
                onClick={applyCoupon}
              >
                Apply
              </button>
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
              {totals.savings > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-primary-dark">Savings</span>
                  <span className="text-green-600">
                    - ₹{totals.savings.toLocaleString()}
                  </span>
                </div>
              )}
              {totals.couponDiscount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-primary-dark">Coupon</span>
                  <span className="text-green-600">
                    - ₹{totals.couponDiscount.toLocaleString()}
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
            <Link
              href={'/checkout'}
              className="mt-4 sm:mt-5 w-full btn btn-filled btn-animated text-sm sm:text-base"
              onClick={() => sessionStorage.setItem('cameFromCart', 'true')}
            >
              Proceed to Checkout
            </Link>
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
      {/* Saved for later */}
      {savedLocal.length > 0 && (
        <div className="p-3 sm:p-4 md:p-5 rounded-lg border border-primary/10 bg-white/60 backdrop-blur-xl mt-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-primary-dark">
              Saved for later
            </h3>
            <span className="text-xs text-primary-dark self-start sm:self-auto">
              {savedLocal.length} item(s)
            </span>
          </div>
          <div className="space-y-3 md:space-y-4">
            {savedLocal.map(entry => {
              const product = entry.product as Product;
              return (
                <div
                  key={product.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 sm:p-4 border border-primary/10 rounded-lg bg-white/30"
                >
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 64px, 80px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-primary-dark line-clamp-2">
                      {product.name}
                    </p>
                    <p className="text-xs mt-1 text-accent font-semibold">
                      ₹{(product.price ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      className=" p-2 rounded-full flex gap-2 items-center btn-outline btn-animated text-xs"
                      onClick={() => moveToCart(product.id)}
                    >
                      Move to cart
                    </button>
                    <button
                      className="p-2 rounded-full flex gap-2 items-center btn-outline btn-animated text-xs"
                      onClick={() => unsave(product.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Recommendations */}
      {recommended && recommended.length > 0 && (
        <div className="mt-8 md:mt-10">
          <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-primary-dark mb-4">
            You may also like
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 items-stretch">
            {recommended.map(p => (
              <div key={p.id}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explore categories */}
      {categoryTiles && categoryTiles.length > 0 && (
        <div className="mt-8 md:mt-10">
          <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-primary-dark mb-4">
            Explore categories
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {categoryTiles.map(tile => (
              <Link key={tile.href} href={tile.href} className="group block">
                <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg border border-primary/10">
                  <Image
                    src={tile.image}
                    alt={tile.label}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <span className="absolute bottom-2 left-2 text-white text-xs sm:text-sm md:text-base font-medium">
                    {tile.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </Container>
  );
}
