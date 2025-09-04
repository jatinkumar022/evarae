import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      default: '',
    },

    // Amazon-like features
    images: [String], // review images (e.g., product worn)
    videos: [String], // optional review videos
    helpfulVotes: { type: Number, default: 0 },
    verifiedPurchase: { type: Boolean, default: false }, // check if order exists
  },
  { timestamps: true }
);

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
export default Review;
