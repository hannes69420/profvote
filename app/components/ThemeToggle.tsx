'use client';

import { useEffect, useState } from 'react';

type Mode = 'light' | 'dark' | 'system';

export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>('system');

  useEffect(() => {
    const stored = (localStorage.getItem('theme') as Mode | null) || 'system';
    setMode(stored);
    apply(stored);
  }, []);

  const apply = (m: Mode) => {
    const root = document.documentElement;
    const dark =
      m === 'dark' ||
      (m === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.toggle('dark', dark);
  };

  // Listen for system changes when in 'system' mode
  useEffect(() => {
    if (mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => apply('system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [mode]);

  const cycle = () => {
    const next: Mode = mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light';
    setMode(next);
    localStorage.setItem('theme', next);
    apply(next);
  };

  const icon = mode === 'light' ? '☀️' : mode === 'dark' ? '🌙' : '🖥️';
  const label = mode === 'light' ? 'Hell' : mode === 'dark' ? 'Dunkel' : 'System';

  return (
    <button
      type="button"
      onClick={cycle}
      title={`Theme: ${label} — klick zum Wechseln`}
      aria-label={`Theme wechseln (aktuell: ${label})`}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-sm
                 transition-colors hover:bg-canvas-soft"
    >
      <span aria-hidden>{icon}</span>
    </button>
  );
}
