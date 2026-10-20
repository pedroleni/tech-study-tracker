import { z } from 'zod'

import { CANAL_REACT_EN_VIVO } from './constantes'

// Todo lo que llega del iframe es entrada no confiable: el código del alumno
// corre allí mismo y puede falsificar cualquier mensaje. Ver los
// "Checkpoints de seguridad" de specs/features/react-en-vivo.md.
const canal = z.literal(CANAL_REACT_EN_VIVO)
const texto = z.string().max(2000)
const entero = z.number().int().min(0)

export const esquemaMensajeReactEnVivo = z.discriminatedUnion('tipo', [
  z.object({ canal, tipo: z.literal('montado'), version: z.string().max(20) }),
  // z.number() ya rechaza Infinity y NaN en Zod 4.
  z.object({ canal, tipo: z.literal('alto'), alto: z.number().min(0) }),
  z.object({ canal, tipo: z.literal('commit'), numero: entero }),
  z.object({
    canal,
    tipo: z.literal('consola'),
    nivel: z.enum(['log', 'info', 'warn', 'error']),
    texto,
    commit: entero,
  }),
  z.object({
    canal,
    tipo: z.literal('error-render'),
    texto,
    archivo: z.string().regex(/^[A-Za-z][A-Za-z0-9-]*\.jsx$/).optional(),
    linea: z.number().int().min(1).optional(),
  }),
  z.object({ canal, tipo: z.literal('error'), texto }),
  z.object({
    canal,
    tipo: z.literal('resultado-comprobaciones'),
    resultados: z
      .array(
        z.object({
          descripcion: z.string().max(160),
          ok: z.boolean(),
          motivo: z.string().max(300).optional(),
        }),
      )
      .max(8),
  }),
])

export type MensajeReactEnVivo = z.infer<typeof esquemaMensajeReactEnVivo>

export function leerMensajeReactEnVivo(
  evento: MessageEvent,
  ventanaEsperada: Window | null | undefined,
): MensajeReactEnVivo | null {
  if (!ventanaEsperada || evento.source !== ventanaEsperada) return null
  const resultado = esquemaMensajeReactEnVivo.safeParse(evento.data)
  return resultado.success ? resultado.data : null
}
