import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  user: { id: 'session-user' } as { id: string } | null,
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: mocks.from },
}))

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({ user: mocks.user }),
}))

import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useRenameCategory,
} from './useCategories'
import {
  useCreateTechnology,
  useDeleteTechnology,
  useTechnologies,
  useTechnology,
  useUpdateTechnology,
} from './useTechnologies'
import type { NewTechnologyInput } from '../queries/mappers'
import { queryKeys } from '../queries/queryKeys'

const categoryRow = {
  id: 'category-1',
  name: 'Frontend',
  created_at: '2026-08-13T08:00:00.000Z',
}

const technologyRow = {
  id: 'technology-1',
  category_id: 'category-1',
  name: 'React',
  status: 'en_progreso' as const,
  priority: 'alta' as const,
  difficulty: 'media' as const,
  notes: 'Hooks',
  resources: [{ label: 'Docs', url: 'https://react.dev' }],
  created_at: '2026-08-13T08:00:00.000Z',
  updated_at: '2026-08-13T09:00:00.000Z',
}

const newTechnology: NewTechnologyInput = {
  categoryId: 'category-1',
  name: 'React',
  status: 'en_progreso',
  priority: 'alta',
  difficulty: 'media',
  notes: 'Hooks',
  resources: [{ label: 'Docs', url: 'https://react.dev' }],
}

function createSupabaseTableMock(row: typeof categoryRow | typeof technologyRow) {
  const terminal = { data: row, error: null }
  const single = vi.fn().mockResolvedValue(terminal)
  const mutationSelect = vi.fn().mockReturnValue({ single })
  const eqAfterMutation = vi.fn().mockReturnValue({ select: mutationSelect })
  const maybeSingle = vi.fn().mockResolvedValue(terminal)
  const eqAfterSelect = vi.fn().mockReturnValue({ maybeSingle })
  const select = vi.fn().mockResolvedValue({ data: [row], error: null })
  const insert = vi.fn().mockReturnValue({ select: mutationSelect })
  const update = vi.fn().mockReturnValue({ eq: eqAfterMutation })
  const deleteQuery = vi.fn().mockReturnValue({ eq: eqAfterMutation })

  return {
    table: {
      select,
      insert,
      update,
      delete: deleteQuery,
    },
    insert,
    update,
    deleteQuery,
    mutationSelect,
    single,
    eqAfterSelect,
    maybeSingle,
  }
}

function setupSupabaseMocks() {
  const categories = createSupabaseTableMock(categoryRow)
  const technologies = createSupabaseTableMock(technologyRow)

  mocks.from.mockImplementation((table: string) => {
    if (table === 'categories') return categories.table
    if (table === 'technologies') return technologies.table
    throw new Error(`Unexpected table: ${table}`)
  })

  return { categories, technologies }
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

describe('data hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.user = { id: 'session-user' }
  })

  it('useCategories and useTechnologies expose mapped query data', async () => {
    setupSupabaseMocks()
    const client = createTestClient()
    const wrapper = wrapperFor(client)
    const categoriesHook = renderHook(() => useCategories(), { wrapper })
    const technologiesHook = renderHook(() => useTechnologies(), { wrapper })

    await waitFor(() => expect(categoriesHook.result.current.isSuccess).toBe(true))
    await waitFor(() => expect(technologiesHook.result.current.isSuccess).toBe(true))

    expect(categoriesHook.result.current.data).toEqual([
      {
        id: 'category-1',
        name: 'Frontend',
        createdAt: '2026-08-13T08:00:00.000Z',
      },
    ])
    expect(technologiesHook.result.current.data?.[0]).toMatchObject({
      id: 'technology-1',
      categoryId: 'category-1',
      updatedAt: '2026-08-13T09:00:00.000Z',
    })
  })

  it('useTechnology uses the id-specific query and exposes mapped data', async () => {
    const { technologies } = setupSupabaseMocks()
    technologies.table.select.mockReturnValueOnce({ eq: technologies.eqAfterSelect })
    const client = createTestClient()
    const { result } = renderHook(() => useTechnology('technology-1'), {
      wrapper: wrapperFor(client),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(technologies.eqAfterSelect).toHaveBeenCalledWith('id', 'technology-1')
    expect(technologies.maybeSingle).toHaveBeenCalledWith()
    expect(result.current.data).toMatchObject({
      id: 'technology-1',
      categoryId: 'category-1',
    })
  })

  it('create hooks pass exactly the active session user id to Supabase', async () => {
    const { categories, technologies } = setupSupabaseMocks()
    const client = createTestClient()
    const wrapper = wrapperFor(client)
    const categoryHook = renderHook(() => useCreateCategory(), { wrapper })
    const technologyHook = renderHook(() => useCreateTechnology(), { wrapper })

    await act(() => categoryHook.result.current.mutateAsync('Frontend'))
    await act(() => technologyHook.result.current.mutateAsync(newTechnology))

    expect(categories.insert).toHaveBeenCalledWith({
      user_id: 'session-user',
      name: 'Frontend',
    })
    expect(technologies.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'session-user',
        category_id: 'category-1',
        name: 'React',
      }),
    )
  })

  it('create hooks reject without a session and never call Supabase', async () => {
    mocks.user = null
    const client = createTestClient()
    const wrapper = wrapperFor(client)
    const categoryHook = renderHook(() => useCreateCategory(), { wrapper })
    const technologyHook = renderHook(() => useCreateTechnology(), { wrapper })

    await expect(categoryHook.result.current.mutateAsync('Frontend')).rejects.toThrow(
      'No hay sesión activa.',
    )
    await expect(technologyHook.result.current.mutateAsync(newTechnology)).rejects.toThrow(
      'No hay sesión activa.',
    )
    expect(mocks.from).not.toHaveBeenCalled()
  })

  it.each([
    ['useCreateCategory', useCreateCategory, 'categories', 'Frontend'],
    [
      'useRenameCategory',
      useRenameCategory,
      'categories',
      { id: 'category-1', name: 'Web' },
    ],
    ['useDeleteCategory', useDeleteCategory, 'categories', 'category-1'],
    ['useCreateTechnology', useCreateTechnology, 'technologies', newTechnology],
    [
      'useUpdateTechnology',
      useUpdateTechnology,
      'technologies',
      { id: 'technology-1', patch: { name: 'Vue' } },
    ],
    ['useDeleteTechnology', useDeleteTechnology, 'technologies', 'technology-1'],
  ] as const)(
    '%s invalidates only its own entity query key',
    async (_name, useMutationHook, entity, variables) => {
      setupSupabaseMocks()
      const client = createTestClient()
      client.setQueryData(queryKeys.categories, [])
      client.setQueryData(queryKeys.technologies, [])
      const { result } = renderHook(() => useMutationHook(), {
        wrapper: wrapperFor(client),
      })

      await act(() => result.current.mutateAsync(variables as never))

      const ownKey = entity === 'categories' ? queryKeys.categories : queryKeys.technologies
      const otherKey = entity === 'categories' ? queryKeys.technologies : queryKeys.categories
      expect(client.getQueryState(ownKey)?.isInvalidated).toBe(true)
      expect(client.getQueryState(otherKey)?.isInvalidated).toBe(false)
    },
  )

  it.each([
    ['useCreateCategory', useCreateCategory, 'categories', 'Frontend'],
    [
      'useRenameCategory',
      useRenameCategory,
      'categories',
      { id: 'category-1', name: 'Web' },
    ],
    ['useDeleteCategory', useDeleteCategory, 'categories', 'category-1'],
    ['useCreateTechnology', useCreateTechnology, 'technologies', newTechnology],
    [
      'useUpdateTechnology',
      useUpdateTechnology,
      'technologies',
      { id: 'technology-1', patch: { name: 'Vue' } },
    ],
    ['useDeleteTechnology', useDeleteTechnology, 'technologies', 'technology-1'],
  ] as const)(
    '%s does not invalidate its entity query key when the mutation fails',
    async (_name, useMutationHook, entity, variables) => {
      const supabase = setupSupabaseMocks()
      const error = new Error('Supabase mutation failed')
      supabase[entity].single.mockResolvedValueOnce({ data: null, error })
      const client = createTestClient()
      const ownKey = entity === 'categories' ? queryKeys.categories : queryKeys.technologies
      client.setQueryData(ownKey, [])
      const { result } = renderHook(() => useMutationHook(), {
        wrapper: wrapperFor(client),
      })

      await expect(result.current.mutateAsync(variables as never)).rejects.toBe(error)

      expect(client.getQueryState(ownKey)?.isInvalidated).toBe(false)
    },
  )
})
