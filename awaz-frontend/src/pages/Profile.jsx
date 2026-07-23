import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiSettings,
  FiMessageCircle,
  FiGrid,
  FiPlayCircle,
  FiBookmark,
  FiUserCheck,
  FiGlobe,
  FiPlus,
  FiShare2,
  FiHeart,
  FiRadio,
  FiCheckCircle,
  FiCamera,
} from 'react-icons/fi'
import { useUser } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
import useAuthStore from '../store/useAuthStore'
import api from '../lib/axios'
import ReelModal from '../components/ReelModal'

export default function Profile() {
  const { user: storeUser } = useAuthStore()
  const { user: clerkUser } = useUser()

  const [activeTab, setActiveTab] = useState('posts') // 'posts' | 'reels' | 'saved'
  const [posts, setPosts] = useState([])
  const [profileData, setProfileData] = useState(null)
  const [selectedReel, setSelectedReel] = useState(null)

  const activeUser =
    storeUser ||
    (clerkUser
      ? {
          name: clerkUser.fullName || clerkUser.firstName || clerkUser.primaryEmailAddress?.emailAddress?.split('@')[0] || 'Reporter',
          handle: `@${clerkUser.username || clerkUser.primaryEmailAddress?.emailAddress?.split('@')[0] || 'user'}`,
          avatar: clerkUser.imageUrl,
          email: clerkUser.primaryEmailAddress?.emailAddress,
        }
      : null)

  useEffect(() => {
    if (activeUser?.handle) {
      const handle = activeUser.handle.replace('@', '')
      api
        .get(`/users/${handle}`)
        .then((res) => {
          if (res.data.success) {
            setProfileData(res.data.user)
            setPosts(res.data.posts || [])
          }
        })
        .catch((err) => console.error(err))
    }
  }, [activeUser])

  const displayUser = profileData || activeUser

  const name = displayUser?.name || 'New Reporter'
  const rawHandle = displayUser?.handle || 'user'
  const handle = rawHandle.replace(/^@/, '')
  const avatar =
    displayUser?.avatar ||
    `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(name)}`
  const bio = displayUser?.bio || ''
  const website = displayUser?.website || ''
  const followingCount = displayUser?.followingCount || 0
  const followersCount = displayUser?.followerCount || 0
  const verified = displayUser?.verified ?? false

  const handleShareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: `${name} (@${handle}) on Awaz`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Profile link copied to clipboard!')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-10 space-y-8">
      {/* ── Instagram Header Section ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 md:gap-16">
        {/* Avatar Image */}
        <div className="relative shrink-0">
          <img
            src={avatar}
            alt={name}
            className="h-32 w-32 sm:h-40 sm:w-40 rounded-full object-cover border border-base-content/10 bg-base-300 shadow-lg"
          />
        </div>

        {/* User Details & Actions */}
        <div className="flex-1 space-y-5 text-center sm:text-left min-w-0">
          {/* Row 1: Username & Action Buttons */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 md:gap-4">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-base-content flex items-center gap-1.5">
              {handle}
              {verified && (
                <FiCheckCircle
                  size={18}
                  className="text-primary fill-primary/20 shrink-0"
                  title="Verified Reporter"
                />
              )}
            </h1>

            <div className="flex items-center gap-2">
              <Link
                to="/settings"
                className="btn btn-sm bg-base-content/10 hover:bg-base-content/20 border-0 text-base-content font-medium px-4 rounded-lg text-xs"
              >
                Edit profile
              </Link>
              <button
                onClick={handleShareProfile}
                className="btn btn-sm bg-base-content/10 hover:bg-base-content/20 border-0 text-base-content font-medium px-3 rounded-lg text-xs gap-1.5"
              >
                <FiShare2 size={13} /> Share profile
              </button>
              <Link
                to="/settings"
                className="btn btn-sm btn-ghost btn-square text-base-content/75 hover:text-base-content"
              >
                <FiSettings size={18} />
              </Link>
            </div>
          </div>

          {/* Row 2: Stats (Dispatches, Followers, Following) */}
          <div className="flex items-center justify-center sm:justify-start gap-8 md:gap-10 text-sm">
            <div>
              <span className="font-bold text-base-content text-base">{posts.length}</span>{' '}
              <span className="text-base-content/60">dispatches</span>
            </div>
            <Link
              to={`/${handle}/followers`}
              className="hover:opacity-80 transition-opacity"
            >
              <span className="font-bold text-base-content text-base">{followersCount}</span>{' '}
              <span className="text-base-content/60">followers</span>
            </Link>
            <Link
              to={`/${handle}/following`}
              className="hover:opacity-80 transition-opacity"
            >
              <span className="font-bold text-base-content text-base">{followingCount}</span>{' '}
              <span className="text-base-content/60">following</span>
            </Link>
          </div>

          {/* Row 3: Name & Bio & Website */}
          <div className="space-y-1 text-sm">
            <p className="font-bold text-base-content text-base">{name}</p>
            {bio && (
              <p className="text-base-content/85 whitespace-pre-line leading-relaxed max-w-lg font-normal">
                {bio}
              </p>
            )}
            {website && (
              <a
                href={
                  website.startsWith('http') ? website : `https://${website}`
                }
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-primary font-medium hover:underline text-xs pt-1"
              >
                <FiGlobe size={13} /> {website}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Instagram Tab Navigation ─────────────────────────────────── */}
      <div className="border-t border-base-content/10 pt-2">
        <div className="flex justify-center gap-12 text-xs font-mono tracking-widest uppercase">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-2 py-3 border-t-2 transition-all ${
              activeTab === 'posts'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-base-content/40 hover:text-base-content/75'
            }`}
          >
            <FiGrid size={14} /> Dispatches
          </button>
          <button
            onClick={() => setActiveTab('reels')}
            className={`flex items-center gap-2 py-3 border-t-2 transition-all ${
              activeTab === 'reels'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-base-content/40 hover:text-base-content/75'
            }`}
          >
            <FiPlayCircle size={14} /> Reels
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 py-3 border-t-2 transition-all ${
              activeTab === 'saved'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-base-content/40 hover:text-base-content/75'
            }`}
          >
            <FiBookmark size={14} /> Saved
          </button>
        </div>
      </div>

      {/* ── Posts / Dispatches Grid ─────────────────────────────────── */}
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-base-content/20 text-base-content/60">
            <FiCamera size={28} />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-base-content">No Dispatches Yet</h3>
            <p className="text-sm text-base-content/50 mt-1 max-w-sm">
              When you post stories or reports, they will appear here on your profile grid.
            </p>
          </div>
          <Link
            to="/upload"
            className="btn btn-sm bg-primary hover:bg-primary/90 text-white border-0 px-6 gap-2"
          >
            <FiPlus size={16} /> Create Dispatch
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1.5 sm:gap-4 md:gap-6">
          {posts.map((post) => {
            const thumb = post.video?.thumbnailUrl || post.video?.url || post.mediaUrl
            return (
              <div
                key={post._id}
                onClick={() => setSelectedReel(post)}
                className="group relative aspect-square rounded-xl bg-base-200 overflow-hidden border border-base-content/10 shadow-md cursor-pointer"
              >
                {thumb ? (
                  <img
                    src={thumb}
                    alt={post.caption || post.headline}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full p-4 flex flex-col justify-between bg-gradient-to-br from-base-200 via-base-300 to-base-200">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                      {post.category || 'NEWS'}
                    </span>
                    <p className="font-semibold text-xs sm:text-sm text-base-content line-clamp-3">
                      {post.caption || post.headline}
                    </p>
                    <span className="text-[9px] font-mono text-base-content/40">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {/* Hover Overlay with Likes Count & Play Icon */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-bold text-sm">
                  <div className="flex items-center gap-1.5">
                    <FiHeart size={18} className="fill-white" />
                    <span>{post.likesCount || (post.likes ? post.likes.length : 0)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FiMessageCircle size={18} className="fill-white" />
                    <span>{post.commentCount || 0}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Reel Modal Detail Viewer */}
      {selectedReel && <ReelModal post={selectedReel} onClose={() => setSelectedReel(null)} />}
    </div>
  )
}
