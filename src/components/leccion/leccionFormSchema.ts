import { z } from 'zod'

export const leccionSchema = z.object({
  modulo: z.string(),
  titulo: z.string().trim().min(1, 'Escribe un título.').max(120),
  resumen: z.string().max(300, 'El resumen no puede superar 300 caracteres.'),
  contenido: z.string().max(200_000, 'El contenido no puede superar 200 000 caracteres.'),
  orden: z.number().int('El orden debe ser un número entero.'),
  status: z.enum(['borrador', 'publicado']),
  esProyecto: z.boolean().default(false),
})

export type LeccionFields = z.infer<typeof leccionSchema>
