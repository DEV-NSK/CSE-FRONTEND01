import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sun, Moon, Monitor, LogOut, Lock, Eye, EyeOff, Bell, Shield, User, Palette } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Switch } from '@/shared/components/ui/switch'
import { Label } from '@/shared/components/ui/label'
import { Separator } from '@/shared/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Badge } from '@/shared/components/ui/badge'
import { ConfirmDialog } from '@/shared/components/common/ConfirmDialog'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { useThemeStore } from '@/shared/store/themeStore'
import { useAuthStore } from '@/shared/store/authStore'
import { authService } from '@/shared/services/auth.service'
import { profileService } from '@/shared/services/profile.service'
import { queryClient } from '@/shared/lib/queryClient'
import type { Theme } from '@/types'

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] })

type PwdForm = z.infer<typeof passwordSchema>

const themeOptions: { value: Theme; label: string; icon: React.ElementType; desc: string }[] = [
  { value: 'light', label: 'Light', icon: Sun, desc: 'Always light' },
  { value: 'dark', label: 'Dark', icon: Moon, desc: 'Always dark' },
  { value: 'system', label: 'System', icon: Monitor, desc: 'Follow OS' },
]

export function SettingsPage() {
  const { theme, setTheme } = useThemeStore()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [pwdSuccess, setPwdSuccess] = useState(false)
  const [pwdError, setPwdError] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [notifPrefs, setNotifPrefs] = useState({ learning: true, coding: true, projects: true, placement: true, events: true, system: true })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PwdForm>({ resolver: zodResolver(passwordSchema) })

  const handleLogout = async () => {
    try { await authService.logout() } catch { /* ignore */ }
    logout(); queryClient.clear(); navigate('/auth/login', { replace: true })
  }

  const onPwd = async (data: PwdForm) => {
    setPwdError(''); setPwdSuccess(false)
    try {
      await profileService.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword })
      setPwdSuccess(true); reset()
    } catch (err: unknown) {
      setPwdError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to change password.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Settings" description="Manage your account preferences" breadcrumbs={[{ label: 'Settings' }]} />
      <Tabs defaultValue="appearance" className="space-y-5">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="appearance" className="gap-1.5 text-xs"><Palette className="h-3 w-3" />Appearance</TabsTrigger>
          <TabsTrigger value="account" className="gap-1.5 text-xs"><User className="h-3 w-3" />Account</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5 text-xs"><Bell className="h-3 w-3" />Notifications</TabsTrigger>
          <TabsTrigger value="privacy" className="gap-1.5 text-xs"><Shield className="h-3 w-3" />Privacy</TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5 text-xs"><Lock className="h-3 w-3" />Security</TabsTrigger>
        </TabsList>

        {/* Appearance */}
        <TabsContent value="appearance">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader><CardTitle>Theme</CardTitle><CardDescription>Choose your preferred appearance</CardDescription></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {themeOptions.map((opt) => {
                    const Icon = opt.icon
                    const sel = theme === opt.value
                    return (
                      <button key={opt.value} type="button" onClick={() => setTheme(opt.value)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${sel ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}
                        aria-pressed={sel}>
                        <Icon className={`h-6 w-6 ${sel ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className={`text-sm font-medium ${sel ? 'text-primary' : ''}`}>{opt.label}</span>
                        <span className="text-xs text-muted-foreground">{opt.desc}</span>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Account */}
        <TabsContent value="account">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <Card>
              <CardHeader><CardTitle>Account Info</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[{ label: 'Name', value: user?.fullName }, { label: 'Email', value: user?.email }, { label: 'Role', value: user?.role }].map(({ label, value }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-sm text-muted-foreground capitalize">{value ?? '—'}</p>
                      </div>
                      {label === 'Email' && !user?.isVerified && <Badge variant="warning">Unverified</Badge>}
                    </div>
                    <Separator />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-destructive/20">
              <CardHeader><CardTitle className="text-destructive">Danger Zone</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Sign out</p>
                    <p className="text-xs text-muted-foreground">Sign out on this device</p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => setLogoutOpen(true)} className="gap-2">
                    <LogOut className="h-4 w-4" />Sign out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader><CardTitle>Notification Preferences</CardTitle><CardDescription>Choose what you want to be notified about</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                {(Object.entries(notifPrefs) as [keyof typeof notifPrefs, boolean][]).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium capitalize">{key}</p>
                      <p className="text-xs text-muted-foreground">Receive {key} notifications</p>
                    </div>
                    <Switch checked={val} onCheckedChange={(v) => setNotifPrefs((p) => ({ ...p, [key]: v }))} aria-label={`Toggle ${key} notifications`} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Privacy */}
        <TabsContent value="privacy">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader><CardTitle>Privacy Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Public Profile', desc: 'Allow others to view your profile' },
                  { label: 'Show Activity', desc: 'Show your coding activity to others' },
                  { label: 'Show Projects', desc: 'Make your projects publicly visible' },
                ].map(({ label, desc }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    <Switch aria-label={label} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader><CardTitle>Change Password</CardTitle><CardDescription>Update your account password</CardDescription></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onPwd)} noValidate className="space-y-4">
                  {pwdError && <div role="alert" className="p-3 rounded-md bg-destructive/10 text-destructive text-sm border border-destructive/20">{pwdError}</div>}
                  {pwdSuccess && <div role="status" className="p-3 rounded-md bg-success/10 text-success text-sm border border-success/20">Password updated successfully!</div>}
                  <div>
                    <Label htmlFor="currentPassword" className="text-sm">Current Password</Label>
                    <div className="relative mt-1">
                      <Input id="currentPassword" type={showCurrent ? 'text' : 'password'} {...register('currentPassword')} className="pr-10" />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowCurrent(!showCurrent)}>
                        {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.currentPassword && <p className="text-xs text-destructive mt-1">{errors.currentPassword.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="newPassword" className="text-sm">New Password</Label>
                    <div className="relative mt-1">
                      <Input id="newPassword" type={showNew ? 'text' : 'password'} {...register('newPassword')} className="pr-10" />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowNew(!showNew)}>
                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.newPassword && <p className="text-xs text-destructive mt-1">{errors.newPassword.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword" className="text-sm">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" {...register('confirmPassword')} className="mt-1" />
                    {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>}
                  </div>
                  <Button type="submit" loading={isSubmitting} className="gap-2">
                    <Lock className="h-4 w-4" />Update password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      <ConfirmDialog open={logoutOpen} onOpenChange={setLogoutOpen} title="Sign out" description="Are you sure you want to sign out?" confirmLabel="Sign out" variant="destructive" onConfirm={handleLogout} />
    </div>
  )
}
