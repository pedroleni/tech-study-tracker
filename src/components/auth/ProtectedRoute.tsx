import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from '@/lib/hooks/useAuth'

export function ProtectedRoute() {
  const { session, loading, isPasswordRecovery } = useAuth()

  if (loading) {
    return <p role="status">Comprobando sesión…</p>
  }

  if (isPasswordRecovery) {
    return <Navigate to="/nueva-password" replace />
  }

  return session ? <Outlet /> : <Navigate to="/login" replace />
}
