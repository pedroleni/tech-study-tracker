import { act, renderHook, waitFor } from '@testing-library/react'
import type { Session } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
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
    },
  },
}))

import { useAuth } from './useAuth'

const user = { id: 'user-1', email: 'person@example.com' }
const session = { access_token: 'managed-by-supabase', user } as Session

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMocks.getSession.mockResolvedValue({ data: { session }, error: null })
    authMocks.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: authMocks.unsubscribe } },
    })
    authMocks.signInWithPassword.mockResolvedValue({ data: { session, user }, error: null })
    authMocks.signUp.mockResolvedValue({ data: { session, user }, error: null })
    authMocks.signOut.mockResolvedValue({ error: null })
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
})
