import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Leccion } from '@/types'

const leccionSchema = z.object({
  modulo: z.string(),
  titulo: z.string().trim().min(1, 'Escribe un título.').max(120),
  resumen: z.string().max(300, 'El resumen no puede superar 300 caracteres.'),
  contenido: z.string().max(200_000, 'El contenido no puede superar 200 000 caracteres.'),
  orden: z.number().int('El orden debe ser un número entero.'),
  status: z.enum(['borrador', 'publicado']),
})

type LeccionFields = z.infer<typeof leccionSchema>

export interface LeccionFormValues {
  slug: string
  modulo: string | null
  titulo: string
  resumen: string
  contenido: string
  orden: number
  status: Leccion['status']
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
      }
    : {
        modulo: '',
        titulo: '',
        resumen: '',
        contenido: '',
        orden: 10,
        status: 'borrador',
      }
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
  const { register, handleSubmit, setError, reset, control, formState } =
    useForm<LeccionFields>({ defaultValues: defaults(leccion) })
  const [submitError, setSubmitError] = useState('')
  const title = useWatch({ control, name: 'titulo' })
  const slug = useMemo(() => leccion?.slug ?? slugify(title), [leccion?.slug, title])

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
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="leccion-titulo">Título</Label>
          <Input
            id="leccion-titulo"
            autoComplete="off"
            maxLength={120}
            aria-invalid={Boolean(formState.errors.titulo)}
            aria-describedby="leccion-titulo-error"
            {...register('titulo')}
          />
          <p id="leccion-titulo-error" className="text-sm text-destructive">
            {formState.errors.titulo?.message}
          </p>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="leccion-slug">Slug</Label>
          <Input
            id="leccion-slug"
            name="slug"
            value={slug}
            readOnly
            autoComplete="off"
            aria-describedby="leccion-slug-help"
          />
          <p id="leccion-slug-help" className="text-xs text-muted-foreground">
            {leccion
              ? 'El slug queda congelado para no romper enlaces ya compartidos.'
              : 'Se deriva automáticamente del título.'}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="leccion-modulo">Módulo</Label>
          <Input
            id="leccion-modulo"
            autoComplete="off"
            aria-describedby="leccion-modulo-help"
            {...register('modulo')}
          />
          <p id="leccion-modulo-help" className="text-xs text-muted-foreground">
            Opcional; agrupa lecciones en la portada.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="leccion-orden">Orden</Label>
          <Input
            id="leccion-orden"
            type="number"
            inputMode="numeric"
            step={1}
            autoComplete="off"
            aria-invalid={Boolean(formState.errors.orden)}
            aria-describedby="leccion-orden-help leccion-orden-error"
            {...register('orden', { valueAsNumber: true })}
          />
          <p id="leccion-orden-help" className="text-xs text-muted-foreground">
            Usa 10, 20, 30… para dejar huecos.
          </p>
          <p id="leccion-orden-error" className="text-sm text-destructive">
            {formState.errors.orden?.message}
          </p>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="leccion-status">Estado</Label>
          {leccion ? (
            <select
              id="leccion-status"
              aria-describedby="leccion-status-help"
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              {...register('status')}
            >
              <option value="borrador">Borrador</option>
              <option value="publicado">Publicado</option>
            </select>
          ) : (
            <>
              <input type="hidden" value="borrador" {...register('status')} />
              <select
                id="leccion-status"
                disabled
                value="borrador"
                aria-describedby="leccion-status-help"
                className="h-9 w-full cursor-not-allowed rounded-lg border border-input bg-background px-3 text-sm text-foreground opacity-50"
              >
                <option value="borrador">Borrador</option>
              </select>
            </>
          )}
          <p id="leccion-status-help" className="text-xs text-muted-foreground">
            {leccion
              ? 'Publicar hace visible la lección cuando su tecnología también está publicada.'
              : 'Toda lección se crea como borrador. Podrás publicarla desde la edición.'}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="leccion-resumen">Resumen</Label>
        <textarea
          id="leccion-resumen"
          rows={3}
          maxLength={300}
          placeholder="Resume el objetivo de la lección…"
          className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          aria-invalid={Boolean(formState.errors.resumen)}
          aria-describedby="leccion-resumen-error"
          {...register('resumen')}
        />
        <p id="leccion-resumen-error" className="text-sm text-destructive">
          {formState.errors.resumen?.message}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="leccion-contenido">Contenido en Markdown</Label>
        <textarea
          id="leccion-contenido"
          rows={20}
          maxLength={200_000}
          placeholder="Escribe la lección en Markdown…"
          className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          aria-invalid={Boolean(formState.errors.contenido)}
          aria-describedby="leccion-contenido-error"
          {...register('contenido')}
        />
        <p id="leccion-contenido-error" className="text-sm text-destructive">
          {formState.errors.contenido?.message}
        </p>
      </div>

      <p aria-live="polite" className="text-sm text-destructive">
        {submitError}
      </p>
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? 'Guardando…' : leccion ? 'Guardar cambios' : 'Crear borrador'}
      </Button>
    </form>
  )
}
