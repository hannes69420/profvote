'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

type Review = {
  id: string;
  uni: string;
  verified: boolean;
  createdAt: string;
  deleteAfter?: string;
  userEmail: string | null;
  comment: string;
  professorId: string | null;
  ratings: {
    insgesamt: number;
    vorlesung: number;
    skript: number;
    klausur: number;
    organisation: number;
    schwierigkeit: number;
  };
};

export default function AdminPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const secret = searchParams.get('secret') || '';
  const [uni, setUni] = useState<'stuttgart' | 'kit'>('stuttgart');
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('all');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!secret) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/reviews?secret=${encodeURIComponent(secret)}&uni=${uni}&filter=${filter}`);
      if (res.status === 401) { setError('Falsches Passwort.'); setLoading(false); return; }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setReviews(data.reviews ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Laden');
    }
    setLoading(false);
  }, [secret, uni, filter]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  async function deleteReview(id: string) {
    if (!confirm('Bewertung wirklich löschen?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/reviews?secret=${encodeURIComponent(secret)}&uni=${uni}&id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.ok) setReviews((r) => r.filter((x) => x.id !== id));
      else alert(data.error || 'Fehler');
    } catch { alert('Fehler beim Löschen'); }
    setDeletingId(null);
  }

  if (!secret) {
    return (
      <div className="container-prose py-24 text-center">
        <h1>Admin</h1>
        <p className="mt-4 text-ink-muted">URL-Parameter <code>?secret=...</code> fehlt.</p>
        <p className="mt-2 text-sm text-ink-muted">Rufe die Seite auf als: <code>/admin?secret=DEIN_ADMIN_SECRET</code></p>
      </div>
    );
  }

  const pending = reviews.filter((r) => !r.verified).length;
  const verified = reviews.filter((r) => r.verified).length;

  return (
    <div className="min-h-screen" style={{ background: 'rgb(var(--bg-soft))' }}>
      <div className="container-prose py-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">ProfVote</p>
            <h1 className="mt-1 !text-3xl">Moderation</h1>
          </div>
          <button onClick={fetchReviews} className="btn-ghost-lg text-sm">
            ↺ Aktualisieren
          </button>
        </div>

        {/* Controls */}
        <div className="mt-6 flex flex-wrap gap-3">
          {/* Uni */}
          <div className="flex rounded-xl border overflow-hidden" style={{ borderColor: 'rgb(var(--border))' }}>
            {(['stuttgart', 'kit'] as const).map((u) => (
              <button
                key={u}
                onClick={() => setUni(u)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  uni === u
                    ? 'bg-ink-soft text-white'
                    : 'bg-white text-ink-muted hover:text-ink-soft dark:bg-neutral-900'
                }`}
              >
                {u === 'stuttgart' ? 'Stuttgart' : 'KIT'}
              </button>
            ))}
          </div>

          {/* Filter */}
          <div className="flex rounded-xl border overflow-hidden" style={{ borderColor: 'rgb(var(--border))' }}>
            {(['all', 'pending', 'verified'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-ink-soft text-white'
                    : 'bg-white text-ink-muted hover:text-ink-soft dark:bg-neutral-900'
                }`}
              >
                {f === 'all' ? 'Alle' : f === 'pending' ? `Ausstehend (${pending})` : `Verifiziert (${verified})`}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        {!loading && !error && (
          <div className="mt-4 flex gap-4 text-sm text-ink-muted">
            <span>{reviews.length} Einträge geladen</span>
            <span>·</span>
            <span className="text-amber-600 dark:text-amber-400">{pending} ausstehend</span>
            <span>·</span>
            <span className="text-green-600 dark:text-green-400">{verified} verifiziert</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-10 text-center text-sm text-ink-muted">Lade Bewertungen…</div>
        )}

        {/* Review list */}
        {!loading && !error && (
          <div className="mt-6 space-y-3">
            {reviews.length === 0 && (
              <div className="card text-center text-sm text-ink-muted py-10">
                Keine Einträge gefunden.
              </div>
            )}
            {reviews.map((r) => (
              <div
                key={r.id}
                className={`card ${!r.verified ? 'border-l-4 border-l-amber-400' : 'border-l-4 border-l-green-400'}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    {/* Status + Date */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        r.verified
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                      }`}>
                        {r.verified ? '✓ Verifiziert' : '⏳ Ausstehend'}
                      </span>
                      <span className="text-xs text-ink-muted">
                        {r.createdAt ? new Date(r.createdAt).toLocaleString('de-DE') : '—'}
                      </span>
                      {!r.verified && r.deleteAfter && (
                        <span className="text-xs text-rose-500">
                          Läuft ab: {new Date(r.deleteAfter).toLocaleDateString('de-DE')}
                        </span>
                      )}
                    </div>

                    {/* Email + ProfID */}
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-ink-muted">
                      <span>📧 {r.userEmail || '—'}</span>
                      <span>👤 Prof-ID: {r.professorId || '—'}</span>
                      <span>🆔 {r.id}</span>
                    </div>

                    {/* Ratings */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {Object.entries(r.ratings).map(([k, v]) => (
                        <span key={k} className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs dark:bg-neutral-800">
                          {k}: <strong>{v}</strong>
                        </span>
                      ))}
                    </div>

                    {/* Comment */}
                    {r.comment && (
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
                        „{r.comment}"
                      </p>
                    )}
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => deleteReview(r.id)}
                    disabled={deletingId === r.id}
                    className="shrink-0 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-100 disabled:opacity-50 dark:bg-rose-950 dark:text-rose-400"
                  >
                    {deletingId === r.id ? '…' : 'Löschen'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
