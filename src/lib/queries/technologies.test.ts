import { beforeEach, describe, expect, it, vi } from 'vitest'

const supabaseMock = vi.hoisted(() => ({ from: vi.fn() }))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: supabaseMock,
}))

import type { NewTechnologyInput } from './mappers'
import {
  createTechnology,
  deleteTechnology,
  getTechnology,
  listTechnologies,
  updateTechnology,
} from './technologies'

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

const technology = {
  id: 'technology-1',
  categoryId: 'category-1',
  name: 'React',
  status: 'en_progreso' as const,
  priority: 'alta' as const,
  difficulty: 'media' as const,
  notes: 'Hooks',
  resources: [{ label: 'Docs', url: 'https://react.dev' }],
  createdAt: '2026-08-13T08:00:00.000Z',
  updatedAt: '2026-08-13T09:00:00.000Z',
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

describe('technology queries', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists all technologies with no category filter and maps them', async () => {
    const select = vi.fn().mockResolvedValue({ data: [technologyRow], error: null })
    supabaseMock.from.mockReturnValue({ select })

    await expect(listTechnologies()).resolves.toEqual([technology])
    expect(supabaseMock.from).toHaveBeenCalledWith('technologies')
    expect(select).toHaveBeenCalledWith()
  })

  it('gets one technology with maybeSingle and maps it', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: technologyRow, error: null })
    const eq = vi.fn().mockReturnValue({ maybeSingle })
    const select = vi.fn().mockReturnValue({ eq })
    supabaseMock.from.mockReturnValue({ select })

    await expect(getTechnology('technology-1')).resolves.toEqual(technology)
    expect(eq).toHaveBeenCalledWith('id', 'technology-1')
    expect(maybeSingle).toHaveBeenCalledWith()
  })

  it('returns null for a missing or hidden technology', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null })
    supabaseMock.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ maybeSingle }),
      }),
    })

    await expect(getTechnology('technology-404')).resolves.toBeNull()
  })

  it('creates a technology with the explicit user id, snake_case fields, and maps it', async () => {
    const single = vi.fn().mockResolvedValue({ data: technologyRow, error: null })
    const select = vi.fn().mockReturnValue({ single })
    const insert = vi.fn().mockReturnValue({ select })
    supabaseMock.from.mockReturnValue({ insert })

    await expect(createTechnology('user-1', newTechnology)).resolves.toEqual(technology)
    expect(insert).toHaveBeenCalledWith({
      user_id: 'user-1',
      category_id: 'category-1',
      name: 'React',
      status: 'en_progreso',
      priority: 'alta',
      difficulty: 'media',
      notes: 'Hooks',
      resources: [{ label: 'Docs', url: 'https://react.dev' }],
    })
  })

  it('updates only supplied fields with select().single() and maps the row', async () => {
    const updatedRow = { ...technologyRow, category_id: 'category-2', notes: '' }
    const single = vi.fn().mockResolvedValue({ data: updatedRow, error: null })
    const select = vi.fn().mockReturnValue({ single })
    const eq = vi.fn().mockReturnValue({ select })
    const update = vi.fn().mockReturnValue({ eq })
    supabaseMock.from.mockReturnValue({ update })

    await expect(
      updateTechnology('technology-1', { categoryId: 'category-2', notes: '' }),
    ).resolves.toEqual({ ...technology, categoryId: 'category-2', notes: '' })
    expect(update).toHaveBeenCalledWith({ category_id: 'category-2', notes: '' })
    expect(eq).toHaveBeenCalledWith('id', 'technology-1')
    expect(select).toHaveBeenCalledWith()
    expect(single).toHaveBeenCalledWith()
  })

  it('deletes with select().single() and maps the deleted row', async () => {
    const single = vi.fn().mockResolvedValue({ data: technologyRow, error: null })
    const select = vi.fn().mockReturnValue({ single })
    const eq = vi.fn().mockReturnValue({ select })
    const deleteQuery = vi.fn().mockReturnValue({ eq })
    supabaseMock.from.mockReturnValue({ delete: deleteQuery })

    await expect(deleteTechnology('technology-1')).resolves.toEqual(technology)
    expect(deleteQuery).toHaveBeenCalledWith()
    expect(eq).toHaveBeenCalledWith('id', 'technology-1')
    expect(select).toHaveBeenCalledWith()
    expect(single).toHaveBeenCalledWith()
  })

  it.each([
    ['listTechnologies', () => listTechnologies(), 'list'],
    ['getTechnology', () => getTechnology('technology-1'), 'get'],
    ['createTechnology', () => createTechnology('user-1', newTechnology), 'create'],
    ['updateTechnology', () => updateTechnology('technology-1', { name: 'Vue' }), 'update'],
    ['deleteTechnology', () => deleteTechnology('technology-1'), 'delete'],
  ])('propagates Supabase errors from %s', async (_name, call, operation) => {
    const error = new Error(`${operation} failed`)
    const terminal = { data: null, error }

    if (operation === 'list') {
      supabaseMock.from.mockReturnValue({ select: vi.fn().mockResolvedValue(terminal) })
    } else if (operation === 'get') {
      supabaseMock.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue(terminal),
          }),
        }),
      })
    } else if (operation === 'create') {
      supabaseMock.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue(terminal) }),
        }),
      })
    } else {
      supabaseMock.from.mockReturnValue({
        [operation]: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue(terminal) }),
          }),
        }),
      })
    }

    await expect(call()).rejects.toBe(error)
  })

  it.each([
    ['no existe', 'update', () => updateTechnology('technology-404', { name: 'Vue' })],
    ['es de otro usuario', 'update', () => updateTechnology('technology-other', { name: 'Vue' })],
    ['no existe', 'delete', () => deleteTechnology('technology-404')],
    ['es de otro usuario', 'delete', () => deleteTechnology('technology-other')],
  ])(
    '%s y %s son indistinguibles al afectar cero filas',
    async (_scenario, operation, call) => {
      const hiddenRowError = new Error('JSON object requested, multiple (or no) rows returned')
      const single = vi.fn().mockResolvedValue({ data: null, error: hiddenRowError })
      const select = vi.fn().mockReturnValue({ single })
      const eq = vi.fn().mockReturnValue({ select })
      supabaseMock.from.mockReturnValue(
        operation === 'update'
          ? { update: vi.fn().mockReturnValue({ eq }) }
          : { delete: vi.fn().mockReturnValue({ eq }) },
      )

      await expect(call()).rejects.toBe(hiddenRowError)
    },
  )
})
