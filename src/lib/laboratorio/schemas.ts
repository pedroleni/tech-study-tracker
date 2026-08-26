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
export type DatosBloqueLaboratorio = z.infer<typeof esquemaBloqueLaboratorio>
