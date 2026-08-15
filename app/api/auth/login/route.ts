import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { findUserByEmail, verifyPassword, signAuthToken } from '@/app/utils/dbAuth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email/Username and password are required.' },
        { status: 400 }
      );
    }

    const cleanInput = email.trim().toLowerCase();

    // Read dynamic admin credentials from app_database.json
    let dynamicAdmin = {
      username: 'admin',
      email: 'srikanthstephen2007@gmail.com',
      password: 'stephen@1235'
    };
    try {
      const dbPath = path.join(process.cwd(), 'data', 'app_database.json');
      if (fs.existsSync(dbPath)) {
        const raw = fs.readFileSync(dbPath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed.adminCredentials) {
          dynamicAdmin = { ...dynamicAdmin, ...parsed.adminCredentials };
        }
      }
    } catch (e) {}

    const adminEmailLower = (dynamicAdmin.email || 'srikanthstephen2007@gmail.com').toLowerCase().trim();
    const adminUserLower = (dynamicAdmin.username || 'admin').toLowerCase().trim();

    if (cleanInput === adminEmailLower || cleanInput === adminUserLower) {
      if (password === dynamicAdmin.password) {
        const adminUser = {
          id: 'admin_1',
          name: dynamicAdmin.username || 'Admin User',
          email: dynamicAdmin.email || 'srikanthstephen2007@gmail.com',
          phone: '+91 98765 43210',
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(dynamicAdmin.username)}&background=F59E0B&color=fff`,
          isAdmin: true
        };
        const token = signAuthToken({ id: adminUser.id, email: adminUser.email, name: adminUser.name });
        const response = NextResponse.json({
          success: true,
          message: 'Admin Sign in successful.',
          user: adminUser,
          isAdmin: true
        });
        response.cookies.set('glh_session', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60,
          path: '/'
        });
        return response;
      } else {
        return NextResponse.json(
          { success: false, error: 'Access Denied: Invalid admin password. Please enter your updated security password.' },
          { status: 401 }
        );
      }
    }

    const user = findUserByEmail(cleanInput);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No account found with this email or username. Please check your details or sign up.' },
        { status: 404 }
      );
    }

    // Verify password against stored hash (or allow demo password fallback)
    const isValidPassword = verifyPassword(password, user.passwordHash);
    const isDemoFallback = password === 'password123';

    if (!isValidPassword && !isDemoFallback) {
      return NextResponse.json(
        { success: false, error: 'Invalid password. Please check your password and try again.' },
        { status: 401 }
      );
    }

    const token = signAuthToken({
      id: user.id,
      email: user.email,
      name: user.name
    });

    const response = NextResponse.json({
      success: true,
      message: 'Sign in successful.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        isGoogle: user.isGoogle
      }
    });

    response.cookies.set('glh_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/'
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to authenticate user.' },
      { status: 500 }
    );
  }
}
