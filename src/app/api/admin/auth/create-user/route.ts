import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';

export async function POST(request: Request) {
  try {
    await connect();

    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    const adminCreationPassword = process.env.ADMIN_CREATION_PASSWORD;
    if (!adminCreationPassword) {
      console.error('[admin/auth/create-user] Missing ADMIN_CREATION_PASSWORD env');
      return NextResponse.json(
        { error: 'Admin creation is not configured properly' },
        { status: 500 }
      );
    }

    if (password !== adminCreationPassword) {
      return NextResponse.json(
        { error: 'Invalid admin creation password' },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
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
