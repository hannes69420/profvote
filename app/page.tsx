import Link from 'next/link';
import { listUniversities, UNI_CONFIG } from '@app/lib/profvote/universities';
import {
  getProfessorById,
  listProfessorsByUni,
  listTopProfessors,
} from '@app/lib/profvote/professors';
import { listRecentReviews, listReviewsByUni } from '@app/lib/profvote/reviews';
import { Avatar } from '@app/components/Avatar';
import type { Professor, University, UniversitySlug } from '@app/lib/profvote/types';

export const dynamic = 'force-dynamic';

type UniComparison = {
  university: University;
  average: number | null;
  reviewCount: number;
};

export default async function Home() {
  const unis = listUniversities();
  const availableUnis = unis.filter((u) => u.available).slice(0, 2);
  const [counts, topProfs, recent] = await Promise.all([
    Promise.all(
      unis.map(async (u) =>
        u.available ? (await listProfessorsByUni(u.slug)).length : 0,
      ),
    ),
    listTopProfessors(5),
    listRecentReviews(6),
  ]);
  const uniComparisons = await Promise.all(availableUnis.map((u) => getUniComparison(u)));
  const [firstUni, secondUni] = uniComparisons;
  const winnerSlug = getComparisonWinnerSlug(firstUni, secondUni);
  const isTie =
    firstUni?.average != null &&
    secondUni?.average != null &&
    firstUni.average === secondUni.average;

  const recentProfs = await Promise.all(
    recent.map((r) => getProfessorById(r.uni, r.professorId)),
  );

  const totalProfs = counts.reduce((a, b) => a + b, 0);

  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(700px 320px at 15% 10%, rgba(0,113,227,0.12), transparent 60%), radial-gradient(800px 350px at 90% 0%, rgba(168,85,247,0.10), transparent 60%), radial-gradient(600px 280px at 50% 100%, rgba(16,185,129,0.08), transparent 60%)',
          }}
        />
        <div className="container-prose pb-14 pt-14 sm:pb-28 sm:pt-32">
          <p className="pill mb-6">Bewerten · Anonym · Verifiziert</p>
          <h1 className="max-w-3xl">
            Wie ist dein
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(120deg, #0071e3, #a855f7 60%, #10b981)',
              }}
            >
              Prof
            </span>{' '}
            wirklich?
          </h1>
          <p className="mt-5 max-w-2xl text-base text-ink-muted sm:mt-6 sm:text-xl">
            ProfVote sammelt anonyme Bewertungen von Studenten - verifiziert per
            Uni-Email, sortiert nach Fakultät, in zwei Klicks abgegeben.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 sm:mt-10">
            <Link href="/uni/stuttgart" className="btn-primary">
              Uni Stuttgart durchsuchen
            </Link>
            <Link href="/uni/kit" className="btn-secondary">
              KIT durchsuchen
            </Link>
          </div>

          <dl className="mt-10 grid max-w-2xl grid-cols-3 gap-4 sm:mt-16 sm:gap-8">
            <Stat label="Professoren" value={totalProfs.toLocaleString('de-DE')} />
            <Stat
              label="Universitäten"
              value={unis.filter((u) => u.available).length.toString()}
              suffix={` von ${unis.length}`}
            />
            <Stat label="Klicks zur Bewertung" value="2" />
          </dl>
        </div>
      </section>

      <section className="container-prose pb-12 sm:pb-16">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2>Uni-Vergleich</h2>
            <p className="mt-3 text-lg text-ink-muted">
              Welche Uni ist insgesamt besser bewertet?
            </p>
          </div>
          {isTie && (
            <span className="pill self-start bg-ink-soft/5 text-ink-soft">
              Aktuell gleich bewertet
            </span>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {uniComparisons.map((comparison) => (
            <UniComparisonCard
              key={comparison.university.slug}
              comparison={comparison}
              isWinner={winnerSlug === comparison.university.slug}
              isTie={isTie}
            />
          ))}
        </div>
      </section>

      <section className="container-prose pb-14 sm:pb-20">
        <div className="mb-6 flex items-baseline justify-between">
          <h2>Beliebteste Profs</h2>
          <span className="text-sm text-ink-muted">nach Bewertung × Anzahl</span>
        </div>
        {topProfs.length === 0 ? (
          <div className="card text-sm text-ink-muted">Noch zu wenig Daten.</div>
        ) : (
          <ol className="grid gap-3 sm:grid-cols-2">
            {topProfs.map((p, i) => (
              <li key={`${p.uni}-${p.id}`}>
                <TopProfCard prof={p} rank={i + 1} />
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="container-prose pb-14 sm:pb-20">
        <div className="mb-6 flex items-baseline justify-between">
          <h2>Aktuell bewertet</h2>
          <span className="text-sm text-ink-muted">{recent.length} neueste</span>
        </div>
        {recent.length === 0 ? (
          <div className="card text-sm text-ink-muted">Noch keine Bewertungen.</div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {recent.map((r, i) => {
              const prof = recentProfs[i];
              if (!prof) return null;
              return (
                <li key={r.id}>
                  <Link
                    href={`/prof/${r.uni}/${prof.slug}`}
                    className="card block transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={prof.name} size={40} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-ink-soft">{prof.name}</div>
                        <div className="text-xs text-ink-muted">
                          {UNI_CONFIG[r.uni].shortName} ·{' '}
                          {new Date(r.createdAt).toLocaleDateString('de-DE', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-canvas-soft px-3 py-1 text-sm font-medium text-ink-soft">
                        {r.ratings.insgesamt}/5
                      </span>
                    </div>
                    {r.comment && (
                      <p className="mt-3 line-clamp-2 text-sm text-ink-soft">
                        „{r.comment}"
                      </p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="container-prose pb-20 sm:pb-28">
        <div className="mt-10 grid gap-4 sm:mt-16 sm:grid-cols-3">
          <HowCard
            step="1"
            title="Such deinen Prof"
            body="Über 700 Professoren aus Stuttgart und KIT - Suche, Sortierung und Fakultäts-Filter helfen."
          />
          <HowCard
            step="2"
            title="Bewerten in 6 Kategorien"
            body="Vorlesung, Skript, Klausur, Organisation, Schwierigkeit, Gesamteindruck."
          />
          <HowCard
            step="3"
            title="Per Uni-Email bestätigen"
            body="Bestätigungs-Link in der Inbox - erst dann wird die Bewertung öffentlich."
          />
        </div>
      </section>
    </>
  );
}

function getComparisonWinnerSlug(
  firstUni?: UniComparison,
  secondUni?: UniComparison,
): UniversitySlug | null {
  if (!firstUni || !secondUni) return null;
  if (firstUni.average != null && secondUni.average == null) return firstUni.university.slug;
  if (secondUni.average != null && firstUni.average == null) return secondUni.university.slug;
  if (firstUni.average == null || secondUni.average == null) return null;
  if (firstUni.average === secondUni.average) return null;
  return firstUni.average > secondUni.average
    ? firstUni.university.slug
    : secondUni.university.slug;
}

async function getUniComparison(university: University): Promise<UniComparison> {
  const reviews = await listReviewsByUni(university.slug);
  const reviewCount = reviews.length;
  const average =
    reviewCount > 0
      ? reviews.reduce((sum, review) => sum + review.ratings.insgesamt, 0) / reviewCount
      : null;

  return { university, average, reviewCount };
}

function UniComparisonCard({
  comparison,
  isWinner,
  isTie,
}: {
  comparison: UniComparison;
  isWinner: boolean;
  isTie: boolean;
}) {
  const { university, average, reviewCount } = comparison;
  const hasReviews = average != null && reviewCount > 0;

  return (
    <Link
      href={`/uni/${university.slug}`}
      className={`group block h-full rounded-[1.75rem] border p-6 transition-all hover:-translate-y-0.5 hover:shadow-card ${
        isWinner ? 'border-ink-soft bg-ink-soft text-white' : 'bg-white'
      }`}
      style={{ borderColor: isWinner ? undefined : 'rgb(var(--border))' }}
    >
      <div className="flex h-full flex-col justify-between gap-8">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className={`text-sm font-medium ${isWinner ? 'text-white/70' : 'text-ink-muted'}`}>
                {university.shortName}
              </p>
              <h3 className={`mt-2 text-2xl sm:text-3xl ${isWinner ? 'text-white' : ''}`}>
                {university.name}
              </h3>
            </div>
            {isWinner && !isTie && (
              <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink-soft">
                Aktuell besser bewertet
              </span>
            )}
            {isTie && hasReviews && (
              <span className="shrink-0 rounded-full bg-canvas-soft px-3 py-1 text-xs font-semibold text-ink-soft">
                Aktuell gleich bewertet
              </span>
            )}
          </div>
        </div>

        <div>
          {hasReviews ? (
            <>
              <div className="flex items-end gap-3">
                <div
                  className={`font-display text-6xl font-semibold leading-none tracking-tightest sm:text-7xl ${
                    isWinner ? 'text-white' : 'text-ink-soft'
                  }`}
                >
                  {average.toFixed(1)}
                </div>
                <div className={`pb-2 text-lg font-medium ${isWinner ? 'text-white/70' : 'text-ink-muted'}`}>
                  /5
                </div>
              </div>
              <StarRating value={average} isWinner={isWinner} />
              <p className={`mt-4 text-sm ${isWinner ? 'text-white/70' : 'text-ink-muted'}`}>
                {reviewCount.toLocaleString('de-DE')}{' '}
                {reviewCount === 1 ? 'Bewertung' : 'Bewertungen'}
              </p>
            </>
          ) : (
            <div>
              <p className={`text-2xl font-semibold ${isWinner ? 'text-white' : 'text-ink-soft'}`}>
                Noch keine Bewertungen
              </p>
              <p className={`mt-3 text-sm ${isWinner ? 'text-white/70' : 'text-ink-muted'}`}>
                Sobald Bewertungen vorliegen, erscheint hier die durchschnittliche
                Gesamtbewertung.
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function StarRating({ value, isWinner }: { value: number; isWinner: boolean }) {
  const rounded = Math.round(value);
  return (
    <div className="mt-4 flex gap-1" aria-label={`${value.toFixed(1)} von 5 Sternen`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-2xl ${star <= rounded ? (isWinner ? 'text-white' : 'text-ink-soft') : 'text-ink-muted/30'}`}
          aria-hidden
        >
          ★
        </span>
      ))}
    </div>
  );
}

function TopProfCard({ prof, rank }: { prof: Professor; rank: number }) {
  const uni = UNI_CONFIG[prof.uni];
  return (
    <Link
      href={`/prof/${prof.uni}/${prof.slug}`}
      className="card block transition-shadow hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink-soft text-xs font-semibold text-white">
          {rank}
        </div>
        <Avatar name={prof.name} size={40} />
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-ink-soft">{prof.name}</div>
          <div className="truncate text-xs text-ink-muted">
            {uni.shortName}
            {prof.faculty ? ` · ${prof.faculty}` : ''}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="font-semibold text-ink-soft">
            {prof.avgOverall?.toFixed(1) ?? '–'}/5
          </div>
          <div className="text-xs text-ink-muted">{prof.reviewCount ?? 0} Reviews</div>
        </div>
      </div>
    </Link>
  );
}

function Stat({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-ink-muted">{label}</dt>
      <dd className="mt-2 font-display text-3xl font-semibold tracking-tightest text-ink-soft sm:text-4xl">
        {value}
        {suffix && <span className="ml-1 text-base font-normal text-ink-muted">{suffix}</span>}
      </dd>
    </div>
  );
}

function HowCard({ step, title, body }: { step: string; title: string; body: string }) {
  return (
    <div className="card">
      <div className="text-xs font-medium uppercase tracking-wider text-ink-muted">
        Schritt {step}
      </div>
      <div className="mt-2 text-lg font-semibold tracking-tightest text-ink-soft">{title}</div>
      <p className="mt-2 text-sm text-ink-muted">{body}</p>
    </div>
  );
}
