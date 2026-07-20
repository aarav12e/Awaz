import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { FiHome, FiCompass, FiPlusSquare, FiUser, FiLogOut, FiMessageCircle, FiSettings, FiChevronDown } from 'react-icons/fi'
import toast from 'react-hot-toast'
import useAuthStore from '../store/useAuthStore'

const links = [
  { to: '/', label: 'Feed', icon: FiHome, end: true },
  { to: '/explore', label: 'Explore', icon: FiCompass },
  { to: '/upload', label: 'Report', icon: FiPlusSquare },
  { to: '/messages', label: 'Messages', icon: FiMessageCircle },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast('Signed out', { icon: '👋' })
    navigate('/login')
  }

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 shrink-0 h-screen sticky top-0 border-r border-base-300 hairline px-4 py-6">
      <div className="flex items-center gap-2 px-2 mb-10">
        <span className="waveform text-primary">
          <span></span><span></span><span></span><span></span><span></span>
        </span>
        <span className="font-display text-2xl tracking-tight">AWAZ</span>
      </div>

      <nav className="flex-1 space-y-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-base-300 text-bone'
                  : 'text-accent hover:text-bone hover:bg-base-200'
              }`
            }
          >
            <Icon size={19} />
            {label}
          </NavLink>
        ))}
      </nav>

      {user && (
        <div className="mt-4 border-t border-base-300 hairline pt-4">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-base-200/70 px-3 py-3 text-left transition-colors hover:bg-base-200"
          >
            <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full bg-base-300" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-xs font-mono text-accent">{user.handle}</p>
            </div>
            <FiChevronDown className={`shrink-0 text-accent transition-transform ${menuOpen ? 'rotate-180' : ''}`} size={16} />
          </button>

          {menuOpen && (
            <div className="mt-2 flex flex-col gap-2 rounded-2xl border border-white/10 bg-base-200/70 p-2">
              <NavLink
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-accent transition-colors hover:bg-base-200 hover:text-bone"
              >
                <FiUser size={16} /> Profile
              </NavLink>
              <NavLink
                to="/settings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-accent transition-colors hover:bg-base-200 hover:text-bone"
              >
                <FiSettings size={16} /> Settings
              </NavLink>
              <button
                onClick={() => {
                  setMenuOpen(false)
                  handleLogout()
                }}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-accent transition-colors hover:bg-base-200 hover:text-primary"
              >
                <FiLogOut size={16} /> Sign out
              </button>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
