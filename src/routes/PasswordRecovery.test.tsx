import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { axe } from 'vitest-axe'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const authState = vi.hoisted(() => ({
  session: null as { user: { id: string } } | null,
  loading: false,
  requestPasswordReset: vi.fn(),
  updatePassword: vi.fn(),
  signOutOtherSessions: vi.fn(),
}))

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({
    user: authState.session?.user ?? null,
    session: authState.session,
    loading: authState.loading,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    verifyOtp: vi.fn(),
    resendCode: vi.fn(),
    requestPasswordReset: authState.requestPasswordReset,
    updatePassword: authState.updatePassword,
    signOutOtherSessions: authState.signOutOtherSessions,
  }),
}))

import { ForgotPasswordPage } from './ForgotPasswordPage'
import { ResetPasswordPage } from './ResetPasswordPage'

const GENERIC_RESET_MESSAGE =
  'Si ese email tiene una cuenta, te hemos enviado instrucciones para recuperarla.'
const VALID_PASSWORD = 'a new secure phrase!'

function renderPage(page: React.ReactNode) {
  return render(<MemoryRouter>{page}</MemoryRouter>)
}

async function submitRecoveryRequest() {
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'person@example.com' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Enviar instrucciones' }))
  await screen.findByText(GENERIC_RESET_MESSAGE)
}

describe('password recovery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authState.session = null
    authState.loading = false
    authState.requestPasswordReset.mockResolvedValue({})
    authState.updatePassword.mockResolvedValue({})
    authState.signOutOtherSessions.mockResolvedValue(undefined)
  })

  it('shows the same generic recovery response whether the request succeeds or fails', async () => {
    const successfulRequest = renderPage(<ForgotPasswordPage />)
    await submitRecoveryRequest()
    const successScreen = successfulRequest.container.textContent
    successfulRequest.unmount()

    authState.requestPasswordReset.mockRejectedValueOnce(new Error('User not found'))
    const failedRequest = renderPage(<ForgotPasswordPage />)
    await submitRecoveryRequest()

    expect(failedRequest.container.textContent).toBe(successScreen)
    expect(screen.queryByText('User not found')).not.toBeInTheDocument()
  })

  it('shows an invalid-link message and no form when there is no recovery session', () => {
    renderPage(<ResetPasswordPage />)

    expect(screen.getByText('Este enlace no es válido o ha caducado.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Solicitar otro enlace' })).toHaveAttribute(
      'href',
      '/recuperar-password',
    )
    expect(screen.queryByLabelText('Nueva contraseña')).not.toBeInTheDocument()
  })

  it('requires 15 characters and matching confirmation before updating the password', async () => {
    authState.session = { user: { id: 'user-1' } }
    render(
      <MemoryRouter initialEntries={['/nueva-password']}>
        <Routes>
          <Route path="/nueva-password" element={<ResetPasswordPage />} />
          <Route path="/" element={<h1>Dashboard de prueba</h1>} />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Nueva contraseña'), {
      target: { value: 'short' },
    })
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), {
      target: { value: 'short' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar contraseña' }))

    expect(
      await screen.findByText(
        'La contraseña debe tener al menos 15 caracteres — puedes usar una frase en vez de una palabra con símbolos.',
      ),
    ).toBeInTheDocument()
    expect(authState.updatePassword).not.toHaveBeenCalled()

    fireEvent.change(screen.getByLabelText('Nueva contraseña'), {
      target: { value: VALID_PASSWORD },
    })
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), {
      target: { value: 'a different phrase!' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar contraseña' }))

    expect(await screen.findByText('Las contraseñas no coinciden.')).toBeInTheDocument()
    expect(authState.updatePassword).not.toHaveBeenCalled()

    fireEvent.change(screen.getByLabelText('Nueva contraseña'), {
      target: { value: 'a different phrase!' },
    })

    await waitFor(() => {
      expect(screen.queryByText('Las contraseñas no coinciden.')).not.toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar contraseña' }))

    await waitFor(() =>
      expect(authState.updatePassword).toHaveBeenCalledWith('a different phrase!'),
    )
    expect(authState.signOutOtherSessions).toHaveBeenCalledOnce()
    expect(await screen.findByRole('heading', { name: 'Dashboard de prueba' })).toBeInTheDocument()
  })

  it('still navigates after a failure revoking other sessions', async () => {
    authState.session = { user: { id: 'user-1' } }
    authState.signOutOtherSessions.mockRejectedValueOnce(new Error('Revocation failed'))
    render(
      <MemoryRouter initialEntries={['/nueva-password']}>
        <Routes>
          <Route path="/nueva-password" element={<ResetPasswordPage />} />
          <Route path="/" element={<h1>Dashboard de prueba</h1>} />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Nueva contraseña'), {
      target: { value: VALID_PASSWORD },
    })
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), {
      target: { value: VALID_PASSWORD },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar contraseña' }))

    expect(await screen.findByRole('heading', { name: 'Dashboard de prueba' })).toBeInTheDocument()
    expect(authState.updatePassword).toHaveBeenCalledWith(VALID_PASSWORD)
    expect(authState.signOutOtherSessions).toHaveBeenCalledOnce()
  })

  it('has no detectable accessibility violations on every recovery screen', async () => {
    const forgot = renderPage(<ForgotPasswordPage />)
    expect(
      (await axe(forgot.container, { rules: { 'color-contrast': { enabled: false } } })).violations,
    ).toEqual([])
    forgot.unmount()

    const invalidReset = renderPage(<ResetPasswordPage />)
    expect(
      (await axe(invalidReset.container, { rules: { 'color-contrast': { enabled: false } } }))
        .violations,
    ).toEqual([])
    invalidReset.unmount()

    authState.session = { user: { id: 'user-1' } }
    const validReset = renderPage(<ResetPasswordPage />)
    expect(
      (await axe(validReset.container, { rules: { 'color-contrast': { enabled: false } } }))
        .violations,
    ).toEqual([])
  })
})
