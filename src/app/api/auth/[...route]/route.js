import { NextResponse } from 'next/server';

const BACKEND_URL = 'https://cloudhostingbackend.zeyo.xyz';
const X_API_KEY = process.env.NEXT_PUBLIC_ZEYO_API_KEY;

export async function POST(request, { params }) {
  const { route } = await params; // Already fixed in previous update
  const body = await request.json();
  let endpoint;

  // Dummy credentials for testing
  const isTestLogin = route[0] === 'login' && 
    body.userIdentifier === 'testuser' && 
    body.password === 'Test@123';
  
  const isTestRegister = route[0] === 'register' && 
    body.username === 'testuser' && 
    body.email === 'testuser@example.com' && 
    body.password === 'Test@123' && 
    body.role === 'user';

  // Handle dummy credentials
  if (isTestLogin) {
    const mockData = {
      token: 'dummy-token-12345',
      user: { userIdentifier: 'testuser', role: 'user' },
    };
    console.log('Dummy login successful:', mockData);
    const res = NextResponse.json(mockData);
    res.cookies.set('auth_token', mockData.token, {
      httpOnly: false, // Changed to false so js-cookie can read it
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600,
      path: '/',
    });
    console.log('Cookie set: auth_token=', mockData.token);
    return res;
  }

  if (isTestRegister) {
    const mockData = {
      token: 'dummy-token-12345',
      user: { username: 'testuser', email: 'testuser@example.com', role: 'user' },
    };
    console.log('Dummy register successful:', mockData);
    const res = NextResponse.json(mockData);
    res.cookies.set('auth_token', mockData.token, {
      httpOnly: false, // Changed to false
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600,
      path: '/',
    });
    console.log('Cookie set: auth_token=', mockData.token);
    return res;
  }

  // Real backend logic
  if (route[0] === 'login') {
    endpoint = '/user/auth';
  } else if (route[0] === 'register') {
    endpoint = '/user/register';
  } else {
    return NextResponse.json({ error: 'Invalid route' }, { status: 400 });
  }

  try {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': X_API_KEY,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log('Backend error:', data);
      return NextResponse.json({ error: data.message || 'Request failed' }, { status: response.status });
    }

    console.log('Backend success:', data);
    const res = NextResponse.json(data);
    res.cookies.set('auth_token', data.token, {
      httpOnly: false, // Changed to false
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600,
      path: '/',
    });
    console.log('Cookie set: auth_token=', data.token);
    return res;
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}