import { beforeEach, describe, expect, it, vi } from 'vitest'

const supabaseMock = vi.hoisted(() => ({ from: vi.fn() }))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: supabaseMock,
}))

import {
  createCategory,
  deleteCategory,
  listCategories,
  renameCategory,
} from './categories'

const categoryRow = {
  id: 'category-1',
  name: 'Frontend',
  created_at: '2026-08-13T08:00:00.000Z',
}

const category = {
  id: 'category-1',
  name: 'Frontend',
  createdAt: '2026-08-13T08:00:00.000Z',
}

describe('category queries', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists and maps categories', async () => {
    const select = vi.fn().mockResolvedValue({ data: [categoryRow], error: null })
    supabaseMock.from.mockReturnValue({ select })

    await expect(listCategories()).resolves.toEqual([category])
    expect(supabaseMock.from).toHaveBeenCalledWith('categories')
    expect(select).toHaveBeenCalledWith()
  })

  it('creates a category with the explicit user id and maps it', async () => {
    const single = vi.fn().mockResolvedValue({ data: categoryRow, error: null })
    const select = vi.fn().mockReturnValue({ single })
    const insert = vi.fn().mockReturnValue({ select })
    supabaseMock.from.mockReturnValue({ insert })

    await expect(createCategory('user-1', 'Frontend')).resolves.toEqual(category)
    expect(insert).toHaveBeenCalledWith({ user_id: 'user-1', name: 'Frontend' })
    expect(select).toHaveBeenCalledWith()
    expect(single).toHaveBeenCalledWith()
  })

  it('renames a category with select().single() and maps it', async () => {
    const renamedRow = { ...categoryRow, name: 'Web' }
    const single = vi.fn().mockResolvedValue({ data: renamedRow, error: null })
    const select = vi.fn().mockReturnValue({ single })
    const eq = vi.fn().mockReturnValue({ select })
    const update = vi.fn().mockReturnValue({ eq })
    supabaseMock.from.mockReturnValue({ update })

    await expect(renameCategory('category-1', 'Web')).resolves.toEqual({
      ...category,
      name: 'Web',
    })
    expect(update).toHaveBeenCalledWith({ name: 'Web' })
    expect(eq).toHaveBeenCalledWith('id', 'category-1')
    expect(select).toHaveBeenCalledWith()
    expect(single).toHaveBeenCalledWith()
  })

  it('deletes a category with select().single() and maps the deleted row', async () => {
    const single = vi.fn().mockResolvedValue({ data: categoryRow, error: null })
    const select = vi.fn().mockReturnValue({ single })
    const eq = vi.fn().mockReturnValue({ select })
    const deleteQuery = vi.fn().mockReturnValue({ eq })
    supabaseMock.from.mockReturnValue({ delete: deleteQuery })

    await expect(deleteCategory('category-1')).resolves.toEqual(category)
    expect(deleteQuery).toHaveBeenCalledWith()
    expect(eq).toHaveBeenCalledWith('id', 'category-1')
    expect(select).toHaveBeenCalledWith()
    expect(single).toHaveBeenCalledWith()
  })

  it.each([
    ['listCategories', () => listCategories(), 'select'],
    ['createCategory', () => createCategory('user-1', 'Frontend'), 'insert'],
    ['renameCategory', () => renameCategory('category-1', 'Web'), 'update'],
    ['deleteCategory', () => deleteCategory('category-1'), 'delete'],
  ])('propagates Supabase errors from %s', async (_name, call, operation) => {
    const error = new Error(`${operation} failed`)
    const terminal = { data: null, error }

    if (operation === 'select') {
      supabaseMock.from.mockReturnValue({ select: vi.fn().mockResolvedValue(terminal) })
    } else if (operation === 'insert') {
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
    ['no existe', 'update', () => renameCategory('category-404', 'Web')],
    ['es de otro usuario', 'update', () => renameCategory('category-other', 'Web')],
    ['no existe', 'delete', () => deleteCategory('category-404')],
    ['es de otro usuario', 'delete', () => deleteCategory('category-other')],
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
