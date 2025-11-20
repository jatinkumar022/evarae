import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: 'Home' },
    fullName: { type: String, default: '' },
    phone: { type: String, default: '' },
    line1: { type: String, default: '' },
    line2: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    country: { type: String, default: 'IN' },
    isDefaultShipping: { type: Boolean, default: false },
    isDefaultBilling: { type: Boolean, default: false },
  },
  { _id: true, timestamps: true }
);

const userProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },

    // Basic details beyond core User
    phone: { type: String, default: '' },
    gender: {
      type: String,
      enum: ['prefer_not_to_say', 'male', 'female', 'other'],
      default: 'prefer_not_to_say',
    },
    dob: { type: Date, default: null },

    // Preferences
    newsletterOptIn: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    emailNotifications: { type: Boolean, default: true },
    orderUpdates: { type: Boolean, default: true },
    promotionalEmails: { type: Boolean, default: true },
    language: { type: String, default: 'en' },

    // Security
    twoFactorEnabled: { type: Boolean, default: false },

    // Embedded data
    addresses: { type: [addressSchema], default: [] },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  { timestamps: true }
);

userProfileSchema.index({ user: 1 }, { unique: true });
userProfileSchema.index({ phone: 1 });

const UserProfile =
  mongoose.models.UserProfile ||
  mongoose.model('UserProfile', userProfileSchema);

export default UserProfile;
