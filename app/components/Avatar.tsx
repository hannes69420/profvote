// Deterministic gradient avatar with initials. Apple-soft pastel palette.

const PALETTE: Array<[string, string]> = [
  ['#FFE5C2', '#FFB199'], // peach
  ['#D6E4FF', '#B6CCFE'], // sky
  ['#E0E7FF', '#C7B2FF'], // lavender
  ['#D1FAE5', '#A7F3D0'], // mint
  ['#FEE2E2', '#FCA5A5'], // rose
  ['#FEF3C7', '#FCD34D'], // sand
  ['#E0F2FE', '#7DD3FC'], // aqua
  ['#F3E8FF', '#D8B4FE'], // lilac
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return Math.abs(h);
}

export function initialsFromName(name: string): string {
  const parts = name
    .replace(/[^\p{L}\s\-]/gu, ' ')
    .trim()
    .split(/[\s\-]+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({
  name,
  size = 56,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const [from, to] = PALETTE[hash(name) % PALETTE.length];
  const initials = initialsFromName(name);
  const fontSize = Math.round(size * 0.4);
  return (
    <div
      aria-hidden
      className={`relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full text-ink-soft ${className ?? ''}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
        fontWeight: 600,
        fontSize,
        letterSpacing: '-0.02em',
      }}
    >
      {initials}
    </div>
  );
}
