import { Navigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import useAuthStore from '../store/useAuthStore'

export default function ProtectedRoute({ children }) {
  const storeAuth = useAuthStore((s) => s.isAuthenticated)
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded && !storeAuth) return null

  const isAuth = Boolean(isSignedIn || storeAuth)

  if (!isAuth) return <Navigate to="/login" replace />
  return children
}
