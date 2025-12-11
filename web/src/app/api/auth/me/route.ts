// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Fetch user from backend
    const response = await axios.get(`${API_BASE_URL}/user/fetch/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data.success) {
      return NextResponse.json(
        { success: false, message: 'Failed to fetch user' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: response.data.data,
    });
  } catch (error: any) {
    console.error('Fetch user API error:', error);

    if (error.response?.status === 401) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
