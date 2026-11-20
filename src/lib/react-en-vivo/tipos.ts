import type { ArchivoReact } from '@/lib/laboratorio/schemas'
import { RUTA_REACT_KIT } from '@/lib/react-kit/rutas'
import { cargarCompiladorEnVivo, type TsReal } from '@/lib/typescript-en-vivo/cargarCompilador'
import { z } from 'zod'

import {
  RUTA_REACT_ROUTER_EN_VIVO,
  VERSION_REACT_ROUTER_EN_VIVO,
} from './constantes'

type Vfs = typeof import('@typescript/vfs')
type EntornoVirtual = import('@typescript/vfs').VirtualTypeScriptEnvironment

const OPCIONES_JSON = {
  target: 'ES2020',
  module: 'ESNext',
  lib: ['ES2020', 'DOM', 'DOM.Iterable'],
  strict: true,
  // Iguala el orden de uniones de los diagnósticos al de TypeScript 7,
  // que es el compilador que usa el alumno fuera del navegador.
  stableTypeOrdering: true,
  jsx: 'react-jsx',
  moduleResolution: 'bundler',
  skipLibCheck: true,
  noUncheckedSideEffectImports: false,
  allowJs: true,
  checkJs: false,
}

const ARCHIVOS_TIPOS_REACT = [
  'react/index.d.ts',
  'react/global.d.ts',
  'react/jsx-runtime.d.ts',
  'react/jsx-dev-runtime.d.ts',
  'react/package.json',
  'react-dom/index.d.ts',
  'react-dom/client.d.ts',
  'react-dom/package.json',
  'csstype/index.d.ts',
  'csstype/package.json',
] as const

export interface DiagnosticoTiposReact {
  archivo: string
  linea: number
  columna: number
  mensaje: string
  severidad: 'error' | 'aviso'
}

export type CargarArchivoTipos = (rutaPublica: string) => Promise<string>

async function cargarArchivoPorFetch(rutaPublica: string): Promise<string> {
  const respuesta = await fetch(rutaPublica)
  if (!respuesta.ok) {
    throw new Error(`No se pudo cargar ${rutaPublica} (${respuesta.status})`)
  }
  return respuesta.text()
}

function rutaVirtualTipo(ruta: string) {
  if (ruta.startsWith('react/')) {
    return `/node_modules/@types/react/${ruta.slice('react/'.length)}`
  }
  if (ruta.startsWith('react-dom/')) {
    return `/node_modules/@types/react-dom/${ruta.slice('react-dom/'.length)}`
  }
  return `/node_modules/csstype/${ruta.slice('csstype/'.length)}`
}

type RecursosTiposReact = {
  ts: TsReal
  vfs: Vfs
  opciones: import('typescript').CompilerOptions
  mapa: Map<string, string>
}

/** Lo que necesita el entorno virtual: los recursos cargados y los archivos del programa. */
export type ParametrosEntornoTiposReact = RecursosTiposReact & { archivosRaiz: string[] }

export type FabricaEntornoTiposReact = (parametros: ParametrosEntornoTiposReact) => EntornoVirtual

export function crearEntornoTiposReact({
  mapa,
  archivosRaiz,
  ts,
  opciones,
  vfs,
}: ParametrosEntornoTiposReact) {
  return vfs.createVirtualTypeScriptEnvironment(
    vfs.createSystem(mapa),
    archivosRaiz,
    ts,
    opciones,
  )
}

const promesasRecursos = new WeakMap<CargarArchivoTipos, Promise<RecursosTiposReact>>()
const promesasTiposRouter = new WeakMap<CargarArchivoTipos, Promise<Record<string, string>>>()

const esquemaTiposRouter = z
  .strictObject({
    version: z.literal(VERSION_REACT_ROUTER_EN_VIVO),
    archivos: z.record(
      z.string().regex(/^(react-router|cookie-es)\/[\w./-]+$/),
      z.string(),
    ),
  })
  .superRefine((datos, contexto) => {
    if (Object.keys(datos.archivos).length > 100) {
      contexto.addIssue({ code: 'custom', message: 'Demasiados archivos de tipos' })
    }
    const caracteres = Object.entries(datos.archivos).reduce(
      (total, [ruta, contenido]) => total + ruta.length + contenido.length,
      0,
    )
    if (caracteres > 2_000_000) {
      contexto.addIssue({ code: 'custom', message: 'Los tipos superan el tamaño admitido' })
    }
  })

export function cargarTiposReactRouter(cargarArchivo: CargarArchivoTipos) {
  const existente = promesasTiposRouter.get(cargarArchivo)
  if (existente) return existente
  const promesa = cargarArchivo(`${RUTA_REACT_ROUTER_EN_VIVO}/tipos.json`)
    .then((texto) => {
      let json: unknown
      try {
        json = JSON.parse(texto)
      } catch {
        throw new Error('Los tipos de React Router no tienen el formato esperado')
      }
      const resultado = esquemaTiposRouter.safeParse(json)
      if (!resultado.success) {
        throw new Error('Los tipos de React Router no tienen el formato esperado')
      }
      return resultado.data.archivos
    })
    .catch((error: unknown) => {
      promesasTiposRouter.delete(cargarArchivo)
      throw error
    })
  promesasTiposRouter.set(cargarArchivo, promesa)
  return promesa
}

function necesitaTiposRouter(archivos: ArchivoReact[]) {
  return archivos.some(
    (archivo) =>
      /\.(?:ts|tsx)$/.test(archivo.nombre) &&
      /\b(?:from|import(?:\s+type)?)\s*\(?\s*['"]react-router(?:\/dom)?['"]/.test(
        archivo.codigo,
      ),
  )
}

function cargarRecursos(cargarArchivo: CargarArchivoTipos) {
  const existente = promesasRecursos.get(cargarArchivo)
  if (existente) return existente

  const promesa = (async (): Promise<RecursosTiposReact> => {
    const { ts, vfs, opciones, nombresLib } = await cargarCompiladorEnVivo(OPCIONES_JSON)
    const mapa = new Map<string, string>()
    await Promise.all([
      ...nombresLib.map(async (nombre) => {
        try {
          mapa.set(`/${nombre}`, await cargarArchivo(`/ts-libs/${nombre}`))
        } catch {
          // La VFS enumera nombres históricos ausentes en algunas versiones.
        }
      }),
      ...ARCHIVOS_TIPOS_REACT.map(async (ruta) => {
        const contenido = await cargarArchivo(`${RUTA_REACT_KIT}/tipos/${ruta}`)
        mapa.set(rutaVirtualTipo(ruta), contenido)
      }),
    ])
    return { ts, vfs, opciones, mapa }
  })().catch((error: unknown) => {
    promesasRecursos.delete(cargarArchivo)
    throw error
  })

  promesasRecursos.set(cargarArchivo, promesa)
  return promesa
}

function mapearDiagnostico(
  diagnostico: import('typescript').Diagnostic,
  ts: TsReal,
): DiagnosticoTiposReact {
  const mensaje = ts.flattenDiagnosticMessageText(diagnostico.messageText, '\n')
  const severidad: DiagnosticoTiposReact['severidad'] =
    diagnostico.category === ts.DiagnosticCategory.Error ? 'error' : 'aviso'

  if (diagnostico.file && diagnostico.start !== undefined) {
    const { line, character } = diagnostico.file.getLineAndCharacterOfPosition(diagnostico.start)
    return {
      archivo: diagnostico.file.fileName.replace(/^\/src\//, ''),
      linea: line + 1,
      columna: character + 1,
      mensaje,
      severidad,
    }
  }
  return { archivo: '', linea: 0, columna: 0, mensaje, severidad }
}

function esArchivoTypeScript(archivo: ArchivoReact) {
  return archivo.nombre.endsWith('.ts') || archivo.nombre.endsWith('.tsx')
}

async function anadirTiposRouter(mapa: Map<string, string>, cargarArchivo: CargarArchivoTipos) {
  const tiposRouter = await cargarTiposReactRouter(cargarArchivo)
  for (const [ruta, contenido] of Object.entries(tiposRouter)) {
    mapa.set(`/node_modules/${ruta}`, contenido)
  }
}

/** Contenido de cada archivo del programa por su ruta virtual (el entorno no admite archivos vacíos). */
function contenidosDelPrograma(archivosDelPrograma: ArchivoReact[]) {
  return new Map(
    archivosDelPrograma.map((archivo) => [
      `/src/${archivo.nombre}`,
      archivo.codigo === '' ? ' ' : archivo.codigo,
    ]),
  )
}

/** Lleva al entorno ya creado los archivos de esta pasada: borra, actualiza y crea. */
function sincronizarArchivos(
  entorno: EntornoVirtual,
  nombresAnteriores: Set<string>,
  contenidos: Map<string, string>,
) {
  for (const nombre of nombresAnteriores) {
    if (!contenidos.has(nombre)) entorno.deleteFile(nombre)
  }
  for (const [nombre, contenido] of contenidos) {
    if (nombresAnteriores.has(nombre)) entorno.updateFile(nombre, contenido)
    else entorno.createFile(nombre, contenido)
  }
}

function diagnosticosDe(entorno: EntornoVirtual, archivosTypeScript: ArchivoReact[], ts: TsReal) {
  return archivosTypeScript
    .flatMap((archivo) => {
      const nombre = `/src/${archivo.nombre}`
      return [
        ...entorno.languageService.getSyntacticDiagnostics(nombre),
        ...entorno.languageService.getSemanticDiagnostics(nombre),
      ]
    })
    .map((diagnostico) => mapearDiagnostico(diagnostico, ts))
}

export function crearSesionTiposReact(
  cargarArchivo: CargarArchivoTipos = cargarArchivoPorFetch,
  { crearEntorno = crearEntornoTiposReact }: { crearEntorno?: FabricaEntornoTiposReact } = {},
) {
  let entorno: EntornoVirtual | null = null
  let nombresActuales = new Set<string>()
  let recursos: RecursosTiposReact | null = null
  let tiposRouterCargados = false

  return {
    async diagnosticar(archivos: ArchivoReact[]): Promise<DiagnosticoTiposReact[]> {
      const archivosTypeScript = archivos.filter(esArchivoTypeScript)
      if (archivosTypeScript.length === 0) return []
      const archivosDelPrograma = archivos.filter((archivo) => /\.(?:jsx|tsx|ts)$/.test(archivo.nombre))

      recursos ??= await cargarRecursos(cargarArchivo)
      if (necesitaTiposRouter(archivosDelPrograma) && !tiposRouterCargados) {
        await anadirTiposRouter(recursos.mapa, cargarArchivo)
        tiposRouterCargados = true
        // TypeScript fija la resolución de paquetes al crear el entorno. Si
        // el programa empieza a importar el router después, hay que recrearlo.
        entorno = null
      }
      const contenidos = contenidosDelPrograma(archivosDelPrograma)

      if (entorno) {
        sincronizarArchivos(entorno, nombresActuales, contenidos)
      } else {
        const mapa = new Map([...recursos.mapa, ...contenidos])
        entorno = crearEntorno({ ...recursos, mapa, archivosRaiz: [...contenidos.keys()] })
      }
      nombresActuales = new Set(contenidos.keys())

      return diagnosticosDe(entorno, archivosTypeScript, recursos.ts)
    },
  }
}

export async function diagnosticarTiposReact(
  archivos: ArchivoReact[],
  cargarArchivo: CargarArchivoTipos = cargarArchivoPorFetch,
): Promise<DiagnosticoTiposReact[]> {
  return crearSesionTiposReact(cargarArchivo).diagnosticar(archivos)
}
