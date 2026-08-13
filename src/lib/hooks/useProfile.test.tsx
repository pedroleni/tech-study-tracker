import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  user: { id: 'user-1' } as { id: string } | null,
  authLoading: false,
}))

vi.mock('@/lib/supabaseClient', () => ({ supabase: { from: mocks.from } }))
vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({ user: mocks.user, loading: mocks.authLoading }),
}))

import { useProfile } from './useProfile'

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

function mockProfile(role: 'user' | 'admin') {
  const maybeSingle = vi.fn().mockResolvedValue({
    data: { id: 'user-1', role, created_at: '2026-08-13T10:00:00.000Z' },
    error: null,
  })
  const eq = vi.fn().mockReturnValue({ maybeSingle })
  mocks.from.mockReturnValue({ select: vi.fn().mockReturnValue({ eq }) })
}

describe('useProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.user = { id: 'user-1' }
    mocks.authLoading = false
  })

  it('exposes the admin role as isAdmin', async () => {
    mockProfile('admin')
    const { result } = renderHook(() => useProfile(), { wrapper })

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.role).toBe('admin')
    expect(result.current.isAdmin).toBe(true)
  })

  it('returns non-admin without querying when there is no session', () => {
    mocks.user = null
    const { result } = renderHook(() => useProfile(), { wrapper })

    expect(result.current.role).toBeNull()
    expect(result.current.isAdmin).toBe(false)
    expect(result.current.loading).toBe(false)
    expect(mocks.from).not.toHaveBeenCalled()
  })
})
