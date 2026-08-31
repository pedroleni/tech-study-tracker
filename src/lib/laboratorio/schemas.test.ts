import { describe, expect, it } from 'vitest'

import { esquemaBloqueLaboratorio, esquemaEditorEnVivo, esquemaSqlAnotado, esquemaSqlEnVivo } from './schemas'

describe('esquemaEditorEnVivo', () => {
  it('acepta un bloque que solo trae contenido en ts', () => {
    const resultado = esquemaEditorEnVivo.safeParse({
      tipo: 'editor-en-vivo',
      ts: 'const x: number = 1;',
    })

    expect(resultado.success).toBe(true)
    if (resultado.success) {
      expect(resultado.data.ts).toBe('const x: number = 1;')
      expect(resultado.data.html).toBe('')
      expect(resultado.data.pestañaInicial).toBe('html')
    }
  })

  it('acepta pestañaInicial: "ts"', () => {
    const resultado = esquemaEditorEnVivo.safeParse({
      tipo: 'editor-en-vivo',
      ts: 'const x = 1;',
      pestañaInicial: 'ts',
    })

    expect(resultado.success).toBe(true)
  })

  it('sigue rechazando un bloque sin contenido en ningún campo', () => {
    const resultado = esquemaEditorEnVivo.safeParse({
      tipo: 'editor-en-vivo',
    })

    expect(resultado.success).toBe(false)
  })

  it('sigue validando bloques ya publicados sin el campo ts (retrocompatible)', () => {
    const resultado = esquemaEditorEnVivo.safeParse({
      tipo: 'editor-en-vivo',
      html: '<p>Hola</p>',
    })

    expect(resultado.success).toBe(true)
    if (resultado.success) {
      expect(resultado.data.ts).toBe('')
    }
  })
})

describe('esquemaSqlAnotado', () => {
  const base = {
    tipo: 'sql-anotado' as const,
    esquemaSql: "CREATE TABLE t (id INTEGER PRIMARY KEY, nombre TEXT); INSERT INTO t VALUES (1, 'Ana');",
    consulta: 'SELECT nombre FROM t',
    anotaciones: [{ fragmento: 'SELECT nombre', nota: 'Selecciona solo la columna nombre.' }],
  }

  it('acepta un bloque válido con los campos mínimos', () => {
    const resultado = esquemaSqlAnotado.safeParse(base)

    expect(resultado.success).toBe(true)
    if (resultado.success) {
      expect(resultado.data.esquemaSql).toBe(base.esquemaSql)
      expect(resultado.data.consulta).toBe(base.consulta)
      expect(resultado.data.anotaciones).toHaveLength(1)
    }
  })

  it('acepta titulo opcional', () => {
    const resultado = esquemaSqlAnotado.safeParse({ ...base, titulo: 'Un título' })

    expect(resultado.success).toBe(true)
  })

  it('rechaza un bloque sin esquemaSql', () => {
    const resultado = esquemaSqlAnotado.safeParse({
      tipo: base.tipo,
      consulta: base.consulta,
      anotaciones: base.anotaciones,
    })

    expect(resultado.success).toBe(false)
  })

  it('rechaza un bloque sin ninguna anotación', () => {
    const resultado = esquemaSqlAnotado.safeParse({ ...base, anotaciones: [] })

    expect(resultado.success).toBe(false)
  })

  it('rechaza más de 8 anotaciones', () => {
    const anotaciones = Array.from({ length: 9 }, (_, i) => ({
      fragmento: `frag${i}`,
      nota: `nota ${i}`,
    }))
    const resultado = esquemaSqlAnotado.safeParse({ ...base, anotaciones })

    expect(resultado.success).toBe(false)
  })

  it('rechaza esquemaSql de más de 3000 caracteres', () => {
    const resultado = esquemaSqlAnotado.safeParse({ ...base, esquemaSql: 'a'.repeat(3001) })

    expect(resultado.success).toBe(false)
  })
})

describe('esquemaSqlEnVivo', () => {
  const base = {
    tipo: 'sql-en-vivo' as const,
    esquemaSql: "CREATE TABLE t (id INTEGER PRIMARY KEY, nombre TEXT); INSERT INTO t VALUES (1, 'Ana');",
  }

  it('acepta un bloque puramente exploratorio (sin consultaSolucion)', () => {
    const resultado = esquemaSqlEnVivo.safeParse(base)

    expect(resultado.success).toBe(true)
    if (resultado.success) {
      expect(resultado.data.consultaInicial).toBe('')
      expect(resultado.data.consultaSolucion).toBeUndefined()
    }
  })

  it('acepta un bloque de ejercicio con consultaSolucion y consigna', () => {
    const resultado = esquemaSqlEnVivo.safeParse({
      ...base,
      consigna: 'Muestra el nombre de todos.',
      consultaInicial: '',
      consultaSolucion: 'SELECT nombre FROM t',
    })

    expect(resultado.success).toBe(true)
  })

  it('rechaza un bloque sin esquemaSql', () => {
    const resultado = esquemaSqlEnVivo.safeParse({ tipo: 'sql-en-vivo' })

    expect(resultado.success).toBe(false)
  })

  it('rechaza consultaSolucion de más de 1500 caracteres', () => {
    const resultado = esquemaSqlEnVivo.safeParse({ ...base, consultaSolucion: 'a'.repeat(1501) })

    expect(resultado.success).toBe(false)
  })
})

describe('esquemaSqlEnVivo — extensión Postgres', () => {
  const base = {
    tipo: 'sql-en-vivo' as const,
    esquemaSql: 'CREATE TABLE t (id int);',
    consultaInicial: '',
  }

  it('motor por defecto es sqlite (retrocompatible)', () => {
    const resultado = esquemaSqlEnVivo.safeParse(base)

    expect(resultado.success).toBe(true)
    if (resultado.success) expect(resultado.data.motor).toBe('sqlite')
  })

  it('acepta motor: postgres', () => {
    const resultado = esquemaSqlEnVivo.safeParse({ ...base, motor: 'postgres' })

    expect(resultado.success).toBe(true)
    if (resultado.success) expect(resultado.data.motor).toBe('postgres')
  })

  it('rechaza un motor que no sea sqlite ni postgres', () => {
    const resultado = esquemaSqlEnVivo.safeParse({ ...base, motor: 'mysql' })

    expect(resultado.success).toBe(false)
  })

  it('extensiones es opcional y solo acepta pgcrypto/uuid_ossp', () => {
    const sinExtensiones = esquemaSqlEnVivo.safeParse(base)
    expect(sinExtensiones.success).toBe(true)
    if (sinExtensiones.success) expect(sinExtensiones.data.extensiones).toBeUndefined()

    const conExtensiones = esquemaSqlEnVivo.safeParse({
      ...base,
      extensiones: ['pgcrypto', 'uuid_ossp'],
    })
    expect(conExtensiones.success).toBe(true)
    if (conExtensiones.success) {
      expect(conExtensiones.data.extensiones).toEqual(['pgcrypto', 'uuid_ossp'])
    }

    const invalida = esquemaSqlEnVivo.safeParse({ ...base, extensiones: ['postgis'] })
    expect(invalida.success).toBe(false)
  })

  it('identidadSimulada es opcional, necesita al menos 2 y como mucho 4', () => {
    const sinIdentidad = esquemaSqlEnVivo.safeParse(base)
    expect(sinIdentidad.success).toBe(true)
    if (sinIdentidad.success) expect(sinIdentidad.data.identidadSimulada).toBeUndefined()

    const dos = [
      { etiqueta: 'Ana', valor: 'ana' },
      { etiqueta: 'Roberto', valor: 'roberto' },
    ]
    const conDos = esquemaSqlEnVivo.safeParse({ ...base, identidadSimulada: dos })
    expect(conDos.success).toBe(true)
    if (conDos.success) expect(conDos.data.identidadSimulada).toEqual(dos)

    const conUna = esquemaSqlEnVivo.safeParse({ ...base, identidadSimulada: [dos[0]] })
    expect(conUna.success).toBe(false)

    const cinco = Array.from({ length: 5 }, (_, i) => ({ etiqueta: `u${i}`, valor: `v${i}` }))
    const conCinco = esquemaSqlEnVivo.safeParse({ ...base, identidadSimulada: cinco })
    expect(conCinco.success).toBe(false)
  })
})

describe('esquemaSqlAnotado — extensión Postgres', () => {
  it('motor por defecto es sqlite (retrocompatible)', () => {
    const resultado = esquemaSqlAnotado.safeParse({
      tipo: 'sql-anotado',
      esquemaSql: 'CREATE TABLE t (id int);',
      consulta: 'SELECT * FROM t;',
      anotaciones: [{ fragmento: 'SELECT', nota: 'x' }],
    })

    expect(resultado.success).toBe(true)
    if (resultado.success) expect(resultado.data.motor).toBe('sqlite')
  })
})

describe('esquemaBloqueLaboratorio con los tipos de SQL', () => {
  it('discrimina sql-anotado y sql-en-vivo dentro de la unión', () => {
    const anotado = esquemaBloqueLaboratorio.safeParse({
      tipo: 'sql-anotado',
      esquemaSql: 'CREATE TABLE t (id INTEGER);',
      consulta: 'SELECT * FROM t',
      anotaciones: [{ fragmento: 'SELECT', nota: 'nota' }],
    })
    const enVivo = esquemaBloqueLaboratorio.safeParse({
      tipo: 'sql-en-vivo',
      esquemaSql: 'CREATE TABLE t (id INTEGER);',
    })

    expect(anotado.success).toBe(true)
    expect(enVivo.success).toBe(true)
  })
})
