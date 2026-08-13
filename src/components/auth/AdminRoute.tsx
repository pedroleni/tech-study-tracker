import { Navigate, Outlet } from 'react-router-dom'

import { useProfile } from '@/lib/hooks/useProfile'

export function AdminRoute() {
  const { isAdmin, loading } = useProfile()

  if (loading) {
    return <p role="status">Comprobando permisos…</p>
  }

  return isAdmin ? <Outlet /> : <Navigate to="/" replace />
}
