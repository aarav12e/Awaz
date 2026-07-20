export default function PostCardSkeleton() {
  return (
    <div className="rounded-xl border border-base-300 hairline overflow-hidden bg-base-200">
      {/* header */}
      <div className="flex items-center gap-3 p-4">
        <div className="skeleton-shimmer w-10 h-10 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton-shimmer h-3 w-32 rounded" />
          <div className="skeleton-shimmer h-2.5 w-24 rounded" />
        </div>
      </div>
      {/* video */}
      <div className="skeleton-shimmer w-full aspect-video" />
      {/* caption + actions */}
      <div className="p-4 space-y-3">
        <div className="skeleton-shimmer h-3 w-full rounded" />
        <div className="skeleton-shimmer h-3 w-2/3 rounded" />
        <div className="flex gap-4 pt-2">
          <div className="skeleton-shimmer h-6 w-14 rounded-full" />
          <div className="skeleton-shimmer h-6 w-14 rounded-full" />
          <div className="skeleton-shimmer h-6 w-14 rounded-full" />
        </div>
      </div>
    </div>
  )
}
