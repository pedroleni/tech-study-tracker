import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  name: z.string().trim().min(1, 'Escribe un nombre para la categoría.').max(80),
})

export function CategoryForm({
  id,
  initialName = '',
  submitLabel,
  pending,
  onCancel,
  onSubmit,
}: {
  id: string
  initialName?: string
  submitLabel: string
  pending: boolean
  onCancel?: () => void
  onSubmit: (name: string) => Promise<void>
}) {
  const { register, handleSubmit, setError, reset, formState } = useForm<{ name: string }>({
    defaultValues: { name: initialName },
  })
  const [submitError, setSubmitError] = useState('')

  async function submit(values: { name: string }) {
    const result = schema.safeParse(values)
    if (!result.success) {
      setError('name', { message: result.error.issues[0]?.message })
      return
    }

    setSubmitError('')
    try {
      await onSubmit(result.data.name)
      reset({ name: '' })
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
