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

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connect();
    const { id } = await ctx.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      notification: {
        ...notification.toObject(),
        _id: notification._id.toString(),
      },
    });
  } catch (error) {
    console.error('Admin notification PATCH error:', error);
    return NextResponse.json(
      { error: 'Unable to update notification. Please try again later' },
      { status: 500 }
    );
  }
}

