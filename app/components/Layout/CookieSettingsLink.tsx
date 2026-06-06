'use client';

export function CookieSettingsLink() {
  return (
    <button
      type="button"
      className="text-left text-xs text-ink-muted underline-offset-2 transition-colors hover:text-ink-soft hover:underline"
      onClick={() => window.dispatchEvent(new Event('profvote:open-cookie-settings'))}
    >
      Cookie-Einstellungen
    </button>
  );
}
