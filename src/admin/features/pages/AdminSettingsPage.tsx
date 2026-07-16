import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Settings, Save } from 'lucide-react'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Switch } from '@/shared/components/ui/switch'
import { Label } from '@/shared/components/ui/label'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/shared/store/authStore'
import { usePlatformSettings, useUpdatePlatformSettings } from '@/shared/hooks/useAdmin'
import { useToast } from '@/shared/hooks/useToast'
import type { PlatformSettings } from '@/shared/types/admin'

export function AdminSettingsPage() {
  const { user } = useAuthStore()
  const { data: settings, isLoading } = usePlatformSettings()
  const updateSettings = useUpdatePlatformSettings()
  const { toast } = useToast()

  const { register, handleSubmit, setValue, watch, reset } = useForm<PlatformSettings>()

  useEffect(() => { if (settings) reset(settings) }, [settings, reset])

  if (user?.role !== 'admin') return <Navigate to="/403" replace />

  const onSubmit = async (data: PlatformSettings) => {
    try {
      await updateSettings.mutateAsync(data)
      toast({ title: 'Settings saved', description: 'Platform settings updated successfully.' })
    } catch { toast({ title: 'Error', description: 'Failed to save settings.', variant: 'destructive' }) }
  }

  const maintenanceMode = watch('maintenanceMode')
  const registrationEnabled = watch('registrationEnabled')

  if (isLoading) return (
    <div className="space-y-4">
      <PageHeader title="Platform Settings" breadcrumbs={[{ label: 'Admin', href: '/dashboard/admin' }, { label: 'Settings' }]} />
      <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />)}</div>
    </div>
  )

  return (
    <div className="max-w-2xl space-y-5">
      <PageHeader
        title="Platform Settings"
        description="Configure global platform settings"
        breadcrumbs={[{ label: 'Admin', href: '/dashboard/admin' }, { label: 'Settings' }]}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader><CardTitle>General</CardTitle><CardDescription>Basic platform configuration</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="platformName" className="text-sm">Platform Name</Label>
                <Input id="platformName" {...register('platformName')} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="supportEmail" className="text-sm">Support Email</Label>
                <Input id="supportEmail" type="email" {...register('supportEmail')} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="maxUploadSize" className="text-sm">Max Upload Size (MB)</Label>
                <Input id="maxUploadSize" type="number" {...register('maxUploadSize', { valueAsNumber: true })} className="mt-1 w-32" />
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader><CardTitle>Access Control</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Maintenance Mode</p>
                  <p className="text-xs text-muted-foreground">Disable access for all non-admin users</p>
                </div>
                <Switch checked={maintenanceMode ?? false} onCheckedChange={(v) => setValue('maintenanceMode', v)} aria-label="Maintenance mode" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Registration</p>
                  <p className="text-xs text-muted-foreground">Allow new user registrations</p>
                </div>
                <Switch checked={registrationEnabled ?? true} onCheckedChange={(v) => setValue('registrationEnabled', v)} aria-label="Registration enabled" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Button type="submit" loading={updateSettings.isPending} className="gap-2">
          <Save className="h-4 w-4" />Save Settings
        </Button>
      </form>
    </div>
  )
}
