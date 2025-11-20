import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'] },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: v => /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v),
        message: props => `${props.value} is not a valid email!`,
      },
    },
    passwordHash: { type: String, default: null },

    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: false },

    // Security Tokens
    forgotPasswordToken: { type: String, default: null },
    forgotPasswordExpiry: { type: Date, default: null },
    verifyToken: { type: String, default: null },
    verifyTokenExpiry: { type: Date, default: null },

    // Admin OTP
    adminOtpHash: { type: String, default: null },
    adminOtpExpiry: { type: Date, default: null },
    adminOtpAttempts: { type: Number, default: 0 },
    adminOtpLastSentAt: { type: Date, default: null },

    // User OTP
    loginOtpHash: { type: String, default: null },
    loginOtpExpiry: { type: Date, default: null },
    loginOtpAttempts: { type: Number, default: 0 },
    loginOtpLastSentAt: { type: Date, default: null },

    // Relation with Profile
    profile: { type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile' },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1, createdAt: -1 });

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
