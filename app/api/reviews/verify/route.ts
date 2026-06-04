import { NextResponse } from 'next/server';
import { confirmReview } from '@app/lib/profvote/submit';
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
    const ok = await confirmReview(uni, id, token);
    return NextResponse.redirect(
      `${base}/bewerten/bestaetigt?status=${ok ? 'ok' : 'invalid'}`,
    );
  } catch (e) {
    console.error('verify failed', e);
    return NextResponse.redirect(`${base}/bewerten/bestaetigt?status=error`);
  }
}
