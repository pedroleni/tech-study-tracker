import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Controller,
  useFieldArray,
  useForm,
  type Control,
  type FieldArrayWithId,
  type FieldErrors,
  type UseFieldArrayAppend,
  type UseFieldArrayRemove,
  type UseFormRegister,
} from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { IconPicker } from '@/components/ui/icon-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { technologyIcons } from '@/lib/icons/technologyIcons'
import { validateResourceUrl } from '@/lib/utils/validateResourceUrl'
import type { Category, Technology } from '@/types'
import type { NewTechnologyInput } from '@/lib/queries/mappers'

const technologySchema = z.object({
  categoryId: z.string().min(1, 'Selecciona una categoría.'),
  name: z.string().trim().min(1, 'Escribe un nombre.').max(120),
  icon: z
    .string()
    .refine((key) => key in technologyIcons, 'Selecciona un icono de la lista.')
    .nullable(),
  status: z.enum(['pendiente', 'en_progreso', 'completado']),
  priority: z.enum(['alta', 'media', 'baja']),
  difficulty: z.enum(['facil', 'media', 'dificil']),
  notes: z.string().max(50_000, 'Los apuntes no pueden superar 50 000 caracteres.'),
  resources: z.array(
    z.object({
      label: z.string().trim().min(1, 'Escribe una etiqueta.').max(120),
      url: z.string().refine(validateResourceUrl, 'Usa una URL completa http:// o https://.'),
    }),
  ),
})

function defaults(technology?: Technology): NewTechnologyInput {
  return technology
    ? {
        categoryId: technology.categoryId,
        name: technology.name,
        icon: technology.icon ?? null,
        status: technology.status,
        priority: technology.priority,
        difficulty: technology.difficulty,
        notes: technology.notes,
        resources: technology.resources,
      }
    : {
        categoryId: '',
        name: '',
        icon: null,
        status: 'pendiente',
        priority: 'media',
        difficulty: 'media',
        notes: '',
        resources: [],
      }
}

const camposSeleccion = [
  {
    id: 'technology-status',
    label: 'Estado',
    name: 'status' as const,
    options: [
      ['pendiente', 'Pendiente'],
      ['en_progreso', 'En progreso'],
      ['completado', 'Completado · publicar'],
    ],
  },
  {
    id: 'technology-priority',
    label: 'Prioridad',
    name: 'priority' as const,
    options: [
      ['baja', 'Baja'],
      ['media', 'Media'],
      ['alta', 'Alta'],
    ],
  },
  {
    id: 'technology-difficulty',
    label: 'Dificultad',
    name: 'difficulty' as const,
    options: [
      ['facil', 'Fácil'],
      ['media', 'Media'],
      ['dificil', 'Difícil'],
    ],
  },
] as const

function CamposPrincipalesTecnologia({
  categories,
  register,
  control,
  errors,
}: {
  categories: Pick<Category, 'id' | 'name' | 'createdAt'>[]
  register: UseFormRegister<NewTechnologyInput>
  control: Control<NewTechnologyInput>
  errors: FieldErrors<NewTechnologyInput>
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="technology-name">Nombre</Label>
        <Input
          id="technology-name"
          autoComplete="off"
          maxLength={120}
          aria-invalid={Boolean(errors.name)}
          {...register('name')}
        />
        <p className="text-sm text-destructive">{errors.name?.message}</p>
      </div>

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="technology-category">Categoría</Label>
        <select
          id="technology-category"
          className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          aria-invalid={Boolean(errors.categoryId)}
          {...register('categoryId')}
        >
          <option value="">Selecciona una categoría</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <p className="text-sm text-destructive">{errors.categoryId?.message}</p>
      </div>

      <div className="space-y-2 sm:col-span-2">
        <p className="text-sm font-medium">Icono (opcional)</p>
        <Controller
          control={control}
          name="icon"
          render={({ field }) => (
            <IconPicker
              icons={technologyIcons}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      {camposSeleccion.map((field) => (
        <div key={field.id} className="space-y-2">
          <Label htmlFor={field.id}>{field.label}</Label>
          <select
            id={field.id}
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            {...register(field.name)}
          >
            {field.options.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  )
}

function RecursosTecnologia({
  fields,
  append,
  remove,
  register,
}: {
  fields: FieldArrayWithId<NewTechnologyInput, 'resources', 'id'>[]
  append: UseFieldArrayAppend<NewTechnologyInput, 'resources'>
  remove: UseFieldArrayRemove
  register: UseFormRegister<NewTechnologyInput>
}) {
  return (
    <fieldset className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <legend className="font-semibold">Recursos</legend>
          <p className="mt-1 text-sm text-muted-foreground">
            Solo enlaces completos con esquema http o https.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => append({ label: '', url: '' })}
        >
          <Plus aria-hidden="true" />
          Añadir recurso
        </Button>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="grid gap-3 rounded-lg border p-4 sm:grid-cols-[1fr_2fr_auto] sm:items-end">
          <div className="space-y-2">
            <Label htmlFor={`resource-label-${index}`}>Etiqueta</Label>
            <Input
              id={`resource-label-${index}`}
              autoComplete="off"
              maxLength={120}
              {...register(`resources.${index}.label`)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`resource-url-${index}`}>URL</Label>
            <Input
              id={`resource-url-${index}`}
              type="url"
              inputMode="url"
              autoComplete="off"
              placeholder="https://ejemplo.com/…"
              {...register(`resources.${index}.url`)}
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            aria-label={`Quitar recurso ${index + 1}`}
            onClick={() => remove(index)}
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </div>
      ))}
    </fieldset>
  )
}

function textoBotonSubmit(pending: boolean, editing: boolean) {
  if (pending) return 'Guardando…'
  if (editing) return 'Guardar cambios'
  return 'Crear ficha'
}

export function TechnologyForm({
  categories,
  technology,
  pending,
  onSubmit,
}: {
  categories: Pick<Category, 'id' | 'name' | 'createdAt'>[]
  technology?: Technology
  pending: boolean
  onSubmit: (input: NewTechnologyInput) => Promise<void>
}) {
  const { register, control, handleSubmit, setError, reset, formState } =
    useForm<NewTechnologyInput>({ defaultValues: defaults(technology) })
  const resources = useFieldArray({ control, name: 'resources' })
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    reset(defaults(technology))
  }, [reset, technology])

  useEffect(() => {
    function warnBeforeUnload(event: BeforeUnloadEvent) {
      if (!formState.isDirty) return
      event.preventDefault()
      event.returnValue = true
    }
    window.addEventListener('beforeunload', warnBeforeUnload)
    return () => window.removeEventListener('beforeunload', warnBeforeUnload)
  }, [formState.isDirty])

  async function submit(values: NewTechnologyInput) {
    const result = technologySchema.safeParse(values)
    if (!result.success) {
      const issue = result.error.issues[0]
      const path = issue?.path.join('.') as keyof NewTechnologyInput | undefined
      if (path && !path.includes('.')) setError(path, { message: issue.message })
      setSubmitError(issue?.message ?? 'Revisa los campos marcados.')
      return
    }

    setSubmitError('')
    try {
      await onSubmit(result.data)
      reset(result.data)
    } catch {
      setSubmitError('No se pudo guardar la ficha. Revisa los campos e inténtalo de nuevo.')
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(submit)(event)} className="space-y-8">
      <CamposPrincipalesTecnologia
        categories={categories}
        register={register}
        control={control}
        errors={formState.errors}
      />

      <div className="space-y-2">
        <Label htmlFor="technology-notes">Apuntes en Markdown</Label>
        <textarea
          id="technology-notes"
          rows={14}
          maxLength={50_000}
          placeholder="Resume conceptos, ejemplos y decisiones…"
          className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          {...register('notes')}
        />
        <p className="text-sm text-destructive">{formState.errors.notes?.message}</p>
      </div>

      <RecursosTecnologia
        fields={resources.fields}
        append={resources.append}
        remove={resources.remove}
        register={register}
      />

      <p aria-live="polite" className="text-sm text-destructive">
        {submitError}
      </p>
      <Button type="submit" size="lg" disabled={pending || categories.length === 0}>
        {textoBotonSubmit(pending, Boolean(technology))}
      </Button>
    </form>
  )
}
