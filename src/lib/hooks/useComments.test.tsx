import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  user: { id: 'user-1' } as { id: string } | null,
  createComment: vi.fn(),
}))

vi.mock('@/lib/hooks/useAuth', () => ({ useAuth: () => ({ user: mocks.user }) }))
vi.mock('@/lib/queries/comments', () => ({
  listComments: vi.fn(),
  createComment: mocks.createComment,
  updateComment: vi.fn(),
  deleteComment: vi.fn(),
}))

import { queryKeys } from '@/lib/queries/queryKeys'

import { useCreateComment } from './useComments'

function wrapperFor(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }): ReactElement {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}

describe('comment hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.user = { id: 'user-1' }
    mocks.createComment.mockResolvedValue({ leccionId: 'leccion-1' })
  })

  it('invalidates the lesson comments after creating a comment', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    client.setQueryData(queryKeys.comments('leccion-1'), [])
    const { result } = renderHook(() => useCreateComment(), {
      wrapper: wrapperFor(client),
    })

    await act(() =>
      result.current.mutateAsync({ leccionId: 'leccion-1', body: 'Buen contenido' }),
    )

    expect(mocks.createComment).toHaveBeenCalledWith('user-1', {
      leccionId: 'leccion-1',
      body: 'Buen contenido',
    })
    expect(client.getQueryState(queryKeys.comments('leccion-1'))?.isInvalidated).toBe(true)
  })
})
