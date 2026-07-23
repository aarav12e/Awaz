import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiSearch, FiUserPlus, FiUserCheck, FiPlay } from 'react-icons/fi'
import LazyImage from '../components/LazyImage'
import api from '../lib/axios'
import useAuthStore from '../store/useAuthStore'
import toast from 'react-hot-toast'
import ReelModal from '../components/ReelModal'

export default function Explore() {
  const [tab, setTab] = useState('posts') // 'posts' | 'people'
  const [search, setSearch] = useState('')
  const [posts, setPosts] = useState([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [selectedReel, setSelectedReel] = useState(null)

  const { user, registeredUsers, following, followUser, unfollowUser } = useAuthStore()

  // Fetch real posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await api.get('/posts')
        if (data.success) {
          setPosts(data.posts)
        }
      } catch (error) {
        console.error('Failed to fetch explore posts', error)
      } finally {
        setLoadingPosts(false)
      }
    }
    fetchPosts()
  }, [])

  const [allUsers, setAllUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)

  // Fetch real users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/users')
        if (data.success) {
          setAllUsers(data.users)
        }
      } catch (error) {
        console.error('Failed to fetch explore users', error)
      } finally {
        setLoadingUsers(false)
      }
    }
    fetchUsers()
  }, [])

  // People — only shown when user types in search by unique handle or name
  const people = useMemo(() => {
    if (!search.trim()) return []
    const others = allUsers.filter((u) => u._id !== user?.id && u._id !== user?._id)
    const q = search.toLowerCase().replace(/^@/, '')
    return others.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.handle.toLowerCase().includes(q)
    )
  }, [allUsers, user, search])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between rounded-[24px] border border-white/10 bg-base-200/70 px-4 py-3 sm:px-5">
        <h1 className="font-display text-xl tracking-tight">Explore</h1>
        <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.24em] text-primary">
          India
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl border border-white/10 bg-base-200/70 p-1">
        {[
          { key: 'posts',  label: 'Posts'  },
          { key: 'people', label: 'People' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex flex-1 items-center justify-center rounded-xl py-2 text-sm font-medium transition-colors ${
              tab === key ? 'bg-base-300 text-bone' : 'text-accent hover:text-bone'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── POSTS TAB ────────────────────────────────────────────────── */}
      {tab === 'posts' && (
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {posts.map((post) => {
            const thumb = post.video?.thumbnailUrl || post.video?.url || post.mediaUrl
            return (
              <div
                key={post._id}
                onClick={() => setSelectedReel(post)}
                className="relative aspect-[9/16] cursor-pointer group bg-base-200 rounded-[14px] overflow-hidden border border-base-content/10"
              >
                {thumb ? (
                  <img
                    src={thumb}
                    alt={post.caption}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 rounded-[14px]"
                  />
                ) : (
                  <div className="w-full h-full p-2 flex flex-col justify-between text-xs bg-base-300">
                    <p className="line-clamp-3 text-base-content font-medium">{post.caption}</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-[14px] flex items-center justify-center">
                  <div className="h-10 w-10 rounded-full bg-black/50 backdrop-blur text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <FiPlay className="ml-0.5 text-white" size={20} />
                  </div>
                </div>
                {post.video?.duration ? (
                  <span className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[9px] font-mono px-1.5 py-0.5 rounded-full">
                    {Math.round(post.video.duration)}s
                  </span>
                ) : null}
              </div>
            )
          })}
        </div>
      )}

      {/* ── PEOPLE TAB ───────────────────────────────────────────────── */}
      {tab === 'people' && (
        <div className="space-y-3">
          {/* Search */}
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-base-200/70 px-4 py-2.5">
            <FiSearch size={16} className="text-accent shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reporters…"
              className="w-full bg-transparent text-sm outline-none placeholder-accent"
            />
          </div>

          {/* User cards */}
          {people.length === 0 ? (
            <p className="text-center text-sm text-accent py-12">
              {!search.trim()
                ? 'Type a unique username into the search bar above to search for members.'
                : `No members found matching "${search}"`}
            </p>
          ) : (
            <div className="space-y-2">
              {people.map((person) => {
                const isFollowing = following.includes(person._id)
                return (
                  <div
                    key={person._id}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-base-200/70 px-4 py-3"
                  >
                    <Link to={`/user/${person.handle}`} className="shrink-0">
                      <img
                        src={person.avatar}
                        alt={person.name}
                        className="h-12 w-12 rounded-full bg-base-300 hover:opacity-80 transition-opacity"
                      />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/user/${person.handle}`}
                        className="flex items-center gap-1.5 hover:text-primary transition-colors"
                      >
                        <p className="text-sm font-semibold truncate">{person.name}</p>
                        {person.verified && (
                          <span className="shrink-0 rounded-full bg-primary/15 px-1.5 py-0.5 text-[8px] font-mono uppercase tracking-[0.2em] text-primary">
                            PRESS
                          </span>
                        )}
                      </Link>
                      <p className="text-xs font-mono text-accent truncate">{person.handle}</p>
                    </div>

                    {isFollowing ? (
                      <button
                        onClick={() => {
                          unfollowUser(person._id)
                          toast('Unfollowed')
                        }}
                        className="btn btn-xs btn-ghost border border-white/10 gap-1 shrink-0"
                      >
                        <FiUserCheck size={12} /> Following
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          followUser(person._id)
                          toast.success(`Following ${person.name}`)
                        }}
                        className="btn btn-xs btn-primary gap-1 shrink-0"
                      >
                        <FiUserPlus size={12} /> Follow
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Reel Modal */}
      {selectedReel && <ReelModal post={selectedReel} onClose={() => setSelectedReel(null)} />}
    </div>
  )
}
