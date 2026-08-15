// Force cache invalidation
import nodemailer from 'nodemailer';

const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;

// Create a transporter using Gmail SMTP
export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
});

/**
 * Sends a verification email.
 */
export async function sendVerificationEmail(to: string, name: string, verifyUrl: string) {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    console.log(`[MAILER MOCK] Verification email to ${to}: ${verifyUrl}`);
    return;
  }

  const mailOptions = {
    from: `"Grand Luxe Hotel" <${GMAIL_USER}>`,
    to,
    subject: 'Verify your email address - Grand Luxe Hotel',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #1a365d; text-align: center;">Welcome to Grand Luxe Hotel</h2>
        <p>Hi ${name || 'Guest'},</p>
        <p>Thank you for creating an account with us. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email Address</a>
        </div>
        <p>If you did not request this, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #777; text-align: center;">Grand Luxe Hotel & Resort</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

/**
 * Sends a password reset email.
 */
export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    console.log(`[MAILER MOCK] Password reset email to ${to}: ${resetUrl}`);
    return;
  }

  const mailOptions = {
    from: `"Grand Luxe Hotel" <${GMAIL_USER}>`,
    to,
    subject: 'Password Reset Request - Grand Luxe Hotel',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #1a365d; text-align: center;">Password Reset Request</h2>
        <p>Hi ${name || 'Guest'},</p>
        <p>We received a request to reset your password for your Grand Luxe Hotel account. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
        </div>
        <p>This link is valid for 15 minutes. If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #777; text-align: center;">Grand Luxe Hotel & Resort</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export const sendBookingConfirmationEmail = async (
  to: string,
  name: string,
  bookingDetails: any
) => {
  const mailOptions = {
    from: `"Grand Luxe Hotel" <${process.env.GMAIL_USER}>`,
    to,
    subject: `Booking Confirmed - ${bookingDetails.room.name} at Grand Luxe Hotel`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eaeaea; border-radius: 8px;">
        <h2 style="color: #1a73e8; text-align: center;">Booking Confirmation</h2>
        <p>Dear <strong>${name}</strong>,</p>
        <p>Thank you for choosing Grand Luxe Hotel. Your reservation has been confirmed. Below are your booking details:</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Booking ID:</strong> ${bookingDetails.id}</p>
          <p><strong>Room:</strong> ${bookingDetails.room.name}</p>
          <p><strong>Room Number:</strong> ${bookingDetails.roomNumber}</p>
          <p><strong>Check-in:</strong> ${bookingDetails.checkIn}</p>
          <p><strong>Check-out:</strong> ${bookingDetails.checkOut}</p>
          <p><strong>Guests:</strong> ${bookingDetails.guests}</p>
          <p><strong>Total Amount:</strong> ₹${bookingDetails.totalAmount.toLocaleString()}</p>
        </div>
        <p>If you have any questions or need to make changes to your reservation, please don't hesitate to contact us.</p>
        <p>We look forward to hosting you!</p>
        <br>
        <p>Warm regards,<br><strong>Grand Luxe Hotel Team</strong></p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Booking confirmation email sent to ${to}`);
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    throw new Error('Failed to send booking confirmation email');
  }
};
