'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from './Avatar';

interface Hit {
  id: string;
  slug: string;
  uni: string;
  uniShort: string;
  name: string;
  faculty?: string;
  avgOverall?: number;
  reviewCount?: number;
}

export function GlobalSearch() {
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(-1);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Debounced search
  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error('search failed');
        const data = (await res.json()) as { hits: Hit[] };
        setHits(data.hits);
        setFocused(data.hits.length > 0 ? 0 : -1);
      } catch (e) {
        if ((e as Error).name !== 'AbortError') setHits([]);
      } finally {
        setLoading(false);
      }
    }, 150);
    return () => {
      ctrl.abort();
      clearTimeout(t);
    };
  }, [q]);

  const go = (h: Hit) => {
    setOpen(false);
    setQ('');
    router.push(`/prof/${h.uni}/${h.slug}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocused((i) => Math.min(i + 1, hits.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocused((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && focused >= 0 && hits[focused]) {
      e.preventDefault();
      go(hits[focused]);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <svg
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
          viewBox="0 0 20 20" fill="none"
        >
          <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M14 14l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={onKeyDown}
          placeholder="Prof:in suchen…"
          className="w-44 rounded-full border border-neutral-200 bg-white/70 pl-9 pr-12 py-2 text-sm
                     placeholder:text-ink-muted backdrop-blur-md focus:w-72 focus:border-ink-soft/30
                     focus:outline-none focus:ring-2 focus:ring-ink-soft/10 transition-[width,border-color]
                     duration-200 sm:w-56 sm:focus:w-80"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline
                        rounded border border-neutral-200 bg-canvas-soft px-1.5 py-0.5 text-[10px]
                        font-medium text-ink-muted">
          ⌘K
        </kbd>
      </div>

      {open && (q.trim().length >= 2 || loading) && (
        <div className="absolute right-0 mt-2 w-[min(28rem,calc(100vw-2rem))] overflow-hidden
                        rounded-2xl border border-neutral-200/70 bg-white/95 shadow-card backdrop-blur-md">
          {loading && hits.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-ink-muted">Suche…</div>
          ) : hits.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-ink-muted">
              Keine Treffer für „{q}"
            </div>
          ) : (
            <ul className="max-h-[60vh] overflow-y-auto py-1">
              {hits.map((h, i) => (
                <li key={`${h.uni}-${h.id}`}>
                  <button
                    type="button"
                    onMouseEnter={() => setFocused(i)}
                    onMouseDown={(e) => { e.preventDefault(); go(h); }}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors
                                ${i === focused ? 'bg-canvas-soft' : ''}`}
                  >
                    <Avatar name={h.name} size={32} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium text-ink-soft">{h.name}</span>
                        <span className="shrink-0 rounded-full bg-canvas-soft px-2 py-0.5 text-[10px] font-medium text-ink-muted">
                          {h.uniShort}
                        </span>
                      </div>
                      {h.faculty && (
                        <div className="mt-0.5 truncate text-xs text-ink-muted">{h.faculty}</div>
                      )}
                    </div>
                    {h.avgOverall != null && (
                      <span className="shrink-0 text-sm font-medium text-ink-soft">
                        ★ {h.avgOverall.toFixed(1)}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
