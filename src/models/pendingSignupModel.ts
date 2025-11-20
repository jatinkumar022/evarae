import mongoose from 'mongoose';

const pendingSignupSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otpHash: { type: String, required: true },
    otpExpiry: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    lastSentAt: { type: Date, default: null },
  },
  { timestamps: true }
);

pendingSignupSchema.index({ email: 1 }, { unique: true });
pendingSignupSchema.index({ createdAt: -1 });

const PendingSignup =
  mongoose.models.PendingSignup ||
  mongoose.model('PendingSignup', pendingSignupSchema);
export default PendingSignup;
