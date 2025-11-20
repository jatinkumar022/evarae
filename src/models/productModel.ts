import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Product slug is required'],
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    sku: {
      type: String,
      trim: true,
    },
    brand: { type: String, default: 'Caelvi' },
    // Relations
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],

    // Pricing & Stock
    price: { type: Number, required: true },
    discountPrice: { type: Number, default: null },
    stockQuantity: { type: Number, default: 0 },

    // Jewellery-specific fields
    weight: { type: String, default: '' }, // e.g., "15g"

    // Media
    images: [String], // multiple product images

    // Ratings
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 }, //we have model for reviews please use that

    // Status
    status: {
      type: String,
      enum: ['active', 'out_of_stock', 'hidden'],
      default: 'active',
    },
    tags: [{ type: String, trim: true }],
    // SEO
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },

    video: String, // product video
  },
  { timestamps: true }
);

productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ sku: 1 }, { unique: true, sparse: true });
productSchema.index({ status: 1, createdAt: -1 });
productSchema.index({ categories: 1, status: 1 });

const Product =
  mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;
