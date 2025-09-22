import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';

const USER_JWT_SECRET = process.env.USER_JWT_SECRET as string;

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

    const user = await User.findById(payload.uid)
      .select('name email phone  gender dob newsletterOptIn addresses')
      .lean();
    if (!user) return NextResponse.json({ user: null });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
