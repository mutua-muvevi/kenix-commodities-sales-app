// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Forward login request to backend
    const response = await axios.post(`${API_BASE_URL}/user/login`, {
      email,
      password,
    });

    if (!response.data.success) {
      return NextResponse.json(
        { success: false, message: response.data.message },
        { status: 401 }
      );
    }

    const { user, token } = response.data.data;

    // Create response
    const nextResponse = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: { user },
    });

    // Set HTTP-only cookies for security
    // Auth token cookie
    nextResponse.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // User role cookie (for middleware)
    nextResponse.cookies.set('user_role', user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // User ID cookie
    nextResponse.cookies.set('user_id', user._id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Generate CSRF token
    const csrfToken = generateCSRFToken();
    nextResponse.cookies.set('csrf_token', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Set last activity timestamp
    nextResponse.cookies.set('last_activity', Date.now().toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return nextResponse;
  } catch (error: any) {
    console.error('Login API error:', error);

    if (error.response) {
      return NextResponse.json(
        {
          success: false,
          message: error.response.data?.message || 'Login failed',
        },
        { status: error.response.status }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Generate cryptographically secure CSRF token
function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}
