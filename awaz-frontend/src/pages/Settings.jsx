import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiCheck, FiCamera, FiLock, FiMoon, FiGlobe } from 'react-icons/fi'
import useAuthStore from '../store/useAuthStore'
import api from '../lib/axios'

const themeOptions = [
  { value: 'white', label: 'White', description: 'Clean and bright' },
  { value: 'black', label: 'Black', description: 'Dark and modern' },
]

export default function Settings() {
  const { user, updateProfile, theme, setTheme } = useAuthStore()

  const [name, setName] = useState(user?.name || '')
  const [handle, setHandle] = useState(user?.handle?.replace('@', '') || '')
  const [website, setWebsite] = useState(user?.website || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [gender, setGender] = useState(user?.gender || 'Prefer not to say')
  const [avatar, setAvatar] = useState(
    user?.avatar || `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(user?.name || 'User')}`
  )

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !handle.trim()) {
      toast.error('Name and Username are required')
      return
    }

    setLoading(true)
    try {
      const payload = {
        name: name.trim(),
        handle: `@${handle.trim().replace(/^@/, '')}`,
        website: website.trim(),
        bio: bio.trim(),
        gender,
        avatar,
      }

      // 1. Send update to backend API
      const { data } = await api.put('/users/me', payload)
      if (data.success) {
        updateProfile(payload)
        toast.success('Profile updated successfully!')
      }
    } catch (err) {
      console.error('Failed to update profile:', err)
      // Local fallback
      updateProfile({
        name: name.trim(),
        handle: `@${handle.trim().replace(/^@/, '')}`,
        website: website.trim(),
        bio: bio.trim(),
        gender,
        avatar,
      })
      toast.success('Profile saved locally')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = () => {
    const newAvatarUrl = prompt('Enter image URL for profile photo:', avatar)
    if (newAvatarUrl && newAvatarUrl.trim()) {
      setAvatar(newAvatarUrl.trim())
      toast.success('Profile photo updated')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-2">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <Link to="/profile" className="inline-flex items-center gap-2 text-sm text-accent hover:text-white transition-colors">
          <FiArrowLeft size={16} /> Back to profile
        </Link>
        <h1 className="font-display text-xl font-bold">Edit Profile</h1>
        <div className="w-16" />
      </div>

      {/* Profile Photo Header Card */}
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-base-200/80 p-4">
        <div className="flex items-center gap-4">
          <img
            src={avatar}
            alt={name}
            className="h-14 w-14 rounded-full bg-base-300 object-cover ring-2 ring-primary/40"
          />
          <div>
            <p className="font-semibold text-base">{handle}</p>
            <p className="text-sm text-accent">{name}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAvatarChange}
          className="btn btn-sm btn-primary gap-2 text-xs font-semibold"
        >
          <FiCamera size={14} /> Change profile photo
        </button>
      </div>

      {/* Main Edit Profile Form */}
      <form onSubmit={handleProfileSubmit} className="rounded-2xl border border-white/10 bg-base-200/50 p-6 space-y-5">
        {/* Name */}
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-accent mb-1.5 block">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input input-bordered w-full bg-base-100/70 text-sm focus:border-primary focus:outline-none"
            placeholder="Aarav Kumar"
          />
          <p className="text-[11px] text-accent mt-1">
            Help people discover your account by using the name you're known by.
          </p>
        </div>

        {/* Username */}
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-accent mb-1.5 block">Username</label>
          <input
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            className="input input-bordered w-full bg-base-100/70 text-sm font-mono focus:border-primary focus:outline-none"
            placeholder="aarav12f"
          />
        </div>

        {/* Website */}
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-accent mb-1.5 block">Website</label>
          <div className="relative">
            <FiGlobe className="absolute left-3 top-3 text-accent" size={16} />
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="input input-bordered w-full pl-9 bg-base-100/70 text-sm focus:border-primary focus:outline-none"
              placeholder="Website"
            />
          </div>
          <p className="text-[11px] text-accent/80 mt-1.5 leading-normal">
            Editing your links is only available on mobile. Visit the Awaz app and edit your profile to change the websites in your bio.
          </p>
        </div>

        {/* Bio */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-accent">Bio</label>
            <span className={`text-[11px] font-mono ${bio.length > 150 ? 'text-error font-bold' : 'text-accent'}`}>
              {bio.length} / 150
            </span>
          </div>
          <textarea
            rows={4}
            maxLength={150}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="textarea textarea-bordered w-full bg-base-100/70 text-sm focus:border-primary focus:outline-none resize-none"
            placeholder="Hi, I'm Aarav..."
          />
        </div>

        {/* Gender */}
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-accent mb-1.5 block">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="select select-bordered w-full bg-base-100/70 text-sm focus:border-primary focus:outline-none"
          >
            <option value="Prefer not to say">Prefer not to say</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Custom">Custom</option>
          </select>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button type="submit" disabled={loading} className="btn btn-primary px-8 gap-2">
            <FiCheck size={16} /> Submit
          </button>
        </div>
      </form>

      {/* Theme Settings Section */}
      <section className="rounded-2xl border border-white/10 bg-base-200/50 p-5 space-y-3">
        <div className="flex items-center gap-3 mb-2">
          <FiMoon size={18} className="text-primary" />
          <h2 className="font-display font-semibold text-base">Theme Mode</h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={`rounded-xl border p-3 text-left transition-all ${
                theme === option.value
                  ? 'border-primary bg-primary/10'
                  : 'border-white/10 bg-base-100/50 hover:border-primary/50'
              }`}
            >
              <div className="font-semibold text-sm">{option.label}</div>
              <div className="text-xs text-accent">{option.description}</div>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
