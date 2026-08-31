// Motor de ejecución real de SQL en el navegador, vía PGlite (PostgreSQL
// 18 real compilado a WebAssembly). Ver specs/features/postgresql-en-vivo.md.
//
// A diferencia de sql-en-vivo/motor.ts (sql.js, síncrono), aquí toda
// consulta es asíncrona — es la propia API de PGlite.
//
// El módulo WASM compilado y el fsBundle (snapshot inicial del sistema
// de ficheros de Postgres) se cargan UNA SOLA VEZ por sesión del
// navegador y se cachean — pesan ~15 MB sin comprimir en total, frente a
// los ~700 KB de sql.js, y una misma lección puede tener varios bloques
// Postgres. Pero cada llamada a ejecutarConsultaPostgres sigue creando
// una instancia PGlite nueva a partir de ese mismo módulo/bundle ya
// cacheados — mismo aislamiento que ya garantiza sql-en-vivo/motor.ts:
// un UPDATE/DELETE de un intento no debe contaminar el siguiente.
import { PGlite, type Extensions } from '@electric-sql/pglite'

import { compararResultados, type ResultadoConsulta } from '@/lib/sql-en-vivo/comparar'

export { compararResultados }
export type { ResultadoConsulta }

export type ExtensionPostgres = 'pgcrypto' | 'uuid_ossp'

export interface IdentidadSimulada {
  etiqueta: string
  valor: string
}

export interface OpcionesEjecucionPostgres {
  extensiones?: ExtensionPostgres[]
  identidad?: IdentidadSimulada
}

export interface MotorPostgres {
  pgliteWasmModule: WebAssembly.Module
  fsBundle: Blob
}

async function cargarWasmModulo(): Promise<WebAssembly.Module> {
  const respuesta = await fetch('/pglite.wasm')
  if (!respuesta.ok) {
    throw new Error(`No se pudo cargar pglite.wasm (${respuesta.status})`)
  }
  // Compilación no-streaming (fetch + arrayBuffer, no
  // WebAssembly.compileStreaming) a propósito: compileStreaming exige
  // que el servidor devuelva Content-Type: application/wasm exacto o
  // lanza — mismo criterio de robustez ya usado en sql-en-vivo/motor.ts,
  // que tampoco usa la variante streaming.
  return WebAssembly.compile(await respuesta.arrayBuffer())
}

async function cargarFsBundle(): Promise<Blob> {
  const respuesta = await fetch('/pglite.data')
  if (!respuesta.ok) {
    throw new Error(`No se pudo cargar pglite.data (${respuesta.status})`)
  }
  return respuesta.blob()
}

let motorCacheado: Promise<MotorPostgres> | null = null

export function crearMotorPostgres(
  cargarWasm: () => Promise<WebAssembly.Module> = cargarWasmModulo,
  cargarBundle: () => Promise<Blob> = cargarFsBundle,
): Promise<MotorPostgres> {
  if (!motorCacheado) {
    // Se cachea la PROMESA, no solo el resultado ya resuelto — si dos
    // bloques de la misma página llaman a crearMotorPostgres() antes de
    // que la primera carga termine, deben compartir la misma descarga
    // en curso en vez de disparar dos fetch de ~15 MB en paralelo.
    motorCacheado = Promise.all([cargarWasm(), cargarBundle()]).then(
      ([pgliteWasmModule, fsBundle]) => ({ pgliteWasmModule, fsBundle }),
    )
  }
  return motorCacheado
}

async function cargarExtensiones(
  nombres: ExtensionPostgres[] = [],
): Promise<Extensions> {
  const extensiones: Extensions = {}
  if (nombres.includes('pgcrypto')) {
    const { pgcrypto } = await import('@electric-sql/pglite/contrib/pgcrypto')
    extensiones.pgcrypto = pgcrypto
  }
  if (nombres.includes('uuid_ossp')) {
    const { uuid_ossp } = await import('@electric-sql/pglite/contrib/uuid_ossp')
    extensiones.uuid_ossp = uuid_ossp
  }
  return extensiones
}

export async function ejecutarConsultaPostgres(
  motor: MotorPostgres,
  esquemaSql: string,
  consulta: string,
  opciones: OpcionesEjecucionPostgres = {},
): Promise<ResultadoConsulta> {
  const extensiones = await cargarExtensiones(opciones.extensiones)
  const db = new PGlite({
    pgliteWasmModule: motor.pgliteWasmModule,
    fsBundle: motor.fsBundle,
    extensions: extensiones,
  })
  try {
    await db.exec(esquemaSql)
    if (opciones.identidad) {
      // El esquemaSql ya debe haber creado el rol app_user NOSUPERUSER +
      // sus GRANT + auth_uid() — ver el comentario de cabecera de este
      // fichero. Un superusuario (el que usa PGlite por defecto) se
      // salta RLS SIEMPRE en Postgres real, con o sin FORCE ROW LEVEL
      // SECURITY — sin este SET ROLE, ninguna política se aplicaría.
      const valorEscapado = opciones.identidad.valor.replace(/'/g, "''")
      await db.exec(`SET myapp.current_user_id = '${valorEscapado}'; SET ROLE app_user;`)
    }
    const resultado = await db.query(consulta, [], { rowMode: 'array' })
    return {
      ok: true,
      columns: resultado.fields.map((campo) => campo.name),
      values: resultado.rows as unknown[][],
    }
  } catch (error) {
    return { ok: false, mensaje: error instanceof Error ? error.message : String(error) }
  } finally {
    await db.close()
  }
}
