import jwt from 'jsonwebtoken';
import { connect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';
import UserProfile from '@/models/userProfile';
import { getCache, setCache, getCacheKey, CACHE_TTL } from '@/lib/cache/redis';
import { createNoCacheResponse } from '@/lib/api/response';
import { cache } from 'react';

const USER_JWT_SECRET = process.env.USER_JWT_SECRET as string;

type BasicUser = { _id: unknown; name: string; email: string; passwordHash?: string | null };

const getCachedUserData = cache(async (uid: string) => {
  await connect();
  return Promise.all([
    User.findById(uid)
      .select({ name: 1, email: 1, passwordHash: 1 })
      .lean<BasicUser & { passwordHash?: string | null } | null>(),
    UserProfile.findOne({ user: uid }).lean(),
  ]);
});

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    if (!USER_JWT_SECRET) {
      return createNoCacheResponse({ user: null });
    }
    
    const cookieHeader = request.headers.get('cookie') || '';
    const token = cookieHeader
      .split(';')
      .map(p => p.trim())
      .find(p => p.startsWith('token='))
      ?.split('=')[1];
    
    if (!token) {
      return createNoCacheResponse({ user: null });
    }

    let payload: { uid?: string } | null = null;
    try {
      payload = jwt.verify(token, USER_JWT_SECRET) as {
        uid?: string;
      } | null;
    } catch {
      return createNoCacheResponse({ user: null });
    }
    
    if (!payload?.uid) {
      return createNoCacheResponse({ user: null });
    }

    const cacheKey = getCacheKey('user', payload.uid);
    const cached = await getCache<{ user: unknown }>(cacheKey);
    
    if (cached) {
      return createNoCacheResponse(cached);
    }

    const [userDoc, profile] = await getCachedUserData(payload.uid);
    
    if (!userDoc) {
      return createNoCacheResponse({ user: null });
    }

    const response = {
      user: {
        id: payload.uid,
        name: userDoc.name,
        email: userDoc.email,
        hasPassword: !!userDoc.passwordHash,
        profile: profile || null,
      },
    };
    
    await setCache(cacheKey, response, CACHE_TTL.SHORT);
    
    return createNoCacheResponse(response);
  } catch {
    return createNoCacheResponse({ user: null });
  }
}
