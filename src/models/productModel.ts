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
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    sku: {
      type: String,
      unique: true,
      sparse: true, // allows null but ensures uniqueness if present
    },
    brand: { type: String, default: 'Caelvi' },
    // Relations
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],

    // Pricing & Stock
    price: { type: Number, required: true },
    discountPrice: { type: Number, default: null },
    stockQuantity: { type: Number, default: 0 },

    // Jewellery-specific fields
    material: { type: String, default: '' }, // Gold-plated, Silver, Rose Gold
    weight: { type: String, default: '' }, // e.g., "15g"
    colors: [String], // e.g., ["Rose Gold", "Silver"]

    // Media
    images: [String], // multiple product images
    thumbnail: String, // main image

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

    wallpaper: [String], // multiple wallpaper images
    video: String, // product video
  },
  { timestamps: true }
);

const Product =
  mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;
