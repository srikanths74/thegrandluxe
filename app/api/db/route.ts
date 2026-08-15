import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data', 'app_database.json');

function readDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading app_database.json:', e);
  }
  return {};
}

function writeDb(data: any) {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('Error writing app_database.json:', e);
    return false;
  }
}

// GET /api/db?key=suites
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');
  const db = readDb();

  if (key) {
    return NextResponse.json({ success: true, key, data: db[key] ?? null });
  }

  return NextResponse.json({ success: true, data: db });
}

// POST /api/db  body: { key: 'suites', data: [...] }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, data } = body;

    if (!key) {
      return NextResponse.json({ success: false, error: 'Missing key' }, { status: 400 });
    }

    const currentDb = readDb();
    currentDb[key] = data;

    const saved = writeDb(currentDb);
    if (!saved) {
      return NextResponse.json({ success: false, error: 'Failed to write to database' }, { status: 500 });
    }

    return NextResponse.json({ success: true, key, data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
