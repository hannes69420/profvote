import { NextResponse } from 'next/server';
import { getAdminClient } from '@app/lib/profvote/wix';
import { REVIEW_COLLECTION } from '@app/lib/profvote/universities';
import type { UniversitySlug } from '@app/lib/profvote/types';

export const runtime = 'nodejs';

function checkAuth(req: Request): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const url = new URL(req.url);
  return url.searchParams.get('secret') === secret;
}

// GET /api/admin/reviews?secret=xxx&uni=stuttgart&filter=all|pending|verified
export async function GET(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const uni = (url.searchParams.get('uni') || 'stuttgart') as UniversitySlug;
  const filter = url.searchParams.get('filter') || 'all'; // all | pending | verified

  const collection = REVIEW_COLLECTION[uni];
  if (!collection) return NextResponse.json({ reviews: [] });

  const wix = getAdminClient();
  const items: Record<string, unknown>[] = [];

  try {
    let q = wix.items.query(collection).descending('_createdDate').limit(100);
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
    ratings: {
      insgesamt: r.sterneInsgesamt ?? r.insgesamt ?? 0,
      vorlesung: r.sterneVorlesung ?? r.vorlesung ?? 0,
      skript: r.sterneskript ?? r.skript ?? 0,
      klausur: r.sterneKlausur ?? r.klausur ?? 0,
      organisation: r.sterneOrganisation ?? r.organisation ?? 0,
      schwierigkeit: r['Sterne Schwierigkeit'] ?? r.schwierigkeit ?? 0,
    },
    professorId: r.professorID ?? r.professorenidkit ?? r.professorId ?? null,
  }));

  return NextResponse.json({ reviews, total: reviews.length });
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
