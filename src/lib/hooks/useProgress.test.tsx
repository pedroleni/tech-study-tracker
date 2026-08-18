import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  user: { id: 'user-1' } as { id: string } | null,
  loading: false,
  getMyProgress: vi.fn(),
  upsertMyProgress: vi.fn(),
}))

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({ user: mocks.user, loading: mocks.loading }),
}))
vi.mock('@/lib/queries/progress', () => ({
  getMyProgress: mocks.getMyProgress,
  upsertMyProgress: mocks.upsertMyProgress,
}))

import { useMyProgress, useSetMyProgress } from './useProgress'
import { queryKeys } from '../queries/queryKeys'

const progress = {
  id: 'progress-1',
  userId: 'user-1',
  technologyId: 'technology-1',
  status: 'en_progreso' as const,
  currentLeccionId: null,
  createdAt: '2026-08-18T10:00:00.000Z',
  updatedAt: '2026-08-18T11:00:00.000Z',
}

function createTestClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}

function wrapperFor(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }): ReactElement {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}

describe('progress hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.user = { id: 'user-1' }
    mocks.loading = false
    mocks.getMyProgress.mockResolvedValue(progress)
    mocks.upsertMyProgress.mockResolvedValue(progress)
  })

  it('loads progress with the active user and technology ids', async () => {
    const client = createTestClient()
    const { result } = renderHook(() => useMyProgress('technology-1'), {
      wrapper: wrapperFor(client),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mocks.getMyProgress).toHaveBeenCalledWith('user-1', 'technology-1')
    expect(result.current.data).toEqual(progress)
  })

  it('does not query private progress without a session', () => {
    mocks.user = null
    const client = createTestClient()
    const { result } = renderHook(() => useMyProgress('technology-1'), {
      wrapper: wrapperFor(client),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(mocks.getMyProgress).not.toHaveBeenCalled()
  })

  it('upserts for the active user and updates the exact progress cache', async () => {
    const client = createTestClient()
    const { result } = renderHook(() => useSetMyProgress(), {
      wrapper: wrapperFor(client),
    })

    await act(() =>
      result.current.mutateAsync({
        technologyId: 'technology-1',
        patch: { status: 'en_progreso' },
      }),
    )

    expect(mocks.upsertMyProgress).toHaveBeenCalledWith('technology-1', {
      status: 'en_progreso',
    })
    expect(
      client.getQueryData(queryKeys.myProgress('user-1', 'technology-1')),
    ).toEqual(progress)
  })

  it('rejects a mutation without a session before calling Supabase', async () => {
    mocks.user = null
    const client = createTestClient()
    const { result } = renderHook(() => useSetMyProgress(), {
      wrapper: wrapperFor(client),
    })

    await expect(
      result.current.mutateAsync({
        technologyId: 'technology-1',
        patch: { status: 'pendiente' },
      }),
    ).rejects.toThrow('Inicia sesión para guardar tu progreso.')
    expect(mocks.upsertMyProgress).not.toHaveBeenCalled()
  })
})
