import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Review from '@/models/reviewModel';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  try {
    await connect();

    const { id } = await params;
    const review = await Review.findById(id)
      .select('-__v')
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
    const { rating, comment, images, videos, verifiedPurchase, helpfulVotes } =
      body;

    // Validate rating range if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const updateData: Partial<{
      rating: number;
      comment: string;
      images: string[];
      videos: string[];
      verifiedPurchase: boolean;
      helpfulVotes: number;
    }> = {};
    if (rating !== undefined) updateData.rating = rating;
    if (comment !== undefined) updateData.comment = comment;
    if (images !== undefined) updateData.images = images;
    if (videos !== undefined) updateData.videos = videos;
    if (verifiedPurchase !== undefined)
      updateData.verifiedPurchase = verifiedPurchase;
    if (helpfulVotes !== undefined) updateData.helpfulVotes = helpfulVotes;

    const { id } = await params;
    const updatedReview = await Review.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .select('-__v')
      .populate('product', 'name slug')
      .populate('user', 'name email')
      .lean();

    if (!updatedReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Review updated successfully',
      review: updatedReview,
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
    const deletedReview = await Review.findByIdAndDelete(id).select('_id').lean();

    if (!deletedReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
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
