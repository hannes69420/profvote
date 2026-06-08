import Link from 'next/link';
import { CookieSettingsLink } from './CookieSettingsLink';
import { AdminLoginLink } from './AdminLoginLink';

const LINKS = [
  {
    heading: 'Plattform',
    items: [
      { label: 'Uni Stuttgart', href: '/uni/stuttgart' },
      { label: 'KIT', href: '/uni/kit' },
      { label: 'TUM', href: '/uni/tum' },
      { label: 'Vergleich', href: '/vergleich' },
    ],
  },
  {
    heading: 'Rechtliches',
    items: [
      { label: 'Impressum', href: '/impressum' },
      { label: 'Datenschutz', href: '/datenschutz' },
      { label: 'Nutzungsbedingungen', href: '/nutzungsbedingungen' },
      { label: 'Rechtliche Grundlagen', href: '/rechtliches' },
    ],
  },
  {
    heading: 'Kontakt',
    items: [{ label: 'profvote-info@gmx.de', href: 'mailto:profvote-info@gmx.de' }],
  },
];

const Footer = () => (
  <footer
    className="mt-24 border-t"
    style={{ background: 'rgb(var(--bg-soft))', borderColor: 'rgb(var(--border))' }}
  >
    <div className="container-prose py-14">
      <div className="grid gap-10 sm:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <div className="font-display text-xl font-semibold tracking-tightest text-ink-soft">
            ProfVote
          </div>
          <p className="mt-3 max-w-xs text-sm text-ink-muted">
            Anonyme, verifizierte Bewertungen von Professoren an deutschen Universitäten.
          </p>
          <p className="mt-4 text-xs text-ink-muted">Schätzle und Conrads Profvote GbR</p>
        </div>

        {LINKS.map((col) => (
          <div key={col.heading}>
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">
              {col.heading}
            </div>
            <ul className="space-y-2">
              {col.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-ink-muted transition-colors hover:text-ink-soft"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div
        className="mt-12 flex flex-col gap-2 border-t pt-8 sm:flex-row sm:items-center sm:justify-between"
        style={{ borderColor: 'rgb(var(--border))' }}
      >
        <p className="text-xs text-ink-muted">
          © {new Date().getFullYear()} Schätzle und Conrads Profvote GbR. Inhalte stammen
          von Studenten.
        </p>
        <p className="text-xs text-ink-muted">
          Bewertungen sind Meinungsäußerungen gemäß BGH-Urteil VI ZR 196/08.
        </p>
        <div className="flex items-center gap-4">
          <CookieSettingsLink />
          <AdminLoginLink />
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
