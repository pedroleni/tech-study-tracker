import type { ArchivoReact } from '@/lib/laboratorio/schemas'

type TsReal = typeof import('typescript')

const OPCIONES_JSON = {
  target: 'ES2020',
  module: 'ESNext',
  lib: ['ES2020', 'DOM', 'DOM.Iterable'],
  strict: true,
  jsx: 'react-jsx',
  moduleResolution: 'bundler',
  skipLibCheck: true,
}

const ARCHIVOS_TIPOS_REACT = [
  'react/index.d.ts',
  'react/global.d.ts',
  'react/jsx-runtime.d.ts',
  'react/jsx-dev-runtime.d.ts',
  'react/package.json',
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
  return `/node_modules/csstype/${ruta.slice('csstype/'.length)}`
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

export async function diagnosticarTiposReact(
  archivos: ArchivoReact[],
  cargarArchivo: CargarArchivoTipos = cargarArchivoPorFetch,
): Promise<DiagnosticoTiposReact[]> {
  const archivosTypeScript = archivos.filter(
    (archivo) => archivo.nombre.endsWith('.ts') || archivo.nombre.endsWith('.tsx'),
  )
  if (archivosTypeScript.length === 0) return []

  const [tsModulo, vfs] = await Promise.all([
    import('typescript-en-vivo'),
    import('@typescript/vfs'),
  ])
  // @typescript/vfs declara sus tipos contra el nombre real `typescript`,
  // aunque en ejecución usamos el alias fijado `typescript-en-vivo`.
  const ts = tsModulo as unknown as TsReal
  const { options, errors } = ts.convertCompilerOptionsFromJson(OPCIONES_JSON, '/')
  if (errors.length > 0) {
    throw new Error('Opciones de compilador de TypeScript inválidas')
  }

  const nombresLib = vfs.knownLibFilesForCompilerOptions(
    { target: ts.ScriptTarget.ES2020, lib: ['es2020', 'dom', 'dom.iterable'] },
    ts,
  )
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
      const contenido = await cargarArchivo(`/vendor/react-kit/1/tipos/${ruta}`)
      mapa.set(rutaVirtualTipo(ruta), contenido)
    }),
  ])

  const archivosRaiz = archivosTypeScript.map((archivo) => `/src/${archivo.nombre}`)
  for (const archivo of archivosTypeScript) {
    mapa.set(`/src/${archivo.nombre}`, archivo.codigo)
  }

  const sistema = vfs.createSystem(mapa)
  const entorno = vfs.createVirtualTypeScriptEnvironment(
    sistema,
    archivosRaiz,
    ts,
    options,
  )

  return archivosRaiz.flatMap((nombre) => [
    ...entorno.languageService.getSyntacticDiagnostics(nombre),
    ...entorno.languageService.getSemanticDiagnostics(nombre),
  ]).map((diagnostico) => mapearDiagnostico(diagnostico, ts))
}
