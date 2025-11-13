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
    
    // Optimize: Use exists() which is faster than findOne() for existence checks
    // and only checks index, doesn't fetch document
    const exists = !!(await User.exists({ email: email.toLowerCase() }).lean());
    
    const response = NextResponse.json({ exists });
    // Add short cache for email checks (30 seconds)
    response.headers.set('Cache-Control', 'private, max-age=30');
    
    return response;
  } catch (error) {
    console.error('[auth/check-email] Error:', error);
    return NextResponse.json(
      { error: 'Unable to check email. Please try again' },
      { status: 500 }
    );
  }
}
