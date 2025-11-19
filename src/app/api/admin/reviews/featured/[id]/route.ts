import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Review from '@/models/reviewModel';
import { updateProductRating } from '@/lib/server/reviews/updateProductRating';

type RouteContext = {
  params: Promise<{ id: string }>;
};

type FeaturedLeanReview = {
  featuredFullName?: string;
  [key: string]: unknown;
};

export async function GET(request: Request, { params }: RouteContext) {
  try {
    await connect();

    const { id } = await params;
    const review = await Review.findOne({ _id: id, isFeatured: true })
      .populate('product', 'name slug')
      .lean<FeaturedLeanReview | null>();

    if (!review) {
      return NextResponse.json({ error: 'Featured review not found' }, { status: 404 });
    }

    // Format to show featuredFullName as user name
    const formattedReview = {
      ...review,
      user: {
        _id: null,
        name: review.featuredFullName || 'Customer',
        email: '',
      },
    };

    return NextResponse.json({ review: formattedReview });
  } catch (error) {
    console.error('[admin featured review GET] Error:', error);
    return NextResponse.json(
      { error: 'Unable to load featured review. Please try again' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    await connect();

    const body = await request.json();
    const {
      fullName,
      rating,
      comment,
      images,
      title,
      helpfulVotes, // Deprecated - use featuredVotes instead
      featuredVotes,
      verifiedPurchase,
    } = body;

    // Validate rating range if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const { id } = await params;
    const review = await Review.findOne({ _id: id, isFeatured: true });

    if (!review) {
      return NextResponse.json(
        { error: 'Featured review not found' },
        { status: 404 }
      );
    }

    const previousRating = review.rating;
    const productReference = review.product;

    // Update fields
    if (typeof fullName === 'string') review.featuredFullName = fullName;
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    if (images !== undefined) review.images = images;
    if (typeof title === 'string') review.title = title;
    if (verifiedPurchase !== undefined)
      review.verifiedPurchase = verifiedPurchase;

    // Handle featuredVotes (prefer featuredVotes over deprecated helpfulVotes)
    const featuredVotesValue = featuredVotes !== undefined ? featuredVotes : helpfulVotes;
    if (featuredVotesValue !== undefined && typeof featuredVotesValue === 'number') {
      review.featuredVotes = Math.max(0, Math.floor(featuredVotesValue));
    }

    await review.save();
    await review.populate('product', 'name slug');

    // Update product rating if rating changed
    if (rating !== undefined && rating !== previousRating) {
      await updateProductRating(productReference.toString());
    }

    // Format response
    const formattedReview = {
      ...review.toObject(),
      user: {
        _id: null,
        name: review.featuredFullName || 'Customer',
        email: '',
      },
    };

    return NextResponse.json({
      message: 'Featured review updated successfully',
      review: formattedReview,
    });
  } catch (error) {
    console.error('[admin featured review PUT] Error:', error);
    return NextResponse.json(
      { error: 'Unable to update featured review. Please try again' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    await connect();

    const { id } = await params;
    const deletedReview = await Review.findOneAndDelete({
      _id: id,
      isFeatured: true,
    });

    if (!deletedReview) {
      return NextResponse.json(
        { error: 'Featured review not found' },
        { status: 404 }
      );
    }

    // Update product rating
    if (
      deletedReview.status === 'approved' ||
      deletedReview.status === undefined
    ) {
      await updateProductRating(deletedReview.product);
    }

    return NextResponse.json({
      message: 'Featured review deleted successfully',
      review: deletedReview,
    });
  } catch (error) {
    console.error('[admin featured review DELETE] Error:', error);
    return NextResponse.json(
      { error: 'Unable to delete featured review. Please try again' },
      { status: 500 }
    );
  }
}

