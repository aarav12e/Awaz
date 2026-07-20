export default function ProfileSkeleton() {
  return (
    <div className="animate-in">
      <div className="skeleton-shimmer h-36 w-full rounded-xl mb-[-2.5rem]" />
      <div className="flex items-end gap-4 px-4">
        <div className="skeleton-shimmer w-20 h-20 rounded-full border-4 border-base-100 shrink-0" />
        <div className="flex-1 space-y-2 pb-2">
          <div className="skeleton-shimmer h-3.5 w-40 rounded" />
          <div className="skeleton-shimmer h-2.5 w-24 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1 mt-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton-shimmer aspect-[9/16] rounded" />
        ))}
      </div>
    </div>
  )
}
