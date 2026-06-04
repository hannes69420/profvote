'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Avatar } from '@app/components/Avatar';

interface Hit {
  id: string;
  slug: string;
  uni: string;
  uniShort: string;
  name: string;
  faculty?: string;
}

export function CompareSearchSlot({
  side,
  otherRef,
  initial,
}: {
  side: 'a' | 'b';
  otherRef?: string;
  initial?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (q.trim().length < 2) { setHits([]); return; }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        const data = (await res.json()) as { hits: Hit[] };
        setHits(data.hits);
      } catch {}
      finally { setLoading(false); }
    }, 200);
    return () => { ctrl.abort(); clearTimeout(t); };
  }, [q]);

  const pick = (h: Hit) => {
    const sp = new URLSearchParams(params.toString());
    sp.set(side, `${h.uni}/${h.slug}`);
    if (otherRef && !sp.get(side === 'a' ? 'b' : 'a')) {
      sp.set(side === 'a' ? 'b' : 'a', otherRef);
    }
    router.replace(`/vergleich?${sp.toString()}`);
  };

  return (
    <div>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Prof:in suchen…"
        className="w-full rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm
                   placeholder:text-ink-muted focus:border-ink-soft focus:outline-none
                   focus:ring-2 focus:ring-ink-soft/10"
      />
      {q.trim().length >= 2 && (
        <ul className="mt-3 divide-y divide-neutral-200/70 overflow-hidden rounded-2xl border border-neutral-200">
          {loading && hits.length === 0 && (
            <li className="px-3 py-3 text-sm text-ink-muted">Suche…</li>
          )}
          {!loading && hits.length === 0 && (
            <li className="px-3 py-3 text-sm text-ink-muted">Keine Treffer.</li>
          )}
          {hits.slice(0, 6).map((h) => (
            <li key={`${h.uni}-${h.id}`}>
              <button
                type="button"
                onClick={() => pick(h)}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-canvas-soft"
              >
                <Avatar name={h.name} size={28} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-ink-soft">{h.name}</div>
                  <div className="truncate text-xs text-ink-muted">{h.uniShort}{h.faculty ? ` · ${h.faculty}` : ''}</div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
      {initial && (
        <p className="mt-2 text-xs text-ink-muted">
          Auswahl <code>{initial}</code> konnte nicht geladen werden.
        </p>
      )}
    </div>
  );
}
