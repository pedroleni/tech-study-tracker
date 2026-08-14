import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { IconPicker } from '@/components/ui/icon-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { categoryIcons } from '@/lib/icons/categoryIcons'

const schema = z.object({
  name: z.string().trim().min(1, 'Escribe un nombre para la categoría.').max(80),
  icon: z
    .string()
    .refine((key) => key in categoryIcons, 'Selecciona un icono de la lista.')
    .nullable(),
})

type CategoryFormValues = z.infer<typeof schema>

export function CategoryForm({
  id,
  initialName = '',
  initialIcon = null,
  submitLabel,
  pending,
  onCancel,
  onSubmit,
}: {
  id: string
  initialName?: string
  initialIcon?: string | null
  submitLabel: string
  pending: boolean
  onCancel?: () => void
  onSubmit: (input: CategoryFormValues) => Promise<void>
}) {
  const { register, control, handleSubmit, setError, reset, formState } =
    useForm<CategoryFormValues>({
      defaultValues: { name: initialName, icon: initialIcon ?? null },
    })
  const [submitError, setSubmitError] = useState('')

  async function submit(values: CategoryFormValues) {
    const result = schema.safeParse(values)
    if (!result.success) {
      setError('name', { message: result.error.issues[0]?.message })
      return
    }

    setSubmitError('')
    try {
      await onSubmit(result.data)
      reset({ name: '', icon: null })
    } catch {
      setSubmitError('No se pudo guardar la categoría. Inténtalo de nuevo.')
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(submit)(event)} className="space-y-3">
      <Label htmlFor={id}>Nombre</Label>
      <Input
        id={id}
        autoComplete="off"
        maxLength={80}
        aria-invalid={Boolean(formState.errors.name)}
        aria-describedby={`${id}-error`}
        {...register('name')}
      />
      <div className="space-y-2">
        <p className="text-sm font-medium">Icono (opcional)</p>
        <Controller
          control={control}
          name="icon"
          render={({ field }) => (
            <IconPicker icons={categoryIcons} value={field.value} onChange={field.onChange} />
          )}
        />
      </div>
      <p id={`${id}-error`} aria-live="polite" className="text-sm text-destructive">
        {formState.errors.name?.message ?? submitError}
      </p>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando…' : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}
