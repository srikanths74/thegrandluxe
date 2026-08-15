import { NextRequest, NextResponse } from 'next/server';
import { findUserByExactEmail, createUser, signAuthToken } from '@/app/utils/dbAuth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, phone } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Name, email, and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const existingUser = findUserByExactEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }

    const newUser = createUser({
      name,
      email,
      password,
      phone,
      isGoogle: false
    });

    const token = signAuthToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name
    });

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully in database.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        avatarUrl: newUser.avatarUrl,
        isGoogle: newUser.isGoogle
      }
    });

    response.cookies.set('glh_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return response;
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create user account.' },
      { status: 500 }
    );
  }
}
