import { connect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';
import { createErrorResponse, createNoCacheResponse } from '@/lib/api/response';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    await connect();

    const body = (await request.json().catch(() => ({}))) as { email?: unknown };
    const rawEmail = typeof body.email === 'string' ? body.email.trim() : '';

    if (!rawEmail) {
      return createErrorResponse('Email is required', 400);
    }

    const normalizedEmail = rawEmail.toLowerCase();
    const exists = await User.exists({ email: normalizedEmail });

    return createNoCacheResponse({ exists: Boolean(exists) });
  } catch (error) {
    console.error('[auth/check-email] Error:', error);
    return createErrorResponse('Unable to check email. Please try again', 500);
  }
}
