import {
  caracterActual,
  crearLectura,
  emitir,
  leerCadena,
  leerEspacios,
  leerIdentificador,
  leerPatron,
  recorrer,
  reglaComentarioDeLinea,
  type Lectura,
  type Regla,
  type Token,
} from './resaltadorBase'

const PALABRAS_CLAVE_SQL = new Set([
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'ON',
  'GROUP', 'BY', 'ORDER', 'HAVING', 'AS', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN',
  'IS', 'NULL', 'DISTINCT', 'LIMIT', 'OFFSET', 'ASC', 'DESC', 'UNION', 'ALL', 'EXISTS',
  'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'WITH', 'INSERT', 'INTO', 'VALUES', 'UPDATE',
  'SET', 'DELETE', 'CREATE', 'TABLE', 'ALTER', 'DROP', 'PRIMARY', 'KEY', 'FOREIGN',
  'REFERENCES', 'DEFAULT', 'UNIQUE', 'CHECK', 'INDEX', 'VIEW', 'COUNT', 'SUM', 'AVG',
  'MIN', 'MAX',
  // Vocabulario de PostgreSQL sin equivalente en SQLite (motor: 'postgres')
  'JSONB', 'RETURNING', 'POLICY', 'ROLE', 'GRANT', 'REVOKE', 'MATERIALIZED',
  'PARTITION', 'FUNCTION', 'PROCEDURE', 'TRIGGER', 'BEFORE', 'AFTER', 'FOR', 'EACH',
  'ROW', 'EXTENSION', 'SEQUENCE', 'SUPERUSER', 'NOSUPERUSER', 'LOGIN', 'ENABLE',
  'USING', 'ARRAY', 'ENUM',
])

/**
 * Avanza sobre una cadena SQL respetando el escape estándar: '' dentro de
 * la cadena representa una comilla simple literal, no un cierre (a
 * diferencia de JS, SQL no usa barra invertida para escapar).
 */
function finDeCadenaSql(codigo: string, inicio: number) {
  let i = inicio + 1
  while (i < codigo.length) {
    if (codigo[i] === "'" && codigo[i + 1] === "'") {
      i += 2
      continue
    }
    if (codigo[i] === "'") return i + 1
    i += 1
  }
  return codigo.length
}

function leerCadenaSql(lectura: Lectura): boolean {
  return leerCadena(lectura, "'", finDeCadenaSql) !== null
}

function leerNumeroSql(lectura: Lectura): boolean {
  return leerPatron(lectura, /^\d+\.?\d*/, 'numero') !== null
}

// SQL es insensible a mayúsculas en sus palabras clave (a diferencia de
// JS) — se compara en mayúsculas, pero se conserva el texto tal cual lo
// escribió quien redactó la consulta.
function esPalabraClaveSql(palabra: string) {
  return PALABRAS_CLAVE_SQL.has(palabra.toUpperCase())
}

function leerIdentificadorSql(lectura: Lectura): boolean {
  return leerIdentificador(lectura, /^[A-Za-z_][\w]*/, esPalabraClaveSql) !== null
}

function leerPuntuacionSql(lectura: Lectura): boolean {
  emitir(lectura, 'puntuacion', caracterActual(lectura))
  return true
}

const REGLAS_SQL: readonly Regla<unknown>[] = [
  reglaComentarioDeLinea('--'),
  leerCadenaSql,
  leerEspacios,
  leerNumeroSql,
  leerIdentificadorSql,
  leerPuntuacionSql,
]

export function tokenizarSql(codigo: string, salida: Token[]) {
  recorrer(crearLectura(codigo, salida), REGLAS_SQL, undefined)
}
