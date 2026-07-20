import { useEffect, useState } from 'react'
import PostCard from '../components/PostCard'
import FeedSkeleton from '../components/skeletons/FeedSkeleton'
import { mockPosts } from '../lib/mockData'

export default function Feed() {
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState([])

  useEffect(() => {
    // Simulates GET /api/posts — swap for a real axios call once backend is live.
    const t = setTimeout(() => {
      setPosts(mockPosts)
      setLoading(false)
    }, 1100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex items-center justify-between rounded-[24px] border border-white/10 bg-base-200/70 px-4 py-3 sm:px-5">
        <div>
          <h1 className="font-display text-xl tracking-tight">Ground Feed</h1>
          <p className="text-sm text-accent">Fresh updates from the field</p>
        </div>
        <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.24em] text-primary">Live · India</span>
      </div>

      {loading ? <FeedSkeleton count={3} /> : (
        <div className="space-y-4 sm:space-y-5">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
