import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';
import UserProfile from '@/models/userProfile';

const USER_JWT_SECRET = process.env.USER_JWT_SECRET as string;

type BasicUser = { _id: unknown; name: string; email: string };

export async function GET(request: Request) {
  try {
    if (!USER_JWT_SECRET) return NextResponse.json({ user: null });
    await connect();

    const cookieHeader = request.headers.get('cookie') || '';
    const token = cookieHeader
      .split(';')
      .map(p => p.trim())
      .find(p => p.startsWith('token='))
      ?.split('=')[1];
    if (!token) return NextResponse.json({ user: null });

    const payload = jwt.verify(token, USER_JWT_SECRET) as {
      uid?: string;
    } | null;
    if (!payload?.uid) return NextResponse.json({ user: null });

    const userDoc = await User.findById(payload.uid)
      .select({ name: 1, email: 1 })
      .lean<BasicUser | null>();
    if (!userDoc) return NextResponse.json({ user: null });

    const profile = await UserProfile.findOne({ user: payload.uid }).lean();

    return NextResponse.json({
      user: {
        id: payload.uid,
        name: userDoc.name,
        email: userDoc.email,
        profile: profile || null,
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
