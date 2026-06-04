import Link from 'next/link';
import { listUniversities, UNI_CONFIG } from '@app/lib/profvote/universities';
import {
  listProfessorsByUni,
  listTopProfessors,
  getProfessorById,
} from '@app/lib/profvote/professors';
import { listRecentReviews } from '@app/lib/profvote/reviews';
import { Avatar } from '@app/components/Avatar';
import type { Professor, UniversitySlug } from '@app/lib/profvote/types';

export const revalidate = 300;

const UNI_THEME: Record<UniversitySlug, { from: string; to: string; emoji: string }> = {
  stuttgart: { from: '#E0F2FE', to: '#BAE6FD', emoji: '🏛' },
  kit:       { from: '#FEF3C7', to: '#FDE68A', emoji: '⚙️' },
  tuebingen: { from: '#FCE7F3', to: '#FBCFE8', emoji: '🌳' },
  tum:       { from: '#E0E7FF', to: '#C7D2FE', emoji: '🦁' },
};

export default async function Home() {
  const unis = listUniversities();
  const [counts, topProfs, recent] = await Promise.all([
    Promise.all(
      unis.map(async (u) =>
        u.available ? (await listProfessorsByUni(u.slug)).length : 0,
      ),
    ),
    listTopProfessors(5),
    listRecentReviews(6),
  ]);

  // Resolve prof names for the recent feed
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
        <div className="container-prose pt-20 pb-20 sm:pt-32 sm:pb-28">
          <p className="pill mb-6">Bewerten · Anonym · Verifiziert</p>
          <h1 className="max-w-3xl">
            Wie ist dein:e<br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(120deg, #0071e3, #a855f7 60%, #10b981)' }}
            >
              Prof:in
            </span>{' '}
            wirklich?
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-ink-muted sm:text-xl">
            ProfVote sammelt anonyme Bewertungen von Studierenden — verifiziert
            per Uni-Email, sortiert nach Fakultät, in zwei Klicks abgegeben.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/uni/stuttgart" className="btn-primary">
              Uni Stuttgart durchsuchen
            </Link>
            <Link href="/uni/kit" className="btn-secondary">
              KIT durchsuchen
            </Link>
          </div>

          <dl className="mt-16 grid max-w-2xl grid-cols-3 gap-8">
            <Stat label="Professor:innen" value={totalProfs.toLocaleString('de-DE')} />
            <Stat
              label="Universitäten"
              value={unis.filter((u) => u.available).length.toString()}
              suffix={` von ${unis.length}`}
            />
            <Stat label="Klicks zur Bewertung" value="2" />
          </dl>
        </div>
      </section>

      <section className="container-prose pb-20">
        <div className="mb-6 flex items-baseline justify-between">
          <h2>Beliebteste Profs</h2>
          <span className="text-sm text-ink-muted">nach Sterne × Anzahl</span>
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

      <section className="container-prose pb-20">
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
                            day: 'numeric', month: 'short',
                          })}
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-canvas-soft px-3 py-1 text-sm font-medium text-ink-soft">
                        ★ {r.ratings.insgesamt}/5
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

      <section className="container-prose pb-28">
        <h2 className="mb-8">Universitäten</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {unis.map((u, i) => {
            const count = counts[i];
            const theme = UNI_THEME[u.slug];
            const inner = (
              <div
                className={`card group relative h-full overflow-hidden ${
                  u.available ? 'hover:shadow-md' : 'opacity-70'
                }`}
              >
                <div
                  aria-hidden
                  className="absolute -right-12 -top-12 h-40 w-40 rounded-full blur-2xl"
                  style={{ background: `radial-gradient(closest-side, ${theme.to}, transparent)` }}
                />
                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <div
                      aria-hidden
                      className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                      style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}
                    >
                      {theme.emoji}
                    </div>
                    <h3>{u.name}</h3>
                    <p className="mt-2 text-sm text-ink-muted">{u.shortDescription}</p>
                  </div>
                  {u.available ? (
                    <span className="pill bg-ink-soft/5 text-ink-soft">{count} Profs</span>
                  ) : (
                    <span className="pill">Bald</span>
                  )}
                </div>
                {u.available && (
                  <div className="relative mt-6 text-sm font-medium text-accent transition-colors group-hover:text-accent-hover">
                    Professor:innen ansehen →
                  </div>
                )}
              </div>
            );
            return u.available ? (
              <Link key={u.slug} href={`/uni/${u.slug}`}>
                {inner}
              </Link>
            ) : (
              <div key={u.slug}>{inner}</div>
            );
          })}
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          <HowCard step="1" title="Such deine:n Prof:in" body="Über 700 Lehrende aus Stuttgart und KIT — Suche, Sortierung und Fakultäts-Filter helfen." />
          <HowCard step="2" title="Sterne in 6 Kategorien" body="Vorlesung, Skript, Klausur, Organisation, Schwierigkeit, Gesamteindruck." />
          <HowCard step="3" title="Per Uni-Email bestätigen" body="Bestätigungs-Link in der Inbox — erst dann wird die Bewertung öffentlich." />
        </div>
      </section>
    </>
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
            ★ {prof.avgOverall?.toFixed(1) ?? '–'}
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
