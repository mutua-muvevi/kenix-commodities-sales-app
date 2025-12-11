// src/app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token found' },
        { status: 401 }
      );
    }

    // Fetch current user to validate token
    const response = await axios.get(`${API_BASE_URL}/user/fetch/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data.success) {
      return NextResponse.json(
        { success: false, message: 'Token validation failed' },
        { status: 401 }
      );
    }

    const user = response.data.data;

    // Update last activity timestamp
    const nextResponse = NextResponse.json({
      success: true,
      message: 'Token refreshed',
      data: { user },
    });

    nextResponse.cookies.set('last_activity', Date.now().toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return nextResponse;
  } catch (error: any) {
    console.error('Refresh API error:', error);

    // If token is invalid, clear cookies
    if (error.response?.status === 401) {
      const response = NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );

      const cookiesToClear = [
        'auth_token',
        'user_role',
        'user_id',
        'csrf_token',
        'last_activity',
      ];

      cookiesToClear.forEach((cookieName) => {
        response.cookies.set(cookieName, '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 0,
          path: '/',
        });
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: 'Token refresh failed' },
      { status: 500 }
    );
  }
}
