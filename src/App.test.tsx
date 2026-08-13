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

  it('shows the public home without redirecting an unauthenticated visitor', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', {
        name: 'Apuntes prácticos para aprender tecnología con contexto',
      }),
    ).toBeInTheDocument()
    expect(window.location.pathname).toBe('/')
  })

  it('shows the same public home at / for an authenticated visitor', () => {
    authState.session = { user: { id: 'user-1' } }

    render(<App />)

    expect(
      screen.getByRole('heading', {
        name: 'Apuntes prácticos para aprender tecnología con contexto',
      }),
    ).toBeInTheDocument()
    expect(window.location.pathname).toBe('/')
  })

  it('redirects an unauthenticated visitor from favorites to login', async () => {
    window.history.pushState({}, '', '/favoritos')

    render(<App />)

    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument()
    await waitFor(() => expect(window.location.pathname).toBe('/login'))
  })
})
