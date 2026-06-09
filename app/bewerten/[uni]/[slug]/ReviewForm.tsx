'use client';

import { useState, useEffect } from 'react';
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

const LS_KEY = 'profvote_email';

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
  const [savedEmail, setSavedEmail] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  // Load saved email from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored) {
        setSavedEmail(stored);
        setEmail(stored);
      }
    } catch {
      // localStorage not available (SSR / private mode)
    }
  }, []);

  function forgetEmail() {
    try { localStorage.removeItem(LS_KEY); } catch { /* ignore */ }
    setSavedEmail(null);
    setEmail('');
  }

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
      // Save email for next time
      try { localStorage.setItem(LS_KEY, email.trim().toLowerCase()); } catch { /* ignore */ }
      setSavedEmail(email.trim().toLowerCase());
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

        {savedEmail && email === savedEmail ? (
          /* Saved email banner */
          <div className="mt-2 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 dark:bg-green-950 dark:border-green-800">
            <div className="flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span className="text-sm text-green-800 dark:text-green-300">
                Gespeicherte E-Mail: <strong>{savedEmail}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={forgetEmail}
              className="ml-4 shrink-0 text-xs text-ink-muted underline hover:text-rose-500"
            >
              Vergessen
            </button>
          </div>
        ) : (
          <>
            <p className="mt-1 text-xs text-ink-muted">
              Nur Adressen auf {allowedDomains.map((d) => `@${d}`).join(' oder ')}.
            </p>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              placeholder={
              allowedDomains[0] === 'student.kit.edu'
                ? 'u1234567@student.kit.edu'
                : allowedDomains[0] === 'tum.de'
                ? 'max.mustermann@tum.de'
                : `st123456@${allowedDomains[0]}`
            }
              className="mt-3 w-full rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm
                         placeholder:text-ink-muted focus:border-ink-soft focus:outline-none
                         focus:ring-2 focus:ring-ink-soft/10"
            />
          </>
        )}
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
  const labels =
    categoryKey === 'schwierigkeit'
      ? ['Sehr schwer', 'Schwer', 'Mittel', 'Eher leicht', 'Leicht']
      : ['Schwach', 'Eher schwach', 'Okay', 'Gut', 'Sehr gut'];

  return (
    <div
      className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 sm:w-auto sm:justify-end"
      onMouseLeave={() => setHover(0)}
    >
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            aria-label={`Bewertung ${n} von 5`}
            className={`grid h-10 w-9 place-items-center text-4xl leading-none transition-all duration-150 active:scale-95
                        ${
                          n <= active
                            ? 'scale-110 text-ink-soft drop-shadow-sm'
                            : 'text-neutral-300 hover:-translate-y-0.5 hover:scale-110 hover:text-ink-soft/70'
                        }`}
          >
            ★
          </button>
        ))}
      </div>
      <span
        className={`min-w-[5.5rem] text-left text-sm font-medium transition-colors sm:text-right ${
          active ? 'text-ink-soft' : 'text-ink-muted'
        }`}
      >
        {active ? labels[active - 1] : 'Auswählen'}
      </span>
    </div>
  );
}
