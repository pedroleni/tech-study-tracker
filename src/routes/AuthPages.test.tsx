import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthApiError } from '@supabase/supabase-js'
import { axe } from 'vitest-axe'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMocks = vi.hoisted(() => ({ signIn: vi.fn(), signUp: vi.fn() }))

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    session: null,
    loading: false,
    signIn: authMocks.signIn,
    signUp: authMocks.signUp,
    signOut: vi.fn(),
  }),
}))

import { LoginPage } from './LoginPage'
import { RegisterPage } from './RegisterPage'

function renderPage(page: React.ReactNode) {
  return render(<MemoryRouter>{page}</MemoryRouter>)
}

describe('auth pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMocks.signIn.mockResolvedValue({})
    authMocks.signUp.mockResolvedValue({})
  })

  it('shows login validation errors and does not submit invalid values', async () => {
    renderPage(<LoginPage />)
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'invalid' } })
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(await screen.findByText('Introduce un email válido.')).toBeInTheDocument()
    expect(screen.getByText('Introduce tu contraseña.')).toBeInTheDocument()
    expect(authMocks.signIn).not.toHaveBeenCalled()
  })

  it('shows registration validation errors', async () => {
    renderPage(<RegisterPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByText('Introduce un email válido.')).toBeInTheDocument()
    expect(
      screen.getByText(
        'La contraseña debe tener al menos 15 caracteres — puedes usar una frase en vez de una palabra con símbolos.',
      ),
    ).toBeInTheDocument()
    expect(authMocks.signUp).not.toHaveBeenCalled()
  })

  it('shows and hides the password without submitting the form', () => {
    renderPage(<LoginPage />)
    const passwordInput = screen.getByLabelText('Contraseña')
    const showPasswordButton = screen.getByRole('button', { name: 'Mostrar contraseña' })

    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(showPasswordButton).toHaveAttribute('type', 'button')

    fireEvent.click(showPasswordButton)

    expect(passwordInput).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toBeInTheDocument()
    expect(authMocks.signIn).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Ocultar contraseña' }))

    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(screen.getByRole('button', { name: 'Mostrar contraseña' })).toBeInTheDocument()
  })

  it('announces Supabase authentication errors', async () => {
    authMocks.signIn.mockRejectedValue(new Error('Credenciales inválidas'))
    renderPage(<LoginPage />)
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'person@example.com' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'secret1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    await waitFor(() => expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument())
  })

  it('shows the same confirmation message for a new signup as for an already-registered email', async () => {
    // Regression test for account enumeration via the register form: a real signup
    // and an "already registered" error must be indistinguishable to the user.
    const confirmationMessage =
      'Si el email es nuevo, hemos enviado un correo de confirmación. Si ya tenías cuenta, revisa tu bandeja o inicia sesión.'

    authMocks.signUp.mockResolvedValueOnce({})
    const { unmount } = renderPage(<RegisterPage />)
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'new@example.com' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'a secure phrase!' } })
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }))
    expect(await screen.findByText(confirmationMessage)).toBeInTheDocument()
    unmount()

    authMocks.signUp.mockRejectedValueOnce(
      new AuthApiError('User already registered', 400, 'user_already_exists'),
    )
    renderPage(<RegisterPage />)
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'existing@example.com' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'a secure phrase!' } })
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }))
    expect(await screen.findByText(confirmationMessage)).toBeInTheDocument()
  })

  it('still surfaces genuine (non-enumeration) registration errors', async () => {
    authMocks.signUp.mockRejectedValue(new Error('Network request failed'))
    renderPage(<RegisterPage />)
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'person@example.com' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'a secure phrase!' } })
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    await waitFor(() => expect(screen.getByText('Network request failed')).toBeInTheDocument())
  })

  it('has no detectable accessibility violations on LoginPage', async () => {
    const { container } = renderPage(<LoginPage />)
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toEqual([])
  })
})
