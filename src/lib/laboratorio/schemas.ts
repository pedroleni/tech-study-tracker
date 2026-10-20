import { z } from 'zod'

export const esquemaPrediceElResultado = z
  .object({
    tipo: z.literal('predice-el-resultado'),
    lenguaje: z.enum(['html', 'jsx', 'tsx']).default('html'),
    codigo: z.string().min(1).max(2000),
    opciones: z.array(z.string().min(1)).min(2).max(5),
    correcta: z.number().int().min(0),
    explicacion: z.string().min(1).max(500),
  })
  .refine((datos) => datos.correcta < datos.opciones.length, {
    message: 'correcta debe ser un índice válido de opciones',
  })

export const esquemaCodigoAnotado = z.object({
  tipo: z.literal('codigo-anotado'),
  lenguaje: z.enum(['html', 'jsx', 'tsx']).default('html'),
  codigo: z.string().min(1).max(4000),
  anotaciones: z
    .array(
      z.object({
        fragmento: z.string().min(1),
        nota: z.string().min(1).max(500),
      }),
    )
    .min(1)
    .max(8),
})

export const esquemaComparadorAntesDespues = z.object({
  tipo: z.literal('comparador-antes-despues'),
  antes: z.string().min(1).max(2000),
  despues: z.string().min(1).max(2000),
  nota: z.string().max(500).optional(),
})

export const esquemaNotasClave = z.object({
  tipo: z.literal('notas-clave'),
  items: z
    .array(
      z.object({
        titulo: z.string().min(1).max(140),
        texto: z.string().min(1).max(600),
      }),
    )
    .min(2)
    .max(8),
})

export const esquemaDiagramaEtiqueta = z.object({
  tipo: z.literal('diagrama-etiqueta'),
  titulo: z.string().min(1).max(120).optional(),
  partes: z
    .array(
      z.object({
        texto: z.string().min(1).max(40),
        rol: z.enum([
          'apertura',
          'atributo-nombre',
          'atributo-valor',
          'contenido',
          'cierre',
          'simbolo',
        ]),
      }),
    )
    .min(3)
    .max(20),
})

export const esquemaCallout = z.object({
  tipo: z.literal('callout'),
  variante: z.enum(['info', 'aviso', 'error', 'exito']),
  titulo: z.string().min(1).max(140),
  contenido: z.string().min(1).max(600),
})

export const esquemaLineaDeTiempo = z.object({
  tipo: z.literal('linea-de-tiempo'),
  titulo: z.string().min(1).max(120).optional(),
  items: z
    .array(
      z.object({
        fecha: z.string().min(1).max(40).optional(),
        titulo: z.string().min(1).max(140),
        texto: z.string().min(1).max(400),
      }),
    )
    .min(2)
    .max(8),
})

export const esquemaRoles = z.object({
  tipo: z.literal('roles'),
  titulo: z.string().min(1).max(120).optional(),
  roles: z
    .array(
      z.object({
        etiqueta: z.string().min(1).max(40),
        rol: z.string().min(1).max(60),
        descripcion: z.string().min(1).max(200),
      }),
    )
    .min(2)
    .max(4),
})

export const esquemaRecursos = z.object({
  tipo: z.literal('recursos'),
  titulo: z.string().min(1).max(120).optional(),
  recursos: z
    .array(
      z.object({
        titulo: z.string().min(1).max(140),
        descripcion: z.string().min(1).max(300),
        url: z.url().max(500),
        etiqueta: z.string().min(1).max(60).optional(),
      }),
    )
    .min(1)
    .max(8),
})

export const esquemaMitos = z.object({
  tipo: z.literal('mitos'),
  titulo: z.string().min(1).max(120).optional(),
  mitos: z
    .array(
      z.object({
        mito: z.string().min(1).max(140),
        realidad: z.string().min(1).max(400),
      }),
    )
    .min(2)
    .max(6),
})

export const esquemaVistaPreviaSocial = z.object({
  tipo: z.literal('vista-previa-social'),
  titulo: z.string().min(1).max(120).optional(),
  dominio: z.string().min(1).max(80),
  ogTitulo: z.string().min(1).max(140),
  ogDescripcion: z.string().min(1).max(300),
  imagenEtiqueta: z.string().min(1).max(60),
})

export const esquemaMapaDeRegiones = z.object({
  tipo: z.literal('mapa-de-regiones'),
  titulo: z.string().min(1).max(120).optional(),
  regiones: z
    .array(
      z.object({
        etiqueta: z.string().min(1).max(40),
        elemento: z.string().min(1).max(30),
        landmark: z.string().min(1).max(30),
        contenido: z.string().min(1).max(200),
      }),
    )
    .min(2)
    .max(6),
})

export const esquemaEsquemaDePagina = z.object({
  tipo: z.literal('esquema-de-pagina'),
  titulo: z.string().min(1).max(120).optional(),
  header: z.string().min(1).max(80),
  nav: z.string().min(1).max(80).optional(),
  main: z.string().min(1).max(80),
  aside: z.string().min(1).max(80).optional(),
  footer: z.string().min(1).max(80),
})

export const esquemaCapasDeCaja = z.object({
  tipo: z.literal('capas-de-caja'),
  titulo: z.string().min(1).max(120).optional(),
  margin: z.string().min(1).max(24),
  border: z.string().min(1).max(24),
  padding: z.string().min(1).max(24),
  content: z.string().min(1).max(40),
})

// Editor en vivo: la lección deja de describir un resultado y deja probarlo
// de verdad. Al menos uno de html/css/js/ts debe traer contenido — un
// bloque con los cuatro vacíos no tiene sentido y `refine` lo rechaza en
// vez de dejarlo caer en un editor completamente en blanco.
export const esquemaEditorEnVivo = z
  .object({
    tipo: z.literal('editor-en-vivo'),
    titulo: z.string().min(1).max(140).optional(),
    consigna: z.string().min(1).max(600).optional(),
    html: z.string().max(4000).default(''),
    css: z.string().max(4000).default(''),
    js: z.string().max(4000).default(''),
    ts: z.string().max(4000).default(''),
    pestañaInicial: z.enum(['html', 'css', 'js', 'ts']).default('html'),
  })
  .refine(
    (datos) => datos.html.trim() || datos.css.trim() || datos.js.trim() || datos.ts.trim(),
    { message: 'editor-en-vivo necesita contenido inicial en html, css, js o ts' },
  )

// Ejecutan de verdad la consulta contra sql.js (motor real, WASM) — nunca
// muestran un resultado tecleado a mano. Ver specs/features/sql-en-vivo.md.
const esquemaMotorSql = z.enum(['sqlite', 'postgres']).default('sqlite')
const esquemaExtensionPostgres = z.array(z.enum(['pgcrypto', 'uuid_ossp'])).optional()
const esquemaIdentidadSimulada = z
  .array(
    z.object({
      etiqueta: z.string().min(1).max(60),
      valor: z.string().min(1).max(60),
    }),
  )
  .min(2)
  .max(4)
  .optional()

export const esquemaSqlAnotado = z.object({
  tipo: z.literal('sql-anotado'),
  titulo: z.string().min(1).max(140).optional(),
  motor: esquemaMotorSql,
  extensiones: esquemaExtensionPostgres,
  identidadSimulada: esquemaIdentidadSimulada,
  esquemaSql: z.string().min(1).max(3000),
  consulta: z.string().min(1).max(1500),
  anotaciones: z
    .array(
      z.object({
        fragmento: z.string().min(1),
        nota: z.string().min(1).max(500),
      }),
    )
    .min(1)
    .max(8),
})

// consultaSolucion es opcional: si falta, el bloque es puramente
// exploratorio (se ejecuta y se muestra el resultado real, sin ✅/❌).
export const esquemaSqlEnVivo = z.object({
  tipo: z.literal('sql-en-vivo'),
  consigna: z.string().min(1).max(600).optional(),
  motor: esquemaMotorSql,
  extensiones: esquemaExtensionPostgres,
  identidadSimulada: esquemaIdentidadSimulada,
  esquemaSql: z.string().min(1).max(3000),
  consultaInicial: z.string().max(1500).default(''),
  consultaSolucion: z.string().max(1500).optional(),
})

// Ejecutan de verdad comandos contra wasm-git (libgit2 real vía WASM) —
// nunca muestran una salida de terminal escrita a mano. Ver
// specs/features/git-en-vivo.md.
//
// Un paso de esquemaGit es normalmente un comando git (sin el prefijo
// "git", ya implícito — "init .", "add a.txt"...). wasm-git no tiene
// ningún comando para escribir contenido de ficheros (eso no es una
// operación de git), así que un paso también puede ser {escribir: {...}}
// para preparar el estado del repositorio antes del comando destacado.
const esquemaPasoGit = z.union([
  z.string().min(1).max(200),
  z.object({
    escribir: z.object({
      ruta: z.string().min(1).max(100),
      contenido: z.string().max(2000),
    }),
  }),
])

export const esquemaGitAnotado = z.object({
  tipo: z.literal('git-anotado'),
  titulo: z.string().min(1).max(140).optional(),
  esquemaGit: z.array(esquemaPasoGit).min(1).max(15),
  comando: z.string().min(1).max(200),
  mostrarGrafo: z.boolean().default(false),
  anotaciones: z
    .array(
      z.object({
        fragmento: z.string().min(1),
        nota: z.string().min(1).max(500),
      }),
    )
    .min(1)
    .max(8),
})

export const esquemaGitEnVivo = z.object({
  tipo: z.literal('git-en-vivo'),
  consigna: z.string().min(1).max(600).optional(),
  esquemaGit: z.array(esquemaPasoGit).min(1).max(15),
  comandoInicial: z.string().max(200).default(''),
  comandoSolucion: z.string().max(200).optional(),
  mostrarGrafo: z.boolean().default(false),
})

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
])

const esquemaEsperaComprobacionReact = z.union([
  esquemaConsultaElementoReact,
  z.strictObject({ ausente: esquemaConsultaElementoReact }),
  z.strictObject({ etiqueta: textoCorto, valor: z.string().max(200) }),
])

export const esquemaComprobacionReact = z.object({
  descripcion: z.string().min(1).max(160),
  pasos: z.array(esquemaPasoComprobacionReact).max(10).default([]),
  espera: esquemaEsperaComprobacionReact,
})

const esquemaArchivoReact = z.object({
  nombre: z.string().regex(/^[A-Za-z][A-Za-z0-9-]*\.(jsx|css)$/),
  codigo: z.string().max(4000),
})

export const esquemaReactEnVivo = z
  .object({
    tipo: z.literal('react-en-vivo'),
    titulo: z.string().min(1).max(140).optional(),
    consigna: z.string().min(1).max(600).optional(),
    archivos: z.array(esquemaArchivoReact).min(1).max(6),
    archivoInicial: z.string().optional(),
    strictMode: z.boolean().default(true),
    mostrarConsola: z.boolean().default(true),
    mostrarJsGenerado: z.boolean().default(false),
    // Árbol de renders (fase 2): qué se renderiza en cada commit y por qué.
    mostrarArbol: z.boolean().default(false),
    comprobaciones: z.array(esquemaComprobacionReact).min(1).max(8).optional(),
  })
  .refine((datos) => datos.archivos.some((archivo) => archivo.nombre === 'App.jsx'), {
    message: 'react-en-vivo necesita un archivo App.jsx',
  })
  .refine((datos) => new Set(datos.archivos.map((archivo) => archivo.nombre)).size === datos.archivos.length, {
    message: 'Los nombres de archivo no pueden repetirse',
  })
  .refine((datos) => !datos.archivoInicial || datos.archivos.some((archivo) => archivo.nombre === datos.archivoInicial), {
    message: 'archivoInicial debe ser uno de los archivos',
  })

export const esquemaReactAnotado = z.object({
  tipo: z.literal('react-anotado'),
  titulo: z.string().min(1).max(140).optional(),
  codigo: z.string().min(1).max(4000),
  css: z.string().max(4000).default(''),
  anotaciones: z
    .array(z.object({ fragmento: z.string().min(1), nota: z.string().min(1).max(500) }))
    .min(1)
    .max(8),
  strictMode: z.boolean().default(true),
  mostrarConsola: z.boolean().default(false),
  mostrarArbol: z.boolean().default(false),
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

export const esquemaImagen = z.object({
  tipo: z.literal('imagen'),
  src: z.string().url().startsWith('https://www.techstudytracker.com/img/'),
  alt: z.string().min(1).max(200),
  titulo: z.string().min(1).max(160).optional(),
})

export const esquemaVideo = z.object({
  tipo: z.literal('video'),
  src: z.string().url().startsWith('https://www.techstudytracker.com/img/'),
  poster: z
    .string()
    .url()
    .startsWith('https://www.techstudytracker.com/img/')
    .optional(),
  descripcion: z.string().min(1).max(200),
  titulo: z.string().min(1).max(160).optional(),
})

export const esquemaBloqueLaboratorio = z.discriminatedUnion('tipo', [
  esquemaPrediceElResultado,
  esquemaCodigoAnotado,
  esquemaComparadorAntesDespues,
  esquemaNotasClave,
  esquemaDiagramaEtiqueta,
  esquemaCallout,
  esquemaLineaDeTiempo,
  esquemaRoles,
  esquemaRecursos,
  esquemaMitos,
  esquemaVistaPreviaSocial,
  esquemaMapaDeRegiones,
  esquemaEsquemaDePagina,
  esquemaCapasDeCaja,
  esquemaEditorEnVivo,
  esquemaSqlAnotado,
  esquemaSqlEnVivo,
  esquemaGitAnotado,
  esquemaGitEnVivo,
  esquemaReactEnVivo,
  esquemaReactAnotado,
  esquemaArbolDeComponentes,
  esquemaImagen,
  esquemaVideo,
])

export type DatosPrediceElResultado = z.infer<typeof esquemaPrediceElResultado>
export type DatosCodigoAnotado = z.infer<typeof esquemaCodigoAnotado>
export type DatosComparadorAntesDespues = z.infer<
  typeof esquemaComparadorAntesDespues
>
export type DatosNotasClave = z.infer<typeof esquemaNotasClave>
export type DatosDiagramaEtiqueta = z.infer<typeof esquemaDiagramaEtiqueta>
export type DatosCallout = z.infer<typeof esquemaCallout>
export type DatosLineaDeTiempo = z.infer<typeof esquemaLineaDeTiempo>
export type DatosRoles = z.infer<typeof esquemaRoles>
export type DatosRecursos = z.infer<typeof esquemaRecursos>
export type DatosMitos = z.infer<typeof esquemaMitos>
export type DatosVistaPreviaSocial = z.infer<typeof esquemaVistaPreviaSocial>
export type DatosMapaDeRegiones = z.infer<typeof esquemaMapaDeRegiones>
export type DatosEsquemaDePagina = z.infer<typeof esquemaEsquemaDePagina>
export type DatosCapasDeCaja = z.infer<typeof esquemaCapasDeCaja>
export type DatosEditorEnVivo = z.infer<typeof esquemaEditorEnVivo>
export type DatosSqlAnotado = z.infer<typeof esquemaSqlAnotado>
export type DatosSqlEnVivo = z.infer<typeof esquemaSqlEnVivo>
export type DatosGitAnotado = z.infer<typeof esquemaGitAnotado>
export type DatosGitEnVivo = z.infer<typeof esquemaGitEnVivo>
export type DatosReactEnVivo = z.infer<typeof esquemaReactEnVivo>
export type DatosReactAnotado = z.infer<typeof esquemaReactAnotado>
export type DatosArbolDeComponentes = z.infer<typeof esquemaArbolDeComponentes>
export type ComprobacionReact = z.infer<typeof esquemaComprobacionReact>
export type ArchivoReact = z.infer<typeof esquemaArchivoReact>
export type ConsultaElementoReact = z.infer<typeof esquemaConsultaElementoReact>
export type DatosImagen = z.infer<typeof esquemaImagen>
export type DatosVideo = z.infer<typeof esquemaVideo>
export type DatosBloqueLaboratorio = z.infer<typeof esquemaBloqueLaboratorio>
