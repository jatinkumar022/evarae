import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Review from '@/models/reviewModel';

const REAL_REVIEW_MATCH = {
  $or: [{ isFeatured: { $exists: false } }, { isFeatured: false }],
};

export async function GET() {
  try {
    await connect();

    const aggregates = await Review.aggregate<{
      _id: string | null;
      count: number;
    }>([
      { $match: REAL_REVIEW_MATCH },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: 0,
    };

    aggregates.forEach(doc => {
      const statusKey = doc._id ?? 'approved';
      if (statusKey === 'pending' || statusKey === 'approved' || statusKey === 'rejected') {
        stats[statusKey] += doc.count;
      } else {
        // Treat unknown/missing statuses as approved (legacy data)
        stats.approved += doc.count;
      }
      stats.total += doc.count;
    });

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('[admin reviews stats] Error:', error);
    return NextResponse.json(
      { error: 'Unable to load review stats. Please try again later' },
      { status: 500 }
    );
  }
}

