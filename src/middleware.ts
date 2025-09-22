// /middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const USER_JWT_SECRET = process.env.USER_JWT_SECRET as string | undefined;

// Only pages that really require login
const PROTECTED_PATHS = [
  '/checkout',
  '/account',
  '/orders',
  '/wishlist',
  '/cart',
];

async function isValidUserToken(token: string | undefined): Promise<boolean> {
  if (!token || !USER_JWT_SECRET) return false;
  try {
    const secret = new TextEncoder().encode(USER_JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return !!payload?.uid && payload.role === 'user';
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    const adminToken = request.cookies.get('adminToken')?.value;
    const path = request.nextUrl.pathname;

    const isProtectedPath = PROTECTED_PATHS.some(p => path.startsWith(p));

    // If not authenticated and trying to access protected page → redirect to login
    if ((!token || !(await isValidUserToken(token))) && isProtectedPath) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // If authenticated and trying to access login/signup → redirect to home (or account)
    if (
      token &&
      (await isValidUserToken(token)) &&
      (path === '/login' || path === '/signup')
    ) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Admin area protection: require adminToken, allow /admin/login
    if (path.startsWith('/admin')) {
      if (path === '/admin/login') {
        if (adminToken) {
          return NextResponse.redirect(new URL('/admin', request.url));
        }
        return NextResponse.next();
      }

      if (!adminToken) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    }

    return NextResponse.next();
  } catch {
    // In case of any unexpected error in middleware, do not block navigation
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*|favicon.ico).*)'],
};
