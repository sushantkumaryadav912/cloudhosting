import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('auth_token')?.value;

  const protectedPaths = ['/AutoDeploy', '/Dashboard'];

  if (protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    if (!token) {
      return NextResponse.redirect(new URL('/Login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/AutoDeploy/:path*', '/Dashboard/:path*'],
};