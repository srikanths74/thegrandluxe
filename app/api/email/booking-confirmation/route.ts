// Force cache invalidation
import { NextRequest, NextResponse } from 'next/server';
import { sendBookingConfirmationEmail } from '@/app/utils/mailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookingDetails } = body;

    if (!bookingDetails || !bookingDetails.customerEmail) {
      return NextResponse.json(
        { error: 'Customer email is required to send confirmation' },
        { status: 400 }
      );
    }

    const name = bookingDetails.customerName || 'Valued Guest';
    await sendBookingConfirmationEmail(bookingDetails.customerEmail, name, bookingDetails);

    return NextResponse.json({ message: 'Booking confirmation email sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to send booking email API:', error);
    return NextResponse.json(
      { error: 'Failed to send booking confirmation email' },
      { status: 500 }
    );
  }
}
