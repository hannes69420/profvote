import Link from 'next/link';
import { getUniversity, UNI_CONFIG } from '@app/lib/profvote/universities';
import { getProfessor } from '@app/lib/profvote/professors';
import { aggregate, listReviewsForProfessor } from '@app/lib/profvote/reviews';
import { Avatar } from '@app/components/Avatar';
import { RatingRing } from '@app/components/RatingRing';
import { RatingBars } from '@app/components/RatingBars';
import { CompareSearchSlot } from './CompareSearchSlot';
import type { AggregatedRatings, Professor, UniversitySlug } from '@app/lib/profvote/types';

export const revalidate = 120;

interface SP {
  a?: string;
  b?: string;
}

function parseRef(s: string | undefined): { uni: UniversitySlug; slug: string } | null {
  if (!s) return null;
  const [uni, slug] = s.split('/');
  if (!uni || !slug) return null;
  if (!UNI_CONFIG[uni as UniversitySlug]?.available) return null;
  return { uni: uni as UniversitySlug, slug };
}

async function loadSide(ref: { uni: UniversitySlug; slug: string } | null) {
  if (!ref) return null;
  const uni = getUniversity(ref.uni);
  if (!uni) return null;
  const prof = await getProfessor(ref.uni, ref.slug);
  if (!prof) return null;
  const reviews = await listReviewsForProfessor(ref.uni, prof.id);
  return { uni, prof, stats: aggregate(reviews), reviewCount: reviews.length };
}

export default async function ComparePage({ searchParams }: { searchParams: SP }) {
  const [a, b] = await Promise.all([
    loadSide(parseRef(searchParams.a)),
    loadSide(parseRef(searchParams.b)),
  ]);

  return (
    <div className="container-prose py-12 sm:py-16">
      <Link href="/" className="text-sm text-ink-muted hover:text-ink-soft">
        ← Startseite
      </Link>
      <h1 className="mt-4">Vergleich</h1>
      <p className="mt-3 text-lg text-ink-muted">
        Stell zwei Profs nebeneinander und schau wer wo besser abschneidet.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <Slot side="a" data={a} other={b} initialQuery={searchParams.a} />
        <Slot side="b" data={b} other={a} initialQuery={searchParams.b} />
      </div>

      {a && b && a.stats && b.stats && (
        <div className="mt-12">
          <h2 className="mb-6">Kategorien-Vergleich</h2>
          <CompareBars a={a.stats} b={b.stats} aName={a.prof.name} bName={b.prof.name} />
        </div>
      )}
    </div>
  );
}

function Slot({
  side,
  data,
  other,
  initialQuery,
}: {
  side: 'a' | 'b';
  data: Awaited<ReturnType<typeof loadSide>>;
  other: Awaited<ReturnType<typeof loadSide>>;
  initialQuery?: string;
}) {
  if (!data) {
    return (
      <div className="card flex min-h-[20rem] flex-col">
        <div className="text-xs font-medium uppercase tracking-wider text-ink-muted">
          Slot {side.toUpperCase()}
        </div>
        <div className="mt-3 text-sm text-ink-muted">Such und wähl eine:n Prof:in.</div>
        <div className="mt-4">
          <CompareSearchSlot side={side} otherRef={other ? `${other.uni.slug}/${other.prof.slug}` : undefined} initial={initialQuery} />
        </div>
      </div>
    );
  }
  const { prof, uni, stats, reviewCount } = data;
  return (
    <div className="card flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs font-medium uppercase tracking-wider text-ink-muted">
          Slot {side.toUpperCase()}
        </div>
        <Link
          href={
            other
              ? `/vergleich?${side === 'a' ? 'b' : 'a'}=${other.uni.slug}/${other.prof.slug}`
              : '/vergleich'
          }
          className="text-xs text-ink-muted hover:text-ink-soft"
        >
          entfernen
        </Link>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Avatar name={prof.name} size={56} />
        <div className="min-w-0">
          <Link href={`/prof/${uni.slug}/${prof.slug}`} className="block truncate font-semibold text-ink-soft hover:underline">
            {prof.name}
          </Link>
          <div className="truncate text-sm text-ink-muted">
            {uni.shortName}{prof.faculty ? ` · ${prof.faculty}` : ''}
          </div>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-center">
        <RatingRing value={stats?.insgesamt ?? null} count={reviewCount} size={140} stroke={12} />
      </div>
      <div className="mt-6">
        <RatingBars stats={stats} />
      </div>
    </div>
  );
}

function CompareBars({
  a, b, aName, bName,
}: {
  a: AggregatedRatings;
  b: AggregatedRatings;
  aName: string;
  bName: string;
}) {
  const cats: Array<{ key: keyof Omit<AggregatedRatings, 'count'>; label: string; inverse?: boolean }> = [
    { key: 'insgesamt', label: 'Insgesamt' },
    { key: 'vorlesung', label: 'Vorlesung' },
    { key: 'skript', label: 'Skript' },
    { key: 'klausur', label: 'Klausur' },
    { key: 'organisation', label: 'Organisation' },
    { key: 'schwierigkeit', label: 'Schwierigkeit', inverse: true },
  ];
  return (
    <div className="card space-y-5">
      {cats.map(({ key, label, inverse }) => {
        const av = a[key];
        const bv = b[key];
        const aWins = inverse ? av < bv : av > bv;
        const bWins = inverse ? bv < av : bv > av;
        return (
          <div key={key} className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div className="text-right">
              <span className={`tabular-nums ${aWins ? 'font-semibold text-ink-soft' : 'text-ink-muted'}`}>
                {av.toFixed(1)}
              </span>
            </div>
            <div className="min-w-[10rem] text-center text-xs text-ink-muted">
              {label}
              {inverse && <div className="text-[10px] opacity-70">niedrig = leicht</div>}
            </div>
            <div className="text-left">
              <span className={`tabular-nums ${bWins ? 'font-semibold text-ink-soft' : 'text-ink-muted'}`}>
                {bv.toFixed(1)}
              </span>
            </div>
          </div>
        );
      })}
      <div className="grid grid-cols-3 gap-4 border-t border-neutral-200 pt-4 text-xs text-ink-muted">
        <div className="text-right">{aName}</div>
        <div className="text-center">Kategorie</div>
        <div className="text-left">{bName}</div>
      </div>
    </div>
  );
}
