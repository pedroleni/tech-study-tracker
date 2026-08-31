// Compilador de TypeScript real (no una transpilación superficial) que
// corre en el navegador. `typescript-en-vivo` (alias de typescript@6.0.3 —
// ver Global Constraints del plan) y `@typescript/vfs` se cargan con
// import() dinámico: solo se descargan cuando una lección tiene contenido
// en el campo `ts` de un bloque `editor-en-vivo`, nunca en el resto de
// páginas. Ver specs/features/typescript-compilacion-en-vivo.md.

const NOMBRE_ARCHIVO = 'archivo.ts'
// El entorno no admite un archivo raíz con contenido vacío: createVirtual-
// TypeScriptEnvironment lanza "File not found" con '' (verificado antes de
// escribir este módulo). Ver la nota de diseño en el plan de implementación.
const MARCADOR_VACIO = ' '

// Si cambias estas opciones, actualiza también scripts/dev/generar-ts-libs.mjs
// (debe generar los mismos ficheros lib) — mismo target/lib en los dos sitios.
const OPCIONES_JSON = {
  target: 'ES2020',
  module: 'ESNext',
  lib: ['ES2020', 'DOM', 'DOM.Iterable'],
  strict: true,
}

export interface DiagnosticoTs {
  linea: number
  columna: number
  mensaje: string
  severidad: 'error' | 'aviso'
}

export interface ResultadoCompilacionTs {
  js: string
  diagnosticos: DiagnosticoTs[]
}

// @typescript/vfs tipa TODA su superficie (createVirtualTypeScriptEnvironment,
// knownLibFilesForCompilerOptions, VirtualTypeScriptEnvironment.languageService
// y los Diagnostic que devuelve...) contra `typeof import('typescript')` — el
// nombre REAL del paquete — no contra el alias `typescript-en-vivo` que usamos
// para no chocar con la devDependency del proyecto (ver Global Constraints del
// plan). En tiempo de ejecución es exactamente el mismo código (mismo bin,
// mismo tarball); TypeScript los trata como identidades nominales distintas
// por cómo se referencian a sí mismos sus propios .d.ts (Node/NodeArray/etc.
// son estructuralmente recursivos) — problema conocido al convivir dos
// instalaciones de "typescript" bajo nombres de paquete distintos, no es un
// error real de tipos. Este único cast, justo al cargar el módulo, evita
// repetirlo en cada llamada a @typescript/vfs.
type TsReal = typeof import('typescript')

export interface EntornoTypeScript {
  ts: TsReal
  entorno: import('@typescript/vfs').VirtualTypeScriptEnvironment
}

async function cargarLibPorFetch(nombre: string): Promise<string> {
  const respuesta = await fetch(`/ts-libs/${nombre}`)
  if (!respuesta.ok) {
    throw new Error(`No se pudo cargar ${nombre} (${respuesta.status})`)
  }
  return respuesta.text()
}

export async function crearEntornoTypeScript(
  cargarLib: (nombre: string) => Promise<string> = cargarLibPorFetch,
): Promise<EntornoTypeScript> {
  const [tsModulo, vfs] = await Promise.all([
    import('typescript-en-vivo'),
    import('@typescript/vfs'),
  ])
  const ts = tsModulo as unknown as TsReal

  // convertCompilerOptionsFromJson es la única vía soportada para pasar de
  // nombres "amigables" (lib: ["DOM"]) a CompilerOptions ya resueltas
  // (lib: ["lib.dom.d.ts"]) - construir CompilerOptions.lib a mano con los
  // nombres cortos no funciona con createVirtualTypeScriptEnvironment
  // (verificado antes de escribir este módulo).
  const { options: opciones, errors } = ts.convertCompilerOptionsFromJson(OPCIONES_JSON, '/')
  if (errors.length > 0) {
    throw new Error('Opciones de compilador de TypeScript inválidas')
  }

  // knownLibFilesForCompilerOptions, en cambio, quiere los nombres CORTOS
  // en minúscula - hace su propio match de prefijo internamente.
  const nombresLib = vfs.knownLibFilesForCompilerOptions(
    { target: ts.ScriptTarget.ES2020, lib: ['es2020', 'dom', 'dom.iterable'] },
    ts,
  )

  const mapa = new Map<string, string>()
  await Promise.all(
    nombresLib.map(async (nombre) => {
      try {
        mapa.set('/' + nombre, await cargarLib(nombre))
      } catch {
        // knownLibFilesForCompilerOptions devuelve nombres históricos que ya
        // no existen en esta versión de TypeScript (documentado por la
        // propia librería) - se ignora igual que hace createDefaultMapFromCDN
        // internamente, el fichero simplemente no estará disponible.
      }
    }),
  )
  mapa.set(NOMBRE_ARCHIVO, MARCADOR_VACIO)

  const sistema = vfs.createSystem(mapa)
  const entorno = vfs.createVirtualTypeScriptEnvironment(sistema, [NOMBRE_ARCHIVO], ts, opciones)
  return { ts, entorno }
}

export function compilarEnEntorno(
  entornoTs: EntornoTypeScript,
  codigo: string,
): ResultadoCompilacionTs {
  const { ts, entorno } = entornoTs

  if (codigo.trim() === '') {
    entorno.updateFile(NOMBRE_ARCHIVO, MARCADOR_VACIO)
    return { js: '', diagnosticos: [] }
  }

  entorno.updateFile(NOMBRE_ARCHIVO, codigo)
  const diagnosticosRaw = [
    ...entorno.languageService.getSyntacticDiagnostics(NOMBRE_ARCHIVO),
    ...entorno.languageService.getSemanticDiagnostics(NOMBRE_ARCHIVO),
  ]
  const diagnosticos = diagnosticosRaw.map((diagnostico) => mapearDiagnostico(diagnostico, ts))
  const hayErrores = diagnosticosRaw.some((d) => d.category === ts.DiagnosticCategory.Error)

  let js = ''
  if (!hayErrores) {
    const salida = entorno.languageService.getEmitOutput(NOMBRE_ARCHIVO)
    js = salida.outputFiles[0]?.text ?? ''
  }

  return { js, diagnosticos }
}

function mapearDiagnostico(diagnostico: import('typescript').Diagnostic, ts: TsReal): DiagnosticoTs {
  const mensaje = ts.flattenDiagnosticMessageText(diagnostico.messageText, '\n')
  const severidad: DiagnosticoTs['severidad'] =
    diagnostico.category === ts.DiagnosticCategory.Error ? 'error' : 'aviso'

  if (diagnostico.file && diagnostico.start !== undefined) {
    const { line, character } = diagnostico.file.getLineAndCharacterOfPosition(diagnostico.start)
    return { linea: line + 1, columna: character + 1, mensaje, severidad }
  }
  return { linea: 0, columna: 0, mensaje, severidad }
}
