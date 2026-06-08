'use client';

import { useState } from 'react';
import type { UniversitySlug } from '@app/lib/profvote/types';

const CATEGORIES: Array<{
  key: 'insgesamt' | 'vorlesung' | 'skript' | 'klausur' | 'organisation' | 'schwierigkeit';
  label: string;
  hint?: string;
}> = [
  { key: 'insgesamt', label: 'Insgesamt', hint: 'Gesamteindruck' },
  { key: 'vorlesung', label: 'Vorlesung', hint: 'Qualität & Verständlichkeit' },
  { key: 'skript', label: 'Skript', hint: 'Folien, Unterlagen' },
  { key: 'klausur', label: 'Klausur', hint: 'Fairness & Vorbereitung' },
  { key: 'organisation', label: 'Organisation', hint: 'Termine, Klausur-Anmeldung' },
  { key: 'schwierigkeit', label: 'Schwierigkeit', hint: '1 = schwer, 5 = leicht' },
];

interface Props {
  uni: UniversitySlug;
  professorId: string;
  professorName: string;
  allowedDomains: string[];
}

type Status = 'idle' | 'submitting' | 'done' | 'error';

export function ReviewForm({ uni, professorId, allowedDomains }: Props) {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const allFilled = CATEGORIES.every((c) => ratings[c.key] >= 1);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!allFilled) {
      setError('Bitte alle sechs Kategorien bewerten.');
      return;
    }
    setStatus('submitting');
    try {
      const res = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ uni, professorId, email, ratings, comment }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus('error');
        setError(data.error || 'Fehler beim Speichern.');
        return;
      }
      setStatus('done');
    } catch {
      setStatus('error');
      setError('Netzwerkfehler. Bitte erneut versuchen.');
    }
  };

  if (status === 'done') {
    return (
      <div className="card">
        <h2>Check deine Email</h2>
        <p className="mt-3 text-ink-muted">
          Wir haben dir einen Bestätigungs-Link an <span className="text-ink-soft">{email}</span>{' '}
          geschickt. Klick darauf, damit deine Bewertung öffentlich wird.
        </p>
        <p className="mt-2 text-sm text-ink-muted">
          Nichts angekommen? Spam-Ordner checken oder in 3 Tagen einfach neu abgeben.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      <div className="card space-y-5">
        {CATEGORIES.map((cat) => (
          <div
            key={cat.key}
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="text-sm font-medium text-ink-soft">{cat.label}</div>
              {cat.hint && <div className="text-xs text-ink-muted">{cat.hint}</div>}
            </div>
            <StarPicker
              categoryKey={cat.key}
              value={ratings[cat.key] || 0}
              onChange={(v) => setRatings((r) => ({ ...r, [cat.key]: v }))}
            />
          </div>
        ))}
      </div>

      <div className="card">
        <label className="block text-sm font-medium text-ink-soft">
          Kommentar (optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="Was war gut, was war schlecht? Bleib fair und faktisch."
          className="mt-3 w-full resize-y rounded-2xl border border-neutral-200 bg-white px-4 py-3
                     text-sm placeholder:text-ink-muted focus:border-ink-soft focus:outline-none
                     focus:ring-2 focus:ring-ink-soft/10"
        />
        <div className="mt-1 text-right text-xs text-ink-muted">{comment.length}/1000</div>
      </div>

      <div className="card">
        <label className="block text-sm font-medium text-ink-soft">Uni-Email</label>
        <p className="mt-1 text-xs text-ink-muted">
          Nur Adressen auf {allowedDomains.map((d) => `@${d}`).join(' oder ')}.
        </p>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={`st123456@${allowedDomains[0]}`}
          className="mt-3 w-full rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm
                     placeholder:text-ink-muted focus:border-ink-soft focus:outline-none
                     focus:ring-2 focus:ring-ink-soft/10"
        />
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-900">{error}</div>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="btn-cta disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {status === 'submitting' ? 'Sende...' : 'Bewertung absenden'}
        </button>
      </div>
    </form>
  );
}

function StarPicker({
  categoryKey,
  value,
  onChange,
}: {
  categoryKey: (typeof CATEGORIES)[number]['key'];
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  const isDifficulty = categoryKey === 'schwierigkeit';

  return (
    <div className="w-full sm:w-auto" onMouseLeave={() => setHover(0)}>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            aria-label={`Bewertung ${n} von 5`}
            className={`grid h-10 w-10 place-items-center rounded-full text-3xl leading-none transition-all
                        ${
                          n <= active
                            ? 'scale-105 text-ink-soft drop-shadow-sm'
                            : 'text-neutral-300 hover:scale-105 hover:text-ink-soft/70'
                        }`}
          >
            ★
          </button>
        ))}
      </div>
      {isDifficulty && (
        <div className="mt-1 flex justify-between px-1 text-[11px] text-ink-muted">
          <span>1 schwer</span>
          <span>5 leicht</span>
        </div>
      )}
    </div>
  );
}
