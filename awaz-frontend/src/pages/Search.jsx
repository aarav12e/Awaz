import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiSearch, FiUserPlus, FiUserCheck, FiX, FiCheckCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'
import api from '../lib/axios'
import useAuthStore from '../store/useAuthStore'

export default function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const { user, followUser, unfollowUser } = useAuthStore()

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const { data } = await api.get(`/users/search?q=${encodeURIComponent(query.trim())}`)
        if (data.success) {
          // Exclude self from search results
          const filtered = (data.users || []).filter((u) => u._id !== user?.id && u._id !== user?._id)
          setResults(filtered)
        }
      } catch (err) {
        console.error('Search failed:', err)
      } finally {
        setLoading(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [query, user])

  const handleFollowToggle = async (e, targetUser) => {
    e.preventDefault()
    e.stopPropagation()

    const isFollowing = user?.following?.includes(targetUser._id) || user?.following?.includes(targetUser.id)

    if (isFollowing) {
      const res = await unfollowUser(targetUser._id || targetUser.id)
      if (res?.success) toast.success(`Unfollowed @${targetUser.handle.replace('@', '')}`)
    } else {
      const res = await followUser(targetUser._id || targetUser.id)
      if (res?.success) toast.success(`Following @${targetUser.handle.replace('@', '')}`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Search Header */}
      <div className="space-y-2">
        <h1 className="font-display text-2xl font-bold tracking-tight text-white">Search</h1>
        <p className="text-sm text-white/50">Find member profiles by unique username or name.</p>
      </div>

      {/* Search Bar Input */}
      <div className="relative">
        <FiSearch className="absolute left-4 top-3.5 text-white/40" size={18} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by unique username (e.g. aarav12f)..."
          className="w-full rounded-2xl border border-white/10 bg-base-200/90 pl-11 pr-10 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-lg"
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3.5 top-3.5 text-white/40 hover:text-white"
          >
            <FiX size={18} />
          </button>
        )}
      </div>

      {/* Results Section */}
      {query.trim() === '' ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 rounded-2xl border border-white/5 bg-base-200/30">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-white/40">
            <FiSearch size={28} />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold text-white">Search Awaz Members</h3>
            <p className="text-xs text-white/40 mt-1 max-w-xs">
              Type a unique username or handle above to find and connect with specific members.
            </p>
          </div>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-12">
          <span className="waveform text-primary">
            <span></span><span></span><span></span><span></span><span></span>
          </span>
        </div>
      ) : results.length === 0 ? (
        <div className="py-16 text-center text-white/40 font-mono text-sm rounded-2xl border border-white/5 bg-base-200/30">
          No members found matching "<span className="text-white">{query}</span>"
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-mono uppercase tracking-wider text-white/40 px-1">
            {results.length} {results.length === 1 ? 'Member' : 'Members'} Found
          </p>

          <div className="space-y-2">
            {results.map((item) => {
              const handle = item.handle.startsWith('@') ? item.handle : `@${item.handle}`
              const isFollowing =
                user?.following?.includes(item._id) || user?.following?.includes(item.id)

              return (
                <Link
                  key={item._id || item.id}
                  to={`/${handle.replace('@', '')}`}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-white/10 bg-base-200/80 hover:bg-base-200 transition-all group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={
                        item.avatar ||
                        `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(item.name)}`
                      }
                      alt={item.name}
                      className="h-12 w-12 rounded-full object-cover shrink-0 bg-base-300 border border-white/10"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white text-sm truncate">{handle}</span>
                        {item.verified && (
                          <FiCheckCircle size={14} className="text-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-white/50 truncate">{item.name}</p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleFollowToggle(e, item)}
                    className={`btn btn-sm text-xs font-semibold px-4 rounded-xl shrink-0 transition-all ${
                      isFollowing
                        ? 'bg-white/10 hover:bg-white/20 text-white border-0'
                        : 'bg-primary hover:bg-primary/90 text-white border-0'
                    }`}
                  >
                    {isFollowing ? (
                      <span className="flex items-center gap-1.5">
                        <FiUserCheck size={14} /> Unfollow
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <FiUserPlus size={14} /> Follow
                      </span>
                    )}
                  </button>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
