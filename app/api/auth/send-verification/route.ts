import { NextRequest, NextResponse } from 'next/server';
import { createEmailVerificationToken } from '@/app/utils/dbAuth';
import { sendVerificationEmail } from '@/app/utils/mailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const origin = `${protocol}://${host}`;

    const { token, user } = createEmailVerificationToken(email);

    const verificationLink = `${origin}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    // Send the actual email
    await sendVerificationEmail(user.email, user.name, verificationLink);

    return NextResponse.json({
      success: true,
      message: `Verification link sent to ${email}.`,
      verificationLink,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error: any) {
    console.error('Send verification error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to send verification link.' },
      { status: 500 }
    );
  }
}
