import { create } from 'zustand'
import api from '../lib/axios'

// ─── localStorage helpers ────────────────────────────────────────────────────
const ls = {
  get: (key, fallback = null) => {
    if (typeof window === 'undefined') return fallback
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : fallback
    } catch { return fallback }
  },
  set: (key, value) => {
    if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(value))
  },
  remove: (key) => {
    if (typeof window !== 'undefined') localStorage.removeItem(key)
  },
}

// ─── Store ───────────────────────────────────────────────────────────────────
const useAuthStore = create((set, get) => {
  // session is { token, ...user }
  const session = ls.get('awaz-session')

  return {
    user: session && session.token ? session : null,
    isAuthenticated: Boolean(session && session.token),
    isLoading: false,
    theme: ls.get('awaz-theme', 'white'),
    
    // Theme
    setTheme: (theme) => {
      ls.set('awaz-theme', theme)
      set({ theme })
    },

    // ── Auth ──────────────────────────────────────────────────────────────
    login: async ({ email, password }) => {
      set({ isLoading: true })
      try {
        const { data } = await api.post('/auth/login', { email, password })
        if (data.success) {
          const sessionData = { ...data.user, token: data.token }
          ls.set('awaz-session', sessionData)
          set({
            isLoading: false,
            isAuthenticated: true,
            user: sessionData,
          })
          return { error: null }
        }
      } catch (err) {
        set({ isLoading: false })
        return { error: err.response?.data?.message || 'Login failed' }
      }
    },

    signup: async ({ name, email, password }) => {
      set({ isLoading: true })
      try {
        const { data } = await api.post('/auth/signup', { name, email, password })
        if (data.success) {
          const sessionData = { ...data.user, token: data.token }
          ls.set('awaz-session', sessionData)
          set({
            isLoading: false,
            isAuthenticated: true,
            user: sessionData,
          })
          return { error: null }
        }
      } catch (err) {
        set({ isLoading: false })
        return { error: err.response?.data?.message || 'Signup failed' }
      }
    },

    logout: () => {
      ls.remove('awaz-session')
      set({ user: null, isAuthenticated: false })
    },

    // ── Profile ───────────────────────────────────────────────────────────
    updateProfile: async ({ name, handle }) => {
      try {
        const { data } = await api.put('/users/me', { name, handle })
        if (data.success) {
          const current = get().user
          const updatedSession = { ...current, ...data.user }
          ls.set('awaz-session', updatedSession)
          set({ user: updatedSession })
          return { error: null }
        }
      } catch (err) {
        return { error: err.response?.data?.message || 'Update failed' }
      }
    },

    fetchMe: async () => {
      try {
        const { data } = await api.get('/auth/me')
        if (data.success) {
          const current = get().user
          const updatedSession = { ...current, ...data.user }
          ls.set('awaz-session', updatedSession)
          set({ user: updatedSession, isAuthenticated: true })
        }
      } catch (err) {
        ls.remove('awaz-session')
        set({ user: null, isAuthenticated: false })
      }
    },

    // ── Follow / Unfollow ─────────────────────────────────────────────────
    followUser: async (targetUserId) => {
      try {
        const { data } = await api.put(`/users/${targetUserId}/follow`)
        if (data.success) {
           await get().fetchMe() // refresh current user to update following list if we store it
        }
      } catch (err) {
        console.error('Follow failed', err)
      }
    },
    
    unfollowUser: async (targetUserId) => {
      try {
        // Our backend uses the same endpoint for follow/unfollow toggle
        const { data } = await api.put(`/users/${targetUserId}/follow`)
        if (data.success) {
           await get().fetchMe()
        }
      } catch (err) {
        console.error('Unfollow failed', err)
      }
    },
  }
})

export default useAuthStore
