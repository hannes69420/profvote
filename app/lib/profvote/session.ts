import { createHmac, timingSafeEqual } from 'crypto';
import { UNI_CONFIG } from './universities';
import type { UniversitySlug } from './types';

export const SESSION_COOKIE = 'profvote_session';
const MAX_AGE_SECONDS = 180 * 24 * 60 * 60;

export interface VerifiedEmailSession {
  email: string;
  uni: UniversitySlug;
  exp: number;
}

function getSecret() {
  const secret = process.env.SESSION_SECRET || process.env.ADMIN_SECRET || process.env.WIX_API_KEY;
  if (!secret) throw new Error('SESSION_SECRET fehlt');
  return secret;
}

function base64url(input: string) {
  return Buffer.from(input).toString('base64url');
}

function sign(payload: string) {
  return createHmac('sha256', getSecret()).update(payload).digest('base64url');
}

export function createVerifiedEmailSession(email: string, uni: UniversitySlug) {
  const session: VerifiedEmailSession = {
    email: email.trim().toLowerCase(),
    uni,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS,
  };
  const payload = base64url(JSON.stringify(session));
  return `${payload}.${sign(payload)}`;
}

export function readVerifiedEmailSession(value: string | undefined | null): VerifiedEmailSession | null {
  if (!value) return null;
  const [payload, signature] = value.split('.');
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as VerifiedEmailSession;
    if (!session.email || !session.uni || !session.exp) return null;
    if (!UNI_CONFIG[session.uni]) return null;
    if (session.exp < Math.floor(Date.now() / 1000)) return null;
    return session;
  } catch {
    return null;
  }
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  };
}
