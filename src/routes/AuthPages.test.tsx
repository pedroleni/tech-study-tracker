import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { AuthApiError } from '@supabase/supabase-js'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { axe } from 'vitest-axe'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
  verifyOtp: vi.fn(),
  resendCode: vi.fn(),
  requestPasswordReset: vi.fn(),
  updatePassword: vi.fn(),
}))

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    session: null,
    loading: false,
    signIn: authMocks.signIn,
    signUp: authMocks.signUp,
    signOut: vi.fn(),
    verifyOtp: authMocks.verifyOtp,
    resendCode: authMocks.resendCode,
    requestPasswordReset: authMocks.requestPasswordReset,
    updatePassword: authMocks.updatePassword,
    signOutOtherSessions: vi.fn(),
  }),
}))

import { VerifyCodeStep } from '@/components/auth/VerifyCodeStep'
import { LoginPage } from './LoginPage'
import { RegisterPage } from './RegisterPage'

const VALID_PASSWORD = 'a secure phrase!'

function renderPage(page: React.ReactNode) {
  return render(<MemoryRouter>{page}</MemoryRouter>)
}

function renderRegisterRoute() {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<h1>Dashboard de prueba</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

function fillRegistration(
  email = 'person@example.com',
  password = VALID_PASSWORD,
  confirmation = password,
) {
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: email } })
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: password } })
  fireEvent.change(screen.getByLabelText('Confirmar contraseña'), {
    target: { value: confirmation },
  })
}

async function advanceToCodeStep() {
  fillRegistration()
  fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }))
  await screen.findByRole('heading', { name: 'Verifica tu email' })
}

describe('auth pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMocks.signIn.mockResolvedValue({})
    authMocks.signUp.mockResolvedValue({})
    authMocks.verifyOtp.mockResolvedValue({})
    authMocks.resendCode.mockResolvedValue({})
  })

  it('keeps login validation independent from the 15-character registration minimum', async () => {
    renderPage(<LoginPage />)
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'person@example.com' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'short' } })
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    await waitFor(() => expect(authMocks.signIn).toHaveBeenCalledWith('person@example.com', 'short'))
  })

  it('rejects non-matching registration passwords without calling signUp', async () => {
    renderPage(<RegisterPage />)
    fillRegistration('person@example.com', VALID_PASSWORD, 'a different phrase!')
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByText('Las contraseñas no coinciden.')).toBeInTheDocument()
    expect(authMocks.signUp).not.toHaveBeenCalled()
  })

  it('clears a password-mismatch error when editing the password makes both fields match', async () => {
    renderPage(<RegisterPage />)
    fillRegistration('person@example.com', VALID_PASSWORD, 'a different secure phrase!')
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByText('Las contraseñas no coinciden.')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'a different secure phrase!' },
    })

    await waitFor(() => {
      expect(screen.queryByText('Las contraseñas no coinciden.')).not.toBeInTheDocument()
    })
  })

  it('does not expose raw Supabase errors during login or registration', async () => {
    authMocks.signIn.mockRejectedValueOnce(
      new Error('you can only request this after 51 seconds'),
    )
    const login = renderPage(<LoginPage />)
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'person@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(await screen.findByText('Email o contraseña incorrectos.')).toBeInTheDocument()
    expect(screen.queryByText('you can only request this after 51 seconds')).not.toBeInTheDocument()
    login.unmount()

    authMocks.signUp.mockRejectedValueOnce(new Error('internal auth service detail'))
    renderPage(<RegisterPage />)
    fillRegistration()
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(
      await screen.findByText('No se pudo completar el registro. Inténtalo de nuevo.'),
    ).toBeInTheDocument()
    expect(screen.queryByText('internal auth service detail')).not.toBeInTheDocument()
  })

  it('shows the verification-code step after a successful signUp', async () => {
    renderPage(<RegisterPage />)
    await advanceToCodeStep()

    expect(authMocks.signUp).toHaveBeenCalledWith('person@example.com', VALID_PASSWORD)
    expect(screen.getByText('Te hemos enviado un código a person@example.com')).toBeInTheDocument()
    expect(screen.getByLabelText('Código de 6 dígitos')).toBeInTheDocument()
  })

  it('shows an indistinguishable code step when the email is already registered', async () => {
    authMocks.signUp.mockRejectedValueOnce(
      new AuthApiError('User already registered', 400, 'user_already_exists'),
    )
    const existingRender = renderPage(<RegisterPage />)
    await advanceToCodeStep()

    expect(existingRender.container.querySelector('.text-destructive')).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Código de 6 dígitos')).toBeInTheDocument()
  })

  it('always offers the same login exit from the verification step', async () => {
    const expectedText = '¿Ya tienes cuenta? Inicia sesión'

    const newAccount = renderPage(<RegisterPage />)
    await advanceToCodeStep()
    const newAccountLink = screen.getByRole('link', { name: 'Inicia sesión' })
    expect(newAccountLink).toHaveAttribute('href', '/login')
    expect(newAccountLink.parentElement).toHaveTextContent(expectedText)
    newAccount.unmount()

    authMocks.signUp.mockRejectedValueOnce(
      new AuthApiError('User already registered', 400, 'user_already_exists'),
    )
    renderPage(<RegisterPage />)
    await advanceToCodeStep()
    const existingAccountLink = screen.getByRole('link', { name: 'Inicia sesión' })
    expect(existingAccountLink).toHaveAttribute('href', '/login')
    expect(existingAccountLink.parentElement).toHaveTextContent(expectedText)
  })

  it('uses one generic message for every invalid or expired code', async () => {
    authMocks.verifyOtp.mockRejectedValue(new Error('No signup request found for this email'))
    renderPage(<RegisterPage />)
    await advanceToCodeStep()

    fireEvent.change(screen.getByLabelText('Código de 6 dígitos'), {
      target: { value: '123456' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Verificar' }))

    expect(await screen.findByText('El código no es válido o ha caducado.')).toBeInTheDocument()
    expect(screen.queryByText('No signup request found for this email')).not.toBeInTheDocument()
  })

  it('navigates to the dashboard after verifying the correct code', async () => {
    renderRegisterRoute()
    await advanceToCodeStep()

    fireEvent.change(screen.getByLabelText('Código de 6 dígitos'), {
      target: { value: '123456' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Verificar' }))

    expect(await screen.findByRole('heading', { name: 'Dashboard de prueba' })).toBeInTheDocument()
    expect(authMocks.verifyOtp).toHaveBeenCalledWith('person@example.com', '123456')
  })

  it('resends the signup code and gives a neutral response after a rate-limit error', async () => {
    authMocks.resendCode.mockRejectedValue(new Error('rate limit exceeded'))
    renderPage(<RegisterPage />)
    await advanceToCodeStep()
    fireEvent.click(screen.getByRole('button', { name: 'Reenviar código' }))

    expect(authMocks.resendCode).toHaveBeenCalledWith('person@example.com')
    expect(
      await screen.findByText(
        'Si tu cuenta necesita verificación, te hemos enviado un código nuevo.',
      ),
    ).toBeInTheDocument()
    expect(screen.queryByText('rate limit exceeded')).not.toBeInTheDocument()
  })

  it('shows the same resend response on success to prevent account enumeration', async () => {
    renderPage(<RegisterPage />)
    await advanceToCodeStep()
    fireEvent.click(screen.getByRole('button', { name: 'Reenviar código' }))

    expect(
      await screen.findByText(
        'Si tu cuenta necesita verificación, te hemos enviado un código nuevo.',
      ),
    ).toBeInTheDocument()
  })

  it('keeps an invalid-code error visible while resending', async () => {
    authMocks.verifyOtp.mockRejectedValue(new Error('Invalid code'))
    renderPage(<RegisterPage />)
    await advanceToCodeStep()

    fireEvent.change(screen.getByLabelText('Código de 6 dígitos'), {
      target: { value: '123456' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Verificar' }))
    expect(await screen.findByText('El código no es válido o ha caducado.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Reenviar código' }))

    expect(await screen.findByText('El código no es válido o ha caducado.')).toBeInTheDocument()
    expect(
      await screen.findByText(
        'Si tu cuenta necesita verificación, te hemos enviado un código nuevo.',
      ),
    ).toBeInTheDocument()
  })

  it('shows and hides every registration password field without submitting', () => {
    renderPage(<RegisterPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }))
    fireEvent.click(
      screen.getByRole('button', { name: 'Mostrar confirmación de contraseña' }),
    )

    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'text')
    expect(screen.getByLabelText('Confirmar contraseña')).toHaveAttribute('type', 'text')
    expect(authMocks.signUp).not.toHaveBeenCalled()
  })

  it('has no detectable accessibility violations on login, registration, and code screens', async () => {
    const login = renderPage(<LoginPage />)
    expect(
      (await axe(login.container, { rules: { 'color-contrast': { enabled: false } } })).violations,
    ).toEqual([])
    login.unmount()

    const register = renderPage(<RegisterPage />)
    expect(
      (await axe(register.container, { rules: { 'color-contrast': { enabled: false } } }))
        .violations,
    ).toEqual([])
    register.unmount()

    const verification = renderPage(<VerifyCodeStep email="person@example.com" />)
    expect(
      (await axe(verification.container, { rules: { 'color-contrast': { enabled: false } } }))
        .violations,
    ).toEqual([])
  })
})
