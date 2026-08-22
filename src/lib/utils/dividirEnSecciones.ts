import { slugifyHeading } from '@/lib/utils/slugifyHeading'

export interface SeccionLeccion {
  id: string
  titulo: string
  cuerpo: string
}

export function dividirEnSecciones(markdown: string): SeccionLeccion[] {
  const secciones: SeccionLeccion[] = []
  let dentroDeBloque = false
  let actual: SeccionLeccion | null = null
  let cuerpoLineas: string[] = []

  const cerrarActual = () => {
    if (!actual) return
    secciones.push({ ...actual, cuerpo: cuerpoLineas.join('\n').trim() })
  }

  for (const linea of markdown.split('\n')) {
    if (linea.trimStart().startsWith('```')) {
      dentroDeBloque = !dentroDeBloque
      if (actual) cuerpoLineas.push(linea)
      continue
    }

    if (!dentroDeBloque) {
      const coincidencia = /^##\s+(.+?)\s*$/.exec(linea)
      if (coincidencia) {
        cerrarActual()
        const titulo = coincidencia[1]
        actual = { id: slugifyHeading(titulo), titulo, cuerpo: '' }
        cuerpoLineas = []
        continue
      }
    }

    if (actual) cuerpoLineas.push(linea)
  }
  cerrarActual()

  return secciones
}
