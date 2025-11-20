import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Category slug is required'],
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    banner: {
      type: String,
      default: '',
    },
    mobileBanner: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ isActive: 1, sortOrder: 1 });
categorySchema.index({ isActive: 1, name: 1 });

// Ensure latest schema is used in dev/hot-reload environments
if (mongoose.models.Category) {
  delete mongoose.models.Category;
}

const Category = mongoose.model('Category', categorySchema);
export default Category;
