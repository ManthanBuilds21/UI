import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

interface ProtectedRouteProps {
  role?: 'user' | 'admin'
}

export default function ProtectedRoute({ role }: ProtectedRouteProps) {
  const { isReady, session } = useAuth()

  if (!isReady) {
    return null
  }

  if (!session) {
    return <Navigate to="/" replace />
  }

  if (role && session.user.role !== role) {
    return <Navigate to="/website" replace />
  }

  return <Outlet />
}
