import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
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

vi.mock('@/lib/hooks/useProfile', () => ({
  useProfile: () => ({ isAdmin: false, loading: false }),
}))

import { Navbar } from './Navbar'

function renderNavbar() {
  return render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>,
  )
}

describe('Navbar', () => {
  beforeEach(() => {
    authState.session = null
    authState.signOut.mockReset()
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }))
  })

  it('hides logout without an active session', () => {
    renderNavbar()

    expect(screen.getByText('Tech Study Tracker')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cerrar sesión' })).not.toBeInTheDocument()
  })

  it('shows logout with an active session and calls signOut', () => {
    authState.session = { user: { id: 'user-1' } }
    renderNavbar()

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }))

    expect(authState.signOut).toHaveBeenCalledOnce()
  })

  it('opens the mobile menu and closes it after navigating', () => {
    renderNavbar()

    const menuButton = screen.getByRole('button', { name: 'Abrir menú' })
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(menuButton)

    expect(screen.getByRole('button', { name: 'Cerrar menú' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    const mobileMenu = screen.getByLabelText('Menú de navegación móvil')
    expect(mobileMenu).toBeInTheDocument()

    fireEvent.click(within(mobileMenu).getByRole('link', { name: 'Categorías' }))

    expect(screen.queryByLabelText('Menú de navegación móvil')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Abrir menú' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('has no detectable accessibility violations', async () => {
    authState.session = { user: { id: 'user-1' } }
    const { container } = renderNavbar()

    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toEqual([])
  })
})
