import { esquemaImagen, type DatosImagen } from '@/lib/laboratorio/schemas'

export interface BloqueImagenEncontrado {
  bloqueCompleto: string
  datos: DatosImagen
}

export function extraerImagenesDeLaboratorio(
  markdown: string,
): BloqueImagenEncontrado[] {
  const bloques: BloqueImagenEncontrado[] = []
  const patron = /```laboratorio[^\S\r\n]*\r?\n(.*?)```/gs

  for (const coincidencia of markdown.matchAll(patron)) {
    try {
      const resultado = esquemaImagen.safeParse(JSON.parse(coincidencia[1]))
      if (resultado.success) {
        bloques.push({ bloqueCompleto: coincidencia[0], datos: resultado.data })
      }
    } catch {
      // Un bloque roto no debe impedir extraer las demás imágenes válidas.
    }
  }

  return bloques
}
