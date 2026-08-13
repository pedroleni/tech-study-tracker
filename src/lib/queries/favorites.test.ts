import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ from: vi.fn() }))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: mocks.from },
}))

import { addFavorite, listFavorites, removeFavorite } from './favorites'

const row = {
  id: 'favorite-1',
  user_id: 'user-1',
  technology_id: 'technology-1',
  created_at: '2026-08-13T10:00:00.000Z',
}

function setup(error: Error | null = null) {
  const terminal = { data: error ? null : row, error }
  const single = vi.fn().mockResolvedValue(terminal)
  const mutationSelect = vi.fn().mockReturnValue({ single })
  const mutationEq = vi.fn().mockReturnValue({ select: mutationSelect })
  const order = vi.fn().mockResolvedValue({ data: error ? null : [row], error })
  const listEq = vi.fn().mockReturnValue({ order })
  const select = vi.fn().mockReturnValue({ eq: listEq })
  const insert = vi.fn().mockReturnValue({ select: mutationSelect })
  const deleteQuery = vi.fn().mockReturnValue({ eq: mutationEq })

  mocks.from.mockReturnValue({ select, insert, delete: deleteQuery })
  return { listEq, insert, deleteQuery }
}

describe('favorite queries', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists only the active user favorites and maps rows', async () => {
    const chain = setup()

    await expect(listFavorites('user-1')).resolves.toEqual([
      {
        id: 'favorite-1',
        userId: 'user-1',
        technologyId: 'technology-1',
        createdAt: '2026-08-13T10:00:00.000Z',
      },
    ])
    expect(chain.listEq).toHaveBeenCalledWith('user_id', 'user-1')
  })

  it('adds and removes an allowlisted favorite payload', async () => {
    const chain = setup()

    await addFavorite('user-1', 'technology-1')
    await removeFavorite('favorite-1')

    expect(chain.insert).toHaveBeenCalledWith({
      user_id: 'user-1',
      technology_id: 'technology-1',
    })
    expect(chain.deleteQuery).toHaveBeenCalledOnce()
  })

  it('propagates Supabase errors', async () => {
    const error = new Error('RLS rejected the favorite')
    setup(error)

    await expect(addFavorite('user-1', 'draft-technology')).rejects.toBe(error)
  })
})
