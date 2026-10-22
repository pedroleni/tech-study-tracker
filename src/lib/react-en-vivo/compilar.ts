import type { ArchivoReact } from '@/lib/laboratorio/schemas'
import type { SesionCompilador } from '@/lib/react-kit/cliente'

export type AvisoCompiladorReact = { archivo: string; error: string }

export type ArchivosCompiladosReact = {
  archivos: ArchivoReact[]
  avisos: AvisoCompiladorReact[]
}

// La compilación es secuencial a propósito: una sesión solo conserva la
// última petición. Así una edición nueva puede invalidar toda la tanda sin
// confundir respuestas de dos archivos del mismo bloque.
export async function compilarArchivosReact(
  archivos: ArchivoReact[],
  sesion: SesionCompilador,
): Promise<ArchivosCompiladosReact | null> {
  const compilados: ArchivoReact[] = []
  const avisos: AvisoCompiladorReact[] = []

  for (const archivo of archivos) {
    if (!/\.(jsx|tsx)$/.test(archivo.nombre)) {
      compilados.push(archivo)
      continue
    }

    const resultado = await sesion.compilar(archivo.codigo, {
      typescript: archivo.nombre.endsWith('.tsx'),
    })
    if (!resultado) return null
    if (resultado.ok) {
      compilados.push({ ...archivo, codigo: resultado.codigo })
    } else {
      compilados.push(archivo)
      avisos.push({ archivo: archivo.nombre, error: resultado.error })
    }
  }

  return { archivos: compilados, avisos }
}
