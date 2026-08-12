import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/hooks/useAuth'

const passwordSchema = z
  .string()
  .min(
    15,
    'La contraseña debe tener al menos 15 caracteres — puedes usar una frase en vez de una palabra con símbolos.',
  )
  .max(128, 'La contraseña no puede superar los 128 caracteres.')

const resetPasswordFieldsSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
})

const resetPasswordSchema = resetPasswordFieldsSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  },
)

interface ResetPasswordFields {
  password: string
  confirmPassword: string
}

export function ResetPasswordPage() {
  const { session, loading, updatePassword, signOutOtherSessions } = useAuth()
  const navigate = useNavigate()
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFields>()

  const onSubmit = async ({ password }: ResetPasswordFields) => {
    setUpdateError(null)

    try {
      await updatePassword(password)
      try {
        await signOutOtherSessions()
      } catch {
        // The password is already changed; revocation failure must not trap the
        // user on this one-time recovery screen.
      }
      navigate('/')
    } catch {
      setUpdateError('No se pudo actualizar la contraseña. Solicita un enlace nuevo e inténtalo otra vez.')
    }
  }

  if (loading) {
    return <p role="status">Comprobando enlace…</p>
  }

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <h1 className="text-pretty text-2xl font-semibold">Enlace no válido</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Este enlace no es válido o ha caducado.
          </p>
          <Link
            className="mt-4 inline-block text-sm text-primary underline underline-offset-4"
            to="/recuperar-password"
          >
            Solicitar otro enlace
          </Link>
        </Card>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <h1 className="text-pretty text-2xl font-semibold">Crear nueva contraseña</h1>
        <form className="mt-6 space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="new-password">Nueva contraseña</Label>
            <div className="relative">
              <Input
                id="new-password"
                className="pr-10"
                type={isPasswordVisible ? 'text' : 'password'}
                autoComplete="new-password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'new-password-error' : undefined}
                {...register('password', {
                  deps: ['confirmPassword'],
                  validate: (value) => {
                    const result = resetPasswordFieldsSchema.shape.password.safeParse(value)
                    return result.success || result.error.issues[0].message
                  },
                })}
              />
              <Button
                className="absolute top-0 right-0"
                type="button"
                variant="ghost"
                size="icon-lg"
                aria-label={isPasswordVisible ? 'Ocultar nueva contraseña' : 'Mostrar nueva contraseña'}
                onClick={() => setIsPasswordVisible((visible) => !visible)}
              >
                {isPasswordVisible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
              </Button>
            </div>
            {errors.password && (
              <p id="new-password-error" className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-new-password">Confirmar contraseña</Label>
            <div className="relative">
              <Input
                id="confirm-new-password"
                className="pr-10"
                type={isConfirmationVisible ? 'text' : 'password'}
                autoComplete="new-password"
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={
                  errors.confirmPassword ? 'confirm-new-password-error' : undefined
                }
                {...register('confirmPassword', {
                  validate: (value, values) => {
                    const result = resetPasswordSchema.safeParse({
                      ...values,
                      confirmPassword: value,
                    })
                    if (result.success) return true

                    return (
                      result.error.issues.find(
                        (issue) => issue.path[0] === 'confirmPassword',
                      )?.message ?? true
                    )
                  },
                })}
              />
              <Button
                className="absolute top-0 right-0"
                type="button"
                variant="ghost"
                size="icon-lg"
                aria-label={
                  isConfirmationVisible
                    ? 'Ocultar confirmación de contraseña'
                    : 'Mostrar confirmación de contraseña'
                }
                onClick={() => setIsConfirmationVisible((visible) => !visible)}
              >
                {isConfirmationVisible ? (
                  <EyeOff aria-hidden="true" />
                ) : (
                  <Eye aria-hidden="true" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p id="confirm-new-password-error" className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div aria-live="polite" aria-atomic="true">
            {updateError && <p className="text-sm text-destructive">{updateError}</p>}
          </div>

          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Actualizando…' : 'Guardar contraseña'}
          </Button>
        </form>
      </Card>
    </main>
  )
}
