import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2, Mail } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { authService } from '@/shared/services/auth.service'

const verifySchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits'),
})

type VerifyFormValues = z.infer<typeof verifySchema>

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  const email = searchParams.get('email') || ''

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyFormValues>({ resolver: zodResolver(verifySchema) })

  const onSubmit = async (data: VerifyFormValues) => {
    setError('')
    try {
      await authService.verifyEmail({ email, otp: data.otp })
      setSuccess(true)
      setTimeout(() => navigate('/auth/login'), 3000)
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      setError(axiosError?.response?.data?.message || 'Invalid or expired OTP. Please try again.')
    }
  }

  const handleResend = async () => {
    setResendMessage('')
    setResendLoading(true)
    try {
      await authService.resendVerification(email)
      setResendMessage('A new OTP has been sent to your email.')
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      setResendMessage(axiosError?.response?.data?.message || 'Failed to resend. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full shadow-lg">
        <CardContent className="pt-8 pb-8 text-center">
          <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-xl font-bold mb-2">Email verified!</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Your account is now active. Redirecting to login...
          </p>
          <Button onClick={() => navigate('/auth/login')}>Go to login</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-2">
          <Mail className="h-10 w-10 text-primary" aria-hidden="true" />
        </div>
        <CardTitle className="text-2xl font-bold text-center">Verify your email</CardTitle>
        <CardDescription className="text-center">
          We sent a 6-digit code to{' '}
          <span className="font-medium text-foreground">{email || 'your email'}</span>.
          Enter it below to activate your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {error && (
            <div role="alert" className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <Input
            label="Verification Code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            error={errors.otp?.message}
            {...register('otp')}
          />

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Verify email
          </Button>
        </form>

        <div className="mt-4 text-center">
          {resendMessage && (
            <p className="text-sm text-muted-foreground mb-2">{resendMessage}</p>
          )}
          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading}
            className="text-sm text-primary hover:underline disabled:opacity-50"
          >
            {resendLoading ? 'Sending...' : "Didn't receive a code? Resend"}
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
