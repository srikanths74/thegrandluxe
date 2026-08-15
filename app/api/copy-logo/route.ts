import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const src = 'C:/Users/acer/.gemini/antigravity-ide/brain/0628a597-379d-4053-b86b-29b537c255bb/hotel_logo_1785856310991.png';
    const dest = path.join(process.cwd(), 'public', 'hotel_logo.png');

    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      return NextResponse.json({ success: true, message: 'Hotel logo copied to public/hotel_logo.png' });
    }
    return NextResponse.json({ success: false, message: 'Source logo not found' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
