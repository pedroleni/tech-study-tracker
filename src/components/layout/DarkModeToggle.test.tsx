import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DarkModeToggle } from './DarkModeToggle'

describe('DarkModeToggle', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    document.documentElement.classList.remove('dark')
  })

  it('toggles the html class, persists the theme, and updates its accessible label', () => {
    render(<DarkModeToggle />)
    const toggle = screen.getByRole('button', { name: 'Cambiar a modo oscuro' })

    fireEvent.click(toggle)

    expect(document.documentElement).toHaveClass('dark')
    expect(localStorage.getItem('theme')).toBe('dark')
    expect(toggle).toHaveAccessibleName('Cambiar a modo claro')

    fireEvent.click(toggle)

    expect(document.documentElement).not.toHaveClass('dark')
    expect(localStorage.getItem('theme')).toBe('light')
    expect(toggle).toHaveAccessibleName('Cambiar a modo oscuro')
  })

  it('uses the system preference when there is no saved theme', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))

    render(<DarkModeToggle />)

    expect(document.documentElement).toHaveClass('dark')
    expect(screen.getByRole('button')).toHaveAccessibleName('Cambiar a modo claro')
  })
})
