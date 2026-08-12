import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/hooks/useAuth'

const codeSchema = z.string().regex(/^\d{6}$/, 'Introduce el código de 6 dígitos.')

interface VerifyCodeFields {
  code: string
}

interface VerifyCodeStepProps {
  email: string
}

const INVALID_CODE_MESSAGE = 'El código no es válido o ha caducado.'
const RESEND_RESULT_MESSAGE =
  'Si tu cuenta necesita verificación, te hemos enviado un código nuevo.'

export function VerifyCodeStep({ email }: VerifyCodeStepProps) {
  const { verifyOtp, resendCode } = useAuth()
  const navigate = useNavigate()
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const [resendMessage, setResendMessage] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyCodeFields>()

  const onSubmit = async ({ code }: VerifyCodeFields) => {
    setVerificationError(null)
    setResendMessage(null)

    try {
      await verifyOtp(email, code)
      navigate('/')
    } catch {
      setVerificationError(INVALID_CODE_MESSAGE)
    }
  }

  const onResend = async () => {
    setResendMessage(null)
    setIsResending(true)

    try {
      await resendCode(email)
    } catch {
      // Keep success and failure indistinguishable: resend must not become a
      // second account-enumeration oracle after the protected signup step.
    } finally {
      setResendMessage(RESEND_RESULT_MESSAGE)
      setIsResending(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <h1 className="text-pretty text-2xl font-semibold">Verifica tu email</h1>
        <p className="mt-2 break-words text-sm text-muted-foreground">
          Te hemos enviado un código a {email}
        </p>

        <form className="mt-6 space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="verification-code">Código de 6 dígitos</Label>
            <Input
              id="verification-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              spellCheck={false}
              maxLength={6}
              aria-invalid={Boolean(errors.code)}
              aria-describedby={errors.code ? 'verification-code-error' : undefined}
              {...register('code', {
                validate: (value) => {
                  const result = codeSchema.safeParse(value)
                  return result.success || result.error.issues[0].message
                },
              })}
            />
            {errors.code && (
              <p id="verification-code-error" className="text-sm text-destructive">
                {errors.code.message}
              </p>
            )}
          </div>

          <div aria-live="polite" aria-atomic="true">
            {verificationError && (
              <p className="text-sm text-destructive">{verificationError}</p>
            )}
            {resendMessage && <p className="text-sm text-muted-foreground">{resendMessage}</p>}
          </div>

          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Verificando…' : 'Verificar'}
          </Button>
          <Button
            className="w-full"
            type="button"
            variant="outline"
            disabled={isResending}
            onClick={onResend}
          >
            {isResending ? 'Reenviando…' : 'Reenviar código'}
          </Button>
        </form>
      </Card>
    </main>
  )
}
