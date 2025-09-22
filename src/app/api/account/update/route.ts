import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';

const USER_JWT_SECRET = process.env.USER_JWT_SECRET as string;

function getCookie(req: Request, name: string): string | null {
  const cookieHeader = req.headers.get('cookie') || '';
  const token = cookieHeader
    .split(';')
    .map(p => p.trim())
    .find(p => p.startsWith(name + '='))
    ?.split('=')[1];
  return token || null;
}

export async function POST(request: Request) {
  try {
    if (!USER_JWT_SECRET)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connect();

    const token = getCookie(request, 'token');
    if (!token)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = jwt.verify(token, USER_JWT_SECRET) as {
      uid?: string;
    } | null;
    if (!payload?.uid)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { name, phone, gender, dob, newsletterOptIn } = body;

    const user = await User.findById(payload.uid);
    if (!user)
      return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (typeof name === 'string' && name.trim()) user.name = name.trim();
    if (typeof phone === 'string')
      user.phone = phone.replace(/\D/g, '').slice(0, 15);

    if (typeof gender === 'string') user.gender = gender;
    if (dob) {
      const parsed = new Date(dob);
      if (!isNaN(parsed.getTime())) {
        user.dob = parsed;
      }
    }
    if (typeof newsletterOptIn === 'boolean')
      user.newsletterOptIn = newsletterOptIn;

    await user.save();

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
