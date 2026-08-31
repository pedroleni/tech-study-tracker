// Tipos y comparación de resultados de una consulta SQL — agnósticos de
// motor (sql.js o PGlite). Compartido entre src/lib/sql-en-vivo/motor.ts
// y src/lib/postgres-en-vivo/motor.ts.
export interface ResultadoConsultaOk {
  ok: true
  columns: string[]
  values: unknown[][]
}

export interface ResultadoConsultaError {
  ok: false
  mensaje: string
}

export type ResultadoConsulta = ResultadoConsultaOk | ResultadoConsultaError

export function compararResultados(a: ResultadoConsulta, b: ResultadoConsulta): boolean {
  if (!a.ok || !b.ok) return false
  if (a.columns.length !== b.columns.length) return false
  for (let i = 0; i < a.columns.length; i++) {
    if (a.columns[i] !== b.columns[i]) return false
  }

  const normalizar = (filas: unknown[][]) => filas.map((fila) => JSON.stringify(fila)).sort()
  const filasA = normalizar(a.values)
  const filasB = normalizar(b.values)
  if (filasA.length !== filasB.length) return false
  return filasA.every((fila, i) => fila === filasB[i])
}
