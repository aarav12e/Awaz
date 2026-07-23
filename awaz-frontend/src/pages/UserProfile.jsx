import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  FiArrowLeft, FiMessageCircle, FiUserPlus, FiUserCheck,
  FiRadio, FiMapPin, FiLoader, FiX, FiCheck,
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import useAuthStore from '../store/useAuthStore'
import api from '../lib/axios'

export default function UserProfile() {
  const { userId, handle: paramHandle } = useParams()
  const navigate = useNavigate()
  
  const { user, followUser, unfollowUser } = useAuthStore()
  
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)

  const targetIdentifier = paramHandle || userId
  const isOwnProfile = user && profile && (user.id === profile.id || user._id === profile._id)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!targetIdentifier) return
      setLoading(true)
      try {
        const cleanHandle = targetIdentifier.replace('@', '')
        const { data } = await api.get(`/users/${cleanHandle}`)
        if (data.success) {
          setProfile(data.user)
          setPosts(data.posts || [])
          setIsFollowing(Boolean(data.user.isFollowing))
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [targetIdentifier])

  const handleFollowToggle = async () => {
    if (!user) {
      toast.error('Please log in')
      return
    }
    const profileId = profile._id || profile.id
    if (isFollowing) {
      setIsFollowing(false)
      toast('Unfollowed')
      await unfollowUser(profileId)
    } else {
      setIsFollowing(true)
      toast.success(`Following ${profile.name}`)
      await followUser(profileId)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <FiLoader size={28} className="text-accent animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <FiRadio size={28} className="text-accent" />
        <p className="text-accent">Reporter not found</p>
        <button onClick={() => navigate(-1)} className="btn btn-sm btn-ghost gap-2">
          <FiArrowLeft size={14} /> Go back
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-accent hover:text-bone transition-colors"
      >
        <FiArrowLeft size={16} /> Back
      </button>

      {/* Profile card */}
      <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-fuchsia-500/20 via-base-200 to-cyan-500/15 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.18)] sm:p-5">
        {/* Banner */}
        <div className="mb-[-2.2rem] h-28 w-full rounded-[20px] bg-gradient-to-br from-primary/80 via-fuchsia-500/60 to-cyan-500/70" />

        <div className="flex flex-col gap-4 px-1 pt-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <img
              src={profile.avatar || 'https://api.dicebear.com/9.x/notionists/svg?seed=Unknown'}
              alt={profile.name}
              className="h-20 w-20 shrink-0 rounded-full border-4 border-base-100 bg-base-300 sm:h-24 sm:w-24 object-cover"
            />
            <div className="pb-2">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-lg sm:text-xl">{profile.name}</h1>
                {profile.verified && (
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-mono uppercase tracking-[0.2em] text-primary">PRESS</span>
                )}
              </div>
              <p className="text-sm font-mono text-accent">{profile.handle}</p>
              {profile.location && (
                <p className="mt-1 flex items-center gap-1 text-xs text-accent">
                  <FiMapPin size={11} /> {profile.location}
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          {!isOwnProfile ? (
            <div className="flex flex-wrap gap-2 pb-2">
              {isFollowing ? (
                <button
                  onClick={handleFollowToggle}
                  className="btn btn-sm bg-white/10 hover:bg-red-600/20 hover:text-red-400 border border-white/10 gap-2 transition-all"
                >
                  <FiUserCheck size={15} /> Unfollow
                </button>
              ) : (
                <button
                  onClick={handleFollowToggle}
                  className="btn btn-sm btn-primary gap-2"
                >
                  <FiUserPlus size={15} /> Follow
                </button>
              )}
              <Link to={`/messages?user=${profile._id}`} className="btn btn-sm btn-outline btn-primary gap-2">
                <FiMessageCircle size={15} /> Message
              </Link>
            </div>
          ) : (
            <div className="pb-2">
              <Link to="/profile" className="btn btn-sm btn-ghost gap-2">
                View my profile
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 px-1 text-center sm:gap-3">
        <div className="rounded-2xl bg-base-200/70 p-3">
          <p className="font-display text-lg">{posts.length}</p>
          <p className="text-[10px] font-mono uppercase text-accent">Dispatches</p>
        </div>
        <Link to={`/${profile.handle}/followers`} className="rounded-2xl bg-base-200/70 p-3 transition-colors hover:bg-base-200">
          <p className="font-display text-lg">{profile.followerCount || 0}</p>
          <p className="text-[10px] font-mono uppercase text-accent">Followers</p>
        </Link>
        <Link to={`/${profile.handle}/following`} className="rounded-2xl bg-base-200/70 p-3 transition-colors hover:bg-base-200">
          <p className="font-display text-lg">{profile.followingCount || 0}</p>
          <p className="text-[10px] font-mono uppercase text-accent">Following</p>
        </Link>
      </div>

      {/* Posts grid */}
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-[24px] border border-dashed border-white/10 bg-base-200/40 py-14 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <FiRadio className="text-primary" size={24} />
          </div>
          <div>
            <p className="font-display text-base">No dispatches yet</p>
            <p className="mt-1 text-sm text-accent">{profile.name} hasn't filed any reports yet.</p>
          </div>
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
