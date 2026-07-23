import { NavLink } from 'react-router-dom'
import { FiHome, FiCompass, FiPlusSquare, FiUser, FiMessageCircle, FiSettings } from 'react-icons/fi'

const links = [
  { to: '/', icon: FiHome, end: true, label: 'Feed' },
  { to: '/explore', icon: FiCompass, label: 'Explore' },
  { to: '/upload', icon: FiPlusSquare, label: 'Report' },
  { to: '/messages', icon: FiMessageCircle, label: 'Chats' },
  { to: '/profile', icon: FiUser, label: 'Profile' },
]

export default function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-base-200/95 backdrop-blur border-t border-base-300 hairline">
      <div className="flex items-center justify-around py-2">
        {links.map(({ to, icon: Icon, end, label }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-4 py-1.5 text-[10px] font-mono uppercase tracking-wide ${
                isActive ? 'text-primary' : 'text-accent'
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
