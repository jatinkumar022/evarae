import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';

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

// PATCH: Update admin account
export async function PATCH(request: Request) {
  try {
    await connect();

    // Verify admin authentication
    const adminId = verifyAdmin(request);
    if (!adminId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name } = body;

    // Find admin user
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      );
    }

    // Update name only (email cannot be changed)
    if (name !== undefined && name.trim()) {
      admin.name = name.trim();
      await admin.save();
    }

    return NextResponse.json({
      admin: {
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error('Admin account update error:', error);
    return NextResponse.json(
      { error: 'Unable to update admin account. Please try again later' },
      { status: 500 }
    );
  }
}

