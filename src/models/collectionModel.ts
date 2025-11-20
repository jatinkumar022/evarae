import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Collectio name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Collection slug is required'],
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
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },

    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  { timestamps: true }
);

collectionSchema.index({ slug: 1 }, { unique: true });
collectionSchema.index({ isActive: 1, sortOrder: 1 });

const Collection =
  mongoose.models.Collection || mongoose.model('Collection', collectionSchema);
export default Collection;
