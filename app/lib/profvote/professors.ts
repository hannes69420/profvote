import { tryGetReadClient } from './wix';
import { DEMO_PROFESSORS, listDemoProfessorsByUni } from './demoData';
import { aggregate, listReviewsByUni, listReviewsForProfessor } from './reviews';
import { TUM_PROFESSOR_ROWS } from './tumProfessors';
import { PROF_COLLECTION, UNI_CONFIG } from './universities';
import type { Professor, UniversitySlug } from './types';

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const SLUG_FROM_NAME = slugify;

function slugFromKitLink(item: Record<string, unknown>): string | undefined {
  const link = item['link-kit-professorenliste-title'] as string | undefined;
  return link?.split('/').filter(Boolean).pop();
}

function normalizeProf(uni: UniversitySlug, raw: Record<string, unknown>): Professor {
  const name = (raw.name as string) || (raw.title as string) || 'Unbekannt';
  const slug =
    (raw.slug as string) ||
    (uni === 'kit' ? slugFromKitLink(raw) : undefined) ||
    SLUG_FROM_NAME(name);
  return {
    id: raw._id as string,
    slug,
    uni,
    name,
    faculty: (raw.fakultatEn as string) || (raw.fakultaet as string) || undefined,
    facultyNumber: typeof raw.fakultat_nr === 'number' ? raw.fakultat_nr : undefined,
    title: (raw.kategorie_basis as string) || (raw.status as string) || undefined,
  };
}

async function attachRealReviewStats(
  uni: UniversitySlug,
  professors: Professor[],
): Promise<Professor[]> {
  const reviews = await listReviewsByUni(uni);
  if (reviews.length === 0) {
    return professors.map(({ avgOverall, reviewCount, ...prof }) => prof);
  }

  const byProfessor = new Map<string, { sum: number; count: number }>();
  for (const review of reviews) {
    const current = byProfessor.get(review.professorId) ?? { sum: 0, count: 0 };
    current.sum += review.ratings.insgesamt;
    current.count += 1;
    byProfessor.set(review.professorId, current);
  }

  return professors.map(({ avgOverall, reviewCount, ...prof }) => {
    const stats = byProfessor.get(prof.id);
    if (!stats || stats.count === 0) return prof;
    return {
      ...prof,
      avgOverall: stats.sum / stats.count,
      reviewCount: stats.count,
    };
  });
}

async function attachRealReviewStatsForProfessor(professor: Professor): Promise<Professor> {
  const reviews = await listReviewsForProfessor(professor.uni, professor.id);
  const stats = aggregate(reviews);
  const { avgOverall, reviewCount, ...prof } = professor;
  if (!stats) return prof;
  return {
    ...prof,
    avgOverall: stats.insgesamt,
    reviewCount: stats.count,
  };
}

function listTumProfessors(): Professor[] {
  const seen = new Map<string, number>();
  return TUM_PROFESSOR_ROWS.map((row, index) => {
    const baseSlug = slugify(row.name);
    const nextCount = (seen.get(baseSlug) ?? 0) + 1;
    seen.set(baseSlug, nextCount);
    const slug = nextCount === 1 ? baseSlug : `${baseSlug}-${nextCount}`;

    return {
      id: `tum-${String(index + 1).padStart(4, '0')}`,
      slug,
      uni: 'tum',
      name: row.name,
      faculty: row.faculty,
      title: 'Professor',
    };
  });
}

export async function listProfessorsByUni(uniSlug: UniversitySlug): Promise<Professor[]> {
  if (!UNI_CONFIG[uniSlug]?.available) return [];
  const collection = PROF_COLLECTION[uniSlug];
  if (!collection) return [];
  const wix = await tryGetReadClient();
  if (!wix) return uniSlug === 'tum' ? listTumProfessors() : listDemoProfessorsByUni(uniSlug);
  const all: Professor[] = [];
  let skip = 0;
  const pageSize = 100;
  while (true) {
    const res = await wix.items.query(collection).limit(pageSize).skip(skip).find();
    for (const it of res.items as Record<string, unknown>[]) all.push(normalizeProf(uniSlug, it));
    if (!res.items?.length || res.items.length < pageSize) break;
    skip += pageSize;
    if (skip > 5000) break;
  }
  if (uniSlug === 'tum' && all.length === 0) return listTumProfessors();
  all.sort((a, b) => a.name.localeCompare(b.name, 'de'));
  return attachRealReviewStats(uniSlug, all);
}

export async function getProfessor(uniSlug: UniversitySlug, slug: string): Promise<Professor | null> {
  const all = await listProfessorsByUni(uniSlug);
  return all.find((p) => p.slug === slug) ?? null;
}

export async function listTopProfessors(limit = 5): Promise<Professor[]> {
  const unis = Object.values(UNI_CONFIG)
    .filter((u) => u.available)
    .map((u) => u.slug);
  const lists = await Promise.all(unis.map((u) => listProfessorsByUni(u)));
  const all = lists.flat().filter((p) => (p.reviewCount ?? 0) > 0 || (p.avgOverall ?? 0) > 0);
  // Wilson-ish ranking: rating * log(1 + count) to favor profs with both high rating + volume
  all.sort((a, b) => {
    const score = (p: Professor) =>
      (p.avgOverall ?? 0) * Math.log(1 + (p.reviewCount ?? 0));
    return score(b) - score(a);
  });
  return all.slice(0, limit);
}

export async function getProfessorById(uniSlug: UniversitySlug, id: string): Promise<Professor | null> {
  const collection = PROF_COLLECTION[uniSlug];
  if (!collection) return null;
  const wix = await tryGetReadClient();
  if (!wix) {
    if (uniSlug === 'tum') return listTumProfessors().find((p) => p.id === id) ?? null;
    return DEMO_PROFESSORS.find((p) => p.uni === uniSlug && p.id === id) ?? null;
  }
  try {
    const res = await wix.items.query(collection).eq('_id', id).limit(1).find();
    const raw = res.items?.[0] as Record<string, unknown> | undefined;
    if (raw) return attachRealReviewStatsForProfessor(normalizeProf(uniSlug, raw));
    if (uniSlug === 'tum') return listTumProfessors().find((p) => p.id === id) ?? null;
    return null;
  } catch {
    if (process.env.NODE_ENV !== 'production') {
      if (uniSlug === 'tum') return listTumProfessors().find((p) => p.id === id) ?? null;
      return DEMO_PROFESSORS.find((p) => p.uni === uniSlug && p.id === id) ?? null;
    }
    return null;
  }
}
