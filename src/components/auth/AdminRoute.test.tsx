import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  session: { user: { id: 'user-1' } } as { user: { id: string } } | null,
  authLoading: false,
  isAdmin: true,
  profileLoading: false,
}))

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({ session: state.session, loading: state.authLoading }),
}))
vi.mock('@/lib/hooks/useProfile', () => ({
  useProfile: () => ({ isAdmin: state.isAdmin, loading: state.profileLoading }),
}))

import { AdminRoute } from './AdminRoute'
import { ProtectedRoute } from './ProtectedRoute'

function renderRoutes() {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route path="/" element={<h1>Inicio</h1>} />
        <Route path="/login" element={<h1>Iniciar sesión</h1>} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<h1>Administración</h1>} />
          </Route>
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('AdminRoute nested inside ProtectedRoute', () => {
  beforeEach(() => {
    state.session = { user: { id: 'user-1' } }
    state.authLoading = false
    state.isAdmin = true
    state.profileLoading = false
  })

  it('renders protected content for an admin session', () => {
    renderRoutes()
    expect(screen.getByRole('heading', { name: 'Administración' })).toBeInTheDocument()
  })

  it('redirects an authenticated non-admin to the public home', async () => {
    state.isAdmin = false
    renderRoutes()
    expect(await screen.findByRole('heading', { name: 'Inicio' })).toBeInTheDocument()
  })

  it('waits for the profile instead of redirecting early', async () => {
    state.isAdmin = false
    state.profileLoading = true
    renderRoutes()

    expect(screen.getByRole('status')).toHaveTextContent('Comprobando permisos…')
    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'Inicio' })).not.toBeInTheDocument(),
    )
  })
})
