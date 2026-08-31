// Motor de ejecución real de comandos Git en el navegador, vía wasm-git
// (libgit2 real compilado a WebAssembly con Emscripten). Se carga con
// import() dinámico: solo se descarga cuando una lección tiene un bloque
// git-anotado o git-en-vivo. Ver specs/features/git-en-vivo.md.
//
// Cada llamada a ejecutarComandosGit crea una instancia de wasm-git NUEVA
// (initGit() fresco) — confirmado en el spec que dos instancias nunca
// comparten sistema de ficheros. El binario WASM ya descargado (motor.wasmBinary)
// SÍ se reutiliza entre ejecuciones: evita volver a pedirlo por red, aunque
// cada initGit() lo recompila desde el mismo buffer — coste aceptable dado
// que el binario pesa 1.6 MB, muy por debajo de los ~10 MB de PGlite.

import type { DatosGitAnotado } from '../laboratorio/schemas'

export interface MotorGit {
  wasmBinary: ArrayBuffer
}

export type ResultadoGit =
  | { ok: true; salida: string }
  | { ok: false; mensaje: string }

export type PasoGit = DatosGitAnotado['esquemaGit'][number]

export interface CommitGit {
  hash: string
  hashCorto: string
  mensaje: string
  padres: string[]
}

export interface RamaGit {
  nombre: string
  hash: string
}

export interface GrafoGit {
  commits: CommitGit[]
  ramas: RamaGit[]
  ramaActual: string
}

// Tokenizador mínimo, consciente de comillas simples/dobles — necesario
// porque wasm-git espera un array de argumentos (['commit', '-m', 'texto']),
// no una cadena de shell completa, y un mensaje de commit real casi
// siempre lleva espacios dentro de comillas.
export function dividirComando(comando: string): string[] {
  const tokens: string[] = []
  const regex = /"([^"]*)"|'([^']*)'|(\S+)/g
  let coincidencia: RegExpExecArray | null
  while ((coincidencia = regex.exec(comando)) !== null) {
    tokens.push(coincidencia[1] ?? coincidencia[2] ?? coincidencia[3])
  }
  return tokens
}

async function cargarWasmPorFetch(): Promise<ArrayBuffer> {
  const respuesta = await fetch('/lg2-async.wasm')
  if (!respuesta.ok) {
    throw new Error(`No se pudo cargar lg2-async.wasm (${respuesta.status})`)
  }
  return respuesta.arrayBuffer()
}

let motorCacheado: Promise<MotorGit> | null = null

export function crearMotorGit(
  cargarWasm: () => Promise<ArrayBuffer> = cargarWasmPorFetch,
): Promise<MotorGit> {
  if (!motorCacheado) {
    motorCacheado = cargarWasm().then((wasmBinary) => ({ wasmBinary }))
  }
  return motorCacheado
}

interface InstanciaGit {
  FS: {
    writeFile: (ruta: string, contenido: string) => void
    mkdir: (ruta: string) => void
    chdir: (ruta: string) => void
    readFile: (ruta: string, opciones: { encoding: 'utf8' }) => string
  }
  callMain: (args: string[]) => number | Promise<number>
  origCallMain?: (args: string[]) => number
  callWithOutput: (args: string[]) => string | Promise<string>
}

async function crearInstancia(motor: MotorGit): Promise<InstanciaGit> {
  const { default: initGit } = await import('wasm-git/lg2_async.js')
  const instancia = (await initGit({
    wasmBinary: motor.wasmBinary,
  })) as InstanciaGit
  // En navegador, wasm-git 0.0.17 sustituye callMain por un wrapper async,
  // pero callWithOutput sigue tratándolo como síncrono y confunde el Promise
  // devuelto con un código de error. Esta feature solo opera sobre MEMFS y
  // remotos locales, así que restaura la implementación síncrona que el propio
  // paquete conserva como origCallMain.
  if (instancia.origCallMain) instancia.callMain = instancia.origCallMain
  instancia.FS.writeFile(
    '/home/web_user/.gitconfig',
    '[user]\nname = Ana\nemail = ana@example.com\n',
  )
  instancia.FS.mkdir('/repo')
  instancia.FS.chdir('/repo')
  return instancia
}

async function ejecutarPaso(
  instancia: InstanciaGit,
  paso: PasoGit,
): Promise<void> {
  if (typeof paso === 'string') {
    await instancia.callMain(dividirComando(paso))
    return
  }
  instancia.FS.writeFile(
    `/repo/${paso.escribir.ruta}`,
    paso.escribir.contenido,
  )
}

export async function ejecutarComandosGit(
  motor: MotorGit,
  esquemaGit: PasoGit[],
  comando: string,
): Promise<ResultadoGit> {
  try {
    const instancia = await crearInstancia(motor)
    for (const paso of esquemaGit) {
      await ejecutarPaso(instancia, paso)
    }
    const salida = await instancia.callWithOutput(dividirComando(comando))
    return { ok: true, salida }
  } catch (error) {
    return {
      ok: false,
      mensaje: error instanceof Error ? error.message : String(error),
    }
  }
}

function parsearForEachRef(salida: string): RamaGit[] {
  return salida
    .split('\n')
    .filter((linea) => linea.trim() !== '')
    .map((linea) => {
      const [hash, tipo, referencia] = linea.trim().split(/\s+/)
      const prefijoRama = 'refs/heads/'
      if (
        !hash ||
        tipo !== 'commit' ||
        !referencia?.startsWith(prefijoRama)
      ) {
        return null
      }
      return { nombre: referencia.slice(prefijoRama.length), hash }
    })
    .filter((rama): rama is RamaGit => rama !== null)
}

function parsearCommitObjeto(
  hash: string,
  textoObjeto: string,
): CommitGit {
  const lineas = textoObjeto.split('\n')
  const padres: string[] = []
  let indiceFinCabecera = lineas.length
  for (let i = 0; i < lineas.length; i++) {
    if (lineas[i] === '') {
      indiceFinCabecera = i
      break
    }
    const coincidenciaPadre = /^parent ([0-9a-f]{40})$/.exec(lineas[i])
    if (coincidenciaPadre) padres.push(coincidenciaPadre[1])
  }
  const mensaje = lineas.slice(indiceFinCabecera + 1).join('\n').trim()
  return { hash, hashCorto: hash.slice(0, 7), mensaje, padres }
}

export async function obtenerGrafo(
  motor: MotorGit,
  esquemaGit: PasoGit[],
): Promise<GrafoGit> {
  const instancia = await crearInstancia(motor)
  for (const paso of esquemaGit) {
    await ejecutarPaso(instancia, paso)
  }

  const salidaRefs = await instancia.callWithOutput(
    dividirComando('for-each-ref'),
  )
  const ramas = parsearForEachRef(salidaRefs)

  const cabezaCruda = instancia.FS.readFile('/repo/.git/HEAD', {
    encoding: 'utf8',
  })
  const ramaActual = cabezaCruda.trim().replace('ref: refs/heads/', '')

  const hashesUnicos = new Set<string>()
  for (const rama of ramas) {
    const salidaLog = await instancia.callWithOutput(
      dividirComando(`log ${rama.nombre} --oneline`),
    )
    for (const linea of salidaLog.split('\n')) {
      const hash = linea.split(' ')[0]
      if (hash) hashesUnicos.add(hash)
    }
  }

  const commits: CommitGit[] = []
  for (const hash of hashesUnicos) {
    const textoObjeto = await instancia.callWithOutput(
      dividirComando(`cat-file -p ${hash}`),
    )
    commits.push(parsearCommitObjeto(hash, textoObjeto))
  }

  return { commits, ramas, ramaActual }
}
