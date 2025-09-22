import { NextResponse } from 'next/server';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;

export async function GET(request: Request) {
  try {
    if (!GOOGLE_CLIENT_ID) {
      return NextResponse.json(
        { error: 'GOOGLE_CLIENT_ID not configured' },
        { status: 500 }
      );
    }

    const url = new URL(request.url);
    const origin = `${url.protocol}//${url.host}`;
    const redirectUri = `${origin}/api/auth/google/callback`;

    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    return NextResponse.redirect(authUrl);
  } catch {
    return NextResponse.json(
      { error: 'Failed to start Google auth' },
      { status: 500 }
    );
  }
}
