import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET as string;

if (!ADMIN_JWT_SECRET) {
  throw new Error('ADMIN_JWT_SECRET missing in environment');
}

export async function GET(request: Request) {
  try {
    await connect();
    const cookieHeader = (request.headers as any).get('cookie') as
      | string
      | null;
    const token = cookieHeader
      ?.split(';')
      .map(p => p.trim())
      .find(p => p.startsWith('adminToken='))
      ?.split('=')[1];
    if (!token) return NextResponse.json({ admin: null });

    const payload = jwt.verify(token, ADMIN_JWT_SECRET) as any;
    if (!payload || payload.role !== 'admin')
      return NextResponse.json({ admin: null });

    const user = await User.findById(payload.uid).select('name email role');
    if (!user || user.role !== 'admin')
      return NextResponse.json({ admin: null });

    return NextResponse.json({
      admin: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    return NextResponse.json({ admin: null });
  }
}
