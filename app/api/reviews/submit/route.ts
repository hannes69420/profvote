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

const RATING_KEYS = ['insgesamt', 'vorlesung', 'skript', 'klausur', 'organisation', 'schwierigkeit'] as const;

export async function POST(req: Request) {
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
      { error: `Bitte eine Uni-Email-Adresse benutzen (${UNI_CONFIG[uni].emailDomains.join(' oder ')}).` },
      { status: 400 },
    );
  }
  const ratings = Object.fromEntries(
    RATING_KEYS.map((k) => [k, Number(body.ratings?.[k] ?? 0)]),
  ) as Record<(typeof RATING_KEYS)[number], number>;
  for (const k of RATING_KEYS) {
    if (!Number.isFinite(ratings[k]) || ratings[k] < 1 || ratings[k] > 5) {
      return NextResponse.json({ error: `Bitte alle Sterne (1–5) bewerten.` }, { status: 400 });
    }
  }

  const prof = await getProfessorById(uni, body.professorId);
  if (!prof) {
    return NextResponse.json({ error: 'Professor:in nicht gefunden' }, { status: 404 });
  }

  try {
    const { reviewId, token } = await submitReview({
      uni,
      professorId: body.professorId,
      email: body.email,
      ratings,
      comment: body.comment,
    });

    const appUrl = process.env.APP_URL || new URL(req.url).origin;
    const verifyUrl = `${appUrl}/api/reviews/verify?id=${encodeURIComponent(reviewId)}&uni=${uni}&token=${encodeURIComponent(token)}`;

    await sendVerificationEmail({
      to: body.email,
      professorName: prof.name,
      verifyUrl,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('submit failed', e);
    return NextResponse.json(
      { error: 'Konnte Bewertung nicht speichern. Bitte später erneut versuchen.' },
      { status: 500 },
    );
  }
}
