import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string;
const USER_JWT_SECRET = process.env.USER_JWT_SECRET as string;
const SESSION_HOURS = Number(process.env.SESSION_HOURS || 72);

async function exchangeCodeForTokens(code: string, redirectUri: string) {
  const body = new URLSearchParams({
    code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  });

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) throw new Error('Token exchange failed');
  return res.json();
}

async function fetchGoogleUserInfo(accessToken: string) {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch user info');
  return res.json();
}

export async function GET(request: Request) {
  try {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !USER_JWT_SECRET) {
      return NextResponse.json(
        { error: 'Auth not configured' },
        { status: 500 }
      );
    }

    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const origin = `${url.protocol}//${url.host}`;
    const redirectUri = `${origin}/api/auth/google/callback`;

    if (!code) {
      return NextResponse.redirect(`${origin}/login?error=missing_code`);
    }

    const tokenResponse = await exchangeCodeForTokens(code, redirectUri);
    const accessToken = tokenResponse.access_token as string;

    const profile = await fetchGoogleUserInfo(accessToken);
    const email = (profile.email as string | undefined)?.toLowerCase();
    const name = (profile.name as string | undefined) || 'User';

    if (!email) {
      return NextResponse.redirect(
        `${origin}/login?error=no_email_from_google`
      );
    }

    await connect();

    let user = await User.findOne({ email });
    try {
      if (!user) {
        console.log('Creating new user:', { name, email });
        user = await User.create({ name, email, isVerified: true });
        console.log('User created:', user);
      } else if (!user.isVerified) {
        user.isVerified = true;
        await user.save();
        console.log('User verified:', user);
      }
    } catch (err) {
      console.error('User save error:', err);
      throw err;
    }

    const token = jwt.sign({ uid: user._id, role: 'user' }, USER_JWT_SECRET, {
      expiresIn: `${SESSION_HOURS}h`,
    });

    const res = NextResponse.redirect(`${origin}/`);
    res.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_HOURS * 60 * 60,
    });

    return res;
  } catch {
    try {
      const url = new URL(request.url);
      return NextResponse.redirect(
        `${url.origin}/login?error=google_auth_failed`
      );
    } catch {
      return NextResponse.json(
        { error: 'Google auth failed' },
        { status: 500 }
      );
    }
  }
}
