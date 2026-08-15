import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, createUser, signAuthToken } from '@/app/utils/dbAuth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const host = req.headers.get('host') || 'localhost:3000';
  const protocol = req.headers.get('x-forwarded-proto') || 'http';
  const origin = `${protocol}://${host}`;

  if (error || !code) {
    return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent(error || 'Google auth cancelled')}`);
  }

  let email = searchParams.get('email') || '';
  let name = searchParams.get('name') || '';
  let avatarUrl = searchParams.get('avatar') || '';

  const clientId = (process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '').trim();
  const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();

  // If real Google OAuth Client Credentials exist, exchange code for user tokens
  if (clientId && clientSecret && !clientId.includes('YOUR_GOOGLE_CLIENT_ID')) {
    try {
      const redirectUri = `${origin}/api/auth/google/callback`;
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code'
        })
      });

      const tokenData = await tokenRes.json();
      if (tokenData.access_token) {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });
        const googleUser = await userInfoRes.json();
        if (googleUser.email) {
          email = googleUser.email;
          name = googleUser.name || googleUser.given_name || email.split('@')[0];
          avatarUrl = googleUser.picture || '';
        }
      }
    } catch (err) {
      console.error('Google token exchange error:', err);
    }
  }

  // Fallback defaults if parameter was missing
  if (!email) {
    return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent('Failed to get email from Google.')}`);
  }

  let user = findUserByEmail(email);
  if (!user) {
    user = createUser({
      name: name || email.split('@')[0],
      email: email,
      isGoogle: true,
      avatarUrl: avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}&background=4285F4&color=fff`
    });
  }

  const token = signAuthToken({
    id: user.id,
    email: user.email,
    name: user.name
  });

  const response = NextResponse.redirect(`${origin}/?auth_success=google`);

  response.cookies.set('glh_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/'
  });

  return response;
}
