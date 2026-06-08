import Link from 'next/link';

export const metadata = { title: '404 — Seite nicht gefunden' };

export default function NotFound() {
  return (
    <div className="container-prose flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(600px 300px at 50% 30%, rgba(0,113,227,0.06), transparent 70%)',
        }}
      />

      <p className="text-sm font-semibold uppercase tracking-widest text-ink-muted">404</p>
      <h1 className="mt-4 break-words !text-4xl sm:!text-6xl">Seite nicht gefunden</h1>
      <p className="mx-auto mt-6 max-w-sm text-lg text-ink-muted">
        Diese Seite existiert nicht oder wurde verschoben.
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-cta">
          Zur Startseite
        </Link>
        <Link href="/uni/stuttgart" className="btn-ghost-lg">
          Uni Stuttgart
        </Link>
        <Link href="/uni/kit" className="btn-ghost-lg">
          KIT
        </Link>
        <Link href="/uni/tum" className="btn-ghost-lg">
          TUM
        </Link>
      </div>
    </div>
  );
}
