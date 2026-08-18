import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({
    session: { user: { id: 'user-1' } },
    loading: false,
    isPasswordRecovery: true,
  }),
}))

import { ProtectedRoute } from './ProtectedRoute'

describe('ProtectedRoute', () => {
  it('redirects a password recovery session instead of rendering protected content', () => {
    render(
      <MemoryRouter initialEntries={['/favoritos']}>
        <Routes>
          <Route path="/nueva-password" element={<h1>Nueva contraseña</h1>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/favoritos" element={<h1>Favoritos</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Nueva contraseña' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Favoritos' })).not.toBeInTheDocument()
  })
})
