import mongoose from 'mongoose';
import Review from '@/models/reviewModel';
import Product from '@/models/productModel';

type RatingSummary = {
  rating: number;
  reviewsCount: number;
  ratingBreakdown: Record<'1' | '2' | '3' | '4' | '5', number>;
};

function toObjectId(id: string | mongoose.Types.ObjectId) {
  if (id instanceof mongoose.Types.ObjectId) return id;
  if (/^[a-f0-9]{24}$/i.test(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  return null;
}

/**
 * Recalculates the `rating` and `reviewsCount` fields on a product using
 * only approved reviews. Returns the summary that was written.
 */
export async function updateProductRating(
  productId: string | mongoose.Types.ObjectId
): Promise<RatingSummary | null> {
  const objectId = toObjectId(productId);
  if (!objectId) {
    console.warn('[reviews] updateProductRating called with invalid product id', productId);
    return null;
  }

  const matchStage = {
    product: objectId,
    $or: [{ status: 'approved' }, { status: { $exists: false } }],
  };

  const [summary] = await Review.aggregate<{
    _id: null;
    avgRating: number;
    reviewCount: number;
  }>([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const breakdownDocs = await Review.aggregate<{ _id: number; count: number }>([
    { $match: matchStage },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 },
      },
    },
  ]);

  const breakdown: RatingSummary['ratingBreakdown'] = {
    '1': 0,
    '2': 0,
    '3': 0,
    '4': 0,
    '5': 0,
  };

  breakdownDocs.forEach(doc => {
    const key = String(doc._id) as keyof RatingSummary['ratingBreakdown'];
    if (key in breakdown) {
      breakdown[key] = doc.count;
    }
  });

  const avgRating =
    typeof summary?.avgRating === 'number'
      ? Math.round(summary.avgRating * 10) / 10
      : 0;
  const reviewsCount = summary?.reviewCount ?? 0;

  await Product.findByIdAndUpdate(objectId, {
    rating: avgRating,
    reviewsCount,
  }).exec();

  return {
    rating: avgRating,
    reviewsCount,
    ratingBreakdown: breakdown,
  };
}

