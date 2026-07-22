import { Link } from 'react-router-dom'
import { FiArrowLeft, FiUserCheck } from 'react-icons/fi'
import useAuthStore from '../store/useAuthStore'

export default function Following() {
  const { following, registeredUsers, unfollowUser } = useAuthStore()
  const followingUsers = registeredUsers.filter((u) => following.includes(u.id))

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 rounded-[24px] border border-white/10 bg-base-200/70 px-4 py-3 sm:px-5">
        <Link to="/profile" className="btn btn-sm btn-ghost btn-square">
          <FiArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-display text-lg tracking-tight">Following</h1>
          <p className="text-xs text-accent font-mono">You follow {following.length} people</p>
        </div>
      </div>

      {/* List */}
      {followingUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-[24px] border border-dashed border-white/10 bg-base-200/40 py-16 px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <FiUserCheck className="text-primary" size={28} />
          </div>
          <div>
            <p className="font-display text-base">Not following anyone yet</p>
            <p className="mt-1 text-sm text-accent">Follow reporters to see their dispatches.</p>
          </div>
          <Link to="/explore" className="btn btn-sm btn-primary mt-1">
            Explore Reporters
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {followingUsers.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-base-200/70 px-4 py-3"
            >
              <img src={u.avatar} alt={u.name} className="h-10 w-10 rounded-full bg-base-300 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">{u.name}</p>
                <p className="text-xs font-mono text-accent truncate">{u.handle}</p>
              </div>
              <button
                onClick={() => unfollowUser(u.id)}
                className="btn btn-xs btn-ghost border border-white/10 text-accent hover:text-primary hover:border-primary/30"
              >
                Unfollow
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
