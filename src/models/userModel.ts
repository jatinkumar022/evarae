import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'] },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: v => /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v),
        message: props => `${props.value} is not a valid email!`,
      },
    },

    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },

    passwordHash: { type: String, default: null },

    phone: { type: String, default: '' },

    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
      default: 'prefer_not_to_say',
    },
    dob: { type: Date, default: null },
    newsletterOptIn: { type: Boolean, default: false },

    addresses: [addressSchema],

    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    cart: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, default: 1 },
      },
    ],

    // Security Tokens
    forgotPasswordToken: { type: String, default: null },
    forgotPasswordExpiry: { type: Date, default: null },
    verifyToken: { type: String, default: null },
    verifyTokenExpiry: { type: Date, default: null },

    // Admin OTP login fields
    adminOtpHash: { type: String, default: null },
    adminOtpExpiry: { type: Date, default: null },
    adminOtpAttempts: { type: Number, default: 0 },
    adminOtpLastSentAt: { type: Date, default: null },

    // User OTP login fields
    loginOtpHash: { type: String, default: null },
    loginOtpExpiry: { type: Date, default: null },
    loginOtpAttempts: { type: Number, default: 0 },
    loginOtpLastSentAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
