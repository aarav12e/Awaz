import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiArrowLeft, FiUserCheck } from 'react-icons/fi'
import useAuthStore from '../store/useAuthStore'
import api from '../lib/axios'

export default function Following() {
  const { handle } = useParams()
  const { user } = useAuthStore()
  const targetHandle = handle ? handle.replace('@', '') : (user ? user.handle : '')

  const [following, setFollowing] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!targetHandle) return
    const fetchFollowing = async () => {
      setLoading(true)
      try {
        const { data } = await api.get(`/users/${targetHandle}/following`)
        if (data.success) {
          setFollowing(data.following)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchFollowing()
  }, [targetHandle])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 rounded-[24px] border border-white/10 bg-base-200/70 px-4 py-3 sm:px-5">
        <button onClick={() => window.history.back()} className="btn btn-sm btn-ghost btn-square">
          <FiArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-display text-lg tracking-tight">Following</h1>
          {!loading && <p className="text-xs text-accent font-mono">{following.length} people</p>}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-8 text-center text-accent text-sm">Loading...</div>
      ) : following.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-[24px] border border-dashed border-white/10 bg-base-200/40 py-16 px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <FiUserCheck className="text-primary" size={28} />
          </div>
          <div>
            <p className="font-display text-base">Not following anyone</p>
            <p className="mt-1 text-sm text-accent">When {handle ? `@${targetHandle}` : 'you'} follow someone, they'll appear here.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {following.map((u) => (
            <Link
              key={u._id}
              to={`/user/${u.handle}`}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-base-200/70 px-4 py-3 hover:bg-white/5 transition-colors"
            >
              <img src={u.avatar} alt={u.name} className="h-10 w-10 rounded-full bg-base-300 shrink-0 object-cover" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">{u.name}</p>
                <p className="text-xs font-mono text-accent truncate">{u.handle}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
