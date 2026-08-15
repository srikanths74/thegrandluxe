import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailToken, findUserByEmail, signAuthToken } from '@/app/utils/dbAuth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const host = req.headers.get('host') || 'localhost:3000';
  const protocol = req.headers.get('x-forwarded-proto') || 'http';
  const origin = `${protocol}://${host}`;

  let user = null;

  if (token) {
    user = verifyEmailToken(token);
  }

  if (!user && email) {
    user = findUserByEmail(email) || null;
  }

  if (!user) {
    return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent('Invalid or expired verification link')}`);
  }

  const authToken = signAuthToken({
    id: user.id,
    email: user.email,
    name: user.name
  });

  const response = NextResponse.redirect(`${origin}/?auth_success=email_verified`);

  response.cookies.set('glh_session', authToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/'
  });

  return response;
}
