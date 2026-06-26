import { NextResponse } from 'next/server';
import { getAdminClient } from '@app/lib/profvote/wix';
import { REVIEW_COLLECTION } from '@app/lib/profvote/universities';
import { buildItemFields } from '@app/lib/profvote/submit';
import type { UniversitySlug } from '@app/lib/profvote/types';

export const runtime = 'nodejs';

type MutableWixDataItem = Record<string, unknown> & { _id: string };

function checkAuth(req: Request): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const url = new URL(req.url);
  return url.searchParams.get('secret') === secret;
}

function checkAuthBody(secret: string | null): boolean {
  const envSecret = process.env.ADMIN_SECRET;
  if (!envSecret) return false;
  return secret === envSecret;
}

// GET /api/admin/reviews?secret=xxx&uni=stuttgart&filter=all|pending|verified
export async function GET(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const uni = (url.searchParams.get('uni') || 'stuttgart') as UniversitySlug;
  const filter = url.searchParams.get('filter') || 'all';

  const collection = REVIEW_COLLECTION[uni];
  if (!collection) return NextResponse.json({ reviews: [] });

  const wix = getAdminClient();
  const items: Record<string, unknown>[] = [];

  try {
    let q = wix.items.query(collection).descending('_createdDate').limit(200);
    if (filter === 'pending') q = q.eq('verified', false);
    else if (filter === 'verified') q = q.eq('verified', true);
    const res = await q.find();
    items.push(...(res.items as Record<string, unknown>[]));
  } catch (e) {
    console.error('admin reviews fetch failed', e);
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }

  const reviews = items.map((r) => ({
    id: r._id,
    uni,
    verified: r.verified,
    createdAt: r._createdDate,
    deleteAfter: r.deleteAfter,
    userEmail: r.userEmail || null,
    comment: (r.Kommentar as string) || (r.kommentar as string) || '',
    commentApproved: r.commentApproved ?? null,
    isAdminReview: r.isAdminReview ?? false,
    ratings: {
      insgesamt: r.sterneInsgesamt ?? r.insgesamt ?? 0,
      vorlesung: r.sterneVorlesung ?? r.vorlesung ?? 0,
      skript: r.sterneskript ?? r.skript ?? 0,
      klausur: r.sterneKlausur ?? r.klausur ?? 0,
      organisation: r.sterneOrganisation ?? r.organisation ?? 0,
      schwierigkeit: r['Sterne Schwierigkeit'] ?? r.schwierigkeit ?? 0,
    },
    professorId: r.professorID ?? r.professorenidkit ?? r.professorId ?? null,
    professorName: (r.professorName as string) || null,
  }));

  return NextResponse.json({ reviews, total: reviews.length });
}

// POST /api/admin/reviews — create a verified review directly (admin bypass)
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!checkAuthBody(body.secret as string)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const uni = body.uni as UniversitySlug;
  const professorId = body.professorId as string;
  const professorName = (body.professorName as string) || '';
  const comment = (body.comment as string) || '';
  const ratings = body.ratings as Record<string, number>;

  if (!uni || !professorId || !ratings) {
    return NextResponse.json({ error: 'uni, professorId und ratings sind pflicht' }, { status: 400 });
  }

  const ratingKeys = ['insgesamt', 'vorlesung', 'skript', 'klausur', 'organisation', 'schwierigkeit'];
  for (const k of ratingKeys) {
    const v = Number(ratings[k]);
    if (!Number.isFinite(v) || v < 1 || v > 5) {
      return NextResponse.json({ error: `Ungültige Bewertung für ${k}` }, { status: 400 });
    }
  }

  const collection = REVIEW_COLLECTION[uni];
  if (!collection) return NextResponse.json({ error: 'Unbekannte Uni' }, { status: 400 });

  try {
    const wix = getAdminClient();
    const fields = buildItemFields(uni, {
      uni,
      professorId,
      email: 'admin@profvote.de',
      ratings: {
        insgesamt: Number(ratings.insgesamt),
        vorlesung: Number(ratings.vorlesung),
        skript: Number(ratings.skript),
        klausur: Number(ratings.klausur),
        organisation: Number(ratings.organisation),
        schwierigkeit: Number(ratings.schwierigkeit),
      },
      comment,
    }, 'admin-bypass');

    const created = await wix.items.insert(collection, {
      ...fields,
      verified: true,
      commentApproved: true,
      isAdminReview: true,
      professorName,
    }) as Record<string, unknown>;

    return NextResponse.json({ ok: true, id: created._id });
  } catch (e) {
    console.error('admin create review failed', e);
    return NextResponse.json({ error: 'Fehler beim Erstellen' }, { status: 500 });
  }
}

// PATCH /api/admin/reviews?secret=xxx&uni=stuttgart&id=xxx&approve=true|false&verify=true
export async function PATCH(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const uni = (url.searchParams.get('uni') || 'stuttgart') as UniversitySlug;
  const id = url.searchParams.get('id');
  const approveParam = url.searchParams.get('approve');
  const verify = url.searchParams.get('verify') === 'true';

  if (!id) return NextResponse.json({ error: 'id fehlt' }, { status: 400 });

  const collection = REVIEW_COLLECTION[uni];
  if (!collection) return NextResponse.json({ error: 'Unbekannte Uni' }, { status: 400 });

  try {
    const wix = getAdminClient();
    const existing = (await wix.items.get(collection, id)) as Record<string, unknown> | null;
    if (!existing) return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 });

    const updates: MutableWixDataItem = { ...existing, _id: id };
    if (approveParam !== null) updates.commentApproved = approveParam === 'true';
    if (verify) updates.verified = true;

    await wix.items.update(collection, updates);
    return NextResponse.json({ ok: true, commentApproved: updates.commentApproved, verified: updates.verified });
  } catch (e) {
    console.error('admin patch failed', e);
    return NextResponse.json({ error: 'Fehler beim Aktualisieren' }, { status: 500 });
  }
}

// DELETE /api/admin/reviews?secret=xxx&uni=stuttgart&id=xxx
export async function DELETE(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const uni = (url.searchParams.get('uni') || 'stuttgart') as UniversitySlug;
  const id = url.searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'id fehlt' }, { status: 400 });

  const collection = REVIEW_COLLECTION[uni];
  if (!collection) return NextResponse.json({ error: 'Unbekannte Uni' }, { status: 400 });

  try {
    const wix = getAdminClient();
    await wix.items.remove(collection, id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('admin delete failed', e);
    return NextResponse.json({ error: 'Löschen fehlgeschlagen' }, { status: 500 });
  }
}
