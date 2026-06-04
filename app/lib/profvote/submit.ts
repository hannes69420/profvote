import { getAdminClient } from './wix';
import { REVIEW_COLLECTION, UNI_CONFIG } from './universities';
import type { RatingBreakdown, UniversitySlug } from './types';

export interface SubmitInput {
  uni: UniversitySlug;
  professorId: string;
  email: string;
  ratings: RatingBreakdown;
  comment?: string;
}

export function isAllowedEmail(uni: UniversitySlug, email: string): boolean {
  const cfg = UNI_CONFIG[uni];
  if (!cfg) return false;
  const lower = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(lower)) return false;
  return cfg.emailDomains.some((d) => lower.endsWith(`@${d}`));
}

function randomToken(): string {
  const a = Math.random().toString(36).slice(2, 12);
  const b = Date.now().toString(36);
  return a + b;
}

function buildItemFields(uni: UniversitySlug, input: SubmitInput, token: string) {
  const base: Record<string, unknown> = {
    Kommentar: input.comment?.trim() || '',
    userEmail: input.email.trim().toLowerCase(),
    verificationToken: token,
    verified: false,
    deleteAfter: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  };
  if (uni === 'stuttgart') {
    return {
      ...base,
      professorID: input.professorId,
      sterneInsgesamt: input.ratings.insgesamt,
      sterneVorlesung: input.ratings.vorlesung,
      sterneskript: input.ratings.skript,
      sterneKlausur: input.ratings.klausur,
      sterneOrganisation: input.ratings.organisation,
      'Sterne Schwierigkeit': input.ratings.schwierigkeit,
    };
  }
  const ratings = {
    insgesamt: input.ratings.insgesamt,
    vorlesung: input.ratings.vorlesung,
    skript: input.ratings.skript,
    klausur: input.ratings.klausur,
    organisation: input.ratings.organisation,
    schwierigkeit: input.ratings.schwierigkeit,
  };
  if (uni === 'kit') return { ...base, ...ratings, professorenidkit: input.professorId };
  if (uni === 'tum') return { ...base, ...ratings, professorId: input.professorId };
  return { ...base, ...ratings };
}

export interface SubmitResult {
  reviewId: string;
  token: string;
}

export async function submitReview(input: SubmitInput): Promise<SubmitResult> {
  const collection = REVIEW_COLLECTION[input.uni];
  if (!collection) throw new Error(`No review collection for uni ${input.uni}`);

  const token = randomToken();
  const wix = getAdminClient();
  const fields = buildItemFields(input.uni, input, token);
  const created = (await wix.items.insert(collection, fields)) as Record<string, unknown>;
  const reviewId = created._id as string | undefined;
  if (!reviewId) throw new Error('Insert returned no _id');
  return { reviewId, token };
}

export async function confirmReview(
  uni: UniversitySlug,
  reviewId: string,
  token: string,
): Promise<boolean> {
  const collection = REVIEW_COLLECTION[uni];
  if (!collection) return false;
  const wix = getAdminClient();
  const existing = (await wix.items.get(collection, reviewId)) as Record<string, unknown> | null;
  if (!existing || existing.verificationToken !== token) return false;
  if (existing.verified === true) return true;
  await wix.items.update(collection, {
    ...existing,
    _id: reviewId,
    verified: true,
  });
  return true;
}
