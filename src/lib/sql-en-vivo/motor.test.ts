import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { compararResultados, crearMotorSql, ejecutarConsulta } from './motor'

async function cargarWasmDesdeDisco(): Promise<ArrayBuffer> {
  const buffer = await readFile(join(process.cwd(), 'public', 'sql-wasm.wasm'))
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer
}

const ESQUEMA = `
  CREATE TABLE departamentos (id INTEGER PRIMARY KEY, nombre TEXT);
  CREATE TABLE empleados (id INTEGER PRIMARY KEY, nombre TEXT, departamento_id INTEGER, salario REAL);
  INSERT INTO departamentos VALUES (1, 'Ingeniería'), (2, 'Ventas');
  INSERT INTO empleados VALUES (1, 'Ana', 1, 55000), (2, 'Luis', 1, 62000), (3, 'Marta', 2, 48000);
`

describe('ejecutarConsulta', () => {
  it('ejecuta un SELECT simple y devuelve columnas y filas reales', async () => {
    const motor = await crearMotorSql(cargarWasmDesdeDisco)
    const resultado = ejecutarConsulta(motor, ESQUEMA, 'SELECT nombre FROM empleados ORDER BY nombre')

    expect(resultado.ok).toBe(true)
    if (resultado.ok) {
      expect(resultado.columns).toEqual(['nombre'])
      expect(resultado.values).toEqual([['Ana'], ['Luis'], ['Marta']])
    }
  })

  it('ejecuta JOIN + GROUP BY + agregación', async () => {
    const motor = await crearMotorSql(cargarWasmDesdeDisco)
    const resultado = ejecutarConsulta(
      motor,
      ESQUEMA,
      `SELECT d.nombre, COUNT(*) AS n FROM empleados e JOIN departamentos d ON d.id = e.departamento_id GROUP BY d.nombre ORDER BY d.nombre`,
    )

    expect(resultado.ok).toBe(true)
    if (resultado.ok) {
      expect(resultado.columns).toEqual(['nombre', 'n'])
      expect(resultado.values).toEqual([['Ingeniería', 2], ['Ventas', 1]])
    }
  })

  it('ejecuta una CTE (WITH)', async () => {
    const motor = await crearMotorSql(cargarWasmDesdeDisco)
    const resultado = ejecutarConsulta(
      motor,
      ESQUEMA,
      `WITH altos AS (SELECT nombre FROM empleados WHERE salario > 50000) SELECT nombre FROM altos ORDER BY nombre`,
    )

    expect(resultado.ok).toBe(true)
    if (resultado.ok) expect(resultado.values).toEqual([['Ana'], ['Luis']])
  })

  it('devuelve un error real de SQLite en vez de reventar', async () => {
    const motor = await crearMotorSql(cargarWasmDesdeDisco)
    const resultado = ejecutarConsulta(motor, ESQUEMA, 'SELECT * FROM tabla_falsa')

    expect(resultado.ok).toBe(false)
    if (!resultado.ok) expect(resultado.mensaje).toContain('no such table')
  })

  it('un UPDATE en una ejecución no afecta a la siguiente (cada ejecución recrea la base de datos)', async () => {
    const motor = await crearMotorSql(cargarWasmDesdeDisco)
    ejecutarConsulta(motor, ESQUEMA, "UPDATE empleados SET salario = 0 WHERE nombre = 'Ana'")
    const resultado = ejecutarConsulta(motor, ESQUEMA, "SELECT salario FROM empleados WHERE nombre = 'Ana'")

    expect(resultado.ok).toBe(true)
    if (resultado.ok) expect(resultado.values).toEqual([[55000]])
  })

  it('devuelve un array de filas vacío (no undefined) para una consulta sin resultado', async () => {
    const motor = await crearMotorSql(cargarWasmDesdeDisco)
    const resultado = ejecutarConsulta(motor, ESQUEMA, "UPDATE empleados SET salario = salario")

    expect(resultado.ok).toBe(true)
    if (resultado.ok) {
      expect(resultado.columns).toEqual([])
      expect(resultado.values).toEqual([])
    }
  })
})

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
