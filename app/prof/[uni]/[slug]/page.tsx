import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getUniversity } from '@app/lib/profvote/universities';
import { getProfessor, slugify } from '@app/lib/profvote/professors';
import { aggregate, listReviewsForProfessor } from '@app/lib/profvote/reviews';
import { Avatar } from '@app/components/Avatar';
import { RatingRing } from '@app/components/RatingRing';
import { RatingBars, RatingDistribution } from '@app/components/RatingBars';
import type { UniversitySlug } from '@app/lib/profvote/types';

export const dynamic = 'force-dynamic';

type PageParams = Promise<{ uni: string; slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: PageParams;
}) {
  const { uni: uniSlug, slug } = await params;
  const uni = getUniversity(uniSlug);
  if (!uni) return { title: 'Professor:in nicht gefunden' };
  const prof = await getProfessor(uni.slug as UniversitySlug, slug);
  if (!prof) return { title: 'Professor:in nicht gefunden' };
  const rating = prof.avgOverall != null ? `⌀ ${prof.avgOverall.toFixed(1)}/5` : 'Noch keine Bewertungen';
  const desc = `${prof.name}${prof.faculty ? ` · ${prof.faculty}` : ''} · ${uni.shortName}. ${rating}${prof.reviewCount ? ` aus ${prof.reviewCount} Bewertungen` : ''}.`;
  return {
    title: `${prof.name} — ${uni.shortName}`,
    description: desc,
    openGraph: { title: `${prof.name} — ${uni.shortName}`, description: desc },
  };
}

export default async function ProfPage({
  params,
}: {
  params: PageParams;
}) {
  const { uni: uniSlug, slug } = await params;
  const uni = getUniversity(uniSlug);
  if (!uni) notFound();
  const prof = await getProfessor(uni.slug as UniversitySlug, slug);
  if (!prof) notFound();

  const reviews = await listReviewsForProfessor(uni.slug as UniversitySlug, prof.id);
  const stats = aggregate(reviews);
  const distribution = reviews.map((r) => r.ratings.insgesamt);
  const withText = reviews.filter((r) => r.comment);

  return (
    <>
      {/* Soft gradient hero */}
      <div className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(900px 320px at 20% -10%, rgba(0,113,227,0.08), transparent 60%), radial-gradient(700px 280px at 90% 0%, rgba(168,85,247,0.07), transparent 65%)',
          }}
        />
        <div className="container-prose pt-10 pb-12 sm:pt-14 sm:pb-16">
          <Link
            href={`/uni/${uni.slug}`}
            className="text-sm text-ink-muted hover:text-ink-soft"
          >
            ← {uni.shortName}
          </Link>

          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <Avatar name={prof.name} size={88} className="shadow-card" />
              <div>
                <h1 className="!text-4xl sm:!text-5xl">{prof.name}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {prof.faculty && (
                    <Link
                      href={`/uni/${uni.slug}/fakultaet/${slugify(prof.faculty)}`}
                      className="pill transition-colors hover:bg-ink-soft/10 hover:text-ink-soft"
                    >
                      {prof.faculty}
                    </Link>
                  )}
                  {prof.title && <span className="pill">{prof.title}</span>}
                  <span className="pill">{uni.shortName}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 self-start">
              <Link
                href={`/vergleich?a=${uni.slug}/${prof.slug}`}
                className="btn-ghost-lg"
              >
                Vergleichen
              </Link>
              <Link
                href={`/bewerten/${uni.slug}/${prof.slug}`}
                className="btn-cta"
              >
                <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l2.6 7.3H22l-6 4.6 2.3 7.3-6.3-4.6L5.7 21.2 8 13.9 2 9.3h7.4L12 2z" />
                </svg>
                Jetzt bewerten
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container-prose pb-24">
        {/* Rating overview */}
        <section className="grid gap-6 sm:grid-cols-5">
          <div className="card flex items-center justify-center sm:col-span-2">
            <RatingRing
              value={stats?.insgesamt ?? null}
              count={stats?.count ?? 0}
            />
          </div>

          <div className="card sm:col-span-3">
            <div className="text-sm font-medium text-ink-soft">Aufschlüsselung</div>
            <div className="mt-5">
              <RatingBars stats={stats} />
            </div>
          </div>
        </section>

        {/* Distribution + Comments */}
        <section className="mt-6 grid gap-6 sm:grid-cols-5">
          <div className="card sm:col-span-2">
            <div className="text-sm font-medium text-ink-soft">Verteilung</div>
            <p className="mt-1 text-xs text-ink-muted">Wie oft welche Gesamt-Sterne vergeben wurden</p>
            <div className="mt-5">
              {distribution.length > 0 ? (
                <RatingDistribution values={distribution} />
              ) : (
                <EmptyStateMini />
              )}
            </div>
          </div>

          <div className="sm:col-span-3">
            <div className="mb-3 flex items-baseline justify-between">
              <h2>Kommentare</h2>
              <span className="text-sm text-ink-muted">
                {withText.length}{withText.length !== reviews.length && reviews.length > 0
                  ? ` · ${reviews.length - withText.length} ohne Text`
                  : ''}
              </span>
            </div>
            <ul className="space-y-3">
              {withText.length === 0 ? (
                <li className="card flex items-center gap-4">
                  <EmptyCommentsSvg />
                  <div>
                    <div className="text-sm font-medium text-ink-soft">Noch keine Kommentare</div>
                    <div className="mt-1 text-sm text-ink-muted">
                      Sei die erste Person, die etwas zu {prof.name.split(' ').slice(-1)[0]} schreibt.
                    </div>
                  </div>
                </li>
              ) : (
                withText.map((r) => (
                  <li key={r.id} className="card">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-ink-soft">★ {r.ratings.insgesamt}/5</span>
                        <span className="text-xs text-ink-muted">
                          · Schwierigkeit {r.ratings.schwierigkeit}/5
                        </span>
                      </div>
                      <time className="text-xs text-ink-muted">
                        {new Date(r.createdAt).toLocaleDateString('de-DE', {
                          year: 'numeric',
                          month: 'short',
                        })}
                      </time>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">{r.comment}</p>
                  </li>
                ))
              )}
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}

function EmptyStateMini() {
  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center">
      <svg width="64" height="40" viewBox="0 0 64 40" fill="none" aria-hidden>
        <rect x="2" y="22" width="8" height="14" rx="2" fill="#E5E5EA" />
        <rect x="14" y="14" width="8" height="22" rx="2" fill="#E5E5EA" />
        <rect x="26" y="6" width="8" height="30" rx="2" fill="#D2D2D7" />
        <rect x="38" y="18" width="8" height="18" rx="2" fill="#E5E5EA" />
        <rect x="50" y="26" width="8" height="10" rx="2" fill="#E5E5EA" />
      </svg>
      <p className="text-xs text-ink-muted">Noch keine Daten</p>
    </div>
  );
}

function EmptyCommentsSvg() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden className="shrink-0">
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E0E7FF" />
          <stop offset="100%" stopColor="#C7B2FF" />
        </linearGradient>
      </defs>
      <rect x="6" y="10" width="36" height="26" rx="8" fill="url(#g1)" />
      <rect x="14" y="20" width="36" height="26" rx="8" fill="#fff" stroke="#E5E5EA" />
      <circle cx="24" cy="33" r="1.5" fill="#6e6e73" />
      <circle cx="32" cy="33" r="1.5" fill="#6e6e73" />
      <circle cx="40" cy="33" r="1.5" fill="#6e6e73" />
    </svg>
  );
}
