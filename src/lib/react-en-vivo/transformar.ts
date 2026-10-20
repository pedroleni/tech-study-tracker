import type { ArchivoReact } from '@/lib/laboratorio/schemas'

export type ResultadoTransformacion =
  | {
      ok: true
      modulos: Record<string, string>
      archivosCss: string[]
      css: string
    }
  | {
      ok: false
      archivo: string
      linea: number | null
      mensaje: string
    }

type ErrorSucrase = Error & {
  loc?: { line?: number }
}

let promesaSucrase: Promise<typeof import('sucrase')> | undefined

function cargarSucrase() {
  promesaSucrase ??= import('sucrase').catch((error: unknown) => {
    // Un chunk caducado tras un despliegue no se queda cacheado: el siguiente
    // intento vuelve a pedirlo.
    promesaSucrase = undefined
    throw error
  })
  return promesaSucrase
}

const ERROR_DE_CARGA = 'No se pudo cargar el editor de React. Recarga la página para intentarlo de nuevo.'

export class ErrorCargaSucrase extends Error {
  constructor() {
    super(ERROR_DE_CARGA)
  }
}

function describirError(error: unknown, archivo: string): ResultadoTransformacion & { ok: false } {
  const errorSucrase = error instanceof Error ? (error as ErrorSucrase) : null
  const prefijo = `Error transforming ${archivo}: `
  const mensajeOriginal = errorSucrase?.message ?? String(error)
  const sinPrefijo = mensajeOriginal.startsWith(prefijo)
    ? mensajeOriginal.slice(prefijo.length)
    : mensajeOriginal

  return {
    ok: false,
    archivo,
    linea:
      typeof errorSucrase?.loc?.line === 'number' ? errorSucrase.loc.line : null,
    mensaje: sinPrefijo.replace(/ \(\d+:\d+\)$/, ''),
  }
}

export async function transformarArchivos(
  archivos: ArchivoReact[],
): Promise<ResultadoTransformacion> {
  const { transform } = await cargarSucrase().catch(() => {
    throw new ErrorCargaSucrase()
  })
  const modulos: Record<string, string> = {}
  const archivosCss: string[] = []
  const estilos: string[] = []

  for (const archivo of archivos) {
    const ruta = `./${archivo.nombre}`

    if (archivo.nombre.endsWith('.css')) {
      archivosCss.push(ruta)
      estilos.push(archivo.codigo)
      continue
    }

    let codigo: string
    try {
      codigo = transform(archivo.codigo, {
        transforms: ['jsx', 'imports'],
        jsxRuntime: 'automatic',
        production: false,
        filePath: archivo.nombre,
      }).code
    } catch (error) {
      return describirError(error, archivo.nombre)
    }
    // Sucrase deja pasar lo que solo rechaza el motor al compilar (un const
    // repetido, await fuera de una función async...). Se compila aquí, SIN
    // ejecutarlo, para dar el mismo error de sintaxis con su archivo en vez de
    // romper la vista previa. Un EvalError (una CSP futura sin 'unsafe-eval')
    // no es un error del alumno: se deja pasar.
    try {
      new Function('require', 'module', 'exports', codigo)
    } catch (error) {
      if (error instanceof SyntaxError) {
        return { ok: false, archivo: archivo.nombre, linea: null, mensaje: error.message }
      }
    }
    modulos[ruta] = codigo
  }

  return { ok: true, modulos, archivosCss, css: estilos.join('\n') }
}

export async function transformarParaMostrar(
  archivos: ArchivoReact[],
): Promise<string> {
  let transform: typeof import('sucrase').transform
  try {
    ;({ transform } = await cargarSucrase())
  } catch {
    return `// ${ERROR_DE_CARGA}`
  }
  const resultados: string[] = []

  for (const archivo of archivos) {
    if (!archivo.nombre.endsWith('.jsx')) continue

    try {
      const codigo = transform(archivo.codigo, {
        transforms: ['jsx'],
        jsxRuntime: 'automatic',
        production: true,
        filePath: archivo.nombre,
      }).code
      resultados.push(`// ${archivo.nombre}\n${codigo}`)
    } catch (error) {
      const detalle = describirError(error, archivo.nombre)
      const linea = detalle.linea ?? '?'
      resultados.push(
        `// ${archivo.nombre}: corrige el error de sintaxis de la línea ${linea} para ver su JavaScript`,
      )
    }
  }

  return resultados.join('\n\n')
}
