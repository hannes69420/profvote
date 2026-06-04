import type { AggregatedRatings } from '@app/lib/profvote/types';

const ROWS: Array<{
  key: keyof Omit<AggregatedRatings, 'count'>;
  label: string;
  invert?: boolean;
}> = [
  { key: 'insgesamt', label: 'Insgesamt' },
  { key: 'vorlesung', label: 'Vorlesung' },
  { key: 'skript', label: 'Skript' },
  { key: 'klausur', label: 'Klausur' },
  { key: 'organisation', label: 'Organisation' },
  { key: 'schwierigkeit', label: 'Schwierigkeit', invert: true },
];

export function RatingBars({ stats }: { stats: AggregatedRatings | null }) {
  return (
    <div className="space-y-4">
      {ROWS.map(({ key, label, invert }) => {
        const v = stats?.[key] ?? null;
        const pct = v != null ? (v / 5) * 100 : 0;
        return (
          <div key={key} className="grid grid-cols-[8rem_1fr_3rem] items-center gap-4">
            <div className="text-sm text-ink-muted">
              {label}
              {invert && (
                <div className="text-[10px] uppercase tracking-wider text-ink-muted/70">
                  niedrig = leicht
                </div>
              )}
            </div>
            <div className="relative h-2.5 overflow-hidden rounded-full bg-canvas-soft">
              {v != null && (
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${barColor(v).from}, ${barColor(v).to})`,
                  }}
                />
              )}
            </div>
            <div className="text-right text-sm font-medium tabular-nums text-ink-soft">
              {v != null ? v.toFixed(1) : '–'}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function RatingDistribution({
  values,
}: {
  values: number[]; // raw "insgesamt" ratings, 1-5
}) {
  if (values.length === 0) return null;
  const counts = [1, 2, 3, 4, 5].map((n) => values.filter((v) => Math.round(v) === n).length);
  const max = Math.max(...counts, 1);

  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map((n) => {
        const c = counts[n - 1];
        const pct = (c / max) * 100;
        return (
          <div key={n} className="grid grid-cols-[2rem_1fr_2rem] items-center gap-3">
            <div className="text-xs text-ink-muted">{n} ★</div>
            <div className="relative h-2 overflow-hidden rounded-full bg-canvas-soft">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-ink-soft/80"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="text-right text-xs tabular-nums text-ink-muted">{c}</div>
          </div>
        );
      })}
    </div>
  );
}

function barColor(v: number): { from: string; to: string } {
  if (v >= 4) return { from: '#86EFAC', to: '#10B981' };
  if (v >= 3) return { from: '#93C5FD', to: '#3B82F6' };
  if (v >= 2) return { from: '#FCD34D', to: '#F59E0B' };
  return { from: '#FCA5A5', to: '#F43F5E' };
}
