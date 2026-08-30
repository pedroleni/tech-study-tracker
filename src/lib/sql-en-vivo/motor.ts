// Motor de ejecución real de SQL en el navegador, vía sql.js (SQLite
// compilado a WebAssembly). Se carga con import() dinámico: solo se
// descarga cuando una lección tiene un bloque sql-anotado o sql-en-vivo,
// nunca en el resto de páginas. Ver specs/features/sql-en-vivo.md.
//
// Cada llamada a ejecutarConsulta recrea la base de datos desde cero a
// partir de esquemaSql — nunca hay una Database compartida entre dos
// ejecuciones. Esto es deliberado: un UPDATE/DELETE en un intento del
// alumno no debe contaminar el siguiente intento, ni la comparación con
// la consulta solución.
import type { QueryExecResult, SqlJsStatic, SqlValue } from 'sql.js'

export interface ResultadoConsultaOk {
  ok: true
  columns: string[]
  values: SqlValue[][]
}

export interface ResultadoConsultaError {
  ok: false
  mensaje: string
}

export type ResultadoConsulta = ResultadoConsultaOk | ResultadoConsultaError

export interface MotorSql {
  DatabaseCtor: SqlJsStatic['Database']
}

async function cargarWasmPorFetch(): Promise<ArrayBuffer> {
  const respuesta = await fetch('/sql-wasm.wasm')
  if (!respuesta.ok) {
    throw new Error(`No se pudo cargar sql-wasm.wasm (${respuesta.status})`)
  }
  return respuesta.arrayBuffer()
}

export async function crearMotorSql(
  cargarWasm: () => Promise<ArrayBuffer> = cargarWasmPorFetch,
): Promise<MotorSql> {
  const [{ default: initSqlJs }, wasmBinary] = await Promise.all([
    import('sql.js'),
    cargarWasm(),
  ])
  const SQL = await initSqlJs({ wasmBinary })
  return { DatabaseCtor: SQL.Database }
}

export function ejecutarConsulta(
  motor: MotorSql,
  esquemaSql: string,
  consulta: string,
): ResultadoConsulta {
  const db = new motor.DatabaseCtor()
  try {
    db.run(esquemaSql)
    const filas: QueryExecResult[] = db.exec(consulta)
    if (filas.length === 0) return { ok: true, columns: [], values: [] }
    return { ok: true, columns: filas[0].columns, values: filas[0].values }
  } catch (error) {
    return { ok: false, mensaje: error instanceof Error ? error.message : String(error) }
  } finally {
    db.close()
  }
}

export function compararResultados(a: ResultadoConsulta, b: ResultadoConsulta): boolean {
  if (!a.ok || !b.ok) return false
  if (a.columns.length !== b.columns.length) return false
  for (let i = 0; i < a.columns.length; i++) {
    if (a.columns[i] !== b.columns[i]) return false
  }

  const normalizar = (filas: SqlValue[][]) => filas.map((fila) => JSON.stringify(fila)).sort()
  const filasA = normalizar(a.values)
  const filasB = normalizar(b.values)
  if (filasA.length !== filasB.length) return false
  return filasA.every((fila, i) => fila === filasB[i])
}
