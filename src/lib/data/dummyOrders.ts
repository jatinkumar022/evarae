// Dummy orders data based on orderModel.ts schema
export interface OrderItem {
  product: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  quantity: number;
  image: string | null;
  selectedColor: string | null;
  selectedSize: string | null;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Order {
  _id: string;
  user: string;
  orderNumber: string;
  items: OrderItem[];
  subtotalAmount: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  paymentChargesAmount: number;
  totalAmount: number;
  paymentMethod: 'razorpay' | 'stripe' | 'phonepe' | 'cod';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'completed';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  shippingAddress: ShippingAddress;
  paymentProviderOrderId: string | null;
  paymentProviderPaymentId: string | null;
  paymentProviderSignature: string | null;
  paymentProvider: string;
  trackingNumber: string | null;
  courierName: string | null;
  isGift: boolean;
  couponCode: string | null;
  notes: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const dummyOrders: Order[] = [
  {
    _id: 'order001',
    user: 'user001',
    orderNumber: 'ORD-2024-001',
    items: [
      {
        product: 'prod001',
        name: 'Traditional Gold Mangalsutra',
        slug: 'traditional-gold-mangalsutra',
        sku: 'MANG-22K-001',
        price: 12999,
        quantity: 1,
        image: 'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/mangalsutra-gold-1',
        selectedColor: 'Gold',
        selectedSize: null,
      },
    ],
    subtotalAmount: 12999,
    taxAmount: 2340,
    shippingAmount: 200,
    discountAmount: 3000,
    paymentChargesAmount: 154,
    totalAmount: 12693,
    paymentMethod: 'razorpay',
    paymentStatus: 'paid',
    orderStatus: 'delivered',
    shippingAddress: {
      fullName: 'Priya Sharma',
      phone: '+91 98765 43210',
      line1: '123 Main Street',
      line2: 'Apartment 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'IN',
    },
    paymentProviderOrderId: 'order_123456789',
    paymentProviderPaymentId: 'pay_987654321',
    paymentProviderSignature: 'sig_abcdef123456',
    paymentProvider: 'razorpay',
    trackingNumber: 'TRK123456789',
    courierName: 'BlueDart',
    isGift: false,
    couponCode: 'WELCOME3000',
    notes: 'Please handle with care',
    paidAt: '2024-01-15T10:30:00.000Z',
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-18T14:30:00.000Z',
  },
  {
    _id: 'order002',
    user: 'user002',
    orderNumber: 'ORD-2024-002',
    items: [
      {
        product: 'prod002',
        name: 'Diamond Stud Earrings',
        slug: 'diamond-stud-earrings',
        sku: 'EARR-DIA-001',
        price: 45000,
        quantity: 2,
        image: 'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/diamond-earrings-1',
        selectedColor: 'White Gold',
        selectedSize: null,
      },
    ],
    subtotalAmount: 90000,
    taxAmount: 16200,
    shippingAmount: 500,
    discountAmount: 0,
    paymentChargesAmount: 1062,
    totalAmount: 107762,
    paymentMethod: 'razorpay',
    paymentStatus: 'paid',
    orderStatus: 'shipped',
    shippingAddress: {
      fullName: 'Rahul Patel',
      phone: '+91 87654 32109',
      line1: '456 Oak Avenue',
      line2: 'Flat 302',
      city: 'Delhi',
      state: 'Delhi',
      postalCode: '110001',
      country: 'IN',
    },
    paymentProviderOrderId: 'order_234567890',
    paymentProviderPaymentId: 'pay_876543210',
    paymentProviderSignature: 'sig_bcdefg234567',
    paymentProvider: 'razorpay',
    trackingNumber: 'TRK987654321',
    courierName: 'Delhivery',
    isGift: true,
    couponCode: null,
    notes: 'Gift wrapping required',
    paidAt: '2024-01-14T15:45:00.000Z',
    createdAt: '2024-01-14T15:30:00.000Z',
    updatedAt: '2024-01-16T10:20:00.000Z',
  },
  {
    _id: 'order003',
    user: 'user003',
    orderNumber: 'ORD-2024-003',
    items: [
      {
        product: 'prod003',
        name: 'Gold Chain Necklace',
        slug: 'gold-chain-necklace',
        sku: 'CHAIN-22K-001',
        price: 85000,
        quantity: 1,
        image: 'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/gold-chain-1',
        selectedColor: 'Gold',
        selectedSize: '22 inch',
      },
    ],
    subtotalAmount: 85000,
    taxAmount: 15300,
    shippingAmount: 300,
    discountAmount: 5000,
    paymentChargesAmount: 1003,
    totalAmount: 96603,
    paymentMethod: 'razorpay',
    paymentStatus: 'paid',
    orderStatus: 'processing',
    shippingAddress: {
      fullName: 'Anjali Singh',
      phone: '+91 76543 21098',
      line1: '789 Pine Road',
      line2: 'Villa 12',
      city: 'Bangalore',
      state: 'Karnataka',
      postalCode: '560001',
      country: 'IN',
    },
    paymentProviderOrderId: 'order_345678901',
    paymentProviderPaymentId: 'pay_765432109',
    paymentProviderSignature: 'sig_cdefgh345678',
    paymentProvider: 'razorpay',
    trackingNumber: null,
    courierName: null,
    isGift: false,
    couponCode: 'SAVE5000',
    notes: null,
    paidAt: '2024-01-13T09:30:00.000Z',
    createdAt: '2024-01-13T09:15:00.000Z',
    updatedAt: '2024-01-13T12:00:00.000Z',
  },
  {
    _id: 'order004',
    user: 'user004',
    orderNumber: 'ORD-2024-004',
    items: [
      {
        product: 'prod004',
        name: 'Traditional Bangles Set',
        slug: 'traditional-bangles-set',
        sku: 'BANG-22K-001',
        price: 65000,
        quantity: 1,
        image: 'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/bangles-1',
        selectedColor: 'Gold',
        selectedSize: 'Standard',
      },
    ],
    subtotalAmount: 65000,
    taxAmount: 11700,
    shippingAmount: 200,
    discountAmount: 0,
    paymentChargesAmount: 767,
    totalAmount: 77667,
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    orderStatus: 'pending',
    shippingAddress: {
      fullName: 'Vikram Mehta',
      phone: '+91 65432 10987',
      line1: '321 Elm Street',
      line2: '',
      city: 'Chennai',
      state: 'Tamil Nadu',
      postalCode: '600001',
      country: 'IN',
    },
    paymentProviderOrderId: null,
    paymentProviderPaymentId: null,
    paymentProviderSignature: null,
    paymentProvider: 'cod',
    trackingNumber: null,
    courierName: null,
    isGift: false,
    couponCode: null,
    notes: 'Cash on delivery preferred',
    paidAt: null,
    createdAt: '2024-01-12T16:45:00.000Z',
    updatedAt: '2024-01-12T16:45:00.000Z',
  },
  {
    _id: 'order005',
    user: 'user005',
    orderNumber: 'ORD-2024-005',
    items: [
      {
        product: 'prod005',
        name: 'Diamond Ring for Engagement',
        slug: 'diamond-ring-engagement',
        sku: 'RING-DIA-001',
        price: 250000,
        quantity: 1,
        image: 'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/diamond-ring-1',
        selectedColor: 'Platinum',
        selectedSize: 'Size 6',
      },
    ],
    subtotalAmount: 250000,
    taxAmount: 45000,
    shippingAmount: 1000,
    discountAmount: 10000,
    paymentChargesAmount: 2390,
    totalAmount: 287390,
    paymentMethod: 'razorpay',
    paymentStatus: 'paid',
    orderStatus: 'confirmed',
    shippingAddress: {
      fullName: 'Rajesh Kumar',
      phone: '+91 98765 12345',
      line1: '987 Rose Garden',
      line2: 'Block C',
      city: 'Pune',
      state: 'Maharashtra',
      postalCode: '411001',
      country: 'IN',
    },
    paymentProviderOrderId: 'order_456789012',
    paymentProviderPaymentId: 'pay_654321098',
    paymentProviderSignature: 'sig_defghi456789',
    paymentProvider: 'razorpay',
    trackingNumber: null,
    courierName: null,
    isGift: false,
    couponCode: 'ENGAGE10000',
    notes: 'Ring size confirmation required',
    paidAt: '2024-01-11T11:00:00.000Z',
    createdAt: '2024-01-11T10:45:00.000Z',
    updatedAt: '2024-01-11T11:15:00.000Z',
  },
  {
    _id: 'order006',
    user: 'user006',
    orderNumber: 'ORD-2024-006',
    items: [
      {
        product: 'prod006',
        name: 'Silver Pendant Set',
        slug: 'silver-pendant-set',
        sku: 'PEND-SIL-001',
        price: 35000,
        quantity: 1,
        image: 'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto/v1/jewelry/pendant-1',
        selectedColor: 'Silver',
        selectedSize: null,
      },
    ],
    subtotalAmount: 35000,
    taxAmount: 6300,
    shippingAmount: 150,
    discountAmount: 0,
    paymentChargesAmount: 413,
    totalAmount: 41863,
    paymentMethod: 'razorpay',
    paymentStatus: 'failed',
    orderStatus: 'cancelled',
    shippingAddress: {
      fullName: 'Meera Desai',
      phone: '+91 91234 56789',
      line1: '654 Maple Lane',
      line2: 'Apt 5C',
      city: 'Ahmedabad',
      state: 'Gujarat',
      postalCode: '380001',
      country: 'IN',
    },
    paymentProviderOrderId: 'order_567890123',
    paymentProviderPaymentId: null,
    paymentProviderSignature: null,
    paymentProvider: 'razorpay',
    trackingNumber: null,
    courierName: null,
    isGift: false,
    couponCode: null,
    notes: 'Payment failed - customer to retry',
    paidAt: null,
    createdAt: '2024-01-10T14:20:00.000Z',
    updatedAt: '2024-01-10T14:25:00.000Z',
  },
];

