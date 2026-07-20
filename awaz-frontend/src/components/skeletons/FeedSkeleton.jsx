import PostCardSkeleton from './PostCardSkeleton'

export default function FeedSkeleton({ count = 3 }) {
  return (
    <div className="space-y-5">
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  )
}
