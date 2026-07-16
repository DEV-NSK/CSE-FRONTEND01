import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, MessageSquare, Send, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Please enter a valid email'),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type FormValues = z.infer<typeof schema>

export function ContactPage() {
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (_data: FormValues) => {
    // Simulate API call
    await new Promise((res) => setTimeout(res, 1000))
    setSent(true)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <h1 className="text-heading-1 mb-3">Contact Us</h1>
        <p className="text-muted-foreground">
          Have a question or feedback? We'd love to hear from you.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium">support@cseplatform.com</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-secondary/10 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-secondary" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Response Time</p>
              <p className="text-sm font-medium">Within 24 hours</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {sent ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" aria-hidden="true" />
              <h2 className="text-xl font-bold mb-2">Message sent!</h2>
              <p className="text-muted-foreground text-sm">
                Thanks for reaching out. We'll get back to you within 24 hours.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle>Send a message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Name" type="text" placeholder="Your name" error={errors.name?.message} {...register('name')} />
                  <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
                </div>
                <Input label="Subject" type="text" placeholder="What's this about?" error={errors.subject?.message} {...register('subject')} />
                <div>
                  <Label htmlFor="message">Message</Label>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder="Your message..."
                    className="mt-1.5 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    {...register('message')}
                  />
                  {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message.message}</p>}
                </div>
                <Button type="submit" loading={isSubmitting} className="gap-2">
                  <Send className="h-4 w-4" />
                  Send message
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
