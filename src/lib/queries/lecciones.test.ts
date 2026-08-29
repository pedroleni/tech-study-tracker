import { beforeEach, describe, expect, it, vi } from 'vitest'

const supabaseMock = vi.hoisted(() => ({ from: vi.fn() }))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: supabaseMock,
}))

import type { NewLeccionInput } from './mappers'
import { createLeccion, getLeccion, listLecciones, listProyectos, updateLeccion } from './lecciones'

const leccionRow = {
  id: 'leccion-1',
  technology_id: 'technology-1',
  slug: 'fundamentos',
  modulo: 'Introducción',
  titulo: 'Fundamentos',
  resumen: 'La base de HTML.',
  contenido: '# Fundamentos',
  orden: 10,
  status: 'borrador' as const,
  es_proyecto: false,
  created_at: '2026-08-14T08:00:00.000Z',
  updated_at: '2026-08-14T08:00:00.000Z',
}

const leccion = {
  id: 'leccion-1',
  technologyId: 'technology-1',
  slug: 'fundamentos',
  modulo: 'Introducción',
  titulo: 'Fundamentos',
  resumen: 'La base de HTML.',
  contenido: '# Fundamentos',
  orden: 10,
  status: 'borrador' as const,
  esProyecto: false,
  createdAt: '2026-08-14T08:00:00.000Z',
  updatedAt: '2026-08-14T08:00:00.000Z',
}

const newLeccion: NewLeccionInput = {
  technologyId: 'technology-1',
  slug: 'fundamentos',
  modulo: 'Introducción',
  titulo: 'Fundamentos',
  resumen: 'La base de HTML.',
  contenido: '# Fundamentos',
  orden: 10,
  esProyecto: false,
}

describe('lesson queries', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists one technology lessons ordered by order and creation time', async () => {
    const secondOrder = vi.fn().mockResolvedValue({ data: [leccionRow], error: null })
    const firstOrder = vi.fn().mockReturnValue({ order: secondOrder })
    const eq = vi.fn().mockReturnValue({ order: firstOrder })
    const select = vi.fn().mockReturnValue({ eq })
    supabaseMock.from.mockReturnValue({ select })

    await expect(listLecciones('technology-1')).resolves.toEqual([leccion])
    expect(supabaseMock.from).toHaveBeenCalledWith('lecciones')
    expect(eq).toHaveBeenCalledWith('technology_id', 'technology-1')
    expect(firstOrder).toHaveBeenCalledWith('orden', { ascending: true })
    expect(secondOrder).toHaveBeenCalledWith('created_at', { ascending: true })
  })

  it('gets a public lesson by its technology and slug', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: leccionRow, error: null })
    const slugEq = vi.fn().mockReturnValue({ maybeSingle })
    const technologyEq = vi.fn().mockReturnValue({ eq: slugEq })
    const select = vi.fn().mockReturnValue({ eq: technologyEq })
    supabaseMock.from.mockReturnValue({ select })

    await expect(
      getLeccion({ technologyId: 'technology-1', slug: 'fundamentos' }),
    ).resolves.toEqual(leccion)
    expect(technologyEq).toHaveBeenCalledWith('technology_id', 'technology-1')
    expect(slugEq).toHaveBeenCalledWith('slug', 'fundamentos')
  })

  it('gets an admin lesson by id and returns null when RLS hides it', async () => {
    const maybeSingle = vi
      .fn()
      .mockResolvedValueOnce({ data: leccionRow, error: null })
      .mockResolvedValueOnce({ data: null, error: null })
    const eq = vi.fn().mockReturnValue({ maybeSingle })
    supabaseMock.from.mockReturnValue({ select: vi.fn().mockReturnValue({ eq }) })

    await expect(getLeccion({ id: 'leccion-1' })).resolves.toEqual(leccion)
    await expect(getLeccion({ id: 'leccion-hidden' })).resolves.toBeNull()
  })

  it('creates a draft without sending status and maps the returned row', async () => {
    const single = vi.fn().mockResolvedValue({ data: leccionRow, error: null })
    const select = vi.fn().mockReturnValue({ single })
    const insert = vi.fn().mockReturnValue({ select })
    supabaseMock.from.mockReturnValue({ insert })

    await expect(createLeccion(newLeccion)).resolves.toEqual(leccion)
    expect(insert).toHaveBeenCalledWith({
      technology_id: 'technology-1',
      slug: 'fundamentos',
      modulo: 'Introducción',
      titulo: 'Fundamentos',
      resumen: 'La base de HTML.',
      contenido: '# Fundamentos',
      orden: 10,
      es_proyecto: false,
    })
  })

  it('updates only supplied editable fields and never reparents the lesson', async () => {
    const updatedRow = { ...leccionRow, status: 'publicado' as const, es_proyecto: true }
    const single = vi.fn().mockResolvedValue({ data: updatedRow, error: null })
    const select = vi.fn().mockReturnValue({ single })
    const eq = vi.fn().mockReturnValue({ select })
    const update = vi.fn().mockReturnValue({ eq })
    supabaseMock.from.mockReturnValue({ update })

    await expect(
      updateLeccion('leccion-1', { status: 'publicado', esProyecto: true }),
    ).resolves.toEqual({
      ...leccion,
      status: 'publicado',
      esProyecto: true,
    })
    expect(update).toHaveBeenCalledWith({ status: 'publicado', es_proyecto: true })
    expect(eq).toHaveBeenCalledWith('id', 'leccion-1')
  })

  it('lists only project lessons with their technology presentation data', async () => {
    const projectRow = {
      ...leccionRow,
      es_proyecto: true,
      technology: {
        id: 'technology-1',
        name: 'HTML',
        icon: 'html5',
        status: 'completado' as const,
      },
    }
    const secondOrder = vi.fn().mockResolvedValue({ data: [projectRow], error: null })
    const firstOrder = vi.fn().mockReturnValue({ order: secondOrder })
    const eq = vi.fn().mockReturnValue({ order: firstOrder })
    const select = vi.fn().mockReturnValue({ eq })
    supabaseMock.from.mockReturnValue({ select })

    await expect(listProyectos()).resolves.toEqual([
      {
        ...leccion,
        esProyecto: true,
        technology: { id: 'technology-1', name: 'HTML', icon: 'html5', status: 'completado' },
      },
    ])
    expect(select).toHaveBeenCalledWith(
      '*, technology:technologies!inner(id, name, icon, status)',
    )
    expect(eq).toHaveBeenCalledWith('es_proyecto', true)
  })

  it('propagates Supabase errors unchanged', async () => {
    const error = new Error('RLS rejected the request')
    supabaseMock.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error }),
        }),
      }),
    })

    await expect(createLeccion(newLeccion)).rejects.toBe(error)
  })
})
