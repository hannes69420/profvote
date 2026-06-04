import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getUniversity } from '@app/lib/profvote/universities';
import { listProfessorsByUni, slugify } from '@app/lib/profvote/professors';
import { Avatar } from '@app/components/Avatar';
import type { UniversitySlug } from '@app/lib/profvote/types';

export const revalidate = 300;

type PageParams = Promise<{ slug: string; fakSlug: string }>;

export default async function FacultyPage({
  params,
}: {
  params: PageParams;
}) {
  const { slug, fakSlug } = await params;
  const uni = getUniversity(slug);
  if (!uni || !uni.available) notFound();

  const all = await listProfessorsByUni(uni.slug as UniversitySlug);
  const faculty = Array.from(
    new Set(all.map((p) => p.faculty).filter(Boolean) as string[]),
  ).find((f) => slugify(f) === fakSlug);

  if (!faculty) notFound();

  const profs = all.filter((p) => p.faculty === faculty);
  const withRating = profs.filter((p) => p.avgOverall != null);
  const avgFaculty = withRating.length
    ? withRating.reduce((s, p) => s + (p.avgOverall ?? 0), 0) / withRating.length
    : null;
  const totalReviews = profs.reduce((s, p) => s + (p.reviewCount ?? 0), 0);

  return (
    <div className="container-prose py-12 sm:py-16">
      <Link href={`/uni/${uni.slug}`} className="text-sm text-ink-muted hover:text-ink-soft">
        ← {uni.shortName}
      </Link>
      <h1 className="mt-4">{faculty}</h1>
      <p className="mt-3 text-lg text-ink-muted">{uni.name}</p>

      <dl className="mt-10 grid max-w-2xl grid-cols-3 gap-8">
        <Stat label="Professor:innen" value={profs.length.toString()} />
        <Stat label="Bewertungen" value={totalReviews.toString()} />
        <Stat label="⌀ Sterne" value={avgFaculty ? avgFaculty.toFixed(2) : '–'} />
      </dl>

      <ul className="mt-10 divide-y divide-neutral-200/70 rounded-3xl bg-white shadow-card">
        {profs
          .sort((a, b) => (b.avgOverall ?? -1) - (a.avgOverall ?? -1) || a.name.localeCompare(b.name, 'de'))
          .map((p) => (
            <li key={p.id}>
              <Link
                href={`/prof/${uni.slug}/${p.slug}`}
                className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-canvas-soft"
              >
                <Avatar name={p.name} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-ink-soft">{p.name}</div>
                  {p.title && <div className="mt-0.5 text-xs text-ink-muted">{p.title}</div>}
                </div>
                <div className="flex shrink-0 items-center gap-3 text-sm">
                  {p.avgOverall != null ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-canvas-soft px-3 py-1 font-medium text-ink-soft">
                      ★ {p.avgOverall.toFixed(1)}
                      {p.reviewCount != null && p.reviewCount > 0 && (
                        <span className="text-ink-muted">· {p.reviewCount}</span>
                      )}
                    </span>
                  ) : (
                    <span className="text-xs text-ink-muted">noch keine Bewertung</span>
                  )}
                  <span className="text-ink-muted">→</span>
                </div>
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-ink-muted">{label}</dt>
      <dd className="mt-1 font-display text-2xl font-semibold tracking-tightest text-ink-soft sm:text-3xl">
        {value}
      </dd>
    </div>
  );
}
