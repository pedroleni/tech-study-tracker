import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { QueryKey } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  user: { id: 'admin-1' } as { id: string } | null,
  loading: false,
  isAdmin: true,
  listLecciones: vi.fn(),
  listProyectos: vi.fn(),
  getLeccion: vi.fn(),
  createLeccion: vi.fn(),
  updateLeccion: vi.fn(),
}))

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({ user: mocks.user, loading: mocks.loading }),
}))
vi.mock('@/lib/hooks/useProfile', () => ({
  useProfile: () => ({ isAdmin: mocks.isAdmin }),
}))
vi.mock('@/lib/queries/lecciones', () => ({
  listLecciones: mocks.listLecciones,
  listProyectos: mocks.listProyectos,
  getLeccion: mocks.getLeccion,
  createLeccion: mocks.createLeccion,
  updateLeccion: mocks.updateLeccion,
}))

import type { NewLeccionInput } from '@/lib/queries/mappers'
import { queryKeys } from '@/lib/queries/queryKeys'

import { useLeccion } from './useLeccion'
import {
  useCreateLeccion,
  useLecciones,
  useProyectos,
  useUpdateLeccion,
} from './useLecciones'

const newLeccion: NewLeccionInput = {
  technologyId: 'technology-1',
  slug: 'fundamentos',
  modulo: null,
  titulo: 'Fundamentos',
  resumen: '',
  contenido: '',
  orden: 10,
  esProyecto: false,
}

function createClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}

function wrapperFor(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }): ReactElement {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}

function expectPublicQueryCacheOptions(client: QueryClient, queryKey: QueryKey) {
  const query = client.getQueryCache().find({ queryKey })
  const options = query?.options as
    | { staleTime?: number; refetchOnWindowFocus?: boolean }
    | undefined

  expect(query).toBeDefined()
  expect(options?.staleTime).toBe(300000)
  expect(options?.refetchOnWindowFocus).toBe(false)
}

describe('lesson hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.user = { id: 'admin-1' }
    mocks.loading = false
    mocks.isAdmin = true
    mocks.listLecciones.mockResolvedValue([])
    mocks.listProyectos.mockResolvedValue([])
    mocks.getLeccion.mockResolvedValue({ id: 'leccion-1' })
    mocks.createLeccion.mockResolvedValue({ id: 'leccion-1' })
    mocks.updateLeccion.mockResolvedValue({ id: 'leccion-1' })
  })

  it('keys a technology lesson list by the current viewer', async () => {
    const client = createClient()
    const { result } = renderHook(() => useLecciones('technology-1'), {
      wrapper: wrapperFor(client),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mocks.listLecciones).toHaveBeenCalledWith('technology-1')
    expectPublicQueryCacheOptions(
      client,
      queryKeys.leccionesForTechnology('admin-1', 'technology-1'),
    )
  })

  it('keys a draft-capable lesson detail by the current viewer', async () => {
    const client = createClient()
    const { result } = renderHook(() => useLeccion({ id: 'leccion-1' }), {
      wrapper: wrapperFor(client),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mocks.getLeccion).toHaveBeenCalledWith({ id: 'leccion-1' })
    expectPublicQueryCacheOptions(client, queryKeys.leccionById('admin-1', 'leccion-1'))
  })

  it('keeps public projects fresh for five minutes without focus refetches', async () => {
    const client = createClient()
    const { result } = renderHook(() => useProyectos(), {
      wrapper: wrapperFor(client),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mocks.listProyectos).toHaveBeenCalledOnce()
    expectPublicQueryCacheOptions(client, queryKeys.proyectos('admin-1'))
  })

  it('rejects admin mutations before querying when auth or role is missing', async () => {
    const client = createClient()
    const wrapper = wrapperFor(client)
    mocks.user = null
    const createHook = renderHook(() => useCreateLeccion(), { wrapper })
    await expect(createHook.result.current.mutateAsync(newLeccion)).rejects.toThrow(
      'No hay sesión activa.',
    )

    mocks.user = { id: 'user-1' }
    mocks.isAdmin = false
    const updateHook = renderHook(() => useUpdateLeccion(), { wrapper })
    await expect(
      updateHook.result.current.mutateAsync({ id: 'leccion-1', patch: { titulo: 'Otro' } }),
    ).rejects.toThrow('Solo el administrador puede gestionar contenido.')
    expect(mocks.createLeccion).not.toHaveBeenCalled()
    expect(mocks.updateLeccion).not.toHaveBeenCalled()
  })

  it('invalidates all lesson views after a successful mutation', async () => {
    const client = createClient()
    client.setQueryData(queryKeys.lecciones, [])
    const { result } = renderHook(() => useCreateLeccion(), {
      wrapper: wrapperFor(client),
    })

    await act(() => result.current.mutateAsync(newLeccion))
    expect(client.getQueryState(queryKeys.lecciones)?.isInvalidated).toBe(true)
  })
})
