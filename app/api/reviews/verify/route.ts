import { NextResponse } from 'next/server';
import { confirmReview } from '@app/lib/profvote/submit';
import { createVerifiedEmailSession, getSessionCookieOptions, SESSION_COOKIE } from '@app/lib/profvote/session';
import { UNI_CONFIG } from '@app/lib/profvote/universities';
import type { UniversitySlug } from '@app/lib/profvote/types';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  const uni = url.searchParams.get('uni') as UniversitySlug | null;
  const token = url.searchParams.get('token');

  const base = process.env.APP_URL || url.origin;

  if (!id || !uni || !token || !UNI_CONFIG[uni]) {
    return NextResponse.redirect(`${base}/bewerten/bestaetigt?status=invalid`);
  }
  try {
    const result = await confirmReview(uni, id, token);
    const res = NextResponse.redirect(
      `${base}/bewerten/bestaetigt?status=${result.ok ? 'ok' : 'invalid'}`,
    );
    if (result.ok && result.email) {
      res.cookies.set(
        SESSION_COOKIE,
        createVerifiedEmailSession(result.email, uni),
        getSessionCookieOptions(),
      );
    }
    return res;
  } catch (e) {
    console.error('verify failed', e);
    return NextResponse.redirect(`${base}/bewerten/bestaetigt?status=error`);
  }
}
