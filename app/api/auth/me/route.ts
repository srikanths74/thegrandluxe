import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken, findUserById } from '@/app/utils/dbAuth';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('glh_session')?.value;
    if (!token) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const payload = verifyAuthToken(token);
    if (!payload) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const user = findUserById(payload.id);
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        isGoogle: user.isGoogle
      }
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
