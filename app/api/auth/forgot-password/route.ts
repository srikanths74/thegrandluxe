import { NextRequest, NextResponse } from 'next/server';
import { createPasswordResetToken } from '@/app/utils/dbAuth';
import { sendPasswordResetEmail } from '@/app/utils/mailer';

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

    const result = createPasswordResetToken(email);
    
    // If user doesn't exist, we still return success to prevent email enumeration
    if (result) {
      const { token, user } = result;
      const resetLink = `${origin}/reset-password?token=${token}`;
      
      // Send the actual email
      await sendPasswordResetEmail(user.email, user.name, resetLink);
    }

    return NextResponse.json({
      success: true,
      message: `If an account exists, a reset link has been sent to ${email}.`,
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to send password reset link.' },
      { status: 500 }
    );
  }
}
