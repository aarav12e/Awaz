import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useUser } from '@clerk/clerk-react'
import AppLayout from './components/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Waveform from './components/Waveform'
import useAuthStore from './store/useAuthStore'
import api from './lib/axios'

// Route-level code splitting — each page is only fetched when visited.
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const Feed = lazy(() => import('./pages/Feed'))
const Search = lazy(() => import('./pages/Search'))
const Explore = lazy(() => import('./pages/Explore'))
const Upload = lazy(() => import('./pages/Upload'))
const Profile = lazy(() => import('./pages/Profile'))
const Settings = lazy(() => import('./pages/Settings'))
const Messages = lazy(() => import('./pages/Messages'))
const Followers = lazy(() => import('./pages/Followers'))
const Following = lazy(() => import('./pages/Following'))
const UserProfile = lazy(() => import('./pages/UserProfile'))
const NotFound = lazy(() => import('./pages/NotFound'))
const About = lazy(() => import('./pages/About'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))
const Contact = lazy(() => import('./pages/Contact'))

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      <Waveform className="text-primary" />
    </div>
  )
}

export default function App() {
  const { theme, syncRegisteredUsers, isAuthenticated, fetchMe } = useAuthStore()
  const { user: clerkUser, isLoaded: clerkIsLoaded } = useUser()

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme)
      document.body.setAttribute('data-theme', theme)
    }
  }, [theme])

  // Sync Clerk User to Backend MongoDB & useAuthStore
  useEffect(() => {
    if (clerkIsLoaded && clerkUser) {
      const cu = clerkUser
      const email = cu.primaryEmailAddress?.emailAddress || ''
      const name = cu.fullName || cu.firstName || email.split('@')[0] || 'Reporter'
      const rawHandle = cu.username || email.split('@')[0] || 'user'
      const avatar = cu.imageUrl

      const current = useAuthStore.getState().user

      // If user is already synced for this exact email/clerkId, do not overwrite state!
      if (current && (current.clerkId === cu.id || current.email?.toLowerCase() === email.toLowerCase())) {
        return
      }

      api
        .post('/auth/clerk-sync', {
          clerkId: cu.id,
          email,
          name,
          handle: rawHandle,
          avatar,
        })
        .then(({ data }) => {
          if (data.success) {
            const sessionUser = { ...data.user, clerkId: cu.id, token: data.token }
            useAuthStore.setState({ user: sessionUser, isAuthenticated: true })
            localStorage.setItem('awaz-session', JSON.stringify(sessionUser))
          }
        })
        .catch((err) => {
          console.error('Clerk sync fallback active:', err)
          const fallbackSession = {
            id: cu.id,
            _id: cu.id,
            clerkId: cu.id,
            name,
            handle: rawHandle.startsWith('@') ? rawHandle : `@${rawHandle}`,
            email,
            avatar,
            verified: false,
            following: [],
            token: 'clerk-session',
          }
          useAuthStore.setState({ user: fallbackSession, isAuthenticated: true })
          localStorage.setItem('awaz-session', JSON.stringify(fallbackSession))
        })
    }
  }, [clerkUser, clerkIsLoaded])

  useEffect(() => {
    if (isAuthenticated) {
      fetchMe().catch(() => {})
    }
  }, [isAuthenticated, fetchMe])

  useEffect(() => {
    const handleUsersUpdated = () => syncRegisteredUsers()
    const handleStorageUpdate = (event) => {
      if (event.key === 'awaz-registered-users') {
        syncRegisteredUsers()
      }
    }

    window.addEventListener('awaz-users-updated', handleUsersUpdated)
    window.addEventListener('storage', handleStorageUpdate)

    return () => {
      window.removeEventListener('awaz-users-updated', handleUsersUpdated)
      window.removeEventListener('storage', handleStorageUpdate)
    }
  }, [syncRegisteredUsers])

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#14171C',
            color: '#F3EFE6',
            border: '1px solid #1E2228',
            fontSize: '13px',
            fontFamily: 'Inter, sans-serif',
          },
          success: { iconTheme: { primary: '#3FB68B', secondary: '#14171C' } },
          error: { iconTheme: { primary: '#E63946', secondary: '#14171C' } },
        }}
      />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Feed />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/search" element={<Search />} />
            <Route path="/reels" element={<Navigate to="/explore" replace />} />
            <Route path="/notifications" element={<div className="p-8 text-center text-accent">Notifications coming soon</div>} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/followers" element={<Followers />} />
            <Route path="/following" element={<Following />} />
            <Route path="/:handle/followers" element={<Followers />} />
            <Route path="/:handle/following" element={<Following />} />
            <Route path="/user/:userId" element={<UserProfile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/:handle" element={<UserProfile />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  )
}
