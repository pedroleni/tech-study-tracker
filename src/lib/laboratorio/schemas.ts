import { z } from 'zod'

export const esquemaPrediceElResultado = z
  .object({
    tipo: z.literal('predice-el-resultado'),
    lenguaje: z.literal('html').default('html'),
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
  lenguaje: z.literal('html').default('html'),
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

export const esquemaImagen = z.object({
  tipo: z.literal('imagen'),
  src: z.string().url().startsWith('https://www.techstudytracker.com/img/'),
  alt: z.string().min(1).max(200),
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
  esquemaImagen,
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
export type DatosImagen = z.infer<typeof esquemaImagen>
export type DatosBloqueLaboratorio = z.infer<typeof esquemaBloqueLaboratorio>
