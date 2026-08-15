import { NextRequest, NextResponse } from 'next/server';
import { findUserByExactEmail, createUser, signAuthToken } from '@/app/utils/dbAuth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json({ error: 'Google Email is required.' }, { status: 400 });
    }

    let user = findUserByExactEmail(email);
    if (!user) {
      const formattedName = name || email.split('@')[0].replace('.', ' ').replace(/^./, (str: string) => str.toUpperCase());
      user = createUser({
        name: formattedName,
        email: email,
        isGoogle: true,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName)}&background=4285F4&color=fff`
      });
    }

    const token = signAuthToken({
      id: user.id,
      email: user.email,
      name: user.name
    });

    const response = NextResponse.json({
      success: true,
      message: 'Google Sign In successful.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        isGoogle: true
      }
    });

    response.cookies.set('glh_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/'
    });

    return response;
  } catch (error: any) {
    console.error('Google Auth error:', error);
    return NextResponse.json(
      { error: error?.message || 'Google Auth failed.' },
      { status: 500 }
    );
  }
}
