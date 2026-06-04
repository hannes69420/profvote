import { tryGetReadClient } from './wix';
import { DEMO_REVIEWS, listDemoReviewsForProfessor } from './demoData';
import { REVIEW_COLLECTION } from './universities';
import type { AggregatedRatings, RatingBreakdown, Review, UniversitySlug } from './types';

function getRatings(uni: UniversitySlug, raw: Record<string, unknown>): RatingBreakdown {
  const num = (v: unknown) => (typeof v === 'number' ? v : 0);
  if (uni === 'stuttgart') {
    return {
      insgesamt: num(raw.sterneInsgesamt),
      vorlesung: num(raw.sterneVorlesung),
      skript: num(raw.sterneskript),
      klausur: num(raw.sterneKlausur),
      organisation: num(raw.sterneOrganisation),
      schwierigkeit: num(raw['Sterne Schwierigkeit']),
    };
  }
  return {
    insgesamt: num(raw.insgesamt),
    vorlesung: num(raw.vorlesung),
    skript: num(raw.skript),
    klausur: num(raw.klausur),
    organisation: num(raw.organisation),
    schwierigkeit: num(raw.schwierigkeit),
  };
}

function getProfessorId(uni: UniversitySlug, raw: Record<string, unknown>): string | undefined {
  if (uni === 'stuttgart') return (raw.professorID as string) || undefined;
  if (uni === 'kit') return (raw.professorenidkit as string) || undefined;
  if (uni === 'tum') return ((raw.professorId as string) || (raw.professorenidtu as string)) ?? undefined;
  return undefined;
}

function toIso(v: unknown): string {
  if (!v) return new Date(0).toISOString();
  if (v instanceof Date) return v.toISOString();
  if (typeof v === 'string') return v;
  if (typeof v === 'object' && v !== null && '$date' in v) {
    return String((v as { $date: unknown }).$date);
  }
  return new Date(0).toISOString();
}

function normalizeReview(uni: UniversitySlug, raw: Record<string, unknown>): Review | null {
  const professorId = getProfessorId(uni, raw);
  if (!professorId) return null;
  return {
    id: raw._id as string,
    professorId,
    uni,
    createdAt: toIso(raw._createdDate),
    comment: ((raw.Kommentar as string) || '').trim() || undefined,
    ratings: getRatings(uni, raw),
    verified: raw.verified !== false,
  };
}

export async function listReviewsForProfessor(
  uni: UniversitySlug,
  professorId: string,
): Promise<Review[]> {
  const collection = REVIEW_COLLECTION[uni];
  if (!collection) return [];
  const wix = await tryGetReadClient();
  if (!wix) return listDemoReviewsForProfessor(uni, professorId);
  const reviews: Review[] = [];
  let q = wix.items.query(collection).limit(100);
  if (uni === 'stuttgart') q = q.eq('professorID', professorId);
  else if (uni === 'kit') q = q.eq('professorenidkit', professorId);
  else if (uni === 'tum') q = q.eq('professorId', professorId);
  try {
    const res = await q.find();
    for (const it of res.items as Record<string, unknown>[]) {
      const r = normalizeReview(uni, it);
      if (r && r.verified) reviews.push(r);
    }
  } catch {
    return [];
  }
  reviews.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return reviews;
}

export async function listRecentReviews(limit = 8): Promise<Review[]> {
  const wix = await tryGetReadClient();
  if (!wix) {
    return DEMO_REVIEWS.filter((r) => r.verified)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }
  const unis: UniversitySlug[] = ['stuttgart', 'kit', 'tum'];
  const all: Review[] = [];
  await Promise.all(
    unis.map(async (uni) => {
      const collection = REVIEW_COLLECTION[uni];
      if (!collection) return;
      try {
        const res = await wix.items
          .query(collection)
          .descending('_createdDate')
          .limit(20)
          .find();
        for (const it of res.items as Record<string, unknown>[]) {
          const r = normalizeReview(uni, it);
          if (r && r.verified) all.push(r);
        }
      } catch {
        // ignore per-collection failures
      }
    }),
  );
  all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return all.slice(0, limit);
}

export function aggregate(reviews: Review[]): AggregatedRatings | null {
  if (!reviews.length) return null;
  const sum: RatingBreakdown = {
    insgesamt: 0, vorlesung: 0, skript: 0, klausur: 0, organisation: 0, schwierigkeit: 0,
  };
  for (const r of reviews) {
    sum.insgesamt += r.ratings.insgesamt;
    sum.vorlesung += r.ratings.vorlesung;
    sum.skript += r.ratings.skript;
    sum.klausur += r.ratings.klausur;
    sum.organisation += r.ratings.organisation;
    sum.schwierigkeit += r.ratings.schwierigkeit;
  }
  const n = reviews.length;
  return {
    count: n,
    insgesamt: sum.insgesamt / n,
    vorlesung: sum.vorlesung / n,
    skript: sum.skript / n,
    klausur: sum.klausur / n,
    organisation: sum.organisation / n,
    schwierigkeit: sum.schwierigkeit / n,
  };
}
