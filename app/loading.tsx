export default function Loading() {
  return (
    <div className="container-prose py-16 sm:py-24">
      <SkeletonBlock className="h-8 w-48" />
      <SkeletonBlock className="mt-4 h-12 w-3/4" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card space-y-3">
            <div className="flex items-center gap-3">
              <SkeletonCircle size={48} />
              <div className="flex-1 space-y-2">
                <SkeletonBlock className="h-4 w-3/4" />
                <SkeletonBlock className="h-3 w-1/2" />
              </div>
            </div>
            <SkeletonBlock className="h-3 w-full" />
            <SkeletonBlock className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800 ${className ?? ''}`}
    />
  );
}

function SkeletonCircle({ size }: { size: number }) {
  return (
    <div
      className="shrink-0 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800"
      style={{ width: size, height: size }}
    />
  );
}
