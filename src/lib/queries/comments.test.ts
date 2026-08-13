import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ from: vi.fn() }))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: mocks.from },
}))

import {
  createComment,
  deleteComment,
  listComments,
  updateComment,
} from './comments'

const row = {
  id: 'comment-1',
  technology_id: 'technology-1',
  user_id: 'user-1',
  parent_comment_id: null,
  body: 'Buen resumen',
  created_at: '2026-08-13T10:00:00.000Z',
  updated_at: '2026-08-13T10:00:00.000Z',
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
  const update = vi.fn().mockReturnValue({ eq: mutationEq })
  const deleteQuery = vi.fn().mockReturnValue({ eq: mutationEq })

  mocks.from.mockReturnValue({ select, insert, update, delete: deleteQuery })
  return { select, listEq, order, insert, update, deleteQuery }
}

describe('comment queries', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists only the requested technology and maps rows', async () => {
    const chain = setup()

    await expect(listComments('technology-1')).resolves.toEqual([
      {
        id: 'comment-1',
        technologyId: 'technology-1',
        userId: 'user-1',
        parentCommentId: null,
        body: 'Buen resumen',
        createdAt: '2026-08-13T10:00:00.000Z',
        updatedAt: '2026-08-13T10:00:00.000Z',
      },
    ])
    expect(mocks.from).toHaveBeenCalledWith('comments')
    expect(chain.listEq).toHaveBeenCalledWith('technology_id', 'technology-1')
    expect(chain.order).toHaveBeenCalledWith('created_at', { ascending: true })
  })

  it('inserts the active user id and a nullable parent id explicitly', async () => {
    const chain = setup()

    await createComment('user-1', {
      technologyId: 'technology-1',
      parentCommentId: 'parent-1',
      body: 'Respuesta',
    })

    expect(chain.insert).toHaveBeenCalledWith({
      technology_id: 'technology-1',
      user_id: 'user-1',
      parent_comment_id: 'parent-1',
      body: 'Respuesta',
    })
  })

  it('updates only body and deletes only by id', async () => {
    const chain = setup()

    await updateComment('comment-1', 'Texto corregido')
    await deleteComment('comment-1')

    expect(chain.update).toHaveBeenCalledWith({ body: 'Texto corregido' })
    expect(chain.deleteQuery).toHaveBeenCalledOnce()
  })

  it('propagates a trigger rejection for a nested reply unchanged', async () => {
    const triggerError = Object.assign(new Error('replies can only be one level deep'), {
      code: 'P0001',
    })
    setup(triggerError)

    await expect(
      createComment('user-1', {
        technologyId: 'technology-1',
        parentCommentId: 'reply-1',
        body: 'Tercer nivel',
      }),
    ).rejects.toBe(triggerError)
  })

  it('rejects an empty or oversized body before calling Supabase', async () => {
    await expect(
      createComment('user-1', { technologyId: 'technology-1', body: '   ' }),
    ).rejects.toThrow('El comentario debe tener entre 1 y 2000 caracteres.')
    await expect(updateComment('comment-1', 'x'.repeat(2001))).rejects.toThrow(
      'El comentario debe tener entre 1 y 2000 caracteres.',
    )
    expect(mocks.from).not.toHaveBeenCalled()
  })
})
