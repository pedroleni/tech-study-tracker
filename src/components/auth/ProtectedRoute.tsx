import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from '@/lib/hooks/useAuth'

export function ProtectedRoute() {
  const { session, loading } = useAuth()

  if (loading) {
    return <p role="status">Comprobando sesión…</p>
  }

  return session ? <Outlet /> : <Navigate to="/login" replace />
}
