import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true },
    slug: { type: String, default: '' },
    sku: { type: String, default: '' },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, default: null },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'IN' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Human-friendly order number
    orderNumber: { type: String, unique: true, index: true },

    items: { type: [orderItemSchema], required: true },

    subtotalAmount: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    shippingAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    // New: gateway fees (e.g., Razorpay charges + their GST)
    paymentChargesAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    paymentMethod: {
      type: String,
      enum: ['razorpay', 'stripe', 'phonepe', 'cod'],
      default: 'razorpay',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'completed'],
      default: 'pending',
    },

    orderStatus: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'returned',
      ],
      default: 'pending',
    },

    shippingAddress: { type: shippingAddressSchema, required: true },

    paymentProviderOrderId: { type: String, default: null },
    paymentProviderPaymentId: { type: String, default: null },
    paymentProviderSignature: { type: String, default: null },
    paymentProvider: { type: String, default: 'razorpay' },

    trackingNumber: { type: String, default: null },
    courierName: { type: String, default: null },

    isGift: { type: Boolean, default: false },
    couponCode: { type: String, default: null },
    notes: { type: String, default: null },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;
