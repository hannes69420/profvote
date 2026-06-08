import { NextResponse } from 'next/server';
import { isAllowedEmail, submitReview } from '@app/lib/profvote/submit';
import { sendVerificationEmail } from '@app/lib/profvote/email';
import { getProfessorById } from '@app/lib/profvote/professors';
import { UNI_CONFIG } from '@app/lib/profvote/universities';
import type { UniversitySlug } from '@app/lib/profvote/types';

export const runtime = 'nodejs';

interface Body {
  uni?: string;
  professorId?: string;
  email?: string;
  ratings?: Record<string, number>;
  comment?: string;
}

const RATING_KEYS = [
  'insgesamt',
  'vorlesung',
  'skript',
  'klausur',
  'organisation',
  'schwierigkeit',
] as const;
const MAX_COMMENT_LENGTH = 1000;

function getSafeSubmitError(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  if (message.includes('WIX_API_KEY') || message.includes('WIX_SITE_ID')) {
    return process.env.NODE_ENV === 'production'
      ? 'Die Bewertungsfunktion ist gerade nicht vollständig konfiguriert.'
      : 'Server-Konfiguration fehlt: WIX_API_KEY und WIX_SITE_ID müssen gesetzt sein.';
  }
  return 'Konnte Bewertung nicht speichern. Bitte später erneut versuchen.';
}

function getSafeEmailError(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  if (message.includes('BREVO_API_KEY')) {
    return process.env.NODE_ENV === 'production'
      ? 'Die Bestätigungs-Mail konnte gerade nicht versendet werden.'
      : 'Server-Konfiguration fehlt: BREVO_API_KEY muss gesetzt sein.';
  }
  if (message.includes('Brevo error')) {
    return process.env.NODE_ENV === 'production'
      ? 'Die Bestätigungs-Mail konnte gerade nicht versendet werden.'
      : message;
  }
  return 'Die Bestätigungs-Mail konnte gerade nicht versendet werden.';
}

const submitLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const maxRequests = 3;
  const timestamps = (submitLog.get(ip) ?? []).filter((t) => now - t < windowMs);
  if (timestamps.length >= maxRequests) return true;
  submitLog.set(ip, [...timestamps, now]);
  return false;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Zu viele Bewertungen in kurzer Zeit. Bitte warte 10 Minuten.' },
      { status: 429 },
    );
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const uni = body.uni as UniversitySlug;
  if (!uni || !UNI_CONFIG[uni]?.available) {
    return NextResponse.json({ error: 'Unbekannte Universität' }, { status: 400 });
  }
  if (!body.professorId) {
    return NextResponse.json({ error: 'professorId fehlt' }, { status: 400 });
  }
  if (!body.email || !isAllowedEmail(uni, body.email)) {
    return NextResponse.json(
      {
        error: `Bitte eine Uni-Email-Adresse benutzen (${UNI_CONFIG[uni].emailDomains.join(
          ' oder ',
        )}).`,
      },
      { status: 400 },
    );
  }
  if (body.comment && body.comment.length > MAX_COMMENT_LENGTH) {
    return NextResponse.json({ error: 'Kommentar zu lang (max. 1000 Zeichen).' }, { status: 400 });
  }

  const ratings = Object.fromEntries(
    RATING_KEYS.map((k) => [k, Number(body.ratings?.[k] ?? 0)]),
  ) as Record<(typeof RATING_KEYS)[number], number>;
  for (const k of RATING_KEYS) {
    if (!Number.isFinite(ratings[k]) || ratings[k] < 1 || ratings[k] > 5) {
      return NextResponse.json({ error: 'Bitte alle Sterne (1-5) bewerten.' }, { status: 400 });
    }
  }

  const prof = await getProfessorById(uni, body.professorId);
  if (!prof) {
    return NextResponse.json({ error: 'Professor:in nicht gefunden' }, { status: 404 });
  }

  let reviewId: string;
  let token: string;
  try {
    ({ reviewId, token } = await submitReview({
      uni,
      professorId: body.professorId,
      email: body.email,
      ratings,
      comment: body.comment,
    }));
  } catch (e) {
    console.error('submit failed', e);
    return NextResponse.json({ error: getSafeSubmitError(e) }, { status: 500 });
  }

  try {
    const appUrl = process.env.APP_URL || new URL(req.url).origin;
    const verifyUrl = `${appUrl}/api/reviews/verify?id=${encodeURIComponent(
      reviewId,
    )}&uni=${uni}&token=${encodeURIComponent(token)}`;

    await sendVerificationEmail({
      to: body.email,
      professorName: prof.name,
      verifyUrl,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('verification email failed', e);
    return NextResponse.json({ error: getSafeEmailError(e) }, { status: 500 });
  }
}
