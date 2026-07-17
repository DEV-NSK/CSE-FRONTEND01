/**
 * FPRD-10: Manager Settings — real profile & password update via auth API
 */
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Settings, Sun, Lock, Bell, User, Loader2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Switch } from '@/shared/components/ui/switch'
import { Label } from '@/shared/components/ui/label'
import { useAuthStore } from '@/shared/store/authStore'
import { authService } from '@/shared/services/auth.service'
import { useToast } from '@/shared/hooks/useToast'

const TABS = [
  { id: 'profile',       label: 'Profile',             icon: User },
  { id: 'password',      label: 'Password',             icon: Lock },
  { id: 'notifications', label: 'Notifications',        icon: Bell },
  { id: 'appearance',    label: 'Appearance',           icon: Sun },
]

interface ProfileForm {
  fullName: string
  phoneNumber: string
  bio: string
  collegeName: string
  branch: string
  githubUrl: string
  linkedinUrl: string
  portfolioUrl: string
}

interface PasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function ManagerSettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [compactMode, setCompactMode] = useState(false)
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [pushNotifs, setPushNotifs] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(false)

  const { user, updateUser } = useAuthStore()
  const { toast } = useToast()

  // Profile form
  const profileForm = useForm<ProfileForm>({
    defaultValues: {
      fullName:     user?.fullName      ?? '',
      phoneNumber:  user?.phoneNumber   ?? '',
      bio:          user?.bio           ?? '',
      collegeName:  user?.collegeName   ?? '',
      branch:       user?.branch        ?? '',
      githubUrl:    user?.githubUrl     ?? '',
      linkedinUrl:  user?.linkedinUrl   ?? '',
      portfolioUrl: user?.portfolioUrl  ?? '',
    },
  })

  // Password form
  const passwordForm = useForm<PasswordForm>({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const handleProfileSave = async (data: ProfileForm) => {
    try {
      const res = await authService.updateProfile(data)
      updateUser(res.data.data as Partial<typeof user>)
      toast({ title: 'Profile updated successfully' })
    } catch {
      toast({ title: 'Failed to update profile', variant: 'destructive' })
    }
  }

  const handlePasswordChange = async (data: PasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      toast({ title: 'New passwords do not match', variant: 'destructive' })
      return
    }
    if (data.newPassword.length < 8) {
      toast({ title: 'Password must be at least 8 characters', variant: 'destructive' })
      return
    }
    try {
      await authService.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword })
      toast({ title: 'Password changed successfully' })
      passwordForm.reset()
    } catch {
      toast({ title: 'Failed to change password — check your current password', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-5 max-w-3xl" role="main" aria-label="Settings">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
          <Settings className="w-5 h-5 text-slate-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Settings</h1>
          <p className="text-xs text-slate-500">Manage your preferences and account settings</p>
        </div>
      </div>

      <div className="flex gap-5">
        {/* Side tabs */}
        <div className="w-44 flex-shrink-0">
          <nav className="space-y-0.5" aria-label="Settings navigation">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                  activeTab === id ? 'bg-violet-50 text-violet-700 font-medium' : 'text-slate-600 hover:bg-slate-50'
                }`}
                aria-current={activeTab === id ? 'page' : undefined}>
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Panel */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl p-6">

          {/* ── Profile ── */}
          {activeTab === 'profile' && (
            <form onSubmit={profileForm.handleSubmit(handleProfileSave)} className="space-y-4" noValidate>
              <h2 className="text-sm font-semibold text-slate-800 mb-4">Edit Profile</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: 'fullName',     label: 'Full Name',       type: 'text' },
                  { id: 'phoneNumber',  label: 'Phone Number',    type: 'tel' },
                  { id: 'collegeName',  label: 'College / Org',   type: 'text' },
                  { id: 'branch',       label: 'Branch / Dept',   type: 'text' },
                  { id: 'githubUrl',    label: 'GitHub URL',      type: 'url' },
                  { id: 'linkedinUrl',  label: 'LinkedIn URL',    type: 'url' },
                  { id: 'portfolioUrl', label: 'Portfolio URL',   type: 'url' },
                ].map(({ id, label, type }) => (
                  <div key={id}>
                    <label htmlFor={id} className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
                    <input
                      id={id}
                      type={type}
                      {...profileForm.register(id as keyof ProfileForm)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 hover:border-slate-300 transition-colors"
                    />
                  </div>
                ))}
              </div>
              <div>
                <label htmlFor="bio" className="block text-xs font-medium text-slate-600 mb-1.5">Bio</label>
                <textarea id="bio" rows={3} {...profileForm.register('bio')}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none" />
              </div>
              <Button type="submit" disabled={profileForm.formState.isSubmitting}
                className="bg-violet-600 hover:bg-violet-700 text-white">
                {profileForm.formState.isSubmitting ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />Saving...</> : 'Save Profile'}
              </Button>
            </form>
          )}

          {/* ── Password ── */}
          {activeTab === 'password' && (
            <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4" noValidate>
              <h2 className="text-sm font-semibold text-slate-800 mb-4">Change Password</h2>
              {[
                { id: 'currentPassword', label: 'Current Password' },
                { id: 'newPassword',     label: 'New Password' },
                { id: 'confirmPassword', label: 'Confirm New Password' },
              ].map(({ id, label }) => (
                <div key={id}>
                  <label htmlFor={id} className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
                  <input
                    id={id}
                    type="password"
                    placeholder="••••••••"
                    {...passwordForm.register(id as keyof PasswordForm, { required: `${label} is required` })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  {passwordForm.formState.errors[id as keyof PasswordForm] && (
                    <p className="text-xs text-red-500 mt-1">
                      {passwordForm.formState.errors[id as keyof PasswordForm]?.message}
                    </p>
                  )}
                </div>
              ))}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                Changing your password will sign you out on all other devices.
              </div>
              <Button type="submit" disabled={passwordForm.formState.isSubmitting}
                className="bg-violet-600 hover:bg-violet-700 text-white">
                {passwordForm.formState.isSubmitting ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />Updating...</> : 'Update Password'}
              </Button>
            </form>
          )}

          {/* ── Notifications ── */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-800 mb-4">Notification Preferences</h2>
              {[
                { id: 'email-notifs', label: 'Email Notifications',  desc: 'Receive notifications via email',      value: emailNotifs,   set: setEmailNotifs },
                { id: 'push-notifs',  label: 'Push Notifications',   desc: 'In-app push notifications',            value: pushNotifs,    set: setPushNotifs },
                { id: 'weekly-digest',label: 'Weekly Digest',        desc: 'Summary every Monday morning',         value: weeklyDigest,  set: setWeeklyDigest },
              ].map(({ id, label, desc, value, set }) => (
                <div key={id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                  <div>
                    <Label htmlFor={id} className="text-sm font-medium text-slate-700">{label}</Label>
                    <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                  </div>
                  <Switch id={id} checked={value} onCheckedChange={set} />
                </div>
              ))}
              <Button className="bg-violet-600 hover:bg-violet-700 text-white">Save Preferences</Button>
            </div>
          )}

          {/* ── Appearance ── */}
          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-800 mb-4">Appearance</h2>
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <div>
                  <Label htmlFor="compact-mode" className="text-sm font-medium text-slate-700">Compact Mode</Label>
                  <p className="text-xs text-slate-500 mt-0.5">Reduce spacing for a denser layout</p>
                </div>
                <Switch id="compact-mode" checked={compactMode} onCheckedChange={setCompactMode} />
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <p className="text-sm text-slate-500">Dark mode is controlled by your system theme.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
