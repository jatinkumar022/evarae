import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';

export async function POST(request: Request) {
  try {
    await connect();

    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ email: email.toLowerCase() }).select('_id').lean();
    if (existing) {
      return NextResponse.json(
        { error: 'Admin user already exists' },
        { status: 400 }
      );
    }

    const admin = new User({
      name,
      email: email.toLowerCase(),
      role: 'admin',
    });

    await admin.save();

    return NextResponse.json({
      ok: true,
      message: 'Admin user created successfully',
      email: admin.email,
    });
  } catch (error) {
    console.error('[admin/auth/create-user] Error:', error);
    return NextResponse.json(
      { error: 'Unable to create admin user. Please try again' },
      { status: 500 }
    );
  }
}
