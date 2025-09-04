import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    subtitle: {
      type: String,
      default: '',
    },

    description: {
      type: String,
      default: '',
    },

    image: {
      type: String, // desktop image
      required: true,
    },
    mobileImage: {
      type: String, // optional mobile-friendly banner
      default: null,
    },

    linkType: {
      type: String,
      enum: ['url', 'category', 'collection', 'product'],
      default: 'url',
    },
    link: {
      type: String, // if type=url → external/internal URL
      default: null,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    collection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collection',
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },

    // Schedule (optional for time-based campaigns)
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },

    // Placement on frontend
    position: {
      type: String,
      enum: ['homepage', 'category_page', 'collection_page', 'product_page'],
      default: 'homepage',
    },

    priority: {
      type: Number,
      default: 0, // higher → shown first
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Banner = mongoose.models.Banner || mongoose.model('Banner', bannerSchema);
export default Banner;
