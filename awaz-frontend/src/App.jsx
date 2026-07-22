import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AppLayout from './components/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Waveform from './components/Waveform'
import useAuthStore from './store/useAuthStore'

// Route-level code splitting — each page is only fetched when visited.
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const Feed = lazy(() => import('./pages/Feed'))
const Explore = lazy(() => import('./pages/Explore'))
const Upload = lazy(() => import('./pages/Upload'))
const Profile = lazy(() => import('./pages/Profile'))
const Settings = lazy(() => import('./pages/Settings'))
const Messages = lazy(() => import('./pages/Messages'))
const Followers = lazy(() => import('./pages/Followers'))
const Following = lazy(() => import('./pages/Following'))
const UserProfile = lazy(() => import('./pages/UserProfile'))
const NotFound = lazy(() => import('./pages/NotFound'))

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      <Waveform className="text-primary" />
    </div>
  )
}

export default function App() {
  const { theme, syncRegisteredUsers } = useAuthStore()

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme)
      document.body.setAttribute('data-theme', theme)
    }
  }, [theme])

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

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Feed />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/followers" element={<Followers />} />
            <Route path="/following" element={<Following />} />
            <Route path="/user/:userId" element={<UserProfile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/messages" element={<Messages />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  )
}
