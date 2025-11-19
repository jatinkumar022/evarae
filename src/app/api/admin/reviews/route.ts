import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Review from '@/models/reviewModel';
import { updateProductRating } from '@/lib/server/reviews/updateProductRating';
import mongoose from 'mongoose';

type LeanAdminReview = {
  _id: mongoose.Types.ObjectId;
  product?: {
    _id?: mongoose.Types.ObjectId;
    name?: string;
    slug?: string;
  } | null;
  user?: {
    _id?: mongoose.Types.ObjectId;
    name?: string;
    email?: string;
  } | null;
  isFeatured?: boolean;
  featuredFullName?: string;
  helpfulVotes?: mongoose.Types.ObjectId[] | number;
  [key: string]: unknown;
};

const APPROVED_OR_LEGACY = {
  $or: [{ status: 'approved' }, { status: { $exists: false } }],
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
    const verifiedPurchase = searchParams.get('verifiedPurchase')?.trim() || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const status = searchParams.get('status')?.trim() || '';

    const skip = (page - 1) * limit;

    // Build filter - exclude featured reviews (only show real reviews)
    const filter: Record<string, unknown> = {
      $or: [{ isFeatured: { $exists: false } }, { isFeatured: false }],
    };

    // Build search filter - search in comment, title, and user name/email via populate
    if (search) {
      const searchConditions: unknown[] = [
        { comment: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
      ];
      filter.$and = filter.$and || [];
      (filter.$and as unknown[]).push({ $or: searchConditions });
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
    if (verifiedPurchase !== '') {
      filter.verifiedPurchase = verifiedPurchase === 'true';
    }

    // Handle status filter - empty means "All Status"
    if (status) {
      if (status === 'approved') {
        filter.$and = filter.$and || [];
        (filter.$and as unknown[]).push(APPROVED_OR_LEGACY);
      } else if (status === 'rejected' || status === 'pending') {
        filter.status = status;
      }
    }
    // If status is empty, show all statuses (no status filter applied)

    // Build sort - validate sortBy to prevent injection
    const allowedSortFields = ['createdAt', 'rating', 'helpfulVotes', 'updatedAt'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sort: Record<string, 1 | -1> = {};
    sort[validSortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute queries in parallel for better performance
    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('product', 'name slug')
        .populate('user', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean<LeanAdminReview[]>(),
      Review.countDocuments(filter),
    ]);

    // Filter reviews by user name/email if search is provided (post-populate filter)
    let formattedReviews = reviews;
    if (search && reviews.length > 0) {
      const searchLower = search.toLowerCase();
      formattedReviews = reviews.filter((review) => {
        const userName = review.user?.name?.toLowerCase() || '';
        const userEmail = review.user?.email?.toLowerCase() || '';
        return userName.includes(searchLower) || userEmail.includes(searchLower);
      });
    }

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
    console.error('[admin reviews GET] Error:', error);
    return NextResponse.json(
      { error: 'Unable to load reviews. Please try again later' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connect();

    const body = await request.json();
    const {
      product,
      user,
      rating,
      comment,
      images,
      videos,
      verifiedPurchase,
      status = 'approved',
      title,
    } = body;

    // Validate required fields
    if (!product || !user || !rating) {
      return NextResponse.json(
        { error: 'Product, user, and rating are required' },
        { status: 400 }
      );
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      product,
      user,
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'User has already reviewed this product' },
        { status: 400 }
      );
    }

    const review = new Review({
      product,
      user,
      rating,
      title: title || '',
      comment: comment || '',
      images: images || [],
      videos: videos || [],
      verifiedPurchase: verifiedPurchase || false,
      helpfulVotes: 0,
      status,
      approvedAt: status === 'approved' ? new Date() : null,
    });

    await review.save();
    await review.populate('product', 'name slug');
    await review.populate('user', 'name email');

    if (status === 'approved') {
      await updateProductRating(product);
    }

    return NextResponse.json(
      {
        message: 'Review created successfully',
        review,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Review POST error:', error);
    return NextResponse.json(
      { error: 'Unable to create review. Please check all fields and try again' },
      { status: 500 }
    );
  }
}
