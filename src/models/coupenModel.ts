import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true, // always store in uppercase
    },

    discountType: {
      type: String,
      enum: ['percentage', 'fixed'], // % off or flat discount
      required: true,
    },

    discountValue: {
      type: Number,
      required: true, // e.g. 20% or ₹200
    },

    minOrderValue: {
      type: Number,
      default: 0,
    },

    maxDiscount: {
      type: Number,
      default: null, // only for percentage based (cap limit)
    },

    startDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: true,
    },

    usageLimit: {
      type: Number,
      default: null, // max times coupon can be used (global)
    },
    usageCount: {
      type: Number,
      default: 0,
    },

    perUserLimit: {
      type: Number,
      default: 1,
    },

    applicableCategories: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    ],
    applicableProducts: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    ],

    eligibleUsers: {
      type: String,
      enum: ['all', 'new_users', 'selected'],
      default: 'all',
    },
    selectedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);
export default Coupon;
