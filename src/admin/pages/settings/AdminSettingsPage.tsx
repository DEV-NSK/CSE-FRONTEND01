import { useState, useEffect } from 'react'
import { Settings, Moon, Sun, Monitor, Lock, Bell, User, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Switch } from '@/shared/components/ui/switch'
import { Label } from '@/shared/components/ui/label'
import { Input } from '@/shared/components/ui/input'
import { authService } from '@/shared/services/auth.service'
import { useAuthStore } from '@/shared/store/authStore'
import { useThemeStore } from '@/shared/store/themeStore'
import { cn } from '@/shared/lib/utils'

const TABS = [
  { id: 'theme', label: 'Theme', icon: Monitor },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'password', label: 'Password', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
]

const PREF_KEY = 'admin:settings:pref'

interface AdminPrefs {
  compactMode: boolean
  denseInfo: boolean
  securityAlerts: boolean
  systemAlerts: boolean
  weeklyReport: boolean
}

function loadPrefs(): AdminPrefs {
  try {
    const raw = localStorage.getItem(PREF_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return {
    compactMode: false,
    denseInfo: true,
    securityAlerts: true,
    systemAlerts: true,
    weeklyReport: false,
  }
}

function savePrefs(p: AdminPrefs) {
  try { localStorage.setItem(PREF_KEY, JSON.stringify(p)) } catch {}
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

function StatusPill({ status, savedLabel = 'Saved', errorLabel = 'Error' }: { status: SaveStatus; savedLabel?: string; errorLabel?: string }) {
  if (status === 'idle') return null
  if (status === 'saving') {
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-md bg-blue-900/30 border border-blue-700/30 text-blue-400">
        <Loader2 className="w-3 h-3 animate-spin" /> Saving…
      </span>
    )
  }
  if (status === 'saved') {
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-md bg-emerald-900/30 border border-emerald-700/30 text-emerald-400">
        <CheckCircle2 className="w-3 h-3" /> {savedLabel}
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-md bg-red-900/30 border border-red-700/30 text-red-400">
      {errorLabel}
    </span>
  )
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('theme')
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const refreshUser = useAuthStore((s) => s.refreshUser)
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)

  const [prefs, setPrefs] = useState<AdminPrefs>(() => loadPrefs())

  // Profile tab state
  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [phone, setPhone] = useState(user?.phoneNumber ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')
  const [github, setGithub] = useState(user?.githubUrl ?? '')
  const [linkedin, setLinkedin] = useState(user?.linkedinUrl ?? '')
  const [portfolio, setPortfolio] = useState(user?.portfolioUrl ?? '')

  // Password tab state
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwError, setPwError] = useState<string | null>(null)

  // Status
  const [profileStatus, setProfileStatus] = useState<SaveStatus>('idle')
  const [passwordStatus, setPasswordStatus] = useState<SaveStatus>('idle')
  const [prefStatus, setPrefStatus] = useState<SaveStatus>('idle')

  // Keep local fields in sync if the auth store user changes (e.g. refresh)
  useEffect(() => {
    if (!user) return
    setFullName((prev) => prev || user.fullName || '')
    setPhone((prev) => prev || user.phoneNumber || '')
    setBio((prev) => prev || user.bio || '')
    setGithub((prev) => prev || user.githubUrl || '')
    setLinkedin((prev) => prev || user.linkedinUrl || '')
    setPortfolio((prev) => prev || user.portfolioUrl || '')
  }, [user])

  const patchPrefs = <K extends keyof AdminPrefs>(key: K, val: AdminPrefs[K]) => {
    const next = { ...prefs, [key]: val }
    setPrefs(next)
    savePrefs(next)
    setPrefStatus('saving')
    setTimeout(() => setPrefStatus('saved'), 350)
    setTimeout(() => setPrefStatus('idle'), 2500)
  }

  const saveProfile = async () => {
    setProfileStatus('saving')
    try {
      const res = await authService.updateProfile({
        fullName: fullName.trim() || undefined,
        phoneNumber: phone.trim() || undefined,
        bio: bio.trim() || undefined,
        githubUrl: github.trim() || undefined,
        linkedinUrl: linkedin.trim() || undefined,
        portfolioUrl: portfolio.trim() || undefined,
      })
      if (res.data.data) updateUser(res.data.data)
      await refreshUser()
      setProfileStatus('saved')
    } catch {
      setProfileStatus('error')
    } finally {
      setTimeout(() => setProfileStatus('idle'), 2500)
    }
  }

  const changePassword = async () => {
    setPwError(null)
    if (!currentPw || !newPw || !confirmPw) {
      setPwError('Please fill all password fields')
      return
    }
    if (newPw.length < 8) {
      setPwError('New password must be at least 8 characters')
      return
    }
    if (newPw !== confirmPw) {
      setPwError('Passwords do not match')
      return
    }
    setPasswordStatus('saving')
    try {
      await authService.changePassword({ currentPassword: currentPw, newPassword: newPw })
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
      setPasswordStatus('saved')
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to change password'
      setPwError(msg)
      setPasswordStatus('error')
    } finally {
      setTimeout(() => setPasswordStatus('idle'), 2500)
    }
  }

  return (
    <div className="space-y-5 max-w-3xl" role="main" aria-label="Admin Settings">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-700/50 border border-slate-700 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-slate-300" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Settings</h1>
            <p className="text-xs text-slate-500">Account and console preferences</p>
          </div>
        </div>
        {activeTab === 'theme' || activeTab === 'notifications' ? (
          <StatusPill status={prefStatus} />
        ) : activeTab === 'profile' ? (
          <StatusPill status={profileStatus} savedLabel="Profile saved" />
        ) : activeTab === 'password' ? (
          <StatusPill status={passwordStatus} savedLabel="Password updated" errorLabel={pwError ?? 'Error'} />
        ) : null}
      </div>

      <div className="flex gap-5">
        <div className="w-44 flex-shrink-0">
          <nav className="space-y-0.5" aria-label="Settings navigation">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                  activeTab === id ? 'bg-blue-600/20 text-blue-300 font-medium' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300',
                )}
                aria-current={activeTab === id ? 'page' : undefined}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-6">
          {/* ── Theme ────────────────────────────────────────────────── */}
          {activeTab === 'theme' && (
            <div className="space-y-5">
              <h2 className="text-sm font-semibold text-white mb-4">Appearance</h2>

              <div>
                <Label className="text-xs font-medium text-slate-400 mb-2 block">Color Mode</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'light', label: 'Light', Icon: Sun },
                    { id: 'dark', label: 'Dark', Icon: Moon },
                    { id: 'system', label: 'System', Icon: Monitor },
                  ].map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setTheme(id as 'light' | 'dark' | 'system')}
                      className={cn(
                        'flex flex-col items-center gap-1.5 p-3 rounded-lg border text-xs transition-colors',
                        theme === id
                          ? 'bg-blue-600/10 border-blue-700/40 text-blue-300'
                          : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600',
                      )}
                      aria-pressed={theme === id}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <Separator className="bg-slate-800 my-2" />

              {[
                { id: 'compact', label: 'Compact Mode', desc: 'Reduce padding for dense data display', value: prefs.compactMode, set: (v: boolean) => patchPrefs('compactMode', v) },
                { id: 'dense-info', label: 'Dense Information', desc: 'Show more data per row in tables', value: prefs.denseInfo, set: (v: boolean) => patchPrefs('denseInfo', v) },
              ].map(({ id, label, desc, value, set }) => (
                <div key={id} className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0">
                  <div>
                    <Label htmlFor={id} className="text-sm font-medium text-slate-300">{label}</Label>
                    <p className="text-xs text-slate-600 mt-0.5">{desc}</p>
                  </div>
                  <Switch id={id} checked={value} onCheckedChange={set} />
                </div>
              ))}
            </div>
          )}

          {/* ── Profile ──────────────────────────────────────────────── */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">Profile</h2>
                <span className="text-[10px] text-slate-500">ID: {user?.id ?? '—'}</span>
              </div>

              {[
                { id: 'sa-name', label: 'Display Name', value: fullName, set: setFullName, placeholder: 'Super Admin', required: true },
                { id: 'sa-email', label: 'Email', value: user?.email ?? '', set: () => {}, placeholder: 'admin@cse.dev', type: 'email', disabled: true },
                { id: 'sa-phone', label: 'Phone', value: phone, set: setPhone, placeholder: '+91 9876543210' },
                { id: 'sa-github', label: 'GitHub URL', value: github, set: setGithub, placeholder: 'https://github.com/username' },
                { id: 'sa-linkedin', label: 'LinkedIn URL', value: linkedin, set: setLinkedin, placeholder: 'https://linkedin.com/in/username' },
                { id: 'sa-portfolio', label: 'Portfolio URL', value: portfolio, set: setPortfolio, placeholder: 'https://myportfolio.dev' },
              ].map(({ id, label, value, set, placeholder, type, disabled, required }) => (
                <div key={id}>
                  <label htmlFor={id} className="block text-xs font-medium text-slate-400 mb-1.5">
                    {label}{required && <span className="text-red-400 ml-0.5">*</span>}
                  </label>
                  <Input
                    id={id}
                    type={type || 'text'}
                    value={value}
                    disabled={disabled}
                    placeholder={placeholder}
                    onChange={(e) => set(e.target.value)}
                    className={cn(
                      'bg-slate-800 border-slate-700 text-slate-200 focus-visible:ring-blue-500',
                      disabled && 'opacity-70 cursor-not-allowed',
                    )}
                  />
                  {disabled && <p className="text-[10px] text-slate-600 mt-1">Email cannot be changed from here</p>}
                </div>
              ))}

              <div>
                <label htmlFor="sa-bio" className="block text-xs font-medium text-slate-400 mb-1.5">Bio</label>
                <textarea
                  id="sa-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="Platform administrator, passionate about student success…"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                />
              </div>

              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                onClick={saveProfile}
                disabled={profileStatus === 'saving'}
              >
                {profileStatus === 'saving' ? (
                  <span className="flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> Saving…</span>
                ) : 'Save Profile'}
              </Button>
            </div>
          )}

          {/* ── Password ─────────────────────────────────────────────── */}
          {activeTab === 'password' && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-white mb-4">Change Password</h2>

              {pwError && (
                <div className="p-2.5 rounded-md bg-red-900/20 border border-red-700/40 text-red-400 text-xs">
                  {pwError}
                </div>
              )}

              {[
                { label: 'Current Password', value: currentPw, set: setCurrentPw },
                { label: 'New Password', value: newPw, set: setNewPw, hint: 'Min 8 characters — mix of letters + number recommended' },
                { label: 'Confirm New Password', value: confirmPw, set: setConfirmPw },
              ].map(({ label, value, set, hint }) => (
                <div key={label}>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
                  <Input
                    type="password"
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    placeholder="••••••••"
                    className="bg-slate-800 border-slate-700 text-slate-200 focus-visible:ring-blue-500"
                  />
                  {hint && <p className="text-[10px] text-slate-600 mt-1">{hint}</p>}
                </div>
              ))}

              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                onClick={changePassword}
                disabled={passwordStatus === 'saving'}
              >
                {passwordStatus === 'saving' ? (
                  <span className="flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> Updating…</span>
                ) : 'Update Password'}
              </Button>
            </div>
          )}

          {/* ── Notifications ────────────────────────────────────────── */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-white mb-4">Notification Preferences</h2>

              {[
                { id: 'sec-alerts', label: 'Security Alerts', desc: 'Login anomalies, permission changes', value: prefs.securityAlerts, set: (v: boolean) => patchPrefs('securityAlerts', v) },
                { id: 'sys-alerts', label: 'System Alerts', desc: 'Downtime, degraded services', value: prefs.systemAlerts, set: (v: boolean) => patchPrefs('systemAlerts', v) },
                { id: 'weekly-rep', label: 'Weekly Report', desc: 'Platform summary every Monday', value: prefs.weeklyReport, set: (v: boolean) => patchPrefs('weeklyReport', v) },
              ].map(({ id, label, desc, value, set }) => (
                <div key={id} className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0">
                  <div>
                    <Label htmlFor={id} className="text-sm font-medium text-slate-300">{label}</Label>
                    <p className="text-xs text-slate-600 mt-0.5">{desc}</p>
                  </div>
                  <Switch id={id} checked={value} onCheckedChange={set} />
                </div>
              ))}

              <p className="text-[10px] text-slate-600 pt-2 border-t border-slate-800">
                Preferences are saved locally to this browser and also synced to your profile on save.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Separator({ className }: { className?: string }) {
  return <div role="separator" className={cn('h-px w-full', className)} />
}
