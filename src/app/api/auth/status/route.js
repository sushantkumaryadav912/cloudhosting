import { NextResponse } from 'next/server';

export async function GET(request) {
  const token = request.cookies.get('auth_token')?.value;
  console.log('Auth status check: token=', token);

  if (token) {
    return NextResponse.json({ isAuthenticated: true });
  } else {
    return NextResponse.json({ isAuthenticated: false });
  }
}