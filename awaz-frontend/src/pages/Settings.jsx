import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiCheck, FiLock, FiMoon, FiUser } from 'react-icons/fi'
import useAuthStore from '../store/useAuthStore'

const themeOptions = [
  { value: 'white', label: 'White', description: 'Clean and bright' },
  { value: 'black', label: 'Black', description: 'Dark and modern' },
]

export default function Settings() {
  const { user, updateProfile, updatePassword, theme, setTheme } = useAuthStore()
  const [displayName, setDisplayName] = useState(user?.name ?? '')
  const [username, setUsername] = useState(user?.handle?.replace('@', '') ?? '')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const handleProfileSave = (e) => {
    e.preventDefault()
    if (!displayName.trim() || !username.trim()) {
      toast.error('Display name and username are required')
      return
    }

    updateProfile({
      name: displayName.trim(),
      handle: `@${username.trim().replace(/^@/, '')}`,
    })
    toast.success('Profile updated')
  }

  const handlePasswordSave = (e) => {
    e.preventDefault()
    if (!oldPassword || !newPassword) {
      toast.error('Fill in both password fields')
      return
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }

    const updated = updatePassword(oldPassword, newPassword)
    if (!updated) {
      toast.error('Old password does not match')
      return
    }

    setOldPassword('')
    setNewPassword('')
    toast.success('Password updated')
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-accent">
        <Link to="/profile" className="inline-flex items-center gap-2 hover:text-bone">
          <FiArrowLeft size={16} /> Back to profile
        </Link>
      </div>

      <section className="rounded-[28px] border border-white/10 bg-gradient-to-br from-fuchsia-500/20 via-base-200 to-cyan-500/20 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-2xl bg-base-100/70 p-2.5">
            <FiUser size={18} className="text-primary" />
          </div>
          <div>
            <h1 className="font-display text-xl">Profile settings</h1>
            <p className="text-sm text-accent">Change your identity and keep your account secure.</p>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-3">
          <label className="block">
            <span className="text-xs uppercase tracking-[0.2em] text-accent">Display name</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 input input-bordered w-full bg-base-100/70"
              placeholder="Your name"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-[0.2em] text-accent">Username</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 input input-bordered w-full bg-base-100/70"
              placeholder="yourname"
            />
          </label>
          <button className="btn btn-primary gap-2">
            <FiCheck size={16} /> Save profile
          </button>
        </form>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-base-200/70 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-2xl bg-base-100/70 p-2.5">
            <FiLock size={18} className="text-primary" />
          </div>
          <div>
            <h2 className="font-display text-lg">Password change</h2>
            <p className="text-sm text-accent">Type your old password before choosing a new one.</p>
          </div>
        </div>

        <form onSubmit={handlePasswordSave} className="space-y-3">
          <label className="block">
            <span className="text-xs uppercase tracking-[0.2em] text-accent">Old password</span>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="mt-1 input input-bordered w-full bg-base-100/70"
              placeholder="Enter current password"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-[0.2em] text-accent">New password</span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 input input-bordered w-full bg-base-100/70"
              placeholder="At least 6 characters"
            />
          </label>
          <button className="btn btn-outline btn-primary gap-2">
            <FiLock size={16} /> Update password
          </button>
        </form>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-base-200/70 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-2xl bg-base-100/70 p-2.5">
            <FiMoon size={18} className="text-primary" />
          </div>
          <div>
            <h2 className="font-display text-lg">Theme palette</h2>
            <p className="text-sm text-accent">Pick a look that matches your mood.</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={`rounded-2xl border p-3 text-left transition-all ${theme === option.value ? 'border-primary bg-primary/10 shadow-[0_10px_30px_rgba(255,67,95,0.15)]' : 'border-white/10 bg-base-100/50 hover:border-primary/50'}`}
            >
              <div className="font-semibold">{option.label}</div>
              <div className="text-sm text-accent">{option.description}</div>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
