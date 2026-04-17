export function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-5 border border-white/[0.06]">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2">
          <div className="skeleton h-3 w-24 rounded" />
          <div className="skeleton h-8 w-16 rounded" />
        </div>
        <div className="skeleton w-11 h-11 rounded-xl" />
      </div>
      <div className="skeleton h-3 w-20 rounded" />
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-white/[0.04]">
      <div className="skeleton w-8 h-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="skeleton h-3 w-36 rounded" />
        <div className="skeleton h-2.5 w-24 rounded" />
      </div>
      <div className="skeleton h-5 w-16 rounded-full" />
      <div className="skeleton h-3 w-20 rounded" />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="glass rounded-2xl border border-white/[0.06] overflow-hidden">
      <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
        <div className="skeleton h-4 w-32 rounded" />
        <div className="skeleton h-8 w-24 rounded-lg" />
      </div>
      <div className="p-4 space-y-1">
        {Array.from({ length: rows }).map((_, i) => <SkeletonRow key={i} />)}
      </div>
    </div>
  )
}
