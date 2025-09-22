import mongoose from 'mongoose';

const pendingSignupSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
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

const PendingSignup =
  mongoose.models.PendingSignup ||
  mongoose.model('PendingSignup', pendingSignupSchema);
export default PendingSignup;
