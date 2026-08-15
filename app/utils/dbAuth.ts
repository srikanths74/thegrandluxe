import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  avatarUrl?: string;
  isGoogle: boolean;
  isVerified?: boolean;
  createdAt: string;
  updatedAt: string;
  resetToken?: string;
  resetExpires?: number;
  verificationToken?: string;
  tokenExpires?: number;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'grand-luxe-hotel-secret-key-2026';

// PBKDF2 Password Hashing
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, originalHash] = storedHash.split(':');
    if (!salt || !originalHash) return false;

    // Support both 32-byte (SHA-256) and 64-byte (SHA-512) stored hashes safely
    const keyLen = Math.floor(originalHash.length / 2);
    if (keyLen <= 0) return false;

    const digest = keyLen === 32 ? 'sha256' : 'sha512';
    const hash = crypto.pbkdf2Sync(password, salt, 100000, keyLen, digest).toString('hex');

    const bufA = Buffer.from(hash, 'hex');
    const bufB = Buffer.from(originalHash, 'hex');

    if (bufA.length !== bufB.length) {
      return false;
    }

    return crypto.timingSafeEqual(bufA, bufB);
  } catch (err) {
    return false;
  }
}

// Signed JWT token implementation using Node.js crypto
export function signAuthToken(payload: { id: string; email: string; name: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifyAuthToken(token: string): { id: string; email: string; name: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');
    if (signature !== expectedSignature) return null;

    const decoded = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (decoded.exp && decoded.exp < Date.now()) return null;
    return decoded;
  } catch (err) {
    return null;
  }
}

// Initial Database Seeding
function initialSeedUsers(): UserRecord[] {
  const defaultPasswordHash = hashPassword('password123');
  return [
    {
      id: 'usr_srikanth_1',
      name: 'srikanth',
      email: 'srikanthsuresh2007@gmail.com',
      passwordHash: defaultPasswordHash,
      phone: '+91 98765 43210',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      isGoogle: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'usr_priya_2',
      name: 'Priya Patel',
      email: 'priya.patel@gmail.com',
      passwordHash: defaultPasswordHash,
      phone: '+91 91234 56789',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      isGoogle: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'usr_rahul_3',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@gmail.com',
      passwordHash: defaultPasswordHash,
      phone: '+91 98765 12345',
      avatarUrl: 'https://ui-avatars.com/api/?name=Rahul+Sharma&background=4285F4&color=fff',
      isGoogle: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
}

// Load and Save DB helpers
export function getUsersFromDB(): UserRecord[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      const seed = initialSeedUsers();
      fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf8');
      return seed;
    }

    const content = fs.readFileSync(DB_FILE, 'utf8');
    if (!content.trim()) {
      const seed = initialSeedUsers();
      fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf8');
      return seed;
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading auth database:', error);
    return [];
  }
}

export function saveUsersToDB(users: UserRecord[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing auth database:', error);
  }
}

export function findUserByExactEmail(email: string): UserRecord | undefined {
  const users = getUsersFromDB();
  const target = email.trim().toLowerCase();
  return users.find(u => u.email.toLowerCase() === target);
}

export function findUserByEmail(emailOrUsername: string): UserRecord | undefined {
  const users = getUsersFromDB();
  const search = emailOrUsername.trim().toLowerCase();

  return users.find(u => 
    u.email.toLowerCase() === search ||
    u.name.toLowerCase() === search ||
    u.name.toLowerCase().replace(/\s+/g, '') === search
  );
}

export function findUserById(id: string): UserRecord | undefined {
  const users = getUsersFromDB();
  return users.find(u => u.id === id);
}

export function createUser(userData: {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  isGoogle?: boolean;
  avatarUrl?: string;
}): UserRecord {
  const users = getUsersFromDB();
  const existing = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
  if (existing) {
    throw new Error('User with this email already exists in database');
  }

  const newId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const newUser: UserRecord = {
    id: newId,
    name: userData.name,
    email: userData.email.toLowerCase(),
    passwordHash: userData.password ? hashPassword(userData.password) : hashPassword('google_oauth_no_pwd'),
    phone: userData.phone || '+91 98765 43210',
    avatarUrl: userData.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=2F7BFF&color=fff`,
    isGoogle: !!userData.isGoogle,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsersToDB(users);
  return newUser;
}

export function updateUserPassword(email: string, newPassword: string): boolean {
  const users = getUsersFromDB();
  const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
  if (index === -1) return false;

  users[index].passwordHash = hashPassword(newPassword);
  users[index].updatedAt = new Date().toISOString();
  saveUsersToDB(users);
  return true;
}

export function createEmailVerificationToken(email: string): { token: string; user: UserRecord } {
  let user = findUserByEmail(email);
  if (!user) {
    user = createUser({
      name: email.split('@')[0],
      email: email,
      isGoogle: false
    });
  }

  const token = `evt_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  const users = getUsersFromDB();
  const index = users.findIndex(u => u.id === user!.id);
  if (index !== -1) {
    users[index].verificationToken = token;
    users[index].tokenExpires = Date.now() + 15 * 60 * 1000; // 15 mins
    saveUsersToDB(users);
    user = users[index];
  }

  return { token, user };
}

export function verifyEmailToken(token: string): UserRecord | null {
  const users = getUsersFromDB();
  const index = users.findIndex(u => u.verificationToken === token);
  if (index === -1) return null;

  const user = users[index];
  if (user.tokenExpires && user.tokenExpires < Date.now()) {
    return null; // Expired
  }

  users[index].isVerified = true;
  delete users[index].verificationToken;
  delete users[index].tokenExpires;
  users[index].updatedAt = new Date().toISOString();
  saveUsersToDB(users);

  return users[index];
}

export function createPasswordResetToken(email: string): { token: string; user: UserRecord } | null {
  const users = getUsersFromDB();
  const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
  if (index === -1) return null;

  const token = `prt_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  users[index].resetToken = token;
  users[index].resetExpires = Date.now() + 15 * 60 * 1000; // 15 mins
  saveUsersToDB(users);
  
  return { token, user: users[index] };
}

export function verifyPasswordResetToken(token: string): UserRecord | null {
  const users = getUsersFromDB();
  const index = users.findIndex(u => u.resetToken === token);
  if (index === -1) return null;

  const user = users[index];
  if (user.resetExpires && user.resetExpires < Date.now()) {
    return null; // Expired
  }

  return user; // Notice we don't delete the token here, we delete it when they actually reset the password
}

export function clearPasswordResetToken(userId: string): void {
  const users = getUsersFromDB();
  const index = users.findIndex(u => u.id === userId);
  if (index !== -1) {
    delete users[index].resetToken;
    delete users[index].resetExpires;
    saveUsersToDB(users);
  }
}
