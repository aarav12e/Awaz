import { useEffect, useState } from 'react'
import LazyImage from '../components/LazyImage'
import { mockPosts } from '../lib/mockData'
import { FiPlay } from 'react-icons/fi'

export default function Explore() {
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState([])

  useEffect(() => {
    const t = setTimeout(() => {
      // Duplicate mock posts to fill out a believable grid
      setPosts([...mockPosts, ...mockPosts].map((p, i) => ({ ...p, id: `${p.id}-${i}` })))
      setLoading(false)
    }, 900)
    return () => clearTimeout(t)
  }, [])

  return (
    <div>
      <h1 className="font-display text-xl tracking-tight mb-5">Explore</h1>

      {loading ? (
        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer aspect-[9/16] rounded" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1">
          {posts.map((post) => (
            <div key={post.id} className="relative aspect-[9/16] cursor-pointer group">
              <LazyImage
                src={post.videoThumb}
                alt={post.caption}
                wrapperClassName="w-full h-full rounded"
                className="w-full h-full object-cover rounded"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded flex items-center justify-center">
                <FiPlay className="text-bone opacity-0 group-hover:opacity-100 transition-opacity" size={22} />
              </div>
              <span className="absolute bottom-1 right-1 bg-black/70 text-bone text-[9px] font-mono px-1 py-0.5 rounded">
                {post.duration}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
