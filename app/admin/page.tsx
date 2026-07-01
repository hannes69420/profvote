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
  isAdminReview?: boolean;
  professorId: string | null;
  professorName: string | null;
  ratings: {
    insgesamt: number;
    vorlesung: number;
    skript: number;
    klausur: number;
    organisation: number;
    schwierigkeit: number;
  };
};

type Tab = 'stats' | 'erstellen' | 'cms' | 'kommentare' | 'bewertungen';
type UniSlug = 'stuttgart' | 'kit' | 'tum';

type CmsEntry = {
  id: string;
  createdAt: string | null;
  updatedAt: string | null;
  preview: {
    name: string;
    faculty?: string;
    title?: string;
    avgOverall?: number;
    reviewCount?: number;
  };
  fields: Record<string, string | number>;
};

const UNI_LABELS: Record<UniSlug, string> = {
  stuttgart: 'Stuttgart',
  kit: 'KIT',
  tum: 'TUM',
};

const RATING_LABELS: Record<string, string> = {
  insgesamt: 'Gesamt',
  vorlesung: 'Vorlesung',
  skript: 'Skript',
  klausur: 'Klausur',
  organisation: 'Organisation',
  schwierigkeit: 'Schwierigkeit',
};

const CMS_FIELD_LABELS: Record<string, string> = {
  name: 'Professorenname',
  title: 'Titel / Anzeigename',
  slug: 'URL-Name',
  fakultatEn: 'Fakultaet / Fachbereich',
  fakultaet: 'Fakultaet',
  fakultat_nr: 'Fakultaetsnummer',
  kategorie_basis: 'Kategorie / Status',
  status: 'Status',
  avgOverall: 'Angezeigte Bewertung',
  anzahl: 'Anzahl Bewertungen',
  school: 'School',
  School: 'School',
  fachbereich: 'Fachbereich',
  Fachbereich: 'Fachbereich',
  studiengang: 'Studiengang',
  Studiengang: 'Studiengang',
  zuordnung: 'Zuordnung',
  Zuordnung: 'Zuordnung',
};

export default function AdminPage() {
  const searchParams = useSearchParams();
  const secret = searchParams.get('secret') || '';
  const [tab, setTab] = useState<Tab>('stats');
  const [uni, setUni] = useState<UniSlug>('stuttgart');
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

  async function verifyReview(id: string) {
    setActingId(id);
    try {
      const res = await fetch(
        `/api/admin/reviews?secret=${encodeURIComponent(secret)}&uni=${uni}&id=${id}&verify=true`,
        { method: 'PATCH' }
      );
      const data = await res.json();
      if (data.ok) {
        setReviews((prev) => prev.map((r) => r.id === id ? { ...r, verified: true } : r));
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

  const pendingComments = reviews.filter((r) => r.verified && r.comment && r.commentApproved === false);
  const approvedComments = reviews.filter((r) => r.verified && r.comment && r.commentApproved !== false);
  const pendingEmail = reviews.filter((r) => !r.verified);
  const verifiedCount = reviews.filter((r) => r.verified).length;
  const adminCount = reviews.filter((r) => r.isAdminReview).length;
  const avgAll = reviews.filter((r) => r.verified && r.ratings.insgesamt > 0);
  const avgOverall = avgAll.length > 0
    ? (avgAll.reduce((s, r) => s + r.ratings.insgesamt, 0) / avgAll.length).toFixed(2)
    : '—';

  return (
    <div className="min-h-screen" style={{ background: 'rgb(var(--bg-soft))' }}>
      <div className="container-prose py-10">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">ProfVote</p>
            <h1 className="mt-1 !text-3xl">Admin</h1>
          </div>
          <button onClick={fetchReviews} disabled={loading}
            className="btn-ghost-lg text-sm disabled:opacity-50">
            {loading ? '…' : '↺ Aktualisieren'}
          </button>
        </div>

        {/* Uni selector */}
        <div className="mt-6">
          <div className="flex overflow-hidden rounded-xl border w-fit" style={{ borderColor: 'rgb(var(--border))' }}>
            {(['stuttgart', 'kit', 'tum'] as UniSlug[]).map((u) => (
              <button key={u} onClick={() => setUni(u)}
                className={`px-5 py-2 text-sm font-medium transition-colors ${uni === u ? 'bg-ink-soft text-white' : 'bg-white text-ink-muted hover:text-ink-soft dark:bg-neutral-900'}`}>
                {UNI_LABELS[u]}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-1 border-b overflow-x-auto" style={{ borderColor: 'rgb(var(--border))' }}>
          <TabButton active={tab === 'stats'} onClick={() => setTab('stats')} label="📊 Dashboard" />
          <TabButton active={tab === 'erstellen'} onClick={() => setTab('erstellen')} label="✍️ Bewertung erstellen" />
          <TabButton active={tab === 'cms'} onClick={() => setTab('cms')} label="CMS bearbeiten" />
          <TabButton active={tab === 'kommentare'} onClick={() => setTab('kommentare')}
            label="Kommentare" badge={pendingComments.length > 0 ? pendingComments.length : undefined} badgeColor="amber" />
          <TabButton active={tab === 'bewertungen'} onClick={() => setTab('bewertungen')} label="Alle Bewertungen" />
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">{error}</div>
        )}
        {loading && <div className="mt-10 text-center text-sm text-ink-muted">Lade…</div>}

        {/* ── TAB: DASHBOARD ── */}
        {!loading && !error && tab === 'stats' && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard label="Gesamt" value={reviews.length} color="blue" />
              <StatCard label="Verifiziert" value={verifiedCount} color="green" />
              <StatCard label="Email ausstehend" value={pendingEmail.length} color="amber" />
              <StatCard label="Kommentare (Wartend)" value={pendingComments.length} color="orange" />
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <StatCard label="Ø Gesamtnote" value={avgOverall} color="purple" />
              <StatCard label="Admin-Bewertungen" value={adminCount} color="slate" />
              <StatCard label="Kommentare freigegeben" value={approvedComments.length} color="green" />
            </div>

            {/* Recent reviews */}
            <div>
              <h2 className="!text-lg font-semibold text-ink-soft mb-3">Letzte Bewertungen</h2>
              <div className="space-y-2">
                {reviews.slice(0, 10).map((r) => (
                  <div key={r.id} className="card flex items-center justify-between gap-3 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`shrink-0 h-2 w-2 rounded-full ${r.verified ? 'bg-green-400' : 'bg-amber-400'}`} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink-soft">
                          {r.professorName || r.professorId || '—'}
                        </p>
                        <p className="text-xs text-ink-muted truncate">
                          {r.userEmail || 'kein Email'} · {r.createdAt ? new Date(r.createdAt).toLocaleDateString('de-DE') : '—'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {r.isAdminReview && <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700">Admin</span>}
                      <StarBadge value={r.ratings.insgesamt} />
                    </div>
                  </div>
                ))}
                {reviews.length === 0 && (
                  <div className="card py-8 text-center text-sm text-ink-muted">Keine Bewertungen gefunden.</div>
                )}
              </div>
            </div>

            {/* Pending email verifications */}
            {pendingEmail.length > 0 && (
              <div>
                <h2 className="!text-lg font-semibold text-ink-soft mb-3">
                  Email-Verifizierung ausstehend
                  <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-sm text-amber-700">{pendingEmail.length}</span>
                </h2>
                <div className="space-y-2">
                  {pendingEmail.map((r) => (
                    <div key={r.id} className="card border-l-4 border-l-amber-400 flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm text-ink-soft">{r.professorName || r.professorId || '—'}</p>
                        <p className="text-xs text-ink-muted">{r.userEmail || '—'} · {r.createdAt ? new Date(r.createdAt).toLocaleDateString('de-DE') : '—'}</p>
                      </div>
                      <button onClick={() => verifyReview(r.id)} disabled={actingId === r.id}
                        className="shrink-0 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-600 disabled:opacity-50">
                        {actingId === r.id ? '…' : '✓ Verifizieren'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: BEWERTUNG ERSTELLEN ── */}
        {!loading && !error && tab === 'erstellen' && (
          <CreateReviewForm secret={secret} uni={uni} onCreated={fetchReviews} />
        )}

        {/* ── TAB: CMS BEARBEITEN ── */}
        {!loading && !error && tab === 'cms' && (
          <CmsEditor secret={secret} uni={uni} />
        )}

        {/* ── TAB: KOMMENTARE PRÜFEN ── */}
        {!loading && !error && tab === 'kommentare' && (
          <div className="mt-6 space-y-8">
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
                <div className="card py-8 text-center text-sm text-ink-muted">✓ Keine Kommentare zur Prüfung</div>
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
            <div className="mb-4 flex flex-wrap gap-3">
              <div className="flex overflow-hidden rounded-xl border" style={{ borderColor: 'rgb(var(--border))' }}>
                {(['all', 'pending', 'verified'] as const).map((f) => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${filter === f ? 'bg-ink-soft text-white' : 'bg-white text-ink-muted hover:text-ink-soft dark:bg-neutral-900'}`}>
                    {f === 'all' ? `Alle (${reviews.length})` : f === 'pending' ? `Ausstehend (${pendingEmail.length})` : `Verifiziert (${verifiedCount})`}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {reviews.length === 0 && (
                <div className="card py-10 text-center text-sm text-ink-muted">Keine Einträge.</div>
              )}
              {reviews.map((r) => (
                <div key={r.id} className={`card border-l-4 ${!r.verified ? 'border-l-amber-400' : r.isAdminReview ? 'border-l-purple-400' : 'border-l-green-400'}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${r.verified ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'}`}>
                          {r.verified ? '✓ Verifiziert' : '⏳ Email ausstehend'}
                        </span>
                        {r.isAdminReview && (
                          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">⚡ Admin</span>
                        )}
                        {r.comment && (
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${r.commentApproved === false ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                            {r.commentApproved === false ? '⏳ Kommentar prüfen' : '✓ Kommentar ok'}
                          </span>
                        )}
                        <span className="text-xs text-ink-muted">{r.createdAt ? new Date(r.createdAt).toLocaleString('de-DE') : '—'}</span>
                      </div>
                      {(r.professorName || r.professorId) && (
                        <p className="text-sm font-medium text-ink-soft">{r.professorName || r.professorId}</p>
                      )}
                      <div className="flex flex-wrap gap-x-4 text-xs text-ink-muted">
                        <span>📧 {r.userEmail || '—'}</span>
                        <span className="font-mono">🆔 {r.id}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(r.ratings).map(([k, v]) => (
                          <span key={k} className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs dark:bg-neutral-800">
                            {RATING_LABELS[k] || k}: <strong>{v}</strong>
                          </span>
                        ))}
                      </div>
                      {r.comment && <p className="mt-1 max-w-2xl text-sm text-ink-soft">„{r.comment}"</p>}
                    </div>
                    <div className="flex shrink-0 flex-col gap-2">
                      {!r.verified && (
                        <button onClick={() => verifyReview(r.id)} disabled={actingId === r.id}
                          className="rounded-lg bg-green-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-600 disabled:opacity-50">
                          {actingId === r.id ? '…' : '✓ Verifizieren'}
                        </button>
                      )}
                      <button onClick={() => deleteReview(r.id)} disabled={actingId === r.id}
                        className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-100 disabled:opacity-50 dark:bg-rose-950 dark:text-rose-400">
                        {actingId === r.id ? '…' : 'Löschen'}
                      </button>
                    </div>
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

// ── CMS EDITOR ──
function CmsEditor({ secret, uni }: { secret: string; uni: UniSlug }) {
  const [query, setQuery] = useState('');
  const [entries, setEntries] = useState<CmsEntry[]>([]);
  const [editableFields, setEditableFields] = useState<string[]>([]);
  const [loadingCms, setLoadingCms] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [cmsError, setCmsError] = useState('');
  const [notice, setNotice] = useState('');

  const loadEntries = useCallback(async () => {
    setLoadingCms(true);
    setCmsError('');
    setNotice('');
    try {
      const params = new URLSearchParams({ secret, uni, q: query });
      const res = await fetch(`/api/admin/cms?${params.toString()}`);
      if (res.status === 401) throw new Error('Nicht berechtigt.');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setEntries(data.entries ?? []);
      setEditableFields(data.editableFields ?? []);
      if (data.limited) setNotice('Es werden die ersten 100 Treffer angezeigt. Bitte Suche verfeinern.');
    } catch (e) {
      setCmsError(e instanceof Error ? e.message : 'CMS-Daten konnten nicht geladen werden.');
    }
    setLoadingCms(false);
  }, [query, secret, uni]);

  useEffect(() => {
    const timer = setTimeout(() => { loadEntries(); }, 250);
    return () => clearTimeout(timer);
  }, [loadEntries]);

  function updateField(id: string, key: string, value: string) {
    setEntries((prev) => prev.map((entry) => (
      entry.id === id
        ? { ...entry, fields: { ...entry.fields, [key]: value } }
        : entry
    )));
  }

  async function saveEntry(entry: CmsEntry) {
    setSavingId(entry.id);
    setCmsError('');
    setNotice('');
    try {
      const res = await fetch(`/api/admin/cms?secret=${encodeURIComponent(secret)}&uni=${uni}&id=${encodeURIComponent(entry.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: entry.fields }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setEntries((prev) => prev.map((item) => (item.id === entry.id ? data.entry : item)));
      setNotice('CMS-Eintrag gespeichert.');
    } catch (e) {
      setCmsError(e instanceof Error ? e.message : 'Speichern fehlgeschlagen.');
    }
    setSavingId(null);
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="!text-xl font-semibold text-ink-soft">CMS-Stammdaten bearbeiten</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Bearbeitet die Professoren-Collection der aktuell ausgewählten Uni ({UNI_LABELS[uni]}).
            </p>
          </div>
          <button
            type="button"
            onClick={loadEntries}
            disabled={loadingCms}
            className="btn-ghost-lg text-sm disabled:opacity-50"
          >
            {loadingCms ? 'Lade...' : 'Neu laden'}
          </button>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nach Name, Fakultät, School oder Status suchen..."
          className="mt-4 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ink-soft/10 dark:bg-neutral-900"
          style={{ borderColor: 'rgb(var(--border))' }}
        />
      </div>

      {cmsError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
          {cmsError}
        </div>
      )}
      {notice && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          {notice}
        </div>
      )}

      {loadingCms ? (
        <div className="card py-8 text-center text-sm text-ink-muted">Lade CMS-Einträge...</div>
      ) : entries.length === 0 ? (
        <div className="card py-8 text-center text-sm text-ink-muted">Keine CMS-Einträge gefunden.</div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="card">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="break-words font-semibold text-ink-soft">{entry.preview.name}</p>
                  <p className="mt-1 break-words text-xs text-ink-muted">
                    {entry.preview.faculty || 'Keine Fakultät'} · ID {entry.id}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => saveEntry(entry)}
                  disabled={savingId === entry.id}
                  className="rounded-xl bg-ink-soft px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {savingId === entry.id ? 'Speichert...' : 'Speichern'}
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {editableFields.map((key) => (
                  <label key={key} className="block">
                    <span className="text-xs font-medium text-ink-muted">
                      {CMS_FIELD_LABELS[key] || key}
                    </span>
                    <input
                      value={entry.fields[key] ?? ''}
                      onChange={(e) => updateField(entry.id, key, e.target.value)}
                      className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm text-ink-soft outline-none focus:ring-2 focus:ring-ink-soft/10 dark:bg-neutral-900"
                      style={{ borderColor: 'rgb(var(--border))' }}
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── CREATE REVIEW FORM ──
function CreateReviewForm({ secret, uni, onCreated }: {
  secret: string;
  uni: UniSlug;
  onCreated: () => void;
}) {
  const [professorId, setProfessorId] = useState('');
  const [professorName, setProfessorName] = useState('');
  const [comment, setComment] = useState('');
  const [ratings, setRatings] = useState({
    insgesamt: 3, vorlesung: 3, skript: 3, klausur: 3, organisation: 3, schwierigkeit: 3,
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [formError, setFormError] = useState('');

  // Professor search
  const [search, setSearch] = useState('');
  const [professors, setProfessors] = useState<{ id: string; name: string; faculty?: string }[]>([]);
  const [loadingProfs, setLoadingProfs] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (search.length < 2) { setProfessors([]); return; }
    const timer = setTimeout(async () => {
      setLoadingProfs(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(search)}`);
        const data = await res.json();
        const allHits = (data.hits ?? []) as { id: string; name: string; faculty?: string; uni: string }[];
        setProfessors(allHits.filter((h) => h.uni === uni).slice(0, 10));
        setShowSuggestions(true);
      } catch { /* ignore */ }
      setLoadingProfs(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, uni]);

  function selectProf(prof: { id: string; name: string }) {
    setProfessorId(prof.id);
    setProfessorName(prof.name);
    setSearch(prof.name);
    setShowSuggestions(false);
  }

  function setRating(key: string, value: number) {
    setRatings((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!professorId) { setFormError('Bitte einen Professor auswählen.'); return; }
    setSubmitting(true);
    setFormError('');
    setSuccess('');
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret, uni, professorId, professorName, comment, ratings }),
      });
      const data = await res.json();
      if (data.ok) {
        setSuccess(`Bewertung erstellt! ID: ${data.id}`);
        setComment('');
        setRatings({ insgesamt: 3, vorlesung: 3, skript: 3, klausur: 3, organisation: 3, schwierigkeit: 3 });
        onCreated();
      } else {
        setFormError(data.error || 'Fehler beim Erstellen');
      }
    } catch {
      setFormError('Netzwerkfehler');
    }
    setSubmitting(false);
  }

  return (
    <div className="mt-6">
      <div className="card max-w-2xl">
        <h2 className="!text-xl font-semibold text-ink-soft mb-1">Admin-Bewertung erstellen</h2>
        <p className="text-sm text-ink-muted mb-6">Wird sofort verifiziert und veröffentlicht — kein Email-Flow.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Professor search */}
          <div className="relative">
            <label className="block text-sm font-medium text-ink-soft mb-1.5">Professor *</label>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setProfessorId(''); setProfessorName(''); }}
              placeholder="Name eingeben…"
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-900"
              style={{ borderColor: 'rgb(var(--border))' }}
              autoComplete="off"
            />
            {loadingProfs && <p className="mt-1 text-xs text-ink-muted">Suche…</p>}
            {showSuggestions && professors.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-xl border bg-white shadow-lg dark:bg-neutral-900"
                style={{ borderColor: 'rgb(var(--border))' }}>
                {professors.map((p) => (
                  <button key={p.id} type="button" onClick={() => selectProf(p)}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 first:rounded-t-xl last:rounded-b-xl">
                    <span className="font-medium text-ink-soft">{p.name}</span>
                    {p.faculty && <span className="ml-2 text-xs text-ink-muted">{p.faculty}</span>}
                  </button>
                ))}
              </div>
            )}
            {professorId && (
              <p className="mt-1 text-xs text-green-600">✓ Ausgewählt: {professorName} <span className="font-mono text-ink-muted">({professorId})</span></p>
            )}
          </div>

          {/* Ratings */}
          <div>
            <label className="block text-sm font-medium text-ink-soft mb-3">Bewertungen *</label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Object.entries(ratings).map(([key, val]) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-ink-soft">{RATING_LABELS[key]}</span>
                    <span className="text-sm font-semibold text-ink-soft">{val} ★</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} type="button" onClick={() => setRating(key, n)}
                        className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${n <= val ? 'bg-amber-400 text-white' : 'bg-neutral-100 text-ink-muted hover:bg-neutral-200 dark:bg-neutral-800'}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-ink-soft mb-1.5">Kommentar (optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Freitext-Kommentar…"
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-900 resize-none"
              style={{ borderColor: 'rgb(var(--border))' }}
            />
            <p className="mt-1 text-xs text-ink-muted text-right">{comment.length}/1000</p>
          </div>

          {formError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">{formError}</div>
          )}
          {success && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">{success}</div>
          )}

          <button type="submit" disabled={submitting || !professorId}
            className="w-full rounded-xl bg-ink-soft py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity">
            {submitting ? 'Erstelle…' : '⚡ Bewertung direkt veröffentlichen'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── HELPER COMPONENTS ──
function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    green: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    orange: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
    slate: 'bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300',
  };
  return (
    <div className={`rounded-2xl p-4 ${colors[color] || colors.slate}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-0.5 text-xs font-medium opacity-75">{label}</p>
    </div>
  );
}

function StarBadge({ value }: { value: number }) {
  return (
    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900 dark:text-amber-300">
      {value} ★
    </span>
  );
}

function TabButton({ active, onClick, label, badge, badgeColor }: {
  active: boolean; onClick: () => void; label: string;
  badge?: number; badgeColor?: 'amber' | 'green';
}) {
  return (
    <button onClick={onClick}
      className={`shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
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
            <StarBadge value={r.ratings.insgesamt} />
            <span>·</span>
            {(r.professorName || r.professorId) && <span className="font-medium text-ink-soft">{r.professorName || r.professorId}</span>}
            <span>·</span>
            <span>📧 {r.userEmail || '—'}</span>
            <span>·</span>
            <span>{r.createdAt ? new Date(r.createdAt).toLocaleDateString('de-DE') : '—'}</span>
          </div>
          <blockquote className="text-base leading-relaxed text-ink-soft">„{r.comment}"</blockquote>
        </div>

        <div className="flex shrink-0 flex-col gap-2">
          {status === 'pending' ? (
            <>
              <button onClick={onApprove} disabled={actingId === r.id}
                className="flex items-center gap-1.5 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50">
                {actingId === r.id ? '…' : '✓ Freigeben'}
              </button>
              <button onClick={onReject} disabled={actingId === r.id}
                className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-100 disabled:opacity-50">
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
