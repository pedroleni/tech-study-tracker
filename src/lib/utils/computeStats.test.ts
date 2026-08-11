import type { Status, Technology } from '@/types'

import { computeStats } from './computeStats'

const createTechnology = (id: string, status: Status): Technology => ({
  id,
  categoryId: 'category',
  name: `Technology ${id}`,
  status,
  priority: 'media',
  difficulty: 'media',
  notes: '',
  resources: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
})

describe('computeStats', () => {
  it('devuelve todos los contadores a cero cuando no hay tecnologías', () => {
    expect(computeStats([])).toEqual({
      pendiente: 0,
      en_progreso: 0,
      completado: 0,
      total: 0,
    })
  })

  it('calcula el total y los contadores de cada estado', () => {
    const technologies = [
      createTechnology('react', 'pendiente'),
      createTechnology('typescript', 'en_progreso'),
      createTechnology('node', 'completado'),
      createTechnology('postgres', 'completado'),
    ]

    expect(computeStats(technologies)).toEqual({
      pendiente: 1,
      en_progreso: 1,
      completado: 2,
      total: 4,
    })
  })
})
