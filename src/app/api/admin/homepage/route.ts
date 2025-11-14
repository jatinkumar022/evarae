import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connect } from '@/dbConfig/dbConfig';
import Homepage from '@/models/homepageModel';

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET as string;

if (!ADMIN_JWT_SECRET) {
  throw new Error('ADMIN_JWT_SECRET missing in environment');
}

// Helper to verify admin authentication
function verifyAdmin(request: Request) {
  const cookieHeader = request.headers.get('cookie') as string | null;
  const token = cookieHeader
    ?.split(';')
    .map(p => p.trim())
    .find(p => p.startsWith('adminToken='))
    ?.split('=')[1];
  
  if (!token) return null;

  try {
    const payload = jwt.verify(token, ADMIN_JWT_SECRET) as {
      uid?: string;
      role?: string;
    };
    if (!payload || payload.role !== 'admin') return null;
    return payload.uid;
  } catch {
    return null;
  }
}

// GET homepage configuration
export async function GET() {
  try {
    await connect();
    const homepage = await Homepage.getHomepage();
    return NextResponse.json({ homepage });
  } catch (error) {
    console.error('Homepage GET error:', error);
    return NextResponse.json(
      { error: 'Unable to load homepage configuration' },
      { status: 500 }
    );
  }
}

// UPDATE homepage configuration
export async function PUT(request: Request) {
  try {
    const adminId = verifyAdmin(request);
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connect();
    const body = await request.json();

    const homepage = await Homepage.getHomepage();

    // Update fields
    if (body.heroImages !== undefined) {
      homepage.heroImages = body.heroImages;
    }
    if (body.signatureCollections !== undefined) {
      homepage.signatureCollections = body.signatureCollections;
    }
    if (body.storyCollections !== undefined) {
      homepage.storyCollections = body.storyCollections;
    }
    if (body.freshlyMinted !== undefined) {
      homepage.freshlyMinted = {
        ...homepage.freshlyMinted,
        ...body.freshlyMinted,
      };
    }
    if (body.worldOfCaelviCollections !== undefined) {
      homepage.worldOfCaelviCollections = body.worldOfCaelviCollections;
    }
    if (body.trendingConfig !== undefined) {
      homepage.trendingConfig = {
        ...homepage.trendingConfig,
        ...body.trendingConfig,
      };
    }

    await homepage.save();

    return NextResponse.json({
      success: true,
      homepage,
    });
  } catch (error) {
    console.error('Homepage PUT error:', error);
    return NextResponse.json(
      { error: 'Unable to update homepage configuration' },
      { status: 500 }
    );
  }
}

