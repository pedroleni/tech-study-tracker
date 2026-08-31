import { describe, expect, it } from 'vitest'

import { compararResultados } from './comparar'

describe('compararResultados', () => {
  it('son iguales si coinciden columnas y filas, en cualquier orden de filas', () => {
    const a = { ok: true as const, columns: ['nombre', 'salario'], values: [['Ana', 55000], ['Luis', 62000]] }
    const b = { ok: true as const, columns: ['nombre', 'salario'], values: [['Luis', 62000], ['Ana', 55000]] }

    expect(compararResultados(a, b)).toBe(true)
  })

  it('son distintos si difieren los nombres de columna', () => {
    const a = { ok: true as const, columns: ['nombre'], values: [['Ana']] }
    const b = { ok: true as const, columns: ['nombre_completo'], values: [['Ana']] }

    expect(compararResultados(a, b)).toBe(false)
  })

  it('son distintos si difiere el orden de las columnas', () => {
    const a = { ok: true as const, columns: ['nombre', 'salario'], values: [['Ana', 55000]] }
    const b = { ok: true as const, columns: ['salario', 'nombre'], values: [[55000, 'Ana']] }

    expect(compararResultados(a, b)).toBe(false)
  })

  it('son distintos si difiere el número de filas', () => {
    const a = { ok: true as const, columns: ['nombre'], values: [['Ana'], ['Luis']] }
    const b = { ok: true as const, columns: ['nombre'], values: [['Ana']] }

    expect(compararResultados(a, b)).toBe(false)
  })

  it('cualquier resultado con error nunca coincide', () => {
    const ok = { ok: true as const, columns: ['nombre'], values: [['Ana']] }
    const error = { ok: false as const, mensaje: 'no such table: x' }

    expect(compararResultados(ok, error)).toBe(false)
    expect(compararResultados(error, ok)).toBe(false)
    expect(compararResultados(error, error)).toBe(false)
  })
})
