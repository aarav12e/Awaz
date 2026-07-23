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

    // ── Stub mock data to prevent crashes on Explore / Messages ──
    registeredUsers: [],
    following: (session && session.following) || [],
    messages: {},
    _connTick: 0,
    getConnectionStatus: () => 'none',
    getIncomingRequests: () => [],
    sendConnectRequest: () => {},
    acceptConnectRequest: () => {},
    declineConnectRequest: () => {},
    sendMessage: () => {},

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
            following: sessionData.following || [],
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
            following: sessionData.following || [],
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
    updateProfile: async (fields) => {
      try {
        const { data } = await api.put('/users/me', fields)
        if (data.success) {
          const current = get().user || {}
          const updatedSession = { ...current, ...data.user, token: current.token || 'clerk-session' }
          ls.set('awaz-session', updatedSession)
          set({ user: updatedSession })
          return { error: null, user: updatedSession }
        }
      } catch (err) {
        // Local fallback update if backend fails
        const current = get().user || {}
        const updatedSession = { ...current, ...fields, token: current.token || 'clerk-session' }
        ls.set('awaz-session', updatedSession)
        set({ user: updatedSession })
        return { error: null, user: updatedSession }
      }
    },

    fetchMe: async () => {
      try {
        const { data } = await api.get('/auth/me')
        if (data.success) {
          const current = get().user || {}
          const updatedSession = { ...current, ...data.user }
          ls.set('awaz-session', updatedSession)
          set({ 
            user: updatedSession, 
            isAuthenticated: true,
            following: updatedSession.following || [],
          })
        }
      } catch (err) {
        // Keep local session active on network error / refresh
      }
    },

    // ── Follow / Unfollow ─────────────────────────────────────────────────
    followUser: async (targetUserId) => {
      try {
        const { data } = await api.put(`/users/${targetUserId}/follow`)
        if (data.success) {
           // Optimistic / immediate state update
           const currentFollowing = get().following;
           if (!currentFollowing.includes(targetUserId)) {
             const newFollowing = [...currentFollowing, targetUserId];
             set({ following: newFollowing });
             const session = get().user;
             if (session) {
                const updated = { ...session, following: newFollowing };
                ls.set('awaz-session', updated);
                set({ user: updated });
             }
           }
           await get().fetchMe() 
        }
      } catch (err) {
        console.error('Follow failed', err)
      }
    },
    
    unfollowUser: async (targetUserId) => {
      try {
        const { data } = await api.put(`/users/${targetUserId}/follow`)
        if (data.success) {
           // Optimistic / immediate state update
           const currentFollowing = get().following;
           if (currentFollowing.includes(targetUserId)) {
             const newFollowing = currentFollowing.filter(id => id !== targetUserId);
             set({ following: newFollowing });
             const session = get().user;
             if (session) {
                const updated = { ...session, following: newFollowing };
                ls.set('awaz-session', updated);
                set({ user: updated });
             }
           }
           await get().fetchMe()
        }
      } catch (err) {
        console.error('Unfollow failed', err)
      }
    },
  }
})

export default useAuthStore
