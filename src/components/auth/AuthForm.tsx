import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { isAuthApiError } from '@supabase/supabase-js'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/hooks/useAuth'

const authSchema = z.object({
  email: z.email('Introduce un email válido.'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
})

type AuthFields = z.infer<typeof authSchema>

interface AuthFormProps {
  mode: 'login' | 'register'
}

// Supabase's "already registered" signUp error is a reliable account-enumeration
// oracle (an attacker can probe arbitrary emails and see which ones already have
// an account) — checked both by code and by message text, since supabase-js
// versions haven't always populated `code` consistently.
function isAccountEnumerationError(error: unknown): boolean {
  if (!isAuthApiError(error)) return false
  return error.code === 'user_already_exists' || /already registered/i.test(error.message)
}

const REGISTER_CONFIRMATION_MESSAGE =
  'Si el email es nuevo, hemos enviado un correo de confirmación. Si ya tenías cuenta, revisa tu bandeja o inicia sesión.'

export function AuthForm({ mode }: AuthFormProps) {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [authError, setAuthError] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)
  const isLogin = mode === 'login'
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthFields>()

  const onSubmit = async ({ email, password }: AuthFields) => {
    setAuthError(null)
    setInfoMessage(null)
    try {
      if (isLogin) {
        await signIn(email, password)
        navigate('/')
        return
      }

      try {
        await signUp(email, password)
      } catch (error) {
        if (!isAccountEnumerationError(error)) throw error
      }
      // Same message whether this was a genuinely new signup or an existing
      // account — the whole point is that the two cases must look identical.
      setInfoMessage(REGISTER_CONFIRMATION_MESSAGE)
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'No se pudo completar la solicitud.')
    }
  }

  const title = isLogin ? 'Iniciar sesión' : 'Crear cuenta'

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <h1 className="mb-6 text-2xl font-semibold">{title}</h1>
        <form className="space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor={`${mode}-email`}>Email</Label>
            <Input
              id={`${mode}-email`}
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? `${mode}-email-error` : undefined}
              {...register('email', {
                validate: (value) => {
                  const result = authSchema.shape.email.safeParse(value)
                  return result.success || result.error.issues[0].message
                },
              })}
            />
            {errors.email && <p id={`${mode}-email-error`} className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${mode}-password`}>Contraseña</Label>
            <Input
              id={`${mode}-password`}
              type="password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? `${mode}-password-error` : undefined}
              {...register('password', {
                validate: (value) => {
                  const result = authSchema.shape.password.safeParse(value)
                  return result.success || result.error.issues[0].message
                },
              })}
            />
            {errors.password && <p id={`${mode}-password-error`} className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          <div aria-live="polite" aria-atomic="true">
            {authError && <p className="text-sm text-destructive">{authError}</p>}
            {infoMessage && <p className="text-sm text-muted-foreground">{infoMessage}</p>}
          </div>
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Procesando…' : title}
          </Button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">
          {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
          <Link className="text-primary underline underline-offset-4" to={isLogin ? '/register' : '/login'}>
            {isLogin ? 'Regístrate' : 'Inicia sesión'}
          </Link>
        </p>
      </Card>
    </main>
  )
}
