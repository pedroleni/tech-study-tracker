import type { Technology } from '@/types'

import { groupByCategory } from './groupByCategory'

const createTechnology = (
  id: string,
  categoryId: string,
): Technology => ({
  id,
  categoryId,
  name: `Technology ${id}`,
  status: 'pendiente',
  priority: 'media',
  difficulty: 'media',
  notes: '',
  resources: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
})

describe('groupByCategory', () => {
  it('devuelve un objeto vacío cuando no hay tecnologías', () => {
    expect(groupByCategory([])).toEqual({})
  })

  it('agrupa las tecnologías por categoryId y conserva su orden', () => {
    const firstFrontend = createTechnology('react', 'frontend')
    const backend = createTechnology('node', 'backend')
    const secondFrontend = createTechnology('typescript', 'frontend')

    expect(
      groupByCategory([firstFrontend, backend, secondFrontend]),
    ).toEqual({
      frontend: [firstFrontend, secondFrontend],
      backend: [backend],
    })
  })
})
