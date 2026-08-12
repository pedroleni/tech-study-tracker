import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { isAuthApiError } from '@supabase/supabase-js'
import { Eye, EyeOff } from 'lucide-react'
import { z } from 'zod'

import { VerifyCodeStep } from '@/components/auth/VerifyCodeStep'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/hooks/useAuth'

const emailSchema = z.email('Introduce un email válido.')

const passwordSchema = z
  .string()
  .min(
    15,
    'La contraseña debe tener al menos 15 caracteres — puedes usar una frase en vez de una palabra con símbolos.',
  )
  .max(128, 'La contraseña no puede superar los 128 caracteres.')

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Introduce tu contraseña.'),
})

// Keep the base object separate: the refined schema below no longer exposes
// `.shape`, which this form uses for its existing field-by-field validation.
const registerFieldsSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
})

const registerSchema = registerFieldsSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  },
)

interface AuthFields {
  email: string
  password: string
  confirmPassword: string
}

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

export function AuthForm({ mode }: AuthFormProps) {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [authError, setAuthError] = useState<string | null>(null)
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false)
  const isLogin = mode === 'login'
  const authSchema = isLogin ? loginSchema : registerFieldsSchema
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthFields>()

  const onSubmit = async ({ email, password }: AuthFields) => {
    setAuthError(null)

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

      // Always show the exact same next step for new and existing accounts.
      setVerificationEmail(email)
    } catch {
      setAuthError(
        isLogin
          ? 'Email o contraseña incorrectos.'
          : 'No se pudo completar el registro. Inténtalo de nuevo.',
      )
    }
  }

  if (verificationEmail) {
    return <VerifyCodeStep email={verificationEmail} />
  }

  const title = isLogin ? 'Iniciar sesión' : 'Crear cuenta'

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <h1 className="mb-6 text-pretty text-2xl font-semibold">{title}</h1>
        <form className="space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor={`${mode}-email`}>Email</Label>
            <Input
              id={`${mode}-email`}
              type="email"
              autoComplete="email"
              spellCheck={false}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? `${mode}-email-error` : undefined}
              {...register('email', {
                validate: (value) => {
                  const result = authSchema.shape.email.safeParse(value)
                  return result.success || result.error.issues[0].message
                },
              })}
            />
            {errors.email && (
              <p id={`${mode}-email-error`} className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${mode}-password`}>Contraseña</Label>
            <div className="relative">
              <Input
                id={`${mode}-password`}
                className="pr-10"
                type={isPasswordVisible ? 'text' : 'password'}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? `${mode}-password-error` : undefined}
                {...register('password', {
                  deps: ['confirmPassword'],
                  validate: (value) => {
                    const result = authSchema.shape.password.safeParse(value)
                    return result.success || result.error.issues[0].message
                  },
                })}
              />
              <Button
                className="absolute top-0 right-0"
                type="button"
                variant="ghost"
                size="icon-lg"
                aria-label={isPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                onClick={() => setIsPasswordVisible((visible) => !visible)}
              >
                {isPasswordVisible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
              </Button>
            </div>
            {errors.password && (
              <p id={`${mode}-password-error`} className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="register-confirm-password">Confirmar contraseña</Label>
              <div className="relative">
                <Input
                  id="register-confirm-password"
                  className="pr-10"
                  type={isConfirmationVisible ? 'text' : 'password'}
                  autoComplete="new-password"
                  aria-invalid={Boolean(errors.confirmPassword)}
                  aria-describedby={
                    errors.confirmPassword ? 'register-confirm-password-error' : undefined
                  }
                  {...register('confirmPassword', {
                    validate: (value, values) => {
                      const result = registerSchema.safeParse({ ...values, confirmPassword: value })
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
                <p id="register-confirm-password-error" className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          )}

          <div aria-live="polite" aria-atomic="true">
            {authError && <p className="text-sm text-destructive">{authError}</p>}
          </div>

          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Procesando…' : title}
          </Button>

          {isLogin && (
            <p className="text-center text-sm">
              <Link className="text-primary underline underline-offset-4" to="/recuperar-password">
                ¿Olvidaste tu contraseña?
              </Link>
            </p>
          )}
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
