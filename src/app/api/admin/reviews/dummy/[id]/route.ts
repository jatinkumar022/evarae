import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Review from '@/models/reviewModel';
import mongoose from 'mongoose';
import { updateProductRating } from '@/lib/server/reviews/updateProductRating';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  try {
    await connect();

    const { id } = await params;
    const review = await Review.findOne({ _id: id, isDummy: true })
      .populate('product', 'name slug')
      .lean();

    if (!review) {
      return NextResponse.json({ error: 'Dummy review not found' }, { status: 404 });
    }

    // Format to show dummyFullName as user name
    const formattedReview = {
      ...review,
      user: {
        _id: null,
        name: (review as any).dummyFullName || 'Customer',
        email: '',
      },
    };

    return NextResponse.json({ review: formattedReview });
  } catch (error) {
    console.error('[admin dummy review GET] Error:', error);
    return NextResponse.json(
      { error: 'Unable to load dummy review. Please try again' },
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
      helpfulVotes, // Deprecated - use dummyVotes instead
      dummyVotes,
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
    const review = await Review.findOne({ _id: id, isDummy: true });

    if (!review) {
      return NextResponse.json(
        { error: 'Dummy review not found' },
        { status: 404 }
      );
    }

    const previousRating = review.rating;
    const productReference = review.product;

    // Update fields
    if (typeof fullName === 'string') review.dummyFullName = fullName;
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    if (images !== undefined) review.images = images;
    if (typeof title === 'string') review.title = title;
    if (verifiedPurchase !== undefined)
      review.verifiedPurchase = verifiedPurchase;

    // Handle dummyVotes (prefer dummyVotes over deprecated helpfulVotes)
    const dummyVotesValue = dummyVotes !== undefined ? dummyVotes : helpfulVotes;
    if (dummyVotesValue !== undefined && typeof dummyVotesValue === 'number') {
      review.dummyVotes = Math.max(0, Math.floor(dummyVotesValue));
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
        name: review.dummyFullName || 'Customer',
        email: '',
      },
    };

    return NextResponse.json({
      message: 'Dummy review updated successfully',
      review: formattedReview,
    });
  } catch (error) {
    console.error('[admin dummy review PUT] Error:', error);
    return NextResponse.json(
      { error: 'Unable to update dummy review. Please try again' },
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
      isDummy: true,
    });

    if (!deletedReview) {
      return NextResponse.json(
        { error: 'Dummy review not found' },
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
      message: 'Dummy review deleted successfully',
      review: deletedReview,
    });
  } catch (error) {
    console.error('[admin dummy review DELETE] Error:', error);
    return NextResponse.json(
      { error: 'Unable to delete dummy review. Please try again' },
      { status: 500 }
    );
  }
}

