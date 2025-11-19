import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connect } from '@/dbConfig/dbConfig';
import Product from '@/models/productModel';
import Review from '@/models/reviewModel';
import { requireUserId } from '@/lib/server/auth/getUserFromRequest';

// Helper to ensure helpfulVotes is always an array and fix corrupted data
async function ensureHelpfulVotesIsArray(reviewId: string): Promise<void> {
  try {
    // Use raw MongoDB operation to fix the field if corrupted
    const db = mongoose.connection.db;
    if (db) {
      await db.collection('reviews').updateOne(
        { _id: new mongoose.Types.ObjectId(reviewId) },
        [
          {
            $set: {
              helpfulVotes: {
                $cond: {
                  if: { $isArray: '$helpfulVotes' },
                  then: '$helpfulVotes',
                  else: [],
                },
              },
            },
          },
        ]
      );
    }
  } catch (error) {
    console.error('[ensureHelpfulVotesIsArray] Error:', error);
    // Fallback: try with Mongoose
    try {
      await Review.updateOne(
        { _id: reviewId },
        { $set: { helpfulVotes: [] } },
        { runValidators: false, strict: false }
      );
    } catch (fallbackError) {
      console.error('[ensureHelpfulVotesIsArray] Fallback error:', fallbackError);
    }
  }
}

type RouteContext = {
  params: Promise<{
    id: string;
    reviewId: string;
  }>;
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

export async function POST(request: Request, { params }: RouteContext) {
  try {
    await connect();
    const { id, reviewId } = await params;
    
    let userId: string;
    try {
      userId = requireUserId(request);
    } catch {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const productId = await resolveProductObjectId(id);

    if (!productId) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return NextResponse.json({ error: 'Invalid review ID' }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Ensure helpfulVotes is an array before proceeding
    await ensureHelpfulVotesIsArray(reviewId);

    // Fetch the review document (not lean, so we can modify and save)
    const review = await Review.findOne({ _id: reviewId, product: productId })
      .select('helpfulVotes featuredVotes');

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Ensure helpfulVotes is an array
    if (!Array.isArray(review.helpfulVotes)) {
      review.helpfulVotes = [];
    }

    const helpfulVotesArray = review.helpfulVotes.filter(
      (vote: unknown): vote is mongoose.Types.ObjectId => vote instanceof mongoose.Types.ObjectId
    );

    // Convert current votes to strings for comparison
    const currentVoteStrings = helpfulVotesArray.map((vote: mongoose.Types.ObjectId) =>
      vote.toString()
    );
    const alreadyVoted = currentVoteStrings.includes(userId);

    if (alreadyVoted) {
      // User already voted, return current count (real + featured)
      const realVotes = review.helpfulVotes.length;
      const featuredVotes = review.featuredVotes ?? 0;
      return NextResponse.json({
        helpfulVotes: realVotes + featuredVotes,
        message: 'Already voted',
      });
    }

    // Add the user ID to the array
    helpfulVotesArray.push(new mongoose.Types.ObjectId(userId));
    review.helpfulVotes = helpfulVotesArray;

    // Save the document (bypass validation to avoid casting issues)
    await review.save({ validateBeforeSave: false });

    // Calculate total: real votes + featured votes
    const realVotesCount = helpfulVotesArray.length;
    const featuredVotesCount = review.featuredVotes ?? 0;
    const totalVotes = realVotesCount + featuredVotesCount;

    return NextResponse.json({
      helpfulVotes: totalVotes,
    });
  } catch (error) {
    console.error('[product review helpful POST] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Unable to register helpful vote', details: message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    await connect();
    const { id, reviewId } = await params;
    
    let userId: string;
    try {
      userId = requireUserId(request);
    } catch {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const productId = await resolveProductObjectId(id);

    if (!productId) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return NextResponse.json({ error: 'Invalid review ID' }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Ensure helpfulVotes is an array before proceeding
    await ensureHelpfulVotesIsArray(reviewId);

    // Fetch the review document (not lean, so we can modify and save)
    const review = await Review.findOne({ _id: reviewId, product: productId })
      .select('helpfulVotes featuredVotes');

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Ensure helpfulVotes is an array
    if (!Array.isArray(review.helpfulVotes)) {
      review.helpfulVotes = [];
    }

    const helpfulVotesArray = review.helpfulVotes.filter(
      (vote: unknown): vote is mongoose.Types.ObjectId => vote instanceof mongoose.Types.ObjectId
    );

    // Remove the user ID from the array
    const filteredVotes = helpfulVotesArray.filter(
      (voteId: mongoose.Types.ObjectId) => voteId.toString() !== userId
    );
    review.helpfulVotes = filteredVotes;

    // Save the document (bypass validation to avoid casting issues)
    await review.save({ validateBeforeSave: false });

    // Calculate total: real votes + featured votes
    const realVotesCount = filteredVotes.length;
    const featuredVotesCount = review.featuredVotes ?? 0;
    const totalVotes = realVotesCount + featuredVotesCount;

    return NextResponse.json({
      helpfulVotes: totalVotes,
    });
  } catch (error) {
    console.error('[product review helpful DELETE] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Unable to update helpful vote', details: message },
      { status: 500 }
    );
  }
}



