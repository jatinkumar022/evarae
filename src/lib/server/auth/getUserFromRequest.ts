import jwt from 'jsonwebtoken';

const USER_JWT_SECRET = process.env.USER_JWT_SECRET as string | undefined;

/**
 * Extracts the authenticated user's id from the `token` cookie.
 * Returns null if the cookie/secret is missing or verification fails.
 */
export function getUserIdFromRequest(request: Request): string | null {
  if (!USER_JWT_SECRET) {
    console.error('[auth] USER_JWT_SECRET is not configured');
    return null;
  }

  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const token = cookieHeader
      .split(';')
      .map(part => part.trim())
      .find(part => part.startsWith('token='))
      ?.split('=')[1];

    if (!token) return null;

    const payload = jwt.verify(token, USER_JWT_SECRET) as { uid?: string } | null;
    return payload?.uid ?? null;
  } catch (error) {
    console.warn('[auth] Failed to verify user token', error);
    return null;
  }
}

export function requireUserId(request: Request): string {
  const uid = getUserIdFromRequest(request);
  if (!uid) {
    throw new Error('UNAUTHENTICATED');
  }
  return uid;
}

