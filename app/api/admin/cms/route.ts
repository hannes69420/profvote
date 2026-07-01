import { NextResponse } from 'next/server';
import { getAdminClient } from '@app/lib/profvote/wix';
import { PROF_COLLECTION } from '@app/lib/profvote/universities';
import type { UniversitySlug } from '@app/lib/profvote/types';

export const runtime = 'nodejs';

type MutableWixDataItem = Record<string, unknown> & { _id: string };

const EDITABLE_FIELDS = [
  'name',
  'title',
  'slug',
  'fakultatEn',
  'fakultaet',
  'fakultat_nr',
  'kategorie_basis',
  'status',
  'avgOverall',
  'anzahl',
  'school',
  'School',
  'fachbereich',
  'Fachbereich',
  'studiengang',
  'Studiengang',
  'zuordnung',
  'Zuordnung',
] as const;

const NUMBER_FIELDS = new Set(['fakultat_nr', 'avgOverall', 'anzahl']);

function checkAuth(req: Request): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const url = new URL(req.url);
  return url.searchParams.get('secret') === secret;
}

function normalizeEditableValue(key: string, value: unknown) {
  if (NUMBER_FIELDS.has(key)) {
    if (value === '' || value == null) return undefined;
    const number = Number(value);
    return Number.isFinite(number) ? number : undefined;
  }
  if (typeof value === 'string') return value.trim();
  return value;
}

function getPreview(item: Record<string, unknown>) {
  return {
    name: (item.name as string) || (item.title as string) || 'Unbekannt',
    faculty:
      (item.fakultatEn as string) ||
      (item.fakultaet as string) ||
      (item.school as string) ||
      (item.School as string) ||
      undefined,
    title: (item.kategorie_basis as string) || (item.status as string) || undefined,
    avgOverall: typeof item.avgOverall === 'number' ? item.avgOverall : undefined,
    reviewCount: typeof item.anzahl === 'number' ? item.anzahl : undefined,
  };
}

function toAdminEntry(item: Record<string, unknown>) {
  const fields = Object.fromEntries(
    EDITABLE_FIELDS.map((key) => [key, item[key] ?? '']),
  );

  return {
    id: item._id,
    createdAt: item._createdDate ?? null,
    updatedAt: item._updatedDate ?? null,
    preview: getPreview(item),
    fields,
  };
}

export async function GET(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const uni = (url.searchParams.get('uni') || 'stuttgart') as UniversitySlug;
  const q = (url.searchParams.get('q') || '').trim().toLowerCase();

  const collection = PROF_COLLECTION[uni];
  if (!collection) return NextResponse.json({ entries: [], editableFields: EDITABLE_FIELDS });

  try {
    const wix = getAdminClient();
    const res = await wix.items.query(collection).limit(200).find();
    const items = (res.items as Record<string, unknown>[]).filter((item) => {
      if (!q) return true;
      const haystack = [
        item.name,
        item.title,
        item.fakultatEn,
        item.fakultaet,
        item.school,
        item.School,
        item.status,
        item.kategorie_basis,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });

    return NextResponse.json({
      entries: items.slice(0, 100).map(toAdminEntry),
      editableFields: EDITABLE_FIELDS,
      total: items.length,
      limited: items.length > 100,
    });
  } catch (e) {
    console.error('admin cms fetch failed', e);
    return NextResponse.json({ error: 'CMS-Daten konnten nicht geladen werden' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const uni = (url.searchParams.get('uni') || 'stuttgart') as UniversitySlug;
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id fehlt' }, { status: 400 });

  const collection = PROF_COLLECTION[uni];
  if (!collection) return NextResponse.json({ error: 'Unbekannte Collection' }, { status: 400 });

  let body: { fields?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    const wix = getAdminClient();
    const existing = (await wix.items.get(collection, id)) as Record<string, unknown> | null;
    if (!existing) return NextResponse.json({ error: 'Eintrag nicht gefunden' }, { status: 404 });

    const update: MutableWixDataItem = { ...existing, _id: id };
    for (const key of EDITABLE_FIELDS) {
      if (!body.fields || !(key in body.fields)) continue;
      const value = normalizeEditableValue(key, body.fields[key]);
      if (value === undefined || value === '') delete update[key];
      else update[key] = value;
    }

    const saved = (await wix.items.update(collection, update)) as Record<string, unknown>;
    return NextResponse.json({ ok: true, entry: toAdminEntry(saved) });
  } catch (e) {
    console.error('admin cms update failed', e);
    return NextResponse.json({ error: 'CMS-Eintrag konnte nicht gespeichert werden' }, { status: 500 });
  }
}
