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
  promesaSucrase ??= import('sucrase')
  return promesaSucrase
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
  const { transform } = await cargarSucrase()
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

    try {
      modulos[ruta] = transform(archivo.codigo, {
        transforms: ['jsx', 'imports'],
        jsxRuntime: 'automatic',
        production: false,
        filePath: archivo.nombre,
      }).code
    } catch (error) {
      return describirError(error, archivo.nombre)
    }
  }

  return { ok: true, modulos, archivosCss, css: estilos.join('\n') }
}

export async function transformarParaMostrar(
  archivos: ArchivoReact[],
): Promise<string> {
  const { transform } = await cargarSucrase()
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
