import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ error: 'This mock inbox is no longer available. Real emails are now sent.' }, { status: 404 });
}
