import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Notification from '@/models/notificationModel';
import jwt from 'jsonwebtoken';

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET as string;

function getCookie(req: Request, name: string): string | null {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const cookies = cookieHeader.split(';').map(c => c.trim());
    const token = cookies.find(c => c.startsWith(`${name}=`))?.split('=')[1];
    return token || null;
  } catch {
    return null;
  }
}

async function verifyAdmin(request: Request): Promise<{ uid?: string } | null> {
  if (!ADMIN_JWT_SECRET) return null;
  const token = getCookie(request, 'adminToken');
  if (!token) return null;
  try {
    return jwt.verify(token, ADMIN_JWT_SECRET) as { uid?: string } | null;
  } catch {
    return null;
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connect();

    await Notification.updateMany(
      { isRead: false },
      { isRead: true, readAt: new Date() }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin notifications read-all PATCH error:', error);
    return NextResponse.json(
      { error: 'Unable to update notifications. Please try again later' },
      { status: 500 }
    );
  }
}

