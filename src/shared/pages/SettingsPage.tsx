import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sun, Moon, Monitor, LogOut, Lock, Eye, EyeOff, Bell, Shield, User, Palette, Loader2 } from 'lucide-react'
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
import { toast } from '@/shared/hooks/useToast'
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
  const { user, logout, updateUser } = useAuthStore()
  const navigate = useNavigate()
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [pwdSuccess, setPwdSuccess] = useState(false)
  const [pwdError, setPwdError] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [notifPrefs, setNotifPrefs] = useState({ learning: true, coding: true, projects: true, placement: true, events: true, system: true })

  // Privacy state — initialized from user profile
  const [privacyState, setPrivacyState] = useState({
    publicProfile: (user?.profileVisibility ?? 'PUBLIC') === 'PUBLIC',
    showActivity: true,
    showProjects: true,
  })
  const [savingPrivacy, setSavingPrivacy] = useState(false)

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

  const handlePrivacyToggle = async (key: keyof typeof privacyState, value: boolean) => {
    // Optimistically update local state
    const prev = privacyState
    setPrivacyState(s => ({ ...s, [key]: value }))
    setSavingPrivacy(true)
    try {
      if (key === 'publicProfile') {
        const visibility = value ? 'PUBLIC' : 'PRIVATE'
        const res = await profileService.updatePrivacy(visibility)
        updateUser(res.data.data as any)
        toast({ title: `Profile is now ${value ? 'public' : 'private'}` })
      } else {
        // showActivity / showProjects — update via profile update
        await profileService.updateProfile({
          ...(key === 'showActivity' ? { showActivity: value } as any : {}),
          ...(key === 'showProjects' ? { showProjects: value } as any : {}),
        })
        toast({ title: 'Privacy setting saved' })
      }
    } catch {
      // Revert on error
      setPrivacyState(prev)
      toast({ title: 'Failed to save privacy setting', variant: 'destructive' })
    } finally {
      setSavingPrivacy(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto w-full">
      <PageHeader title="Settings" description="Manage your account preferences" breadcrumbs={[{ label: 'Settings' }]} />
      <Tabs defaultValue="appearance" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1 w-full">
          <TabsTrigger value="appearance" className="gap-1.5 text-xs flex-1 sm:flex-none"><Palette className="h-3 w-3" />Appearance</TabsTrigger>
          <TabsTrigger value="account" className="gap-1.5 text-xs flex-1 sm:flex-none"><User className="h-3 w-3" />Account</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5 text-xs flex-1 sm:flex-none"><Bell className="h-3 w-3" />Notifications</TabsTrigger>
          <TabsTrigger value="privacy" className="gap-1.5 text-xs flex-1 sm:flex-none"><Shield className="h-3 w-3" />Privacy</TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5 text-xs flex-1 sm:flex-none"><Lock className="h-3 w-3" />Security</TabsTrigger>
        </TabsList>

        {/* Appearance */}
        <TabsContent value="appearance">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Theme</CardTitle><CardDescription className="text-xs">Choose your preferred appearance</CardDescription></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {themeOptions.map((opt) => {
                    const Icon = opt.icon
                    const sel = theme === opt.value
                    return (
                      <button key={opt.value} type="button" onClick={() => setTheme(opt.value)}
                        className={`flex flex-col items-center gap-1.5 p-3 sm:p-4 rounded-lg border-2 transition-all ${sel ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}
                        aria-pressed={sel}>
                        <Icon className={`h-5 w-5 ${sel ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className={`text-xs font-medium ${sel ? 'text-primary' : ''}`}>{opt.label}</span>
                        <span className="text-[10px] text-muted-foreground hidden sm:block">{opt.desc}</span>
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
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>Control who can see your profile and activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {([
                  { key: 'publicProfile' as const, label: 'Public Profile', desc: 'Allow others to view your profile' },
                  { key: 'showActivity' as const, label: 'Show Activity', desc: 'Show your coding activity to others' },
                  { key: 'showProjects' as const, label: 'Show Projects', desc: 'Make your projects publicly visible' },
                ]).map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {savingPrivacy && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                      <Switch
                        aria-label={label}
                        checked={privacyState[key]}
                        onCheckedChange={(v) => handlePrivacyToggle(key, v)}
                        disabled={savingPrivacy}
                      />
                    </div>
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
