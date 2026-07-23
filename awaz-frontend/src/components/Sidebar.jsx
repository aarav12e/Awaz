import { useState, useEffect } from 'react'
import { NavLink, useNavigate, Link } from 'react-router-dom'
import { FiHome, FiSearch, FiCompass, FiPlayCircle, FiMessageCircle, FiHeart, FiPlusSquare, FiMenu, FiSettings, FiLogOut, FiUser } from 'react-icons/fi'
import { useUser, useClerk } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
import useAuthStore from '../store/useAuthStore'
import api from '../lib/axios'

const links = [
  { to: '/', label: 'Home', icon: FiHome, end: true },
  { to: '/search', label: 'Search', icon: FiSearch },
  { to: '/explore', label: 'Explore', icon: FiCompass },
  { to: '/reels', label: 'Reels', icon: FiPlayCircle },
  { to: '/messages', label: 'Messages', icon: FiMessageCircle, badge: true },
  { to: '/notifications', label: 'Notifications', icon: FiHeart },
  { to: '/upload', label: 'Create', icon: FiPlusSquare },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const { user: storeUser, logout, isAuthenticated } = useAuthStore()
  const { user: clerkUser } = useUser()
  const clerk = useClerk()

  const user = storeUser || (clerkUser ? {
    avatar: clerkUser.imageUrl,
    name: clerkUser.fullName || clerkUser.firstName || 'Reporter',
    handle: `@${clerkUser.username || 'user'}`,
  } : null)

  const isLoggedIn = Boolean(user || isAuthenticated || clerkUser)
  const [menuOpen, setMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!isLoggedIn) return

    const fetchUnread = async () => {
      try {
        const { data } = await api.get('/messages/unread-count')
        if (data.success) {
          setUnreadCount(data.unreadCount || 0)
        }
      } catch (err) {
        // Silent catch
      }
    }

    fetchUnread()
    const interval = setInterval(fetchUnread, 4000)
    return () => clearInterval(interval)
  }, [isLoggedIn])

  const handleLogout = async () => {
    if (clerk?.signOut) {
      try {
        await clerk.signOut()
      } catch (e) {
        console.error(e)
      }
    }
    logout()
    toast('Signed out', { icon: '👋' })
    navigate('/login')
  }

  return (
    <aside className="hidden md:flex md:flex-col md:w-[244px] shrink-0 h-screen sticky top-0 border-r border-white/10 px-3 py-5 bg-base-100 z-50">
      <Link to="/" className="flex items-center gap-2 px-3 mb-8 mt-2 hover:opacity-80 transition-opacity">
        <span className="waveform text-primary">
          <span></span><span></span><span></span><span></span><span></span>
        </span>
        <span className="font-display text-2xl tracking-tight">AWAZ</span>
      </Link>

      <nav className="flex-1 space-y-1">
        {links.map(({ to, label, icon: Icon, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-4 px-3 py-3 rounded-lg text-[15px] transition-all group hover:bg-white/5 relative ${
                isActive ? 'font-bold' : 'font-normal'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative shrink-0">
                  <Icon size={24} className={`transition-transform group-hover:scale-105 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
                  {badge && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-mono font-bold text-white shadow-sm">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* Profile Link */}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-4 px-3 py-3 rounded-lg text-[15px] transition-all group hover:bg-white/5 ${
              isActive ? 'font-bold' : 'font-normal'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt="Profile" 
                  className={`w-6 h-6 rounded-full object-cover shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'ring-[2px] ring-offset-2 ring-offset-base-100 ring-bone' : ''}`} 
                />
              ) : (
                <FiUser size={24} className={`shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
              )}
              <span>Profile</span>
            </>
          )}
        </NavLink>
      </nav>

      {/* More Menu */}
      <div className="mt-4 relative">
        {menuOpen && (
          <div className="absolute bottom-[calc(100%+10px)] left-0 w-[220px] flex flex-col gap-1 rounded-2xl bg-[#262626] p-2 shadow-xl z-50">
            <Link
              to="/settings"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors hover:bg-white/10"
            >
              <FiSettings size={18} /> Settings
            </Link>
            <div className="h-px bg-white/10 mx-2 my-1" />
            <button
              onClick={() => {
                setMenuOpen(false)
                handleLogout()
              }}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition-colors hover:bg-white/10"
            >
              <FiLogOut size={18} /> Log out
            </button>
          </div>
        )}
        
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`flex w-full items-center gap-4 px-3 py-3 rounded-lg text-[15px] transition-all group hover:bg-white/5 ${menuOpen ? 'font-bold' : 'font-normal'}`}
        >
          <FiMenu size={24} className={`shrink-0 transition-transform group-hover:scale-105 ${menuOpen ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
          <span>More</span>
        </button>
      </div>
    </aside>
  )
}
