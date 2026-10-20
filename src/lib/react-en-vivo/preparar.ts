import type { ArchivoReact } from '@/lib/laboratorio/schemas'

import { construirDocumentoReact } from './documento'
import { ErrorCargaSucrase, transformarArchivos } from './transformar'

export type DocumentoPreparado = { ok: true; srcDoc: string } | { ok: false; error: string }

// Transformar + montar el srcdoc, con el error de sintaxis ya redactado para
// el alumno. Lo usan react-en-vivo (vista previa y comprobaciones) y
// react-anotado.
export async function prepararDocumento(
  archivos: ArchivoReact[],
  opciones: { origen: string; strictMode: boolean; conPruebas: boolean; conArbol?: boolean },
): Promise<DocumentoPreparado> {
  let resultado: Awaited<ReturnType<typeof transformarArchivos>>
  try {
    resultado = await transformarArchivos(archivos)
  } catch (error) {
    if (error instanceof ErrorCargaSucrase) return { ok: false, error: error.message }
    throw error
  }
  if (!resultado.ok) {
    const linea = resultado.linea ? `, línea ${resultado.linea}` : ''
    return {
      ok: false,
      error: `Error de sintaxis en ${resultado.archivo}${linea}: ${resultado.mensaje}`,
    }
  }
  return {
    ok: true,
    srcDoc: construirDocumentoReact({
      origen: opciones.origen,
      css: resultado.css,
      modulos: resultado.modulos,
      archivosCss: resultado.archivosCss,
      strictMode: opciones.strictMode,
      conPruebas: opciones.conPruebas,
      conArbol: opciones.conArbol,
    }),
  }
}
