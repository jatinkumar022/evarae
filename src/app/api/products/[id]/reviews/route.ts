import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connect } from '@/dbConfig/dbConfig';
import Product from '@/models/productModel';
import Review from '@/models/reviewModel';
import Order from '@/models/orderModel';
import { getUserIdFromRequest } from '@/lib/server/auth/getUserFromRequest';
import { clearKeys, cacheKeys } from '@/lib/cache';

type LeanProductReview = {
  _id: mongoose.Types.ObjectId;
  product?: mongoose.Types.ObjectId;
  user?: {
    _id?: mongoose.Types.ObjectId;
    name?: string;
    email?: string;
  } | null;
  isFeatured?: boolean;
  featuredFullName?: string;
  featuredVotes?: number;
  helpfulVotes?: mongoose.Types.ObjectId[];
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  createdAt: Date;
  verifiedPurchase?: boolean;
  [key: string]: unknown;
};

type RouteContext = { params: Promise<{ id: string }> };

const APPROVED_MATCH = {
  $or: [{ status: 'approved' }, { status: { $exists: false } }],
};

async function resolveProductObjectId(identifier: string) {
  if (!identifier) return null;

  if (/^[a-f0-9]{24}$/i.test(identifier)) {
    return new mongoose.Types.ObjectId(identifier);
  }

  const product = await Product.findOne({
    $or: [{ slug: identifier }, { sku: identifier }],
  })
    .select('_id')
    .lean<{ _id: mongoose.Types.ObjectId } | null>();

  return product?._id ?? null;
}

function sanitizeImages(images: unknown): string[] {
  if (!Array.isArray(images)) return [];
  return images
    .map(img => (typeof img === 'string' ? img.trim() : ''))
    .filter(Boolean)
    .slice(0, 4);
}

export async function GET(request: Request, { params }: RouteContext) {
  try {
    await connect();
    const { id } = await params;
    const productId = await resolveProductObjectId(id);

    if (!productId) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') || '10')));
    const withImages = searchParams.get('withImages') === 'true';

    const viewerId = getUserIdFromRequest(request);

    // Fetch both real (approved) reviews and featured reviews separately
    const realReviewsFilter: Record<string, unknown> = {
      product: productId,
      ...APPROVED_MATCH,
      $or: [{ isFeatured: { $exists: false } }, { isFeatured: false }],
    };

    const featuredReviewsFilter: Record<string, unknown> = {
      product: productId,
      isFeatured: true,
      status: 'approved', // Featured reviews are always approved
    };

    if (withImages) {
      realReviewsFilter.images = { $exists: true, $ne: [] };
      featuredReviewsFilter.images = { $exists: true, $ne: [] };
    }

    // Fetch both types of reviews in parallel
    const [realReviews, featuredReviews] = await Promise.all([
      Review.find(realReviewsFilter)
        .sort({ createdAt: -1 })
        .populate('user', 'name email')
        .select('+helpfulVotes')
        .lean<LeanProductReview[]>(),
      Review.find(featuredReviewsFilter)
        .sort({ createdAt: -1 })
        .select('+helpfulVotes')
        .lean<LeanProductReview[]>(),
    ]);

    // Combine both arrays
    const allReviews = [...realReviews, ...featuredReviews];

    // Shuffle/randomize the combined array
    const shuffledReviews = allReviews.sort(() => Math.random() - 0.5);

    // Apply pagination after shuffling
    const skip = (page - 1) * limit;
    const reviews = shuffledReviews.slice(skip, skip + limit);

    // Get total count for pagination
    const total = allReviews.length;

    // For stats, include both real and featured reviews
    const matchStage = {
      product: productId,
      $or: [
        // Real approved reviews
        {
          ...APPROVED_MATCH,
          $or: [{ isFeatured: { $exists: false } }, { isFeatured: false }],
        },
        // Featured reviews (always approved)
        {
          isFeatured: true,
          status: 'approved',
        },
      ],
    };

    const [stats] = await Review.aggregate<{
      _id: null;
      avgRating: number;
      reviewCount: number;
      verifiedCount: number;
    }>([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
          verifiedCount: {
            $sum: {
              $cond: [{ $eq: ['$verifiedPurchase', true] }, 1, 0],
            },
          },
        },
      },
    ]);

    const breakdownDocs = await Review.aggregate<{ _id: number; count: number }>([
      { $match: matchStage },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]);

    const breakdown = {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
    };

    breakdownDocs.forEach(doc => {
      const key = String(doc._id) as keyof typeof breakdown;
      if (key in breakdown) {
        breakdown[key] = doc.count;
      }
    });

    const viewerObjectId = viewerId ? new mongoose.Types.ObjectId(viewerId) : null;

    const formatted = reviews.map(review => {
      const helpfulVotesArray = Array.isArray(review.helpfulVotes)
        ? review.helpfulVotes
        : [];
      const hasVoted =
        viewerObjectId === null
          ? false
          : helpfulVotesArray.some(id => id.equals(viewerObjectId));

      // Handle featured reviews - use featuredFullName instead of user
      const isFeatured = Boolean(review.isFeatured);
      const userName = isFeatured
        ? (review.featuredFullName || 'Customer')
        : (review.user?.name || 'Customer');
      const userEmail = isFeatured ? '' : (review.user?.email || '');

      // Calculate total helpful votes: real votes + featured votes
      const realVotesCount = helpfulVotesArray.length;
      const featuredVotesCount = isFeatured ? (review.featuredVotes ?? 0) : 0;
      const totalHelpfulVotes = realVotesCount + featuredVotesCount;

      return {
        _id: review._id.toString(),
        rating: review.rating,
        title: review.title || '',
        comment: review.comment,
        images: review.images || [],
        createdAt: review.createdAt,
        verifiedPurchase: !!review.verifiedPurchase,
        helpfulVotes: totalHelpfulVotes, // Sum of real + featured votes
        viewerHasVoted: hasVoted,
        user: {
          _id: isFeatured ? '' : (review.user?._id?.toString?.() ?? ''),
          name: userName,
          email: userEmail,
        },
      };
    });

    const response = NextResponse.json({
      reviews: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + reviews.length < total,
      },
      summary: {
        averageRating:
          typeof stats?.avgRating === 'number'
            ? Math.round(stats.avgRating * 10) / 10
            : 0,
        reviewCount: stats?.reviewCount ?? 0,
        verifiedCount: stats?.verifiedCount ?? 0,
        ratingBreakdown: breakdown,
      },
    });

    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    console.error('[product reviews GET] Error:', error);
    return NextResponse.json(
      { error: 'Unable to load reviews at the moment' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    await connect();
    const { id } = await params;
    const productId = await resolveProductObjectId(id);

    if (!productId) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Please login to submit a review' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const rating = Number(body.rating);
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const comment = typeof body.comment === 'string' ? body.comment.trim() : '';
    const images = sanitizeImages(body.images);

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (comment.length < 10) {
      return NextResponse.json(
        { error: 'Review comment must be at least 10 characters long' },
        { status: 400 }
      );
    }

    // Optimize: Check for existing review and qualified order in parallel
    const [existingReview, qualifiedOrder] = await Promise.all([
      Review.findOne({
        product: productId,
        user: userId,
      })
        .select('_id')
        .lean<{ _id: mongoose.Types.ObjectId } | null>(),
      Order.findOne({
        user: userId,
        'items.product': productId,
        paymentStatus: { $in: ['paid', 'completed'] },
        orderStatus: { $nin: ['cancelled'] },
      })
        .select('_id')
        .lean<{ _id: mongoose.Types.ObjectId } | null>(),
    ]);

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already submitted a review for this product' },
        { status: 409 }
      );
    }

    await Review.create({
      product: productId,
      user: userId,
      order: qualifiedOrder?._id ?? null,
      rating,
      title,
      comment,
      images,
      verifiedPurchase: Boolean(qualifiedOrder),
      status: 'pending',
    });

    clearKeys([
      cacheKeys.productDetail(id),
      cacheKeys.productList(`people-also-bought:${id}`),
      cacheKeys.productList(`related:${id}`),
    ]);

    return NextResponse.json(
      {
        message:
          'Thank you for your review! It will be visible once approved by our team.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[product reviews POST] Error:', error);
    return NextResponse.json(
      { error: 'Unable to submit review at the moment' },
      { status: 500 }
    );
  }
}

