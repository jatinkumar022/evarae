import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';
import UserProfile from '@/models/userProfile';

const USER_JWT_SECRET = process.env.USER_JWT_SECRET as string;

type BasicUser = { _id: unknown; name: string; email: string; passwordHash?: string | null };

export async function GET(request: Request) {
  try {
    if (!USER_JWT_SECRET) {
      console.error('[account/me] USER_JWT_SECRET is not set');
      return NextResponse.json({ user: null });
    }
    
    await connect();

    const cookieHeader = request.headers.get('cookie') || '';
    const token = cookieHeader
      .split(';')
      .map(p => p.trim())
      .find(p => p.startsWith('token='))
      ?.split('=')[1];
    
    if (!token) {
      return NextResponse.json({ user: null });
    }

    let payload: { uid?: string } | null = null;
    try {
      payload = jwt.verify(token, USER_JWT_SECRET) as {
        uid?: string;
      } | null;
    } catch (jwtError) {
      console.error('[account/me] JWT verification failed:', jwtError);
      return NextResponse.json({ user: null });
    }
    
    if (!payload?.uid) {
      return NextResponse.json({ user: null });
    }

    const userDoc = await User.findById(payload.uid)
      .select({ name: 1, email: 1, passwordHash: 1 })
      .lean<BasicUser & { passwordHash?: string | null } | null>();
    
    if (!userDoc) {
      console.error('[account/me] User not found:', payload.uid);
      return NextResponse.json({ user: null });
    }

    const profile = await UserProfile.findOne({ user: payload.uid }).lean();

    return NextResponse.json({
      user: {
        id: payload.uid,
        name: userDoc.name,
        email: userDoc.email,
        hasPassword: !!userDoc.passwordHash, // Indicate if user has password (not Google sign-in)
        profile: profile || null,
      },
    });
  } catch (error) {
    console.error('[account/me] Unexpected error:', error);
    return NextResponse.json({ user: null });
  }
}
