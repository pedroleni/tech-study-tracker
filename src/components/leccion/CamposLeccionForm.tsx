import type { FieldErrors, UseFormRegister } from 'react-hook-form'

import type { LeccionFields } from '@/components/leccion/leccionFormSchema'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Leccion } from '@/types'

function CamposIdentificacionLeccion({
  leccion,
  slug,
  register,
  errors,
}: {
  leccion?: Leccion
  slug: string
  register: UseFormRegister<LeccionFields>
  errors: FieldErrors<LeccionFields>
}) {
  return (
    <>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="leccion-titulo">Título</Label>
        <Input
          id="leccion-titulo"
          autoComplete="off"
          maxLength={120}
          aria-invalid={Boolean(errors.titulo)}
          aria-describedby="leccion-titulo-error"
          {...register('titulo')}
        />
        <p id="leccion-titulo-error" className="text-sm text-destructive">
          {errors.titulo?.message}
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
          aria-invalid={Boolean(errors.orden)}
          aria-describedby="leccion-orden-help leccion-orden-error"
          {...register('orden', { valueAsNumber: true })}
        />
        <p id="leccion-orden-help" className="text-xs text-muted-foreground">
          Usa 10, 20, 30… para dejar huecos.
        </p>
        <p id="leccion-orden-error" className="text-sm text-destructive">
          {errors.orden?.message}
        </p>
      </div>
    </>
  )
}

function EstadoYProyectoLeccion({
  leccion,
  register,
}: {
  leccion?: Leccion
  register: UseFormRegister<LeccionFields>
}) {
  return (
    <>
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

      <div className="sm:col-span-2">
        <div className="flex min-h-11 items-start gap-3 rounded-lg border bg-background p-3">
          <input
            id="leccion-es-proyecto"
            type="checkbox"
            className="mt-0.5 size-4 shrink-0 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            aria-describedby="leccion-es-proyecto-help"
            {...register('esProyecto')}
          />
          <div className="space-y-1">
            <Label htmlFor="leccion-es-proyecto" className="cursor-pointer">
              Es un proyecto
            </Label>
            <p id="leccion-es-proyecto-help" className="text-xs text-muted-foreground">
              Las lecciones publicadas con esta marca aparecen también en la sección Proyectos.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export function CamposLeccionForm({
  leccion,
  slug,
  register,
  errors,
}: {
  leccion?: Leccion
  slug: string
  register: UseFormRegister<LeccionFields>
  errors: FieldErrors<LeccionFields>
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <CamposIdentificacionLeccion
        leccion={leccion}
        slug={slug}
        register={register}
        errors={errors}
      />
      <EstadoYProyectoLeccion leccion={leccion} register={register} />
    </div>
  )
}

export function ResumenLeccionForm({
  register,
  errors,
}: {
  register: UseFormRegister<LeccionFields>
  errors: FieldErrors<LeccionFields>
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="leccion-resumen">Resumen</Label>
      <textarea
        id="leccion-resumen"
        rows={3}
        maxLength={300}
        placeholder="Resume el objetivo de la lección…"
        className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        aria-invalid={Boolean(errors.resumen)}
        aria-describedby="leccion-resumen-error"
        {...register('resumen')}
      />
      <p id="leccion-resumen-error" className="text-sm text-destructive">
        {errors.resumen?.message}
      </p>
    </div>
  )
}
