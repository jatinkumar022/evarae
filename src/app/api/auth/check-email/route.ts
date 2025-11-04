import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';

export async function POST(request: Request) {
  try {
    await connect();
    const { email } = await request.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    const exists = !!(await User.exists({ email: email.toLowerCase() }));
    return NextResponse.json({ exists });
  } catch (error) {
    console.error('[auth/check-email] Error:', error);
    return NextResponse.json(
      { error: 'Unable to check email. Please try again' },
      { status: 500 }
    );
  }
}
