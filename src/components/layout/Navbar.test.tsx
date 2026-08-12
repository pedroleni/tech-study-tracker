import { fireEvent, render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const authState = vi.hoisted(() => ({
  session: null as { user: { id: string } } | null,
  signOut: vi.fn(),
}))

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({
    session: authState.session,
    signOut: authState.signOut,
  }),
}))

import { Navbar } from './Navbar'

describe('Navbar', () => {
  beforeEach(() => {
    authState.session = null
    authState.signOut.mockReset()
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }))
  })

  it('hides logout without an active session', () => {
    render(<Navbar />)

    expect(screen.getByText('Tech Study Tracker')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cerrar sesión' })).not.toBeInTheDocument()
  })

  it('shows logout with an active session and calls signOut', () => {
    authState.session = { user: { id: 'user-1' } }
    render(<Navbar />)

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }))

    expect(authState.signOut).toHaveBeenCalledOnce()
  })

  it('has no detectable accessibility violations', async () => {
    authState.session = { user: { id: 'user-1' } }
    const { container } = render(<Navbar />)

    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toEqual([])
  })
})
