import { act, renderHook, waitFor } from '@testing-library/react'
import type { Session } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  verifyOtp: vi.fn(),
  resend: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  updateUser: vi.fn(),
  unsubscribe: vi.fn(),
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: authMocks.getSession,
      onAuthStateChange: authMocks.onAuthStateChange,
      signInWithPassword: authMocks.signInWithPassword,
      signUp: authMocks.signUp,
      signOut: authMocks.signOut,
      verifyOtp: authMocks.verifyOtp,
      resend: authMocks.resend,
      resetPasswordForEmail: authMocks.resetPasswordForEmail,
      updateUser: authMocks.updateUser,
    },
  },
}))

import { useAuth } from './useAuth'
import { queryClient } from '@/lib/queryClient'
import { queryKeys } from '@/lib/queries/queryKeys'

const user = { id: 'user-1', email: 'person@example.com' }
const session = { access_token: 'managed-by-supabase', user } as Session

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    queryClient.clear()
    sessionStorage.clear()
    authMocks.getSession.mockResolvedValue({ data: { session }, error: null })
    authMocks.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: authMocks.unsubscribe } },
    })
    authMocks.signInWithPassword.mockResolvedValue({ data: { session, user }, error: null })
    authMocks.signUp.mockResolvedValue({ data: { session, user }, error: null })
    authMocks.signOut.mockResolvedValue({ error: null })
    authMocks.verifyOtp.mockResolvedValue({ data: { session, user }, error: null })
    authMocks.resend.mockResolvedValue({ data: {}, error: null })
    authMocks.resetPasswordForEmail.mockResolvedValue({ data: {}, error: null })
    authMocks.updateUser.mockResolvedValue({ data: { user }, error: null })
  })

  it('loads the initial session and unsubscribes on unmount', async () => {
    const { result, unmount } = renderHook(() => useAuth())

    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.session).toBe(session)
    expect(result.current.user).toBe(user)

    unmount()
    expect(authMocks.unsubscribe).toHaveBeenCalledOnce()
  })

  it('updates state when Supabase emits an auth change', async () => {
    let listener: (_event: string, session: Session | null) => void = () => undefined
    authMocks.onAuthStateChange.mockImplementation((callback) => {
      listener = callback
      return { data: { subscription: { unsubscribe: authMocks.unsubscribe } } }
    })
    authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null })
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => listener('SIGNED_IN', session))
    expect(result.current.session).toBe(session)
  })

  it('clears cached private data when Supabase emits SIGNED_OUT', async () => {
    let listener: (_event: string, session: Session | null) => void = () => undefined
    authMocks.onAuthStateChange.mockImplementation((callback) => {
      listener = callback
      return { data: { subscription: { unsubscribe: authMocks.unsubscribe } } }
    })
    queryClient.setQueryData(queryKeys.technologiesForViewer('user-1'), ['draft'])
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => listener('SIGNED_OUT', null))

    expect(queryClient.getQueryData(queryKeys.technologiesForViewer('user-1'))).toBeUndefined()
    expect(result.current.session).toBeNull()
  })

  it('marks the session as password recovery when Supabase emits PASSWORD_RECOVERY', async () => {
    let listener: (_event: string, session: Session | null) => void = () => undefined
    authMocks.onAuthStateChange.mockImplementation((callback) => {
      listener = callback
      return { data: { subscription: { unsubscribe: authMocks.unsubscribe } } }
    })
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => listener('PASSWORD_RECOVERY', session))

    expect(result.current.isPasswordRecovery).toBe(true)
    expect(sessionStorage.getItem('passwordRecovery')).toBe('true')
  })

  it('restores the password recovery state from sessionStorage on mount', async () => {
    sessionStorage.setItem('passwordRecovery', 'true')

    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.isPasswordRecovery).toBe(true)
  })

  it('clears the password recovery state after a successful password update', async () => {
    sessionStorage.setItem('passwordRecovery', 'true')
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(() => result.current.updatePassword('a new secure phrase!'))

    expect(result.current.isPasswordRecovery).toBe(false)
    expect(sessionStorage.getItem('passwordRecovery')).toBeNull()
  })

  it('delegates password auth actions and surfaces errors', async () => {
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(() => result.current.signIn('person@example.com', 'secret1'))
    expect(authMocks.signInWithPassword).toHaveBeenCalledWith({
      email: 'person@example.com',
      password: 'secret1',
    })

    authMocks.signOut.mockResolvedValue({ error: new Error('Sign out failed') })
    await expect(result.current.signOut()).rejects.toThrow('Sign out failed')
  })

  it('delegates email verification and password-recovery actions', async () => {
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(() => result.current.verifyOtp('person@example.com', '123456'))
    expect(authMocks.verifyOtp).toHaveBeenCalledWith({
      email: 'person@example.com',
      token: '123456',
      type: 'email',
    })

    await act(() => result.current.resendCode('person@example.com'))
    expect(authMocks.resend).toHaveBeenCalledWith({
      type: 'signup',
      email: 'person@example.com',
    })

    await act(() => result.current.requestPasswordReset('person@example.com'))
    expect(authMocks.resetPasswordForEmail).toHaveBeenCalledWith('person@example.com', {
      redirectTo: `${window.location.origin}/nueva-password`,
    })

    await act(() => result.current.updatePassword('a new secure phrase!'))
    expect(authMocks.updateUser).toHaveBeenCalledWith({ password: 'a new secure phrase!' })

    await act(() => result.current.signOutOtherSessions())
    expect(authMocks.signOut).toHaveBeenCalledWith({ scope: 'others' })
  })

  it('surfaces verifyOtp errors', async () => {
    authMocks.verifyOtp.mockResolvedValue({ data: null, error: new Error('Verification failed') })
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await expect(result.current.verifyOtp('person@example.com', '123456')).rejects.toThrow(
      'Verification failed',
    )
  })

  it('surfaces resendCode errors', async () => {
    authMocks.resend.mockResolvedValue({ data: null, error: new Error('Resend failed') })
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await expect(result.current.resendCode('person@example.com')).rejects.toThrow('Resend failed')
  })

  it('surfaces requestPasswordReset errors', async () => {
    authMocks.resetPasswordForEmail.mockResolvedValue({
      data: null,
      error: new Error('Reset request failed'),
    })
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await expect(result.current.requestPasswordReset('person@example.com')).rejects.toThrow(
      'Reset request failed',
    )
  })

  it('surfaces updatePassword errors', async () => {
    authMocks.updateUser.mockResolvedValue({ data: null, error: new Error('Update failed') })
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await expect(result.current.updatePassword('a new secure phrase!')).rejects.toThrow(
      'Update failed',
    )
  })
})
