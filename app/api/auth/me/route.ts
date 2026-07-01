import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { readVerifiedEmailSession, SESSION_COOKIE } from '@app/lib/profvote/session';

export const runtime = 'nodejs';

export async function GET() {
  const cookieStore = await cookies();
  const session = readVerifiedEmailSession(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) return NextResponse.json({ authenticated: false });

  return NextResponse.json({
    authenticated: true,
    email: session.email,
    uni: session.uni,
  });
}
