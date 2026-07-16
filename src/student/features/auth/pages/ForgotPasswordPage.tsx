import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { authService } from '@/shared/services/auth.service'

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
})
type FormValues = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormValues) => {
    setError('')
    try {
      await authService.forgotPassword({ email: data.email })
      // Navigate to reset page — backend always returns 200 (no email enumeration)
      navigate(`/auth/reset-password?email=${encodeURIComponent(data.email)}`)
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      setError(axiosError?.response?.data?.message || 'Failed to send reset email. Please try again.')
    }
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Forgot password?</CardTitle>
        <CardDescription className="text-center">
          Enter your email and we'll send you a reset link
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
            label="Email"
            type="email"
            placeholder="you@example.com"
            leftIcon={<Mail className="h-4 w-4" />}
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Button type="submit" className="w-full" loading={isSubmitting}>
            Send reset link
          </Button>
        </form>
        <div className="mt-6 text-center">
          <Link to="/auth/login" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to login
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
