import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiMapPin, FiPlay, FiSettings, FiMessageCircle } from 'react-icons/fi'
import ProfileSkeleton from '../components/skeletons/ProfileSkeleton'
import LazyImage from '../components/LazyImage'
import useAuthStore from '../store/useAuthStore'
import { mockPosts } from '../lib/mockData'

export default function Profile() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState([])

  useEffect(() => {
    const t = setTimeout(() => {
      setPosts(mockPosts.slice(0, 4))
      setLoading(false)
    }, 1000)
    return () => clearTimeout(t)
  }, [])

  if (loading) return <ProfileSkeleton />

  return (
    <div className="space-y-4">
      <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-fuchsia-500/25 via-base-200 to-cyan-500/20 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.18)] sm:p-5">
        <div className="mb-[-2.2rem] h-28 w-full rounded-[20px] bg-gradient-to-br from-primary/80 via-fuchsia-500/60 to-cyan-500/70" />
        <div className="flex flex-col gap-4 px-1 pt-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="h-20 w-20 shrink-0 rounded-full border-4 border-base-100 bg-base-300 sm:h-24 sm:w-24"
            />
            <div className="pb-2">
              <h1 className="font-display text-lg sm:text-xl">{user?.name}</h1>
              <p className="text-sm font-mono text-accent">{user?.handle}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pb-2">
            <Link to="/messages" className="btn btn-sm btn-outline btn-primary gap-2">
              <FiMessageCircle size={16} /> Chat
            </Link>
            <Link to="/settings" className="btn btn-sm btn-ghost gap-2">
              <FiSettings size={16} /> Settings
            </Link>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 px-1 text-xs font-mono text-accent">
        <FiMapPin size={12} /> Delhi NCR, India
      </div>

      <div className="grid grid-cols-3 gap-2 px-1 text-center sm:gap-3">
        <div className="rounded-2xl bg-base-200/70 p-3">
          <p className="font-display text-lg">{posts.length}</p>
          <p className="text-[10px] font-mono uppercase text-accent">Dispatches</p>
        </div>
        <div className="rounded-2xl bg-base-200/70 p-3">
          <p className="font-display text-lg">1.2K</p>
          <p className="text-[10px] font-mono uppercase text-accent">Followers</p>
        </div>
        <div className="rounded-2xl bg-base-200/70 p-3">
          <p className="font-display text-lg">318</p>
          <p className="text-[10px] font-mono uppercase text-accent">Following</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {posts.map((post) => (
          <div key={post.id} className="relative aspect-[9/16] cursor-pointer group">
            <LazyImage
              src={post.videoThumb}
              alt={post.caption}
              wrapperClassName="w-full h-full rounded-[14px]"
              className="w-full h-full object-cover rounded-[14px]"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-[14px] flex items-center justify-center">
              <FiPlay className="text-bone opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
