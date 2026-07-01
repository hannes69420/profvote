import { randomBytes } from 'crypto';
import { getAdminClient } from './wix';
import { REVIEW_COLLECTION, UNI_CONFIG } from './universities';
import type { RatingBreakdown, UniversitySlug } from './types';

type MutableWixDataItem = Record<string, unknown> & { _id: string };

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
  return randomBytes(32).toString('hex');
}

export function buildItemFields(uni: UniversitySlug, input: SubmitInput, token: string) {
  const comment = input.comment?.trim() || '';
  const base: Record<string, unknown> = {
    Kommentar: comment,
    userEmail: input.email.trim().toLowerCase(),
    verificationToken: token,
    verified: false,
    deleteAfter: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    // Comments need explicit admin approval before going public
    commentApproved: comment ? false : true,
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
  alreadyVerified: boolean;
}

export async function hasVerifiedEmailForUni(uni: UniversitySlug, email: string): Promise<boolean> {
  const collection = REVIEW_COLLECTION[uni];
  if (!collection) return false;

  const normalizedEmail = email.trim().toLowerCase();
  const wix = getAdminClient();
  const res = await wix.items
    .query(collection)
    .eq('userEmail', normalizedEmail)
    .eq('verified', true)
    .limit(1)
    .find();

  return (res.items?.length ?? 0) > 0;
}

export async function submitReview(
  input: SubmitInput,
  options: { skipEmailVerification?: boolean } = {},
): Promise<SubmitResult> {
  const collection = REVIEW_COLLECTION[input.uni];
  if (!collection) throw new Error(`No review collection for uni ${input.uni}`);

  const token = randomToken();
  const wix = getAdminClient();
  const fields: Record<string, unknown> = buildItemFields(input.uni, input, token);
  if (options.skipEmailVerification) {
    fields.verified = true;
    fields.verificationToken = '';
    delete fields.deleteAfter;
  }
  const created = (await wix.items.insert(collection, fields)) as Record<string, unknown>;
  const reviewId = created._id as string | undefined;
  if (!reviewId) throw new Error('Insert returned no _id');
  return { reviewId, token, alreadyVerified: Boolean(options.skipEmailVerification) };
}

export async function confirmReview(
  uni: UniversitySlug,
  reviewId: string,
  token: string,
): Promise<{ ok: boolean; email?: string }> {
  const collection = REVIEW_COLLECTION[uni];
  if (!collection) return { ok: false };
  const wix = getAdminClient();
  const existing = (await wix.items.get(collection, reviewId)) as Record<string, unknown> | null;
  if (!existing || existing.verificationToken !== token) return { ok: false };
  const email = typeof existing.userEmail === 'string' ? existing.userEmail : undefined;
  if (existing.verified === true) return { ok: true, email };
  const update: MutableWixDataItem = {
    ...existing,
    _id: reviewId,
    verified: true,
  };
  await wix.items.update(collection, update);
  return { ok: true, email };
}
