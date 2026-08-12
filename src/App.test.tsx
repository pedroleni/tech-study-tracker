import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const authState = vi.hoisted(() => ({
  session: null as { user: { id: string } } | null,
  loading: false,
  signOut: vi.fn(),
}))

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({
    user: authState.session?.user ?? null,
    session: authState.session,
    loading: authState.loading,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: authState.signOut,
  }),
}))

import App from './App'

describe('App routes', () => {
  beforeEach(() => {
    authState.session = null
    authState.loading = false
    window.history.pushState({}, '', '/')
  })

  it('redirects an unauthenticated visitor from / to /login', async () => {
    render(<App />)

    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument()
    await waitFor(() => expect(window.location.pathname).toBe('/login'))
  })

  it('shows the dashboard at / for an authenticated visitor', () => {
    authState.session = { user: { id: 'user-1' } }

    render(<App />)

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/')
  })
})
