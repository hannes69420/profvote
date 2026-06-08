'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

type Review = {
  id: string;
  uni: string;
  verified: boolean;
  createdAt: string;
  deleteAfter?: string;
  userEmail: string | null;
  comment: string;
  commentApproved: boolean | null;
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

type Tab = 'kommentare' | 'bewertungen';

export default function AdminPage() {
  const searchParams = useSearchParams();
  const secret = searchParams.get('secret') || '';
  const [tab, setTab] = useState<Tab>('kommentare');
  const [uni, setUni] = useState<'stuttgart' | 'kit'>('stuttgart');
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('all');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actingId, setActingId] = useState<string | null>(null);

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

  async function approveComment(id: string, approve: boolean) {
    setActingId(id);
    try {
      const res = await fetch(
        `/api/admin/reviews?secret=${encodeURIComponent(secret)}&uni=${uni}&id=${id}&approve=${approve}`,
        { method: 'PATCH' }
      );
      const data = await res.json();
      if (data.ok) {
        setReviews((prev) => prev.map((r) => r.id === id ? { ...r, commentApproved: approve } : r));
      } else alert(data.error || 'Fehler');
    } catch { alert('Fehler'); }
    setActingId(null);
  }

  async function deleteReview(id: string) {
    if (!confirm('Bewertung wirklich löschen?')) return;
    setActingId(id);
    try {
      const res = await fetch(`/api/admin/reviews?secret=${encodeURIComponent(secret)}&uni=${uni}&id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.ok) setReviews((r) => r.filter((x) => x.id !== id));
      else alert(data.error || 'Fehler');
    } catch { alert('Fehler beim Löschen'); }
    setActingId(null);
  }

  if (!secret) {
    return (
      <div className="container-prose py-24 text-center">
        <h1>Admin</h1>
        <p className="mt-4 text-ink-muted">Bitte über den Footer-Link einloggen.</p>
      </div>
    );
  }

  // Comments that need review: verified reviews with a comment that isn't approved yet
  const pendingComments = reviews.filter(
    (r) => r.verified && r.comment && r.commentApproved === false
  );
  const approvedComments = reviews.filter(
    (r) => r.verified && r.comment && r.commentApproved !== false
  );
  const pendingEmail = reviews.filter((r) => !r.verified).length;
  const verifiedCount = reviews.filter((r) => r.verified).length;

  return (
    <div className="min-h-screen" style={{ background: 'rgb(var(--bg-soft))' }}>
      <div className="container-prose py-10">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">ProfVote</p>
            <h1 className="mt-1 !text-3xl">Moderation</h1>
          </div>
          <button onClick={fetchReviews} className="btn-ghost-lg text-sm">↺ Aktualisieren</button>
        </div>

        {/* Uni selector */}
        <div className="mt-6 flex flex-wrap gap-3">
          <div className="flex overflow-hidden rounded-xl border" style={{ borderColor: 'rgb(var(--border))' }}>
            {(['stuttgart', 'kit'] as const).map((u) => (
              <button key={u} onClick={() => setUni(u)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${uni === u ? 'bg-ink-soft text-white' : 'bg-white text-ink-muted hover:text-ink-soft dark:bg-neutral-900'}`}>
                {u === 'stuttgart' ? 'Stuttgart' : 'KIT'}
              </button>
            ))}
          </div>
        </div>

        {/* Main tabs */}
        <div className="mt-6 flex gap-1 border-b" style={{ borderColor: 'rgb(var(--border))' }}>
          <TabButton active={tab === 'kommentare'} onClick={() => setTab('kommentare')}
            label="Kommentare prüfen"
            badge={pendingComments.length > 0 ? pendingComments.length : undefined}
            badgeColor="amber" />
          <TabButton active={tab === 'bewertungen'} onClick={() => setTab('bewertungen')}
            label="Alle Bewertungen" />
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">{error}</div>
        )}
        {loading && <div className="mt-10 text-center text-sm text-ink-muted">Lade…</div>}

        {/* ── TAB: KOMMENTARE PRÜFEN ── */}
        {!loading && !error && tab === 'kommentare' && (
          <div className="mt-6 space-y-8">

            {/* Pending comments */}
            <section>
              <h2 className="!text-lg font-semibold text-ink-soft mb-3">
                Ausstehend
                {pendingComments.length > 0 && (
                  <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-sm text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                    {pendingComments.length}
                  </span>
                )}
              </h2>
              {pendingComments.length === 0 ? (
                <div className="card py-8 text-center text-sm text-ink-muted">
                  ✓ Keine Kommentare zur Prüfung
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingComments.map((r) => (
                    <CommentCard key={r.id} r={r} actingId={actingId}
                      onApprove={() => approveComment(r.id, true)}
                      onReject={() => approveComment(r.id, false)}
                      onDelete={() => deleteReview(r.id)}
                      status="pending" />
                  ))}
                </div>
              )}
            </section>

            {/* Approved comments */}
            <section>
              <h2 className="!text-lg font-semibold text-ink-soft mb-3">
                Freigegeben
                <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-sm text-green-700 dark:bg-green-900 dark:text-green-300">
                  {approvedComments.length}
                </span>
              </h2>
              {approvedComments.length === 0 ? (
                <div className="card py-8 text-center text-sm text-ink-muted">Noch keine freigegebenen Kommentare.</div>
              ) : (
                <div className="space-y-3">
                  {approvedComments.map((r) => (
                    <CommentCard key={r.id} r={r} actingId={actingId}
                      onApprove={() => approveComment(r.id, true)}
                      onReject={() => approveComment(r.id, false)}
                      onDelete={() => deleteReview(r.id)}
                      status="approved" />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ── TAB: ALLE BEWERTUNGEN ── */}
        {!loading && !error && tab === 'bewertungen' && (
          <div className="mt-4">
            {/* Sub-filter */}
            <div className="mb-4 flex flex-wrap gap-3">
              <div className="flex overflow-hidden rounded-xl border" style={{ borderColor: 'rgb(var(--border))' }}>
                {(['all', 'pending', 'verified'] as const).map((f) => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${filter === f ? 'bg-ink-soft text-white' : 'bg-white text-ink-muted hover:text-ink-soft dark:bg-neutral-900'}`}>
                    {f === 'all' ? 'Alle' : f === 'pending' ? `Email ausstehend (${pendingEmail})` : `Verifiziert (${verifiedCount})`}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {reviews.length === 0 && (
                <div className="card py-10 text-center text-sm text-ink-muted">Keine Einträge.</div>
              )}
              {reviews.map((r) => (
                <div key={r.id} className={`card border-l-4 ${!r.verified ? 'border-l-amber-400' : 'border-l-green-400'}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${r.verified ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'}`}>
                          {r.verified ? '✓ Verifiziert' : '⏳ Email ausstehend'}
                        </span>
                        {r.comment && (
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${r.commentApproved === false ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                            {r.commentApproved === false ? '⏳ Kommentar ausstehend' : '✓ Kommentar freigegeben'}
                          </span>
                        )}
                        <span className="text-xs text-ink-muted">{r.createdAt ? new Date(r.createdAt).toLocaleString('de-DE') : '—'}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 text-xs text-ink-muted">
                        <span>📧 {r.userEmail || '—'}</span>
                        <span>🆔 {r.id}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(r.ratings).map(([k, v]) => (
                          <span key={k} className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs dark:bg-neutral-800">{k}: <strong>{v}</strong></span>
                        ))}
                      </div>
                      {r.comment && <p className="mt-1 max-w-2xl text-sm text-ink-soft">„{r.comment}"</p>}
                    </div>
                    <button onClick={() => deleteReview(r.id)} disabled={actingId === r.id}
                      className="shrink-0 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-100 disabled:opacity-50 dark:bg-rose-950 dark:text-rose-400">
                      {actingId === r.id ? '…' : 'Löschen'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label, badge, badgeColor }: {
  active: boolean; onClick: () => void; label: string;
  badge?: number; badgeColor?: 'amber' | 'green';
}) {
  return (
    <button onClick={onClick}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
        active ? 'border-ink-soft text-ink-soft' : 'border-transparent text-ink-muted hover:text-ink-soft'
      }`}>
      {label}
      {badge !== undefined && (
        <span className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
          badgeColor === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
        }`}>{badge}</span>
      )}
    </button>
  );
}

function CommentCard({ r, actingId, onApprove, onReject, onDelete, status }: {
  r: Review; actingId: string | null;
  onApprove: () => void; onReject: () => void; onDelete: () => void;
  status: 'pending' | 'approved';
}) {
  return (
    <div className={`card border-l-4 ${status === 'pending' ? 'border-l-amber-400' : 'border-l-green-400'}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
            <span>⭐ {r.ratings.insgesamt}/5</span>
            <span>·</span>
            <span>📧 {r.userEmail || '—'}</span>
            <span>·</span>
            <span>{r.createdAt ? new Date(r.createdAt).toLocaleDateString('de-DE') : '—'}</span>
          </div>
          <blockquote className="text-base leading-relaxed text-ink-soft">
            „{r.comment}"
          </blockquote>
        </div>

        <div className="flex shrink-0 flex-col gap-2">
          {status === 'pending' ? (
            <>
              <button onClick={onApprove} disabled={actingId === r.id}
                className="flex items-center gap-1.5 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-600 disabled:opacity-50">
                {actingId === r.id ? '…' : '✓ Freigeben'}
              </button>
              <button onClick={onReject} disabled={actingId === r.id}
                className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-100 disabled:opacity-50">
                {actingId === r.id ? '…' : '✕ Ablehnen'}
              </button>
            </>
          ) : (
            <button onClick={onReject} disabled={actingId === r.id}
              className="rounded-lg border px-3 py-1.5 text-xs text-ink-muted hover:text-rose-500 disabled:opacity-50"
              style={{ borderColor: 'rgb(var(--border))' }}>
              Freigabe zurückziehen
            </button>
          )}
          <button onClick={onDelete} disabled={actingId === r.id}
            className="text-xs text-ink-muted hover:text-rose-500 disabled:opacity-50">
            Löschen
          </button>
        </div>
      </div>
    </div>
  );
}
