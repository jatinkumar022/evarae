'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Container from '@/app/components/layouts/Container';
import { allProducts } from '@/lib/data/products';
import { Product } from '@/lib/types/product';
import {
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Calendar,
  ArrowRight,
  Download,
  Share2,
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

export default function OrderSummaryPage() {
  const router = useRouter();
  // Cart state
  const [cartItems] = useState<CartItem[]>(getInitialCart());
  const [orderNumber] = useState(`ORD-${Date.now().toString().slice(-8)}`);

  // Check if user came from payment
  useEffect(() => {
    // Check if user came from checkout flow
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

  // Mock order details
  const orderDetails = {
    customerName: 'Bonnie Green',
    email: 'name@flowbite.com',
    phone: '+1 123-456-7890',
    address: '123 Main Street, Apt 4B',
    city: 'San Francisco',
    country: 'United States',
    paymentMethod: 'Credit Card',
    deliveryMethod: 'Free Delivery - FedEx',
    estimatedDelivery: 'Friday, 13 Dec 2023',
    orderDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  };

  return (
    <Container className="py-4 md:py-8 lg:py-12">
      {/* Success Header */}
      <div className="text-center mb-8 max-lg:mt-3">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary-dark mb-2 font-heading">
          Order Confirmed!
        </h1>
        <p className="text-primary-dark/70 mb-2 text-sm">
          Thank you for your purchase. Your order has been successfully placed.
        </p>
        <p className="text-xs sm:text-sm text-primary-dark/60">
          Order #{orderNumber} • {orderDetails.orderDate}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Information */}
          <div className="p-4 sm:p-5 rounded-lg border border-primary/10 bg-white/60 backdrop-blur-xl">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-primary-dark mb-4 font-heading">
              Order Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipping Address */}
              <div className="space-y-3">
                <h3 className="font-semibold text-primary-dark flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Shipping Address
                </h3>
                <div className="text-sm text-primary-dark/80 space-y-1">
                  <p className="font-medium">{orderDetails.customerName}</p>
                  <p>{orderDetails.address}</p>
                  <p>
                    {orderDetails.city}, {orderDetails.country}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-3 h-3" />
                    {orderDetails.phone}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    {orderDetails.email}
                  </p>
                </div>
              </div>

              {/* Payment & Delivery */}
              <div className="space-y-3">
                <h3 className="font-semibold text-primary-dark flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Payment & Delivery
                </h3>
                <div className="text-sm text-primary-dark/80 space-y-1">
                  <p>
                    <span className="font-medium">Payment Method:</span>{' '}
                    {orderDetails.paymentMethod}
                  </p>
                  <p>
                    <span className="font-medium">Delivery Method:</span>{' '}
                    {orderDetails.deliveryMethod}
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span className="font-medium">
                      Estimated Delivery:
                    </span>{' '}
                    {orderDetails.estimatedDelivery}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="p-4 sm:p-5 rounded-lg border border-primary/10 bg-white/60 backdrop-blur-xl">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-primary-dark mb-4">
              Order Items
            </h2>

            <div className="space-y-4">
              {cartItems.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 p-3 border border-primary/10 rounded-lg"
                >
                  <div className="relative w-16 h-16 rounded-md overflow-hidden border border-primary/10">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary-dark truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-primary-dark/70">
                      SKU: {product.id}
                    </p>
                    <p className="text-xs text-primary-dark/70">
                      Qty: {quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-accent">
                      ₹{((product.price ?? 0) * quantity).toLocaleString()}
                    </p>
                    <p className="text-xs text-primary-dark/70">
                      ₹{(product.price ?? 0).toLocaleString()} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Steps */}
          <div className="p-4 sm:p-5 rounded-lg border border-primary/10 bg-white/60 backdrop-blur-xl">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-primary-dark mb-4">
              What&apos;s Next?
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-semibold text-primary">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-primary-dark">
                    Order Confirmation
                  </h3>
                  <p className="text-xs sm:text-sm text-primary-dark/70">
                    You&apos;ll receive an email confirmation with your order
                    details and tracking information.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-semibold text-primary">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-primary-dark">
                    Order Processing
                  </h3>
                  <p className="text-xs sm:text-sm  text-primary-dark/70">
                    Our team will process your order and prepare it for shipment
                    within 24 hours.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-semibold text-primary">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-primary-dark">Shipment</h3>
                  <p className="text-xs sm:text-sm  text-primary-dark/70">
                    You&apos;ll receive tracking information once your order
                    ships. Estimated delivery: {orderDetails.estimatedDelivery}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          {/* Order Summary */}
          <div className="p-4 sm:p-5 rounded-lg border border-primary/10 bg-white/60 backdrop-blur-xl">
            <h3 className="text-base sm:text-lg font-semibold text-primary-dark mb-4">
              Order Summary
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
              <div className="flex items-center justify-between">
                <span className="text-primary-dark">Tax</span>
                <span className="text-primary-dark">
                  ₹{totals.tax.toLocaleString()}
                </span>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-rose-200/70 to-transparent my-2" />
              <div className="flex items-center justify-between text-base">
                <span className="font-semibold text-primary-dark">
                  Total Paid
                </span>
                <span className="font-bold text-accent">
                  ₹{totals.total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 space-y-3">
              <button className="w-full btn btn-outline btn-animated flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Download Invoice
              </button>
              <button className="w-full btn btn-outline btn-animated flex items-center justify-center gap-2">
                <Share2 className="w-4 h-4" />
                Share Order
              </button>
            </div>
          </div>

          {/* Customer Support */}
          <div className="p-4 rounded-lg border border-primary/10 bg-white/60 backdrop-blur-xl">
            <h3 className="font-semibold text-primary-dark mb-3">Need Help?</h3>
            <div className="space-y-2 text-sm text-primary-dark/70">
              <p>
                Our customer support team is here to help with any questions
                about your order.
              </p>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <span>+1 (800) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <span>support@evarae.com</span>
              </div>
            </div>
          </div>

          {/* Continue Shopping */}
          <div className="p-4 rounded-lg border border-primary/10 bg-white/60 backdrop-blur-xl">
            <Link
              href="/shop"
              className="w-full btn btn-filled btn-animated flex items-center justify-center gap-2"
            >
              Continue Shopping
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </aside>
      </div>
    </Container>
  );
}
