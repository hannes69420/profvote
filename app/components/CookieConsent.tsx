'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type OptionalCategory = 'statistics' | 'comfort' | 'marketing';

type ConsentState = {
  necessary: true;
  statistics: boolean;
  comfort: boolean;
  marketing: boolean;
};

const STORAGE_KEY = 'profvote_cookie_consent_v1';

const DEFAULT_CONSENT: ConsentState = {
  necessary: true,
  statistics: false,
  comfort: false,
  marketing: false,
};

const OPTIONAL_CATEGORIES: Array<{
  key: OptionalCategory;
  title: string;
  description: string;
}> = [
  {
    key: 'statistics',
    title: 'Statistik',
    description:
      'Vercel Web Analytics & Speed Insights — cookiefreie, anonyme Auswertung von Seitenaufrufen und Ladezeiten. Keine Nutzerprofile, keine Cross-Site-Tracker.',
  },
  {
    key: 'comfort',
    title: 'Komfort / externe Inhalte',
    description:
      'Optional. Für zusätzliche Funktionen wie eingebettete Inhalte, Karten, Videos, externe Schriftarten oder Captchas, falls wir sie später einbauen.',
  },
  {
    key: 'marketing',
    title: 'Marketing',
    description:
      'Optional. Für Werbung oder Kampagnenauswertung. ProfVote nutzt aktuell keine Marketing-Cookies und keine Werbe-Tracker.',
  },
];

function normalizeConsent(value: Partial<ConsentState> | null): ConsentState {
  return {
    necessary: true,
    statistics: Boolean(value?.statistics),
    comfort: Boolean(value?.comfort),
    marketing: Boolean(value?.marketing),
  };
}

function readConsent(): ConsentState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return normalizeConsent(JSON.parse(raw) as Partial<ConsentState>);
  } catch {
    return null;
  }
}

function saveConsent(consent: ConsentState) {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...consent, savedAt: new Date().toISOString() }),
  );
  window.dispatchEvent(new CustomEvent('profvote:cookie-consent-changed', { detail: consent }));
}

export function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [draft, setDraft] = useState<ConsentState>(DEFAULT_CONSENT);

  useEffect(() => {
    const stored = readConsent();
    setDraft(stored ?? DEFAULT_CONSENT);
    setOpen(!stored);
    setMounted(true);

    const openSettings = () => {
      setDraft(readConsent() ?? DEFAULT_CONSENT);
      setShowSettings(false);
      setOpen(true);
    };

    window.addEventListener('profvote:open-cookie-settings', openSettings);
    return () => window.removeEventListener('profvote:open-cookie-settings', openSettings);
  }, []);

  const selectedCount = useMemo(
    () => Number(draft.statistics) + Number(draft.comfort) + Number(draft.marketing),
    [draft],
  );

  if (!mounted || !open) return null;

  const closeWithConsent = (consent: ConsentState) => {
    saveConsent(consent);
    setOpen(false);
  };

  const toggle = (key: OptionalCategory) => {
    setDraft((current) => ({ ...current, [key]: !current[key] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-hidden bg-black/45 p-2 backdrop-blur-sm sm:items-center sm:p-8">
      <div
        className="max-h-[calc(100dvh-1rem)] w-full max-w-[calc(100vw-1rem)] overflow-hidden border bg-white shadow-[0_24px_80px_rgba(0,0,0,0.26)] sm:max-w-2xl"
        style={{ borderColor: 'rgb(var(--border))', borderRadius: '1.25rem' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-title"
      >
        <div className="max-h-[calc(100dvh-1rem)] overflow-y-auto">
          <div className="px-4 pb-3 pt-4 sm:px-7 sm:pt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Datenschutz & Cookies
            </p>
            <h2 id="cookie-title" className="mt-2 text-2xl font-semibold leading-tight">
              Cookie-Einstellungen
            </h2>

            <div className="mt-4 space-y-2.5 text-sm leading-relaxed text-ink-muted sm:mt-5 sm:space-y-3">
              <p>
                Wir verwenden technisch notwendige Cookies und ähnliche
                Speichertechnologien, damit ProfVote sicher, stabil und zuverlässig
                funktioniert. Optionale Cookies und Dienste werden nur nach deiner
                ausdrücklichen Einwilligung aktiviert.
              </p>
              <p>
                Du kannst deine Einwilligung jederzeit mit Wirkung für die Zukunft über
                den Link „Cookie-Einstellungen“ im Footer ändern oder widerrufen.
              </p>
            </div>
          </div>

          <div className="px-4 sm:px-7">
            <div className="border-t pt-4" style={{ borderColor: 'rgb(var(--border))' }}>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <h3 className="text-base font-semibold leading-tight text-ink-soft">
                  Notwendige Cookies
                </h3>
                <p className="text-sm font-medium text-ink-muted">Immer aktiv</p>
              </div>
              <div className="mt-3 space-y-2.5 text-sm leading-relaxed text-ink-muted sm:space-y-3">
                <p>
                  Diese Cookies sind erforderlich, um die grundlegenden Funktionen der
                  Website bereitzustellen, die Sicherheit zu gewährleisten, Missbrauch zu
                  verhindern und deine Cookie-Auswahl zu speichern.
                </p>
                <p>
                  <span className="font-medium text-ink-soft">Rechtsgrundlage:</span> §
                  25 Abs. 2 TDDDG sowie Art. 6 Abs. 1 lit. f DSGVO.
                </p>
                <p>
                  Weitere Informationen findest du in unserer{' '}
                  <Link
                    href="/datenschutz"
                    className="font-medium text-ink-soft underline-offset-2 hover:underline"
                  >
                    Datenschutzerklärung
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>

          <div className="px-4 pt-3 sm:px-7 sm:pt-4">
            <button
              type="button"
              className="text-sm font-medium text-ink-soft underline-offset-4 hover:underline"
              onClick={() => setShowSettings((value) => !value)}
            >
              {showSettings ? 'Optionale Einstellungen ausblenden' : 'Optionale Einstellungen anzeigen'}
            </button>
          </div>

          {showSettings && (
            <div className="mt-3 space-y-3 px-4 sm:px-7">
              {OPTIONAL_CATEGORIES.map((category) => (
                <div
                  key={category.key}
                  className="border px-3 py-3 sm:px-4 sm:py-4"
                  style={{ borderColor: 'rgb(var(--border))', borderRadius: '1rem' }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-base font-semibold leading-tight text-ink-soft">
                        {category.title}
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                        {category.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-pressed={draft[category.key]}
                      className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                        draft[category.key] ? 'bg-ink-soft' : 'bg-neutral-300'
                      }`}
                      onClick={() => toggle(category.key)}
                    >
                      <span className="sr-only">{category.title} umschalten</span>
                      <span
                        className={`ml-1 h-4 w-4 rounded-full bg-white transition-transform ${
                          draft[category.key] ? 'translate-x-5' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 border-t px-4 py-3 sm:mt-5 sm:px-7 sm:py-4" style={{ borderColor: 'rgb(var(--border))' }}>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                className="btn-primary"
                onClick={() =>
                  closeWithConsent({
                    necessary: true,
                    statistics: true,
                    comfort: true,
                    marketing: true,
                  })
                }
              >
                Alle akzeptieren
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => closeWithConsent(DEFAULT_CONSENT)}
              >
                Alle ablehnen
              </button>
            </div>

            <div className="mt-3 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-center">
              {showSettings && (
                <button
                  type="button"
                  className="text-ink-muted underline-offset-4 transition-colors hover:text-ink-soft hover:underline"
                  onClick={() => closeWithConsent(draft)}
                >
                  Auswahl speichern ({selectedCount})
                </button>
              )}
              <Link
                href="/datenschutz"
                className="text-ink-muted underline-offset-4 transition-colors hover:text-ink-soft hover:underline"
              >
                Datenschutz
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
