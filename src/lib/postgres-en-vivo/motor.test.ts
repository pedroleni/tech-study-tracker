import { Blob as NodeBlob, File as NodeFile } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { crearMotorPostgres, ejecutarConsultaPostgres } from './motor'

globalThis.Blob = NodeBlob as unknown as typeof Blob
globalThis.File = NodeFile as unknown as typeof File

async function cargarWasmDesdeDisco(): Promise<WebAssembly.Module> {
  const buffer = await readFile(join(process.cwd(), 'public', 'pglite.wasm'))
  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer
  return WebAssembly.compile(arrayBuffer)
}

async function cargarFsBundleDesdeDisco(): Promise<Blob> {
  const buffer = await readFile(join(process.cwd(), 'public', 'pglite.data'))
  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer
  return new Blob([arrayBuffer])
}

const ESQUEMA = `
  CREATE TABLE departamentos (id serial primary key, nombre text);
  CREATE TABLE empleados (id serial primary key, nombre text, departamento_id int, salario numeric);
  INSERT INTO departamentos (nombre) VALUES ('Ingeniería'), ('Ventas');
  INSERT INTO empleados (nombre, departamento_id, salario) VALUES
    ('Ana', 1, 55000), ('Luis', 1, 62000), ('Marta', 2, 48000);
`

describe('ejecutarConsultaPostgres', () => {
  it('ejecuta un SELECT simple y devuelve columnas y filas reales', async () => {
    const motor = await crearMotorPostgres(cargarWasmDesdeDisco, cargarFsBundleDesdeDisco)
    const resultado = await ejecutarConsultaPostgres(
      motor,
      ESQUEMA,
      'SELECT nombre FROM empleados ORDER BY nombre',
    )

    expect(resultado.ok).toBe(true)
    if (resultado.ok) {
      expect(resultado.columns).toEqual(['nombre'])
      expect(resultado.values).toEqual([['Ana'], ['Luis'], ['Marta']])
    }
  })
})

describe('RLS con identidad simulada', () => {
  const ESQUEMA_RLS = `
    CREATE TABLE posts (id serial primary key, autor_id text not null, titulo text not null);
    INSERT INTO posts (autor_id, titulo) VALUES
      ('ana', 'Post de Ana 1'), ('ana', 'Post de Ana 2'), ('roberto', 'Post de Roberto');
    CREATE OR REPLACE FUNCTION auth_uid() RETURNS text AS $$
      SELECT current_setting('myapp.current_user_id', true);
    $$ LANGUAGE sql STABLE;
    ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "solo ver los propios posts" ON posts FOR SELECT USING (autor_id = auth_uid());
    CREATE ROLE app_user NOSUPERUSER;
    GRANT USAGE ON SCHEMA public TO app_user;
    GRANT SELECT ON posts TO app_user;
  `
  const CONSULTA = 'SELECT titulo FROM posts ORDER BY titulo'

  it('cada identidad ve solo sus propias filas', async () => {
    const motor = await crearMotorPostgres(cargarWasmDesdeDisco, cargarFsBundleDesdeDisco)

    const comoAna = await ejecutarConsultaPostgres(motor, ESQUEMA_RLS, CONSULTA, {
      identidad: { etiqueta: 'Ana', valor: 'ana' },
    })
    expect(comoAna.ok).toBe(true)
    if (comoAna.ok) expect(comoAna.values).toEqual([['Post de Ana 1'], ['Post de Ana 2']])

    const comoRoberto = await ejecutarConsultaPostgres(motor, ESQUEMA_RLS, CONSULTA, {
      identidad: { etiqueta: 'Roberto', valor: 'roberto' },
    })
    expect(comoRoberto.ok).toBe(true)
    if (comoRoberto.ok) expect(comoRoberto.values).toEqual([['Post de Roberto']])
  })

  it('una identidad desconocida no ve ninguna fila', async () => {
    const motor = await crearMotorPostgres(cargarWasmDesdeDisco, cargarFsBundleDesdeDisco)
    const resultado = await ejecutarConsultaPostgres(motor, ESQUEMA_RLS, CONSULTA, {
      identidad: { etiqueta: 'Nadie', valor: 'nadie-conocido' },
    })
    expect(resultado.ok).toBe(true)
    if (resultado.ok) expect(resultado.values).toEqual([])
  })

  it('sin identidad (superusuario) ve todas las filas — RLS no se aplica al superusuario', async () => {
    const motor = await crearMotorPostgres(cargarWasmDesdeDisco, cargarFsBundleDesdeDisco)
    const resultado = await ejecutarConsultaPostgres(motor, ESQUEMA_RLS, CONSULTA)
    expect(resultado.ok).toBe(true)
    if (resultado.ok) expect(resultado.values).toHaveLength(3)
  })
})

describe('aislamiento entre ejecuciones', () => {
  it('un UPDATE en una ejecución no afecta a la siguiente', async () => {
    const motor = await crearMotorPostgres(cargarWasmDesdeDisco, cargarFsBundleDesdeDisco)
    await ejecutarConsultaPostgres(motor, ESQUEMA, "UPDATE empleados SET salario = 0 WHERE nombre = 'Ana'")
    const resultado = await ejecutarConsultaPostgres(
      motor,
      ESQUEMA,
      "SELECT salario FROM empleados WHERE nombre = 'Ana'",
    )
    expect(resultado.ok).toBe(true)
    if (resultado.ok) expect(resultado.values).toEqual([['55000']])
  })
})

describe('errores reales', () => {
  it('devuelve un error real de Postgres en vez de reventar', async () => {
    const motor = await crearMotorPostgres(cargarWasmDesdeDisco, cargarFsBundleDesdeDisco)
    const resultado = await ejecutarConsultaPostgres(motor, ESQUEMA, 'SELECT * FROM tabla_falsa')
    expect(resultado.ok).toBe(false)
    if (!resultado.ok) expect(resultado.mensaje).toContain('does not exist')
  })
})

describe('extensiones', () => {
  it('pgcrypto funciona cuando se declara', async () => {
    const motor = await crearMotorPostgres(cargarWasmDesdeDisco, cargarFsBundleDesdeDisco)
    const resultado = await ejecutarConsultaPostgres(
      motor,
      'CREATE EXTENSION IF NOT EXISTS pgcrypto;',
      "SELECT digest('hola', 'sha256') IS NOT NULL AS funciona",
      { extensiones: ['pgcrypto'] },
    )
    expect(resultado.ok).toBe(true)
    if (resultado.ok) expect(resultado.values).toEqual([[true]])
  })

  it('sin declarar la extensión, CREATE EXTENSION falla', async () => {
    const motor = await crearMotorPostgres(cargarWasmDesdeDisco, cargarFsBundleDesdeDisco)
    const resultado = await ejecutarConsultaPostgres(
      motor,
      'CREATE EXTENSION IF NOT EXISTS pgcrypto;',
      "SELECT 1",
    )
    expect(resultado.ok).toBe(false)
  })
})
