import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiMapPin, FiSettings, FiMessageCircle, FiRadio } from 'react-icons/fi'
import useAuthStore from '../store/useAuthStore'
import api from '../lib/axios'

export default function Profile() {
  const { user } = useAuthStore()
  const [posts, setPosts] = useState([])
  const [profileData, setProfileData] = useState(null)
  
  useEffect(() => {
    if (user?.handle) {
      // Remove @ if it's there
      const handle = user.handle.replace('@', '')
      api.get(`/users/${handle}`)
        .then(res => {
          if (res.data.success) {
            setProfileData(res.data.user)
            setPosts(res.data.posts)
          }
        })
        .catch(err => console.error(err))
    }
  }, [user])

  const displayUser = profileData || user
  const followingCount = displayUser?.followingCount || 0
  const followersCount = displayUser?.followerCount || 0

  return (
    <div className="space-y-4">
      {/* Profile card */}
      <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-fuchsia-500/25 via-base-200 to-cyan-500/20 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.18)] sm:p-5">
        <div className="mb-[-2.2rem] h-28 w-full rounded-[20px] bg-gradient-to-br from-primary/80 via-fuchsia-500/60 to-cyan-500/70" />
        <div className="flex flex-col gap-4 px-1 pt-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <img
              src={displayUser?.avatar || 'https://api.dicebear.com/9.x/notionists/svg?seed=Unknown'}
              alt={displayUser?.name}
              className="h-20 w-20 shrink-0 rounded-full border-4 border-base-100 bg-base-300 sm:h-24 sm:w-24 object-cover"
            />
            <div className="pb-2">
              <h1 className="font-display text-lg sm:text-xl">{displayUser?.name}</h1>
              <p className="text-sm font-mono text-accent">{displayUser?.handle}</p>
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

      {/* Location */}
      {displayUser?.location && (
        <div className="flex items-center gap-1.5 px-1 text-xs font-mono text-accent">
          <FiMapPin size={12} /> {displayUser.location}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 px-1 text-center sm:gap-3">
        <div className="rounded-2xl bg-base-200/70 p-3">
          <p className="font-display text-lg">{posts.length}</p>
          <p className="text-[10px] font-mono uppercase text-accent">Dispatches</p>
        </div>
        <Link
          to="/followers"
          className="rounded-2xl bg-base-200/70 p-3 transition-colors hover:bg-base-200"
        >
          <p className="font-display text-lg">{followersCount}</p>
          <p className="text-[10px] font-mono uppercase text-accent">Followers</p>
        </Link>
        <Link
          to="/following"
          className="rounded-2xl bg-base-200/70 p-3 transition-colors hover:bg-base-200"
        >
          <p className="font-display text-lg">{followingCount}</p>
          <p className="text-[10px] font-mono uppercase text-accent">Following</p>
        </Link>
      </div>

      {/* Posts grid */}
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-[24px] border border-dashed border-white/10 bg-base-200/40 py-16 px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <FiRadio className="text-primary" size={28} />
          </div>
          <div>
            <p className="font-display text-base">No dispatches yet</p>
            <p className="mt-1 text-sm text-accent">When you report something, it will appear here.</p>
          </div>
          <Link to="/upload" className="btn btn-sm btn-primary gap-2 mt-1">
            <FiRadio size={14} /> File a Report
          </Link>
        </div>
      ) : (
        <>
          <p className="px-1 text-xs font-mono uppercase tracking-widest text-accent">Dispatches</p>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {posts.map((post) => (
              <div key={post._id} className="relative aspect-[9/16] cursor-pointer group">
                <img
                  src={post.video?.thumbnailUrl || ''}
                  alt={post.caption}
                  className="w-full h-full object-cover rounded-[14px]"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors rounded-[14px] flex flex-col items-center justify-center gap-1">
                  {post.video?.duration && (
                    <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-bone text-[9px] font-mono px-1.5 py-0.5 rounded-full">
                      {Math.round(post.video.duration)}s
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
