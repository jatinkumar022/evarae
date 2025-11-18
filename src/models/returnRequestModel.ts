import mongoose from 'mongoose';

const returnRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    orderItem: {
      // Store the item details at time of return request
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      name: { type: String, required: true },
      slug: { type: String, default: '' },
      sku: { type: String, default: '' },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true, min: 1 },
      image: { type: String, default: null },
    },
    returnReason: {
      type: String,
      required: true,
      enum: [
        'defective',
        'wrong_item',
        'quality_issue',
        'not_as_described',
        'damaged',
        'other',
      ],
    },
    note: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    images: {
      type: [String],
      required: true,
      validate: {
        validator: function (images: string[]) {
          return images.length >= 2 && images.length <= 5;
        },
        message: 'Please provide 2-5 images',
      },
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'processing', 'completed'],
      default: 'pending',
      index: true,
    },
    adminNotes: {
      type: String,
      default: null,
    },
    processedAt: {
      type: Date,
      default: null,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
returnRequestSchema.index({ order: 1, status: 1 });
returnRequestSchema.index({ user: 1, status: 1 });
returnRequestSchema.index({ createdAt: -1 });

const ReturnRequest =
  mongoose.models.ReturnRequest ||
  mongoose.model('ReturnRequest', returnRequestSchema);

export default ReturnRequest;

