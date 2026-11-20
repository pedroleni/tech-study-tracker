// Esquemas de los bloques de React del laboratorio (react-en-vivo,
// react-anotado, compilador-react y árbol de componentes) y de sus piezas:
// archivos, comprobaciones, API simulada y red. `schemas.ts` los reexporta y
// los reúne con el resto en `esquemaBloqueLaboratorio`.
import { z } from 'zod'

// Roles cerrados para detectar errores de escritura en el JSON antes de
// ejecutar la comprobación en el iframe.
export const ROLES_COMPROBACION = [
  'button', 'link', 'heading', 'textbox', 'searchbox', 'checkbox', 'radio',
  'switch', 'combobox', 'listbox', 'option', 'list', 'listitem', 'dialog',
  'alert', 'status', 'tab', 'tabpanel', 'img', 'navigation', 'main',
  'region', 'table', 'row', 'cell', 'menu', 'menuitem', 'progressbar',
  'slider', 'spinbutton',
] as const

const textoCorto = z.string().min(1).max(120)

// Una ruta interna, nunca una URL externa ni una ruta de protocolo relativo.
export const esquemaUrlRouter = z.string().min(1).max(200).regex(/^\/(?!\/)\S*$/)

const esquemaConsultaElementoReact = z.union([
  z.strictObject({ texto: textoCorto }),
  z.strictObject({
    rol: z.enum(ROLES_COMPROBACION),
    nombre: textoCorto.optional(),
    texto: textoCorto.optional(),
  }),
  z.strictObject({ etiqueta: textoCorto }),
])

const esquemaPasoComprobacionReact = z.union([
  z.strictObject({ escribir: z.strictObject({ etiqueta: textoCorto, texto: z.string().max(200) }) }),
  z.strictObject({ pulsar: esquemaConsultaElementoReact }),
  z.strictObject({ teclear: z.string().min(1).max(60) }),
  z.strictObject({ seleccionar: z.strictObject({ etiqueta: textoCorto, opcion: textoCorto }) }),
  z.strictObject({ red: z.literal('fallar-siguiente') }),
  z.strictObject({ navegar: esquemaUrlRouter }),
  z.strictObject({ atras: z.literal(true) }),
  z.strictObject({ adelante: z.literal(true) }),
  z.strictObject({ recargar: z.literal(true) }),
])

const esquemaEsperaComprobacionReact = z.union([
  esquemaConsultaElementoReact,
  z.strictObject({ ausente: esquemaConsultaElementoReact }),
  z.strictObject({ etiqueta: textoCorto, valor: z.string().max(200) }),
  z.strictObject({ url: esquemaUrlRouter }),
])

export const esquemaComprobacionReact = z.object({
  descripcion: z.string().min(1).max(160),
  urlInicial: esquemaUrlRouter.optional(),
  pasos: z.array(esquemaPasoComprobacionReact).max(10).default([]),
  espera: esquemaEsperaComprobacionReact,
})

const esquemaArchivoReact = z.object({
  nombre: z.string().regex(/^[A-Za-z][A-Za-z0-9-]*\.(jsx|tsx|ts|css)$/),
  codigo: z.string().max(4000),
})

const esquemaRegistroApiReact = z
  .object({ id: z.union([z.number(), z.string()]) })
  .passthrough()
const esquemaApiReact = z
  .record(
    z.string().regex(/^[a-z][a-z0-9-]*$/),
    z.array(esquemaRegistroApiReact).max(200),
  )
  .superRefine((api, contexto) => {
    if (Object.keys(api).length > 8) {
      contexto.addIssue({ code: 'custom', message: 'api admite como máximo 8 colecciones' })
    }
    try {
      if (JSON.stringify(api).length > 20_000) {
        contexto.addIssue({ code: 'custom', message: 'api admite como máximo 20 000 caracteres en JSON' })
      }
    } catch {
      contexto.addIssue({ code: 'custom', message: 'api debe poder representarse como JSON' })
    }
  })
const esquemaRedReact = z.object({
  latencia: z.number().int().min(0).max(3000).optional(),
  desordenar: z.boolean().default(false),
})

export const esquemaReactEnVivo = z
  .object({
    tipo: z.literal('react-en-vivo'),
    titulo: z.string().min(1).max(140).optional(),
    consigna: z.string().min(1).max(600).optional(),
    archivos: z.array(esquemaArchivoReact).min(1).max(6),
    archivoInicial: z.string().optional(),
    urlInicial: esquemaUrlRouter.optional(),
    barraDeDirecciones: z.boolean().default(true),
    strictMode: z.boolean().default(true),
    mostrarConsola: z.boolean().default(true),
    mostrarJsGenerado: z.boolean().default(false),
    // Árbol de renders (fase 2): qué se renderiza en cada commit y por qué.
    mostrarArbol: z.boolean().default(false),
    mostrarEfectos: z.boolean().default(false),
    mostrarRouter: z.boolean().default(false),
    mostrarLint: z.boolean().default(false),
    compilador: z.boolean().default(false),
    exigirLintLimpio: z.boolean().default(false),
    exigirTiposCorrectos: z.boolean().default(false),
    api: esquemaApiReact.optional(),
    red: esquemaRedReact.optional(),
    comprobaciones: z.array(esquemaComprobacionReact).min(1).max(8).optional(),
  })
  .refine((datos) => datos.archivos.filter((archivo) => /^App\.(jsx|tsx)$/.test(archivo.nombre)).length === 1, {
    message: 'react-en-vivo necesita exactamente uno entre App.jsx y App.tsx',
  })
  .refine((datos) => new Set(datos.archivos.map((archivo) => archivo.nombre)).size === datos.archivos.length, {
    message: 'Los nombres de archivo no pueden repetirse',
  })
  .refine((datos) => !datos.archivoInicial || datos.archivos.some((archivo) => archivo.nombre === datos.archivoInicial), {
    message: 'archivoInicial debe ser uno de los archivos',
  })
  .refine(
    (datos) =>
      !datos.exigirTiposCorrectos ||
      datos.archivos.some((archivo) => /\.(?:ts|tsx)$/.test(archivo.nombre)),
    { message: 'exigirTiposCorrectos necesita al menos un archivo .ts o .tsx' },
  )
  .refine(
    (datos) => {
      const usaUrl = datos.comprobaciones?.some(
        (comprobacion) =>
          comprobacion.urlInicial !== undefined ||
          'url' in comprobacion.espera ||
          comprobacion.pasos.some(
            (paso) =>
              'navegar' in paso || 'atras' in paso || 'adelante' in paso || 'recargar' in paso,
          ),
      )
      return (
        !usaUrl ||
        datos.archivos.some((archivo) =>
          /\bfrom\s*['"]react-router(?:\/dom)?['"]/.test(archivo.codigo),
        )
      )
    },
    { message: 'Las comprobaciones con URL necesitan que algún archivo importe react-router' },
  )
  .refine(
    (datos) =>
      !datos.mostrarRouter ||
      datos.archivos.some((archivo) =>
        /\bfrom\s*['"]react-router(?:\/dom)?['"]/.test(archivo.codigo),
      ),
    { message: 'mostrarRouter necesita que algún archivo importe react-router' },
  )

export const esquemaReactAnotado = z
  .object({
    tipo: z.literal('react-anotado'),
    titulo: z.string().min(1).max(140).optional(),
    codigo: z.string().min(1).max(4000),
    css: z.string().max(4000).default(''),
    anotaciones: z
      .array(z.object({ fragmento: z.string().min(1), nota: z.string().min(1).max(500) }))
      .min(1)
      .max(8),
    strictMode: z.boolean().default(true),
    urlInicial: esquemaUrlRouter.optional(),
    barraDeDirecciones: z.boolean().default(true),
    lenguaje: z.enum(['jsx', 'tsx']).default('jsx'),
    mostrarConsola: z.boolean().default(false),
    mostrarArbol: z.boolean().default(false),
    mostrarEfectos: z.boolean().default(false),
    mostrarRouter: z.boolean().default(false),
    api: esquemaApiReact.optional(),
    red: esquemaRedReact.optional(),
  })
  .refine(
    (datos) =>
      !datos.mostrarRouter || /\bfrom\s*['"]react-router(?:\/dom)?['"]/.test(datos.codigo),
    { message: 'mostrarRouter necesita que el código importe react-router' },
  )

export const esquemaCompiladorReact = z.strictObject({
  tipo: z.literal('compilador-react'),
  titulo: z.string().min(1).max(140).optional(),
  consigna: z.string().min(1).max(600).optional(),
  codigo: z.string().max(4000),
})

// Árbol de componentes estático: el mismo dibujo que el árbol de renders,
// pero escrito por el autor, para diagramas que no salen de ejecutar código
// (árbol de render frente a dependencias, dónde vive el estado, proveedor y
// consumidores de un contexto...). Ver specs/features/react-en-vivo.md.
export const ESTADOS_NODO_ARBOL = ['montado', 'renderizado', 'sin-cambios', 'desmontado'] as const

export const esquemaArbolDeComponentes = z
  .object({
    tipo: z.literal('arbol-de-componentes'),
    titulo: z.string().min(1).max(140).optional(),
    nodos: z
      .array(
        z.strictObject({
          nombre: z.string().min(1).max(60),
          nivel: z.number().int().min(0).max(8),
          clave: z.string().min(1).max(40).optional(),
          estado: z.enum(ESTADOS_NODO_ARBOL).optional(),
          etiqueta: z.string().min(1).max(40).optional(),
          nota: z.string().min(1).max(160).optional(),
        }),
      )
      .min(1)
      .max(40),
  })
  .refine(
    (datos) =>
      datos.nodos.every((nodo, i) => (i === 0 ? nodo.nivel === 0 : nodo.nivel <= datos.nodos[i - 1].nivel + 1)),
    { message: 'El primer nodo va en el nivel 0 y cada nodo baja como mucho un nivel respecto al anterior' },
  )

export type DatosReactEnVivo = z.infer<typeof esquemaReactEnVivo>
export type DatosReactAnotado = z.infer<typeof esquemaReactAnotado>
export type DatosCompiladorReact = z.infer<typeof esquemaCompiladorReact>
export type DatosArbolDeComponentes = z.infer<typeof esquemaArbolDeComponentes>
export type ComprobacionReact = z.infer<typeof esquemaComprobacionReact>
export type ArchivoReact = z.infer<typeof esquemaArchivoReact>
export type ConsultaElementoReact = z.infer<typeof esquemaConsultaElementoReact>
