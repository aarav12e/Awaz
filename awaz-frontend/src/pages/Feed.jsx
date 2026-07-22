import { useEffect, useState } from 'react'
import PostCard from '../components/PostCard'
import FeedSkeleton from '../components/skeletons/FeedSkeleton'
import api from '../lib/axios'

export default function Feed() {
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState([])

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await api.get('/posts')
        if (data.success) {
          setPosts(data.posts)
        }
      } catch (error) {
        console.error('Failed to fetch posts', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
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
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))
          ) : (
            <div className="text-center py-10 text-accent">No dispatches found.</div>
          )}
        </div>
      )}
    </div>
  )
}
