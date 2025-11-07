import { NextResponse } from 'next/server';
import { cache } from 'react';

export function createCachedResponse(
  data: unknown,
  options: {
    maxAge?: number;
    staleWhileRevalidate?: number;
    etag?: string;
    compress?: boolean;
  } = {}
): NextResponse {
  const {
    maxAge = 300,
    staleWhileRevalidate = 86400,
    etag,
    compress = false,
  } = options;

  const headers = new Headers();
  
  headers.set(
    'Cache-Control',
    `public, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}, max-age=${maxAge}`
  );
  
  if (etag) {
    headers.set('ETag', etag);
  }
  
  headers.set('X-Content-Type-Options', 'nosniff');
  
  if (compress) {
    headers.set('Content-Encoding', 'gzip');
  }

  return NextResponse.json(data, { headers });
}

export function createNoCacheResponse(data: unknown): NextResponse {
  const headers = new Headers();
  headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  headers.set('Pragma', 'no-cache');
  headers.set('Expires', '0');
  
  return NextResponse.json(data, { headers });
}

export function createErrorResponse(
  error: string,
  status: number = 500,
  headers?: HeadersInit
): NextResponse {
  return NextResponse.json({ error }, { status, headers });
}

export const memoizeCache = cache;

