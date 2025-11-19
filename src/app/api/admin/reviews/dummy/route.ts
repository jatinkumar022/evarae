import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Review from '@/models/reviewModel';
import Product from '@/models/productModel';
import mongoose from 'mongoose';
import { updateProductRating } from '@/lib/server/reviews/updateProductRating';

interface DummyReviewInput {
  fullName: string;
  title: string;
  rating: number;
  comment: string;
  helpfulVotes?: number; // Deprecated - use dummyVotes instead
  dummyVotes?: number; // Fake helpful votes count
  verifiedPurchase?: boolean;
  createdAt?: string;
  updatedAt?: string;
  images?: string[];
}

type LeanDummyReview = {
  _id: mongoose.Types.ObjectId;
  product?: {
    _id?: mongoose.Types.ObjectId;
    name?: string;
    slug?: string;
  } | null;
  isDummy?: boolean;
  dummyFullName?: string;
  helpfulVotes?: mongoose.Types.ObjectId[] | number;
  dummyVotes?: number;
  [key: string]: unknown;
};

export async function GET(request: Request) {
  try {
    await connect();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)));
    const search = searchParams.get('search')?.trim() || '';
    const product = searchParams.get('product')?.trim() || '';
    const rating = searchParams.get('rating')?.trim() || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build filter - only dummy reviews
    const filter: Record<string, unknown> = { isDummy: true };
    
    if (search) {
      filter.$or = [
        { comment: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { dummyFullName: { $regex: search, $options: 'i' } },
      ];
    }
    if (product) {
      filter.product = product;
    }
    if (rating) {
      const ratingNum = parseInt(rating, 10);
      if (!isNaN(ratingNum) && ratingNum >= 1 && ratingNum <= 5) {
        filter.rating = ratingNum;
      }
    }

    // Build sort - validate sortBy to prevent injection
    const allowedSortFields = ['createdAt', 'rating', 'helpfulVotes', 'dummyVotes', 'updatedAt'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sort: Record<string, 1 | -1> = {};
    sort[validSortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute queries in parallel for better performance
    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('product', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean<LeanDummyReview[]>(),
      Review.countDocuments(filter),
    ]);

    // Format reviews to show dummyFullName as user name
    const formattedReviews = reviews.map(review => {
      const realVotesCount = Array.isArray(review.helpfulVotes)
        ? review.helpfulVotes.length
        : 0;
      const dummyVotesCount = review.dummyVotes ?? 0;
      const totalVotes = realVotesCount + dummyVotesCount;

      return {
        ...review,
        helpfulVotes: totalVotes, // Show total for admin
        dummyVotes: dummyVotesCount, // Also include separate dummyVotes
        user: {
          _id: null,
          name: review.dummyFullName || 'Customer',
          email: '',
        },
      };
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      reviews: formattedReviews,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('[admin dummy reviews GET] Error:', error);
    return NextResponse.json(
      { error: 'Unable to load dummy reviews. Please try again later' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connect();

    const body = await request.json();
    const { productId, reviews } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(reviews) || reviews.length === 0) {
      return NextResponse.json(
        { error: 'Reviews array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Verify product exists
    const productObjectId = /^[a-f0-9]{24}$/i.test(productId)
      ? new mongoose.Types.ObjectId(productId)
      : null;

    if (!productObjectId) {
      return NextResponse.json(
        { error: 'Invalid product ID format' },
        { status: 400 }
      );
    }

    const product = await Product.findById(productObjectId).select('_id name').lean();
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const createdReviews = [];
    const errors = [];

    for (let i = 0; i < reviews.length; i++) {
      const reviewData: DummyReviewInput = reviews[i];

      try {
        // Validate required fields
        if (!reviewData.fullName || !reviewData.rating || !reviewData.comment) {
          errors.push({
            index: i,
            error: 'Missing required fields: fullName, rating, or comment',
          });
          continue;
        }

        // Validate rating
        if (reviewData.rating < 1 || reviewData.rating > 5) {
          errors.push({
            index: i,
            error: 'Rating must be between 1 and 5',
          });
          continue;
        }

        // Parse dates if provided
        let createdAt = new Date();
        let updatedAt = new Date();
        if (reviewData.createdAt) {
          const parsed = new Date(reviewData.createdAt);
          if (!isNaN(parsed.getTime())) {
            createdAt = parsed;
            updatedAt = parsed;
          }
        }
        if (reviewData.updatedAt) {
          const parsed = new Date(reviewData.updatedAt);
          if (!isNaN(parsed.getTime())) {
            updatedAt = parsed;
          }
        }

        // Initialize helpfulVotes array (for real votes from users)
        // Keep helpfulVotes empty for dummy reviews - real votes will be added here
        const helpfulVotesArray: mongoose.Types.ObjectId[] = [];

        // Get dummyVotes count (prefer dummyVotes over deprecated helpfulVotes)
        const dummyVotesCount = reviewData.dummyVotes ?? reviewData.helpfulVotes ?? 0;

        const review = new Review({
          product: productObjectId,
          isDummy: true,
          dummyFullName: reviewData.fullName,
          rating: reviewData.rating,
          title: reviewData.title || '',
          comment: reviewData.comment,
          images: reviewData.images || [],
          helpfulVotes: helpfulVotesArray, // Real user votes (empty initially)
          dummyVotes: Math.max(0, Math.floor(dummyVotesCount)), // Fake votes count
          verifiedPurchase: reviewData.verifiedPurchase ?? false,
          status: 'approved', // Auto-approve dummy reviews
          approvedAt: new Date(),
        });

        // Set custom timestamps
        review.createdAt = createdAt;
        review.updatedAt = updatedAt;

        await review.save();
        createdReviews.push({
          _id: review._id.toString(),
          fullName: reviewData.fullName,
          rating: review.rating,
          title: review.title,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        errors.push({
          index: i,
          error: message,
        });
      }
    }

    // Update product rating after all reviews are created
    if (createdReviews.length > 0) {
      await updateProductRating(productObjectId.toString());
    }

    return NextResponse.json(
      {
        message: `Created ${createdReviews.length} dummy review(s)`,
        created: createdReviews,
        errors: errors.length > 0 ? errors : undefined,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[admin reviews dummy POST] Error:', error);
    return NextResponse.json(
      { error: 'Unable to create dummy reviews. Please try again' },
      { status: 500 }
    );
  }
}

