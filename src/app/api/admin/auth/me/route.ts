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
    const cookieHeader = request.headers.get('cookie') as string | null;
    const token = cookieHeader
      ?.split(';')
      .map(p => p.trim())
      .find(p => p.startsWith('adminToken='))
      ?.split('=')[1];
    if (!token) return NextResponse.json({ admin: null });

    const payload = jwt.verify(token, ADMIN_JWT_SECRET) as {
      uid?: string;
      role?: string;
    };
    if (!payload || payload.role !== 'admin')
      return NextResponse.json({ admin: null });

    const user = await User.findById(payload.uid).select('name email role').lean();
    if (!user || Array.isArray(user))
      return NextResponse.json({ admin: null });

    const adminUser = user as unknown as { name: string; email: string; role: string };
    if (adminUser.role !== 'admin')
      return NextResponse.json({ admin: null });

    return NextResponse.json({
      admin: { id: payload.uid, name: adminUser.name, email: adminUser.email },
    });
  } catch {
    return NextResponse.json({ admin: null });
  }
}
