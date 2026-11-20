import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { CamposLeccionForm } from '@/components/leccion/CamposLeccionForm'
import {
  EditorContenidoLeccion,
  ResumenLeccionForm,
} from '@/components/leccion/EditorContenidoLeccion'
import { useImagenesLeccionForm } from '@/components/leccion/useImagenesLeccionForm'
import { Button } from '@/components/ui/button'
import { extraerImagenesDeLaboratorio } from '@/lib/utils/extraerImagenesDeLaboratorio'
import type { Leccion } from '@/types'

const leccionSchema = z.object({
  modulo: z.string(),
  titulo: z.string().trim().min(1, 'Escribe un título.').max(120),
  resumen: z.string().max(300, 'El resumen no puede superar 300 caracteres.'),
  contenido: z.string().max(200_000, 'El contenido no puede superar 200 000 caracteres.'),
  orden: z.number().int('El orden debe ser un número entero.'),
  status: z.enum(['borrador', 'publicado']),
  esProyecto: z.boolean().default(false),
})

export type LeccionFields = z.infer<typeof leccionSchema>

export interface LeccionFormValues {
  slug: string
  modulo: string | null
  titulo: string
  resumen: string
  contenido: string
  orden: number
  status: Leccion['status']
  esProyecto: boolean
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function defaults(leccion?: Leccion): LeccionFields {
  return leccion
    ? {
        modulo: leccion.modulo ?? '',
        titulo: leccion.titulo,
        resumen: leccion.resumen,
        contenido: leccion.contenido,
        orden: leccion.orden,
        status: leccion.status,
        esProyecto: leccion.esProyecto,
      }
    : {
        modulo: '',
        titulo: '',
        resumen: '',
        contenido: '',
        orden: 10,
        status: 'borrador',
        esProyecto: false,
      }
}

function textoBotonSubmit(pending: boolean, editing: boolean) {
  if (pending) return 'Guardando…'
  if (editing) return 'Guardar cambios'
  return 'Crear borrador'
}

export function LeccionForm({
  leccion,
  pending,
  onSubmit,
}: {
  leccion?: Leccion
  pending: boolean
  onSubmit: (values: LeccionFormValues) => Promise<void>
}) {
  const { register, handleSubmit, setError, reset, control, formState, getValues, setValue } =
    useForm<LeccionFields>({ defaultValues: defaults(leccion) })
  const gestionImagenes = useImagenesLeccionForm({ leccion, getValues, setValue })

  const { ref: contenidoRef, ...contenidoRegister } = register('contenido')
  const [submitError, setSubmitError] = useState('')
  const title = useWatch({ control, name: 'titulo' })
  const contenidoActual = useWatch({ control, name: 'contenido' })
  const slug = useMemo(() => leccion?.slug ?? slugify(title), [leccion?.slug, title])
  const imagenes = useMemo(
    () => extraerImagenesDeLaboratorio(contenidoActual ?? ''),
    [contenidoActual],
  )

  useEffect(() => {
    reset(defaults(leccion))
  }, [leccion, reset])

  useEffect(() => {
    function warnBeforeUnload(event: BeforeUnloadEvent) {
      if (!formState.isDirty) return
      event.preventDefault()
      event.returnValue = true
    }
    window.addEventListener('beforeunload', warnBeforeUnload)
    return () => window.removeEventListener('beforeunload', warnBeforeUnload)
  }, [formState.isDirty])

  async function submit(values: LeccionFields) {
    const result = leccionSchema.safeParse(values)
    if (!result.success) {
      const issue = result.error.issues[0]
      const path = issue?.path[0] as keyof LeccionFields | undefined
      if (path) setError(path, { message: issue.message }, { shouldFocus: true })
      setSubmitError(issue?.message ?? 'Revisa los campos marcados.')
      return
    }
    if (!slug) {
      setError(
        'titulo',
        { message: 'El título debe generar un slug válido.' },
        { shouldFocus: true },
      )
      setSubmitError('Usa al menos una letra o un número en el título.')
      return
    }

    setSubmitError('')
    try {
      await onSubmit({
        ...result.data,
        slug,
        modulo: result.data.modulo.trim() || null,
      })
      reset(result.data)
    } catch {
      setSubmitError('No se pudo guardar la lección. Revisa los campos e inténtalo de nuevo.')
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(submit)(event)} className="space-y-8">
      <CamposLeccionForm
        leccion={leccion}
        slug={slug}
        register={register}
        errors={formState.errors}
      />

      <ResumenLeccionForm register={register('resumen')} errors={formState.errors} />

      <EditorContenidoLeccion
        contenidoRegister={contenidoRegister}
        contenidoRef={contenidoRef}
        textareaRef={gestionImagenes.textareaRef}
        errors={formState.errors}
        subiendoImagen={gestionImagenes.subiendoImagen}
        errorImagen={gestionImagenes.errorImagen}
        mensajeImagen={gestionImagenes.mensajeImagen}
        imagenBorrandose={gestionImagenes.imagenBorrandose}
        imagenes={imagenes}
        manejarDragOver={gestionImagenes.manejarDragOver}
        manejarDrop={gestionImagenes.manejarDrop}
        manejarPaste={gestionImagenes.manejarPaste}
        borrarImagen={gestionImagenes.borrarImagen}
      />

      <p aria-live="polite" className="text-sm text-destructive">
        {submitError}
      </p>
      <Button type="submit" size="lg" disabled={pending}>
        {textoBotonSubmit(pending, Boolean(leccion))}
      </Button>
    </form>
  )
}
