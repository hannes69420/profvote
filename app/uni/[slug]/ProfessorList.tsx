'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Professor, UniversitySlug } from '@app/lib/profvote/types';
import { Avatar } from '@app/components/Avatar';

interface Props {
  professors: Professor[];
  faculties: string[];
  uniSlug: UniversitySlug;
}

type SortKey = 'name' | 'rating' | 'reviews';

const SORTS: Array<{ key: SortKey; label: string }> = [
  { key: 'name', label: 'Name A–Z' },
  { key: 'rating', label: 'Beste Bewertung' },
  { key: 'reviews', label: 'Meiste Reviews' },
];

export function ProfessorList({ professors, faculties, uniSlug }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  const [q, setQ] = useState(() => params.get('q') ?? '');
  const [faculty, setFaculty] = useState(() => params.get('fac') ?? '');
  const [sort, setSort] = useState<SortKey>(() => (params.get('sort') as SortKey) || 'rating');

  // Sync state to URL (replace, not push, so back-button feels right)
  const syncUrl = useCallback(
    (next: { q?: string; fac?: string; sort?: SortKey }) => {
      const sp = new URLSearchParams(params.toString());
      const setOrDel = (k: string, v: string | undefined) => {
        if (v && v.length > 0) sp.set(k, v);
        else sp.delete(k);
      };
      setOrDel('q', next.q ?? q);
      setOrDel('fac', next.fac ?? faculty);
      setOrDel('sort', (next.sort ?? sort) === 'rating' ? '' : next.sort ?? sort);
      const qs = sp.toString();
      router.replace(qs ? `?${qs}` : '?', { scroll: false });
    },
    [params, router, q, faculty, sort],
  );

  useEffect(() => {
    const handle = setTimeout(() => syncUrl({}), 200);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, faculty, sort]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = professors.filter((p) => {
      if (faculty && p.faculty !== faculty) return false;
      if (!needle) return true;
      return (
        p.name.toLowerCase().includes(needle) ||
        (p.faculty?.toLowerCase().includes(needle) ?? false)
      );
    });

    out.sort((a, b) => {
      if (sort === 'rating') {
        const av = a.avgOverall ?? -1;
        const bv = b.avgOverall ?? -1;
        if (av !== bv) return bv - av;
      } else if (sort === 'reviews') {
        const av = a.reviewCount ?? 0;
        const bv = b.reviewCount ?? 0;
        if (av !== bv) return bv - av;
      }
      return a.name.localeCompare(b.name, 'de');
    });

    return out;
  }, [q, faculty, sort, professors]);

  return (
    <div>
      <div className="space-y-4">
        <div className="search-hero group relative">
          <svg
            aria-hidden
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted transition-colors group-focus-within:text-ink-soft sm:left-7 sm:h-7 sm:w-7"
            viewBox="0 0 20 20" fill="none"
          >
            <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
            <path d="M14 14l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Nach Name oder Fakultät suchen…"
            autoFocus
            className="w-full rounded-2xl border bg-white py-4 pl-12 pr-12 text-base
                       font-medium tracking-tightest placeholder:font-normal placeholder:text-ink-muted
                       focus:outline-none sm:rounded-[1.75rem] sm:py-7 sm:pl-20 sm:pr-20 sm:text-2xl"
            style={{ borderColor: 'rgb(var(--border))' }}
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ('')}
              aria-label="Suche leeren"
              className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-canvas-soft text-lg text-ink-muted transition-colors hover:bg-ink-soft/10 hover:text-ink-soft sm:right-6 sm:h-9 sm:w-9"
            >
              ×
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {faculties.length > 0 && (
            <select
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              className="flex-1 min-w-[12rem] rounded-full border bg-white px-5 py-3 text-sm
                         text-ink-soft focus:border-ink-soft focus:outline-none focus:ring-2
                         focus:ring-ink-soft/10"
              style={{ borderColor: 'rgb(var(--border))' }}
            >
              <option value="">Alle Fakultäten</option>
              {faculties.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          )}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-full border bg-white px-5 py-3 text-sm
                       text-ink-soft focus:border-ink-soft focus:outline-none focus:ring-2
                       focus:ring-ink-soft/10"
            style={{ borderColor: 'rgb(var(--border))' }}
            aria-label="Sortierung"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-ink-muted">
          {filtered.length} von {professors.length}
        </p>
        {(q || faculty || sort !== 'rating') && (
          <button
            type="button"
            onClick={() => { setQ(''); setFaculty(''); setSort('rating'); }}
            className="text-sm text-ink-muted underline-offset-2 hover:text-ink-soft hover:underline"
          >
            Filter zurücksetzen
          </button>
        )}
      </div>

      <ul className="mt-4 min-w-0 divide-y divide-neutral-200/70 rounded-2xl bg-white shadow-card sm:rounded-3xl">
        {filtered.length === 0 && (
          <li className="px-6 py-6 text-sm text-ink-muted">Keine Treffer.</li>
        )}
        {filtered.slice(0, 200).map((p) => (
          <li key={p.id}>
            <Link
              href={`/prof/${uniSlug}/${p.slug}`}
              className="flex min-w-0 items-center gap-3 px-4 py-3 transition-colors hover:bg-canvas-soft sm:gap-4 sm:px-5 sm:py-3.5"
            >
              <Avatar name={p.name} size={40} />
              <div className="min-w-0 flex-1">
                <div className="break-words font-medium leading-snug text-ink-soft">{p.name}</div>
                {p.faculty && (
                  <div className="mt-0.5 break-words text-sm leading-snug text-ink-muted">
                    {p.faculty}
                  </div>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2 text-sm sm:gap-3">
                {p.avgOverall != null ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-canvas-soft px-3 py-1 font-medium text-ink-soft">
                    {p.avgOverall.toFixed(1)}/5
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

      {filtered.length > 200 && (
        <p className="mt-4 text-center text-sm text-ink-muted">
          Zeige die ersten 200 — bitte präziser suchen oder filtern.
        </p>
      )}
    </div>
  );
}
