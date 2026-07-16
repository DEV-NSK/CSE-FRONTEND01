import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Lock, CheckCircle2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { authService } from '@/shared/services/auth.service'

const schema = z
  .object({
    otp: z
      .string()
      .length(6, 'OTP must be exactly 6 digits')
      .regex(/^\d{6}$/, 'OTP must contain only digits'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number')
      .regex(/[@$!%*?&]/, 'Must contain at least one special character (@$!%*?&)'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

export function ResetPasswordPage() {
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const email = searchParams.get('email') || ''

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormValues) => {
    setError('')
    if (!email) {
      setError('Email is missing. Please restart the password reset flow.')
      return
    }
    try {
      await authService.resetPassword({ email, otp: data.otp, newPassword: data.password })
      setDone(true)
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      setError(
        axiosError?.response?.data?.message || 'Failed to reset password. The OTP may have expired.',
      )
    }
  }

  if (done) {
    return (
      <Card className="w-full shadow-lg">
        <CardContent className="pt-8 pb-8 text-center">
          <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-xl font-bold mb-2">Password reset!</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Your password has been updated. You can now log in.
          </p>
          <Button onClick={() => navigate('/auth/login')}>Go to login</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Set new password</CardTitle>
        <CardDescription className="text-center">
          Enter the 6-digit code sent to{' '}
          <span className="font-medium text-foreground">{email || 'your email'}</span> and choose
          a new password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {error && (
            <div
              role="alert"
              className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm"
            >
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

          <Input
            label="New Password"
            type={showPwd ? 'text' : 'password'}
            placeholder="••••••••"
            leftIcon={<Lock className="h-4 w-4" />}
            autoComplete="new-password"
            error={errors.password?.message}
            helperText="Min 8 chars, uppercase, lowercase, number, special char (@$!%*?&)"
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPwd ? 'Hide password' : 'Show password'}
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            {...register('password')}
          />

          <Input
            label="Confirm Password"
            type={showConfirm ? 'text' : 'password'}
            placeholder="••••••••"
            leftIcon={<Lock className="h-4 w-4" />}
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            {...register('confirmPassword')}
          />

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Reset password
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Link
            to="/auth/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to login
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
