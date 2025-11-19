import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connect } from '@/dbConfig/dbConfig';
import Review from '@/models/reviewModel';
import { updateProductRating } from '@/lib/server/reviews/updateProductRating';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  try {
    await connect();

    const { id } = await params;
    const review = await Review.findById(id)
      .populate('product', 'name slug')
      .populate('user', 'name email')
      .lean();

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Review GET error:', error);
    return NextResponse.json(
      { error: 'Review not found' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    await connect();

    const body = await request.json();
    const {
      rating,
      comment,
      images,
      videos,
      verifiedPurchase,
      helpfulVotes,
      status,
      title,
      adminNotes,
    } = body;

    // Validate rating range if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (
      status !== undefined &&
      !['pending', 'approved', 'rejected'].includes(status)
    ) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    const { id } = await params;
    const review = await Review.findById(id);

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    const previousStatus =
      review.status ?? ('approved' as 'pending' | 'approved' | 'rejected');
    const productReference = review.product;

    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    if (images !== undefined) review.images = images;
    if (videos !== undefined) review.videos = videos;
    if (verifiedPurchase !== undefined)
      review.verifiedPurchase = verifiedPurchase;
    // helpfulVotes should NOT be set here - it's managed through the helpful vote API
    // helpfulVotes is always an array of ObjectIds, never a number
    // Only allow setting if it's an array of ObjectIds (for admin operations)
    if (helpfulVotes !== undefined) {
      if (Array.isArray(helpfulVotes)) {
        // Ensure all items are ObjectIds
        const validObjectIds = helpfulVotes.filter((v: any) =>
          mongoose.Types.ObjectId.isValid(v)
        );
        review.helpfulVotes = validObjectIds.map(
          (v: any) => new mongoose.Types.ObjectId(v)
        );
      }
      // If not an array, ignore it - don't try to set it
    }
    if (typeof title === 'string') review.title = title;
    if (typeof adminNotes === 'string') review.adminNotes = adminNotes;
    if (status) {
      review.status = status;
      if (status === 'approved' && previousStatus !== 'approved') {
        review.approvedAt = new Date();
      } else if (status !== 'approved' && previousStatus === 'approved') {
        review.approvedAt = null;
      }
    }

    await review.save();
    await review.populate('product', 'name slug');
    await review.populate('user', 'name email');

    if (
      previousStatus === 'approved' ||
      review.status === 'approved' ||
      (!review.status && previousStatus === 'approved')
    ) {
      await updateProductRating(productReference);
    }

    return NextResponse.json({
      message: 'Review updated successfully',
      review,
    });
  } catch (error) {
    console.error('Review PUT error:', error);
    return NextResponse.json(
      { error: 'Unable to update review. Please check all fields and try again' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    await connect();

    const { id } = await params;
    const deletedReview = await Review.findByIdAndDelete(id);

    if (!deletedReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    if (
      deletedReview.status === 'approved' ||
      deletedReview.status === undefined
    ) {
      await updateProductRating(deletedReview.product);
    }

    return NextResponse.json({
      message: 'Review deleted successfully',
      review: deletedReview,
    });
  } catch (error) {
    console.error('Review DELETE error:', error);
    return NextResponse.json(
      { error: 'Unable to delete review. Please try again' },
      { status: 500 }
    );
  }
}
