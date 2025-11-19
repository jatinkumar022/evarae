import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      required: function (this: { isFeatured?: boolean }) {
        return !this.isFeatured;
      },
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    featuredFullName: {
      type: String,
      trim: true,
      default: '',
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 120,
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
      maxlength: 2000,
    },
    // Amazon-like features
    images: {
      type: [String],
      default: [],
    }, // review images (e.g., product worn)
    videos: {
      type: [String],
      default: [],
    }, // optional review videos
    helpfulVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    featuredVotes: { type: Number, default: 0, min: 0 }, // Featured helpful votes for featured reviews
    verifiedPurchase: { type: Boolean, default: false }, // check if order exists
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    adminNotes: {
      type: String,
      default: '',
    },
    approvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Unique index for real reviews (product + user)
// For featured reviews, we allow multiple reviews per product
reviewSchema.index(
  { product: 1, user: 1 },
  {
    unique: true,
    partialFilterExpression: { isFeatured: { $ne: true } },
  }
);
reviewSchema.index({ product: 1, status: 1, createdAt: -1 });
reviewSchema.index({ isFeatured: 1, product: 1 });

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
export default Review;
