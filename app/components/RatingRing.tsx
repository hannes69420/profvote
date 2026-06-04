// SVG donut showing a 0-5 rating as a filled arc.

export function RatingRing({
  value,
  count,
  size = 180,
  stroke = 14,
}: {
  value: number | null;
  count: number;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = value != null ? Math.max(0, Math.min(1, value / 5)) : 0;
  const dash = c * pct;
  const stop = ratingColor(value);

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={stop.from} />
            <stop offset="100%" stopColor={stop.to} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#F2F2F4"
          strokeWidth={stroke}
        />
        {value != null && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c - dash}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display text-5xl font-semibold tracking-tightest text-ink-soft">
          {value != null ? value.toFixed(1) : '–'}
        </div>
        <div className="mt-0.5 text-xs text-ink-muted">
          {count > 0 ? `${count} Bewertung${count === 1 ? '' : 'en'}` : 'noch keine'}
        </div>
      </div>
    </div>
  );
}

function ratingColor(v: number | null): { from: string; to: string } {
  if (v == null) return { from: '#E5E5EA', to: '#D2D2D7' };
  if (v >= 4) return { from: '#34D399', to: '#10B981' }; // green
  if (v >= 3) return { from: '#60A5FA', to: '#3B82F6' }; // blue
  if (v >= 2) return { from: '#FBBF24', to: '#F59E0B' }; // amber
  return { from: '#FB7185', to: '#F43F5E' }; // rose
}
