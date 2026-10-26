import { z } from 'zod'

import { CANAL_REACT_EN_VIVO } from './constantes'

// Todo lo que llega del iframe es entrada no confiable: el código del alumno
// corre allí mismo y puede falsificar cualquier mensaje. Ver los
// "Checkpoints de seguridad" de specs/features/react-en-vivo.md.
const canal = z.literal(CANAL_REACT_EN_VIVO)
const texto = z.string().max(2000)
const entero = z.number().int().min(0)
const resultado = z.object({
  descripcion: z.string().max(160),
  ok: z.boolean(),
  motivo: z.string().max(300).optional(),
})

// Árbol de renders (fase 2): lo que arbol.js resume de cada commit.
const motivoRender = z.discriminatedUnion('tipo', [
  z.object({ tipo: z.literal('estado'), indice: z.number().int().min(1).max(100) }),
  z.object({
    tipo: z.literal('prop'),
    nombre: z.string().max(40),
    detalle: z.enum(['funcion-nueva', 'objeto-nuevo', 'array-nuevo']).optional(),
  }),
  z.object({ tipo: z.literal('contexto'), nombre: z.string().max(60) }),
  z.object({ tipo: z.literal('padre') }),
  z.object({ tipo: z.literal('gancho') }),
])
const valorCorto = z.string().max(80)
const nodoArbol = z.object({
  id: z.number().int().min(1),
  nivel: z.number().int().min(0).max(40),
  nombre: z.string().min(1).max(60),
  clave: z.string().max(40).optional(),
  marca: z.enum(['memo', 'proveedor', 'suspense']).optional(),
  estado: z.enum(['montado', 'renderizado', 'sin-cambios', 'desmontado']),
  renders: entero,
  motivos: z.array(motivoRender).max(6),
  props: z.array(z.object({ nombre: z.string().max(40), valor: valorCorto })).max(12),
  estados: z.array(z.object({ valor: valorCorto })).max(12),
})

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
    archivo: z.string().regex(/^[A-Za-z][A-Za-z0-9-]*\.(jsx|tsx|ts)$/).optional(),
    linea: z.number().int().min(1).optional(),
  }),
  z.object({ canal, tipo: z.literal('error'), texto }),
  z.object({
    canal,
    tipo: z.literal('ubicacion'),
    url: z.string().max(500).regex(/^\/(?!\/)\S*$/),
    puedeAtras: z.boolean(),
    puedeAdelante: z.boolean(),
    origen: z.enum([
      'createMemoryRouter',
      'createBrowserRouter',
      'createHashRouter',
      'MemoryRouter',
      'BrowserRouter',
      'HashRouter',
    ]),
  }),
  z.object({
    canal,
    tipo: z.literal('efecto'),
    commit: entero,
    componente: z.string().max(60),
    gancho: z.string().max(60).optional(),
    archivo: z.string().regex(/^[A-Za-z][A-Za-z0-9-]*\.(jsx|tsx|ts)$/),
    linea: z.number().int().min(1),
    accion: z.enum(['efecto', 'limpieza']),
    clase: z.enum(['useEffect', 'useLayoutEffect', 'useInsertionEffect']),
    motivo: z.enum(['montaje', 'strict-mode', 'dependencias', 'cada-render', 'desmontaje']).optional(),
    cambios: z
      .array(z.object({ nombre: z.string().max(40), antes: valorCorto, ahora: valorCorto }))
      .max(8),
  }),
  z.object({
    canal,
    tipo: z.literal('peticion'),
    id: z.number().int().min(1),
    metodo: z.string().regex(/^[A-Z]{1,10}$/),
    ruta: z.string().max(200),
    estado: z.enum(['pendiente', 'ok', 'error', 'cancelada']),
    codigo: z.number().int().min(100).max(599).optional(),
    ms: entero.optional(),
  }),
  // Una por comprobación terminada: el comprobador mide inactividad, no el total.
  z.object({ canal, tipo: z.literal('progreso-comprobaciones'), resultado }),
  z.object({ canal, tipo: z.literal('resultado-comprobaciones'), resultados: z.array(resultado).max(8) }),
  z.object({
    canal,
    tipo: z.literal('arbol'),
    commit: entero,
    nodos: z.array(nodoArbol).max(200),
    truncado: z.boolean(),
    cambiosDom: entero,
  }),
])

export type MensajeReactEnVivo = z.infer<typeof esquemaMensajeReactEnVivo>
export type MensajeArbol = Extract<MensajeReactEnVivo, { tipo: 'arbol' }>
export type MensajePeticion = Extract<MensajeReactEnVivo, { tipo: 'peticion' }>
export type MensajeEfecto = Extract<MensajeReactEnVivo, { tipo: 'efecto' }>
export type MensajeUbicacion = Extract<MensajeReactEnVivo, { tipo: 'ubicacion' }>
export type NodoArbolRender = MensajeArbol['nodos'][number]
export type MotivoRender = NodoArbolRender['motivos'][number]

export function leerMensajeReactEnVivo(
  evento: MessageEvent,
  ventanaEsperada: Window | null | undefined,
): MensajeReactEnVivo | null {
  if (!ventanaEsperada || evento.source !== ventanaEsperada) return null
  const resultado = esquemaMensajeReactEnVivo.safeParse(evento.data)
  return resultado.success ? resultado.data : null
}
