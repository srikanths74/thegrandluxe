import { NextRequest, NextResponse } from 'next/server';
import { verifyPasswordResetToken, updateUserPassword, clearPasswordResetToken } from '@/app/utils/dbAuth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token and new password are required.' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    const user = verifyPasswordResetToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired password reset token.' }, { status: 400 });
    }

    const updated = updateUserPassword(user.email, newPassword);
    if (!updated) {
      return NextResponse.json({ error: 'Failed to update password.' }, { status: 500 });
    }

    // Clear the token so it can't be reused
    clearPasswordResetToken(user.id);

    return NextResponse.json({
      success: true,
      message: 'Password successfully updated in database.'
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to reset password.' }, { status: 500 });
  }
}
