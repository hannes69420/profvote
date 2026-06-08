'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function AdminLoginLink() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/reviews?secret=${encodeURIComponent(password)}&uni=stuttgart&filter=all`);
      if (res.status === 401) {
        setError('Falsches Passwort.');
        setLoading(false);
        return;
      }
      router.push(`/admin?secret=${encodeURIComponent(password)}`);
    } catch {
      setError('Fehler beim Verbinden.');
    }
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={() => { setOpen(true); setError(''); setPassword(''); }}
        className="text-xs text-ink-muted/40 transition-colors hover:text-ink-muted"
      >
        Admin
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div
            className="w-full max-w-sm overflow-hidden bg-white shadow-2xl dark:bg-neutral-950"
            style={{ borderRadius: '1.25rem', border: '1px solid rgb(var(--border))' }}
          >
            <form onSubmit={handleSubmit} className="p-6">
              <h2 className="text-lg font-semibold text-ink-soft">Admin-Login</h2>
              <p className="mt-1 text-sm text-ink-muted">Passwort eingeben um fortzufahren.</p>

              <input
                type="password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Passwort"
                className="mt-4 w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ink-soft/20 dark:bg-neutral-900"
                style={{ borderColor: 'rgb(var(--border))' }}
              />

              {error && (
                <p className="mt-2 text-xs text-rose-500">{error}</p>
              )}

              <div className="mt-4 flex gap-2">
                <button
                  type="submit"
                  disabled={!password || loading}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {loading ? 'Prüfe…' : 'Einloggen'}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn-ghost-lg"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
