import { describe, expect, it } from 'vitest'

import type { GrafoGit } from '@/lib/git-en-vivo/motor'

import { calcularLayoutGrafo } from './calcularLayoutGrafo'

describe('calcularLayoutGrafo', () => {
  it('un historial lineal de 2 commits queda en el mismo carril, en orden', () => {
    const grafo: GrafoGit = {
      commits: [
        { hash: 'aaaa', hashCorto: 'aaaa', mensaje: 'v1', padres: [] },
        {
          hash: 'bbbb',
          hashCorto: 'bbbb',
          mensaje: 'v2',
          padres: ['aaaa'],
        },
      ],
      ramas: [{ nombre: 'master', hash: 'bbbb' }],
      ramaActual: 'master',
    }
    const layout = calcularLayoutGrafo(grafo)

    const nodoV1 = layout.nodos.find((n) => n.hash === 'aaaa')!
    const nodoV2 = layout.nodos.find((n) => n.hash === 'bbbb')!
    expect(nodoV1.carril).toBe(0)
    expect(nodoV2.carril).toBe(0)
    expect(nodoV1.x).toBeLessThan(nodoV2.x)
    expect(layout.aristas).toEqual([
      {
        desde: { x: nodoV1.x, y: nodoV1.y },
        hasta: { x: nodoV2.x, y: nodoV2.y },
      },
    ])
    expect(layout.etiquetas).toEqual([
      {
        nombre: 'master',
        x: nodoV2.x,
        y: nodoV2.y,
        carril: 0,
        esActual: true,
      },
    ])
  })

  it('una rama divergente pone la rama secundaria en un carril distinto', () => {
    const grafo: GrafoGit = {
      commits: [
        {
          hash: 'base',
          hashCorto: 'base',
          mensaje: 'base',
          padres: [],
        },
        {
          hash: 'feat',
          hashCorto: 'feat',
          mensaje: 'feature-commit',
          padres: ['base'],
        },
        {
          hash: 'mstr',
          hashCorto: 'mstr',
          mensaje: 'master-commit',
          padres: ['base'],
        },
      ],
      ramas: [
        { nombre: 'master', hash: 'mstr' },
        { nombre: 'feature', hash: 'feat' },
      ],
      ramaActual: 'master',
    }
    const layout = calcularLayoutGrafo(grafo)

    const nodoBase = layout.nodos.find((n) => n.hash === 'base')!
    const nodoMaster = layout.nodos.find((n) => n.hash === 'mstr')!
    const nodoFeature = layout.nodos.find((n) => n.hash === 'feat')!

    expect(nodoBase.carril).toBe(0)
    expect(nodoMaster.carril).toBe(0)
    expect(nodoFeature.carril).toBe(1)
    expect(layout.aristas).toHaveLength(2)

    const etiquetaMaster = layout.etiquetas.find(
      (e) => e.nombre === 'master',
    )!
    const etiquetaFeature = layout.etiquetas.find(
      (e) => e.nombre === 'feature',
    )!
    expect(etiquetaMaster.esActual).toBe(true)
    expect(etiquetaFeature.esActual).toBe(false)
  })
})
