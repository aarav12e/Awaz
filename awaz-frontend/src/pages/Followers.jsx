import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiArrowLeft, FiUsers } from 'react-icons/fi'
import useAuthStore from '../store/useAuthStore'
import api from '../lib/axios'

export default function Followers() {
  const { handle } = useParams()
  const { user } = useAuthStore()
  const targetHandle = handle ? handle.replace('@', '') : (user ? user.handle : '')

  const [followers, setFollowers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!targetHandle) return
    const fetchFollowers = async () => {
      setLoading(true)
      try {
        const { data } = await api.get(`/users/${targetHandle}/followers`)
        if (data.success) {
          setFollowers(data.followers)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchFollowers()
  }, [targetHandle])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 rounded-[24px] border border-white/10 bg-base-200/70 px-4 py-3 sm:px-5">
        <button onClick={() => window.history.back()} className="btn btn-sm btn-ghost btn-square">
          <FiArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-display text-lg tracking-tight">Followers</h1>
          {!loading && <p className="text-xs text-accent font-mono">{followers.length} people follow {handle ? `@${targetHandle}` : 'you'}</p>}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-8 text-center text-accent text-sm">Loading...</div>
      ) : followers.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-[24px] border border-dashed border-white/10 bg-base-200/40 py-16 px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <FiUsers className="text-primary" size={28} />
          </div>
          <div>
            <p className="font-display text-base">No followers yet</p>
            <p className="mt-1 text-sm text-accent">When someone follows {handle ? `@${targetHandle}` : 'you'}, they'll appear here.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {followers.map((u) => (
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
