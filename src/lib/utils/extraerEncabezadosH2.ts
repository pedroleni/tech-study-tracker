import { slugifyHeading } from '@/lib/utils/slugifyHeading'

export interface EncabezadoH2 {
  id: string
  titulo: string
}

export function extraerEncabezadosH2(markdown: string): EncabezadoH2[] {
  const encabezados: EncabezadoH2[] = []
  let dentroDeBloque = false

  for (const linea of markdown.split('\n')) {
    if (linea.trimStart().startsWith('```')) {
      dentroDeBloque = !dentroDeBloque
      continue
    }
    if (dentroDeBloque) continue

    const coincidencia = /^##\s+(.+?)\s*$/.exec(linea)
    if (!coincidencia) continue

    const titulo = coincidencia[1]
    encabezados.push({ id: slugifyHeading(titulo), titulo })
  }

  return encabezados
}
