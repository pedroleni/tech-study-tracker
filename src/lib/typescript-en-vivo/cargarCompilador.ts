// Carga compartida del compilador de TypeScript en vivo: la usan
// `compilar.ts` (bloques con TypeScript) y `react-en-vivo/tipos.ts` (tipos
// de React). Los dos módulos se piden con import() dinámico para que solo
// se descarguen cuando una lección los necesita.

// @typescript/vfs tipa TODA su superficie (createVirtualTypeScriptEnvironment,
// knownLibFilesForCompilerOptions, VirtualTypeScriptEnvironment.languageService
// y los Diagnostic que devuelve...) contra `typeof import('typescript')`.
// Ese nombre resuelve ahora al alias @typescript/typescript6@6.0.2, cuya API
// clásica es compatible con `typescript-en-vivo` (typescript@6.0.3), pero son
// dos instalaciones y TypeScript les asigna identidades nominales distintas
// por cómo se referencian a sí mismos sus .d.ts recursivos (Node/NodeArray,
// etc.). Este único cast, justo al cargar el módulo, evita repetirlo en cada
// llamada a @typescript/vfs; el build nativo de la 7 vive por separado en
// `@typescript/native`.
export type TsReal = typeof import('typescript')

export type CompiladorEnVivo = {
  ts: TsReal
  vfs: typeof import('@typescript/vfs')
  opciones: import('typescript').CompilerOptions
  /** Archivos lib.*.d.ts que necesitan estas opciones (pueden faltar algunos). */
  nombresLib: string[]
}

/**
 * Carga TypeScript y @typescript/vfs, resuelve `opcionesJson` y calcula los
 * archivos lib que hay que dar al entorno virtual.
 */
export async function cargarCompiladorEnVivo(opcionesJson: object): Promise<CompiladorEnVivo> {
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
  const { options: opciones, errors } = ts.convertCompilerOptionsFromJson(opcionesJson, '/')
  if (errors.length > 0) {
    throw new Error('Opciones de compilador de TypeScript inválidas')
  }

  // knownLibFilesForCompilerOptions, en cambio, quiere los nombres CORTOS
  // en minúscula - hace su propio match de prefijo internamente.
  const nombresLib = vfs.knownLibFilesForCompilerOptions(
    { target: ts.ScriptTarget.ES2020, lib: ['es2020', 'dom', 'dom.iterable'] },
    ts,
  )
  return { ts, vfs, opciones, nombresLib }
}
