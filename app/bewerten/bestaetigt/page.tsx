import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function ConfirmedPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = searchParams.status;
  if (status === 'ok') {
    return (
      <div className="container-prose py-24 text-center">
        <div className="pill mb-6 inline-flex bg-green-50 text-green-900">Bestätigt</div>
        <h1>Danke!</h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-ink-muted">
          Deine Bewertung ist jetzt öffentlich. Andere Studierende sehen sie ab sofort
          auf der Prof-Seite.
        </p>
        <div className="mt-10">
          <Link href="/" className="btn-primary">Zur Startseite</Link>
        </div>
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="container-prose py-24 text-center">
        <h1>Hat nicht geklappt</h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-ink-muted">
          Bei der Bestätigung ist etwas schiefgegangen. Versuch in ein paar Minuten erneut,
          den Link aus der Email zu öffnen.
        </p>
      </div>
    );
  }
  return (
    <div className="container-prose py-24 text-center">
      <h1>Link ungültig</h1>
      <p className="mx-auto mt-6 max-w-xl text-lg text-ink-muted">
        Dieser Bestätigungs-Link ist abgelaufen oder wurde bereits benutzt. Du kannst die
        Bewertung einfach neu abgeben.
      </p>
      <div className="mt-10">
        <Link href="/" className="btn-secondary">Zur Startseite</Link>
      </div>
    </div>
  );
}
