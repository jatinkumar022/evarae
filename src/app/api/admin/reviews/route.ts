import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Review from '@/models/reviewModel';

export async function GET(request: Request) {
  try {
    await connect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const product = searchParams.get('product') || '';
    const rating = searchParams.get('rating') || '';
    const verifiedPurchase = searchParams.get('verifiedPurchase') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build filter
    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [{ comment: { $regex: search, $options: 'i' } }];
    }
    if (product) filter.product = product;
    if (rating) filter.rating = parseInt(rating);
    if (verifiedPurchase !== '')
      filter.verifiedPurchase = verifiedPurchase === 'true';

    // Build sort
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const reviews = await Review.find(filter)
      .populate('product', 'name slug')
      .populate('user', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Review.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      reviews,
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
    console.error('Reviews GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connect();

    const body = await request.json();
    const { product, user, rating, comment, images, videos, verifiedPurchase } =
      body;

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
      comment: comment || '',
      images: images || [],
      videos: videos || [],
      verifiedPurchase: verifiedPurchase || false,
      helpfulVotes: 0,
    });

    await review.save();
    await review.populate('product', 'name slug');
    await review.populate('user', 'name email');

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
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
