import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/hooks/useAuth'

const emailSchema = z.email('Introduce un email válido.')

interface ForgotPasswordFields {
  email: string
}

const GENERIC_RESET_MESSAGE =
  'Si ese email tiene una cuenta, te hemos enviado instrucciones para recuperarla.'

export function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth()
  const [requestCompleted, setRequestCompleted] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFields>()

  const onSubmit = async ({ email }: ForgotPasswordFields) => {
    try {
      await requestPasswordReset(email)
    } catch {
      // Deliberately ignored: success and failure must be indistinguishable so
      // this endpoint cannot reveal whether an account exists.
    } finally {
      setRequestCompleted(true)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <h1 className="text-pretty text-2xl font-semibold">Recuperar contraseña</h1>

        {requestCompleted ? (
          <div className="mt-4 space-y-4" aria-live="polite">
            <p className="text-sm text-muted-foreground">{GENERIC_RESET_MESSAGE}</p>
            <Link className="text-sm text-primary underline underline-offset-4" to="/login">
              Volver a iniciar sesión
            </Link>
          </div>
        ) : (
          <form className="mt-6 space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="recovery-email">Email</Label>
              <Input
                id="recovery-email"
                type="email"
                autoComplete="email"
                spellCheck={false}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'recovery-email-error' : undefined}
                {...register('email', {
                  validate: (value) => {
                    const result = emailSchema.safeParse(value)
                    return result.success || result.error.issues[0].message
                  },
                })}
              />
              {errors.email && (
                <p id="recovery-email-error" className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando…' : 'Enviar instrucciones'}
            </Button>
          </form>
        )}
      </Card>
    </main>
  )
}
