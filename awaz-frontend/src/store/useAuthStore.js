import { create } from 'zustand'

const getStoredTheme = () => {
  if (typeof window === 'undefined') return 'white'
  return localStorage.getItem('awaz-theme') || 'white'
}

const getStoredSession = () => {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('awaz-session')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const getStoredRegisteredUsers = () => {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('awaz-registered-users')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const persistRegisteredUsers = (users) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('awaz-registered-users', JSON.stringify(users))
  }
}

// Frontend-only mock auth store for now.
// Backend integration (JWT, /api/auth routes) will replace the mock calls later.
const useAuthStore = create((set, get) => ({
  user: getStoredSession(),
  isAuthenticated: Boolean(getStoredSession()),
  isLoading: false,
  theme: getStoredTheme(),
  registeredUsers: getStoredRegisteredUsers(),

  setTheme: (theme) => {
    if (typeof window !== 'undefined') localStorage.setItem('awaz-theme', theme)
    set({ theme })
  },

  persistSession: (user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('awaz-session', JSON.stringify(user))
    }
  },

  syncRegisteredUsers: () => {
    set({ registeredUsers: getStoredRegisteredUsers() })
  },

  updateProfile: ({ name, handle }) => {
    const current = get().user
    if (!current) return
    const updatedUser = { ...current, name, handle }
    set((state) => {
      const nextUsers = state.registeredUsers.map((entry) => entry.id === updatedUser.id ? { ...entry, ...updatedUser } : entry)
      if (typeof window !== 'undefined') localStorage.setItem('awaz-registered-users', JSON.stringify(nextUsers))
      return { user: updatedUser, registeredUsers: nextUsers }
    })
  },

  updatePassword: (oldPassword, newPassword) => {
    const current = get().user
    if (!current) return true
    if (oldPassword !== '123456') return false
    return true
  },

  login: async ({ email, password }) => {
    set({ isLoading: true })
    await new Promise((r) => setTimeout(r, 900))
    const profile = {
      id: 'u_001',
      name: 'Aarav Kumar',
      handle: '@aarav.reports',
      avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Aarav',
      verified: false,
      password: '123456',
    }
    set((state) => {
      const nextUsers = state.registeredUsers.some((entry) => entry.id === profile.id)
        ? state.registeredUsers.map((entry) => entry.id === profile.id ? { ...entry, ...profile } : entry)
        : [...state.registeredUsers, profile]
      persistRegisteredUsers(nextUsers)
      get().persistSession(profile)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('awaz-users-updated', { detail: nextUsers }))
      }
      return {
        isLoading: false,
        isAuthenticated: true,
        user: profile,
        registeredUsers: nextUsers,
      }
    })
    return true
  },

  signup: async ({ name, email, password }) => {
    set({ isLoading: true })
    await new Promise((r) => setTimeout(r, 900))
    const profile = {
      id: `u_${Date.now()}`,
      name,
      handle: '@' + name.toLowerCase().replace(/\s+/g, '.'),
      avatar: `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(name)}`,
      verified: false,
      password,
    }
    set((state) => {
      const nextUsers = state.registeredUsers.some((entry) => entry.id === profile.id)
        ? state.registeredUsers.map((entry) => entry.id === profile.id ? { ...entry, ...profile } : entry)
        : [...state.registeredUsers, profile]
      persistRegisteredUsers(nextUsers)
      get().persistSession(profile)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('awaz-users-updated', { detail: nextUsers }))
      }
      return {
        isLoading: false,
        isAuthenticated: true,
        user: profile,
        registeredUsers: nextUsers,
      }
    })
    return true
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('awaz-session')
    }
    set({ user: null, isAuthenticated: false })
  },
}))

export default useAuthStore
