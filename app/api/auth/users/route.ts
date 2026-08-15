import { NextResponse } from 'next/server';
import { getUsersFromDB } from '@/app/utils/dbAuth';

export async function GET() {
  try {
    const users = getUsersFromDB();
    // Return sanitized database users list
    const sanitizedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || 'N/A',
      avatarUrl: user.avatarUrl,
      isGoogle: user.isGoogle,
      createdAt: user.createdAt,
      passwordHash: user.passwordHash.substring(0, 20) + '...' // Masked for security preview
    }));

    return NextResponse.json({
      totalUsers: users.length,
      databaseFile: 'my-app/data/users.json',
      users: sanitizedUsers
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to retrieve database contents' }, { status: 500 });
  }
}
