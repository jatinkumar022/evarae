'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Container from '@/app/(main)/components/layouts/Container';
import { allProducts } from '@/lib/data/products';
import { Product } from '@/lib/types/product';
import {
  CreditCard,
  Truck,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  Building,
  FileText,
  Plus,
  Edit,
  Trash2,
  Shield,
  Clock,
  Package,
} from 'lucide-react';

interface CartItem {
  product: Product;
  quantity: number;
}

type PaymentMethod = 'CREDIT_CARD' | 'PAYPAL' | 'COD' | 'BANK_TRANSFER';

interface Address {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  company?: string;
  vatNumber?: string;
  isDefault: boolean;
}

interface DeliveryMethod {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
  description: string;
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

const deliveryMethods: DeliveryMethod[] = [
  {
    id: 'express',
    name: 'Express Delivery',
    price: 49,
    estimatedDays: 'Get it today',
    description: 'Same day delivery for urgent orders',
  },
  {
    id: 'fast',
    name: 'DHL Fast Delivery',
    price: 15,
    estimatedDays: 'Get it by Tomorrow',
    description: 'Next day delivery service',
  },
  {
    id: 'standard',
    name: 'Free Delivery - FedEx',
    price: 0,
    estimatedDays: 'Get it by Friday, 13 Dec 2023',
    description: 'Standard delivery service',
  },
];

export default function CheckoutPage() {
  const router = useRouter();

  // Check if user came from cart (you can implement this with localStorage or context)
  useEffect(() => {
    // Check if user came from cart page
    const cameFromCart = sessionStorage.getItem('cameFromCart');
    if (!cameFromCart && getInitialCart().length === 0) {
      router.push('/cart');
      return;
    }

    // Set flag for next pages
    sessionStorage.setItem('cameFromCart', 'true');
  }, [router]);

  // Cart state
  const [cartItems] = useState<CartItem[]>(getInitialCart());

  // Address state
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      fullName: 'Bonnie Green',
      email: 'name@flowbite.com',
      phone: '+1 123-456-7890',
      country: 'United States',
      city: 'San Francisco',
      address: '123 Main Street, Apt 4B',
      company: 'Flowbite LLC',
      vatNumber: 'DE42313253',
      isDefault: true,
    },
  ]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('1');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<
    Omit<Address, 'id' | 'isDefault'>
  >({
    fullName: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    address: '',
    company: '',
    vatNumber: '',
  });

  // Payment state
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('CREDIT_CARD');
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
    paypalEmail: '',
    bankDetails: '',
  });

  // Delivery state
  const [selectedDeliveryId, setSelectedDeliveryId] =
    useState<string>('standard');
  const [giftWrap, setGiftWrap] = useState(false);
  const [orderNote, setOrderNote] = useState('');

  // Totals calculation
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

    const selectedDelivery = deliveryMethods.find(
      d => d.id === selectedDeliveryId
    );
    const shipping = selectedDelivery?.price || 0;
    const giftWrapCost = giftWrap ? 99 : 0;
    const tax = Math.floor(subtotal * 0.18); // 18% tax
    const total = Math.max(0, subtotal - shipping + giftWrapCost + tax);

    return {
      subtotal,
      savings,
      shipping,
      giftWrapCost,
      tax,
      total,
    };
  }, [cartItems, selectedDeliveryId, giftWrap]);

  // Helper functions
  const addNewAddress = () => {
    if (
      newAddress.fullName &&
      newAddress.email &&
      newAddress.phone &&
      newAddress.country &&
      newAddress.city &&
      newAddress.address
    ) {
      const address: Address = {
        ...newAddress,
        id: Date.now().toString(),
        isDefault: addresses.length === 0,
      };
      setAddresses(prev => [...prev, address]);
      setSelectedAddressId(address.id);
      setShowAddAddress(false);
      setNewAddress({
        fullName: '',
        email: '',
        phone: '',
        country: '',
        city: '',
        address: '',
        company: '',
        vatNumber: '',
      });
    }
  };

  const deleteAddress = (id: string) => {
    if (addresses.length > 1) {
      setAddresses(prev => prev.filter(addr => addr.id !== id));
      if (selectedAddressId === id) {
        setSelectedAddressId(addresses[0]?.id || '');
      }
    }
  };

  return (
    <Container className="py-4 md:py-8 lg:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Address Section */}
          <div className="p-4 sm:p-5 rounded-lg border border-primary/10 bg-white/60 backdrop-blur-xl">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-xl md:text-2xl font-semibold text-primary-dark font-heading">
                Checkout
              </h1>
              <p className="text-primary-dark/70 text-sm">
                Complete your purchase with secure payment
              </p>
            </div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-primary-dark flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Delivery Details
              </h2>
              <button
                onClick={() => setShowAddAddress(!showAddAddress)}
                className="px-3 p-2 rounded-full btn-outline btn-animated text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add New Address
              </button>
            </div>

            {/* Address List */}
            <div className="space-y-3 mb-4">
              {addresses.map(address => (
                <div
                  key={address.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedAddressId === address.id
                      ? 'border-primary bg-primary/5'
                      : 'border-primary/20 hover:border-primary/40'
                  }`}
                  onClick={() => setSelectedAddressId(address.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === address.id}
                          onChange={() => setSelectedAddressId(address.id)}
                          className="text-primary"
                        />
                        <span className="font-semibold text-primary-dark">
                          {address.fullName}
                        </span>
                        {address.isDefault && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="text-xs sm:text-sm text-primary-dark/80 space-y-1">
                        <p>{address.address}</p>
                        <p>
                          {address.city}, {address.country}
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone className="w-3 h-3" />
                          {address.phone}
                        </p>
                        <p className="flex items-center gap-2">
                          <Mail className="w-3 h-3" />
                          {address.email}
                        </p>
                        {address.company && (
                          <p className="flex items-center gap-2">
                            <Building className="w-3 h-3" />
                            {address.company}
                          </p>
                        )}
                        {address.vatNumber && (
                          <p className="flex items-center gap-2">
                            <FileText className="w-3 h-3" />
                            {address.vatNumber}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          // Edit functionality would go here
                        }}
                        className="p-1 text-primary hover:bg-primary/10 rounded-full transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {addresses.length > 1 && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            deleteAddress(address.id);
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Address Form */}
            {showAddAddress && (
              <div className="border mb-3 border-primary/20 rounded-lg p-4 bg-white/50">
                <h3 className="font-semibold text-primary-dark mb-3">
                  Add New Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={newAddress.fullName}
                    onChange={e =>
                      setNewAddress(prev => ({
                        ...prev,
                        fullName: e.target.value,
                      }))
                    }
                    className="rounded-md border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <input
                    type="email"
                    placeholder="Your email*"
                    value={newAddress.email}
                    onChange={e =>
                      setNewAddress(prev => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="rounded-md border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    placeholder="Country*"
                    value={newAddress.country}
                    onChange={e =>
                      setNewAddress(prev => ({
                        ...prev,
                        country: e.target.value,
                      }))
                    }
                    className="rounded-md border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    placeholder="City*"
                    value={newAddress.city}
                    onChange={e =>
                      setNewAddress(prev => ({ ...prev, city: e.target.value }))
                    }
                    className="rounded-md border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    placeholder="Phone Number*"
                    value={newAddress.phone}
                    onChange={e =>
                      setNewAddress(prev => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="md:col-span-2 rounded-md border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    value={newAddress.address}
                    onChange={e =>
                      setNewAddress(prev => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    className="md:col-span-2 rounded-md border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    placeholder="Company name (optional)"
                    value={newAddress.company}
                    onChange={e =>
                      setNewAddress(prev => ({
                        ...prev,
                        company: e.target.value,
                      }))
                    }
                    className="rounded-md border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    placeholder="VAT number (optional)"
                    value={newAddress.vatNumber}
                    onChange={e =>
                      setNewAddress(prev => ({
                        ...prev,
                        vatNumber: e.target.value,
                      }))
                    }
                    className="rounded-md border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={addNewAddress}
                    className="btn btn-filled btn-animated text-sm"
                  >
                    Add Address
                  </button>
                  <button
                    onClick={() => setShowAddAddress(false)}
                    className="btn btn-outline btn-animated text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-primary-dark mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment
            </h2>

            <div className="space-y-4">
              {/* Credit Card */}
              <div
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  paymentMethod === 'CREDIT_CARD'
                    ? 'border-primary bg-primary/5'
                    : 'border-primary/20'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'CREDIT_CARD'}
                    onChange={() => setPaymentMethod('CREDIT_CARD')}
                    className="text-primary"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary-dark">
                      Credit Card
                    </h3>
                    <p className="text-xs sm:text-sm text-primary-dark/70">
                      Pay with your credit card
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {paymentMethod === 'CREDIT_CARD' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Card number"
                      value={paymentDetails.cardNumber}
                      onChange={e =>
                        setPaymentDetails(prev => ({
                          ...prev,
                          cardNumber: e.target.value,
                        }))
                      }
                      className="md:col-span-2 rounded-md border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                    <input
                      type="text"
                      placeholder="Name on card"
                      value={paymentDetails.cardName}
                      onChange={e =>
                        setPaymentDetails(prev => ({
                          ...prev,
                          cardName: e.target.value,
                        }))
                      }
                      className="rounded-md border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={paymentDetails.expiry}
                      onChange={e =>
                        setPaymentDetails(prev => ({
                          ...prev,
                          expiry: e.target.value,
                        }))
                      }
                      className="rounded-md border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                    <input
                      type="text"
                      placeholder="CVV"
                      value={paymentDetails.cvv}
                      onChange={e =>
                        setPaymentDetails(prev => ({
                          ...prev,
                          cvv: e.target.value,
                        }))
                      }
                      className="rounded-md border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>
                )}
              </div>

              {/* Payment on Delivery */}
              <div
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-primary bg-primary/5'
                    : 'border-primary/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="text-primary"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary-dark">
                      Payment on delivery
                    </h3>
                    <p className="text-xs sm:text-sm text-primary-dark/70">
                      +$15 payment processing fee
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* PayPal */}
              <div
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  paymentMethod === 'PAYPAL'
                    ? 'border-primary bg-primary/5'
                    : 'border-primary/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'PAYPAL'}
                    onChange={() => setPaymentMethod('PAYPAL')}
                    className="text-primary"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary-dark">
                      Paypal account
                    </h3>
                    <p className="text-xs sm:text-sm text-primary-dark/70">
                      Connect to your account
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {paymentMethod === 'PAYPAL' && (
                  <div className="mt-3">
                    <input
                      type="email"
                      placeholder="PayPal email"
                      value={paymentDetails.paypalEmail}
                      onChange={e =>
                        setPaymentDetails(prev => ({
                          ...prev,
                          paypalEmail: e.target.value,
                        }))
                      }
                      className="w-full rounded-md border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Methods */}
          <div className="p-4 sm:p-5 rounded-lg border border-primary/10 bg-white/60 backdrop-blur-xl">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-primary-dark mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Delivery Methods
            </h2>

            <div className="space-y-3">
              {deliveryMethods.map(method => (
                <div
                  key={method.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedDeliveryId === method.id
                      ? 'border-primary bg-primary/5'
                      : 'border-primary/20'
                  }`}
                  onClick={() => setSelectedDeliveryId(method.id)}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="delivery"
                      checked={selectedDeliveryId === method.id}
                      onChange={() => setSelectedDeliveryId(method.id)}
                      className="text-primary"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-primary-dark text-sm sm:text-base">
                          {method.price > 0
                            ? `$${method.price} - ${method.name}`
                            : method.name}
                        </h3>
                        <span className="text-xs sm:text-sm text-primary-dark/70">
                          {method.price > 0 ? `$${method.price}` : 'Free'}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-primary-dark/70">
                        {method.estimatedDays}
                      </p>
                      <p className="text-xs text-primary-dark/60">
                        {method.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Additional Options */}
          <div className="p-4 sm:p-5 rounded-lg border border-primary/10 bg-white/60 backdrop-blur-xl">
            <h2 className="text-xl font-semibold text-primary-dark mb-4">
              Additional Options
            </h2>

            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={giftWrap}
                  onChange={e => setGiftWrap(e.target.checked)}
                  className="rounded border-primary/20 text-primary focus:ring-primary/20"
                />
                <div>
                  <span className="font-medium text-primary-dark">
                    Gift Wrap
                  </span>
                  <p className="text-sm text-primary-dark/70">
                    Beautiful gift packaging for your order
                  </p>
                </div>
              </label>

              <div>
                <label className="block text-sm font-medium text-primary-dark mb-2">
                  Order Note (Optional)
                </label>
                <textarea
                  value={orderNote}
                  onChange={e => setOrderNote(e.target.value)}
                  placeholder="Enter any special instructions or notes for your order..."
                  rows={3}
                  className="w-full rounded-md border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary resize-none"
                />
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

            {/* Price Breakdown */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-primary-dark">Subtotal</span>
                <span className="font-semibold text-accent">
                  ${totals.subtotal.toLocaleString()}
                </span>
              </div>
              {totals.savings > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-primary-dark">Savings</span>
                  <span className="text-green-600">
                    -${totals.savings.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-primary-dark">Store Pickup</span>
                <span className="text-primary-dark">$99</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-primary-dark">Tax</span>
                <span className="text-primary-dark">
                  ${totals.tax.toLocaleString()}
                </span>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-rose-200/70 to-transparent my-2" />
              <div className="flex items-center justify-between text-base">
                <span className="font-semibold text-primary-dark">Total</span>
                <span className="font-bold text-accent">
                  ${totals.total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Proceed Button */}
            <Link
              href="/checkout/payment"
              className="mt-5 w-full btn btn-filled btn-animated flex items-center justify-center gap-2"
            >
              Proceed to Payment
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Security Notice */}
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <Shield className="w-4 h-4" />
                <span className="text-xs font-medium">Secure Checkout</span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                Your payment information is encrypted and secure
              </p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="p-4 rounded-lg border border-primary/10 bg-white/60 backdrop-blur-xl">
            <div className="space-y-3 text-sm text-primary-dark">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                <span>Free returns within 30 days</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>24/7 customer support</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>SSL encrypted checkout</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </Container>
  );
}
