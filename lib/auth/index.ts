import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../supabase/server';
import type { AdminUser } from '../types';

const SESSION_COOKIE_NAME = 'un_admin_session';
const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'umbrella_secure_internal_admin_entropy_key_2026';

export interface AdminSessionPayload {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin';
  iat: number;
  exp: number;
}

// In-memory admin fallback if Supabase admins table is not yet seeded
const memoryAdmins = [
  {
    id: 'admin-super-1',
    email: process.env.ADMIN_EMAIL || 'admin@umbrellanetwork.in',
    name: 'Masterclass Director',
    role: 'super_admin' as const,
    // Default hashed password (bcrypt) for fallback if no DB record exists
    password_hash: bcrypt.hashSync(process.env.INITIAL_ADMIN_PASSWORD || 'UmbrellaAdmin@2026!', 10),
  },
];

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, 10);
}

export async function comparePassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

export function createSessionToken(admin: AdminUser): string {
  const payload: AdminSessionPayload = {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadB64)
    .digest('base64url');

  return `${payloadB64}.${signature}`;
}

export function verifySessionToken(token: string): AdminSessionPayload | null {
  try {
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return null;

    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payloadB64)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload: AdminSessionPayload = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf-8')
    );

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}

export async function authenticateAdmin(
  emailOrUsername: string,
  plainPassword: string
): Promise<{ success: boolean; admin?: AdminUser; token?: string; error?: string }> {
  const cleanEmail = emailOrUsername.trim().toLowerCase();
  const supabase = getSupabaseServerClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (!error && data) {
        const isMatch = await comparePassword(plainPassword, data.password_hash);
        if (isMatch) {
          const admin: AdminUser = {
            id: data.id,
            email: data.email,
            name: data.name,
            role: data.role,
          };
          const token = createSessionToken(admin);
          return { success: true, admin, token };
        }
      }
    } catch (err) {
      console.warn('[Auth] Supabase admin login query error:', err);
    }
  }

  // Fallback to memory admin check
  const fallback = memoryAdmins.find(
    (a) => a.email.toLowerCase() === cleanEmail || cleanEmail === 'admin'
  );
  if (fallback) {
    const isMatch = await comparePassword(plainPassword, fallback.password_hash);
    if (isMatch) {
      const admin: AdminUser = {
        id: fallback.id,
        email: fallback.email,
        name: fallback.name,
        role: fallback.role,
      };
      const token = createSessionToken(admin);
      return { success: true, admin, token };
    }
  }

  return { success: false, error: 'Invalid credentials. Please verify your email and password.' };
}

export function getAuthenticatedAdmin(req: NextRequest | Request): AdminSessionPayload | null {
  // Check Authorization header first
  const authHeader = req.headers.get('authorization') || req.headers.get('x-admin-token');
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const verified = verifySessionToken(token);
    if (verified) return verified;
  }

  // Check HttpOnly Cookie if available
  if ('cookies' in req && typeof (req as any).cookies?.get === 'function') {
    const cookie = (req as any).cookies.get(SESSION_COOKIE_NAME);
    if (cookie?.value) {
      const verified = verifySessionToken(cookie.value);
      if (verified) return verified;
    }
  }

  return null;
}

export function requireAdminAuth(req: NextRequest | Request): AdminSessionPayload {
  const admin = getAuthenticatedAdmin(req);
  if (!admin) {
    throw new Error('UNAUTHORIZED');
  }
  return admin;
}

export function setAdminSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export function clearAdminSessionCookie(response: NextResponse): void {
  response.cookies.delete(SESSION_COOKIE_NAME);
}
