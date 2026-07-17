import { useState, useEffect } from 'react'
import {
  Sliders, Mail, Paintbrush, HardDrive, AlertTriangle,
  Lock, Zap, Flag, Variable, Database, RefreshCw, CheckCircle2,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Switch } from '@/shared/components/ui/switch'
import { Label } from '@/shared/components/ui/label'
import { cn } from '@/shared/lib/utils'
import { usePlatformSettings, useUpdatePlatformSettings } from '@/shared/hooks/useAdmin'
import { useAdminSystemHealth } from '@/shared/hooks/useAdminAnalytics'

const TABS = [
  { id: 'smtp',        label: 'SMTP',          icon: Mail },
  { id: 'branding',    label: 'Branding',       icon: Paintbrush },
  { id: 'storage',     label: 'Storage',        icon: HardDrive },
  { id: 'maintenance', label: 'Maintenance',    icon: AlertTriangle },
  { id: 'security',    label: 'Security',       icon: Lock },
  { id: 'api',         label: 'API',            icon: Zap },
  { id: 'flags',       label: 'Feature Flags',  icon: Flag },
  { id: 'system',      label: 'System Vars',    icon: Variable },
  { id: 'cache',       label: 'Cache',          icon: Database },
]

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-slate-800 rounded-lg', className)} />
}

export default function AdminPlatformPage() {
  const [activeTab, setActiveTab]           = useState('smtp')
  const [saved, setSaved]                   = useState(false)

  // Load persisted settings from DB
  const { data: settings, isLoading }       = usePlatformSettings()
  const updateSettings                       = useUpdatePlatformSettings()

  // Local form state — seeded from DB once loaded
  const [smtpHost, setSmtpHost]             = useState('')
  const [smtpPort, setSmtpPort]             = useState('587')
  const [smtpUser, setSmtpUser]             = useState('')
  const [smtpFrom, setSmtpFrom]             = useState('')

  const [maintenanceMode, setMaintenanceMode]           = useState(false)
  const [registrationsOpen, setRegistrationsOpen]       = useState(true)
  const [codingEnabled, setCodingEnabled]               = useState(true)
  const [placementsEnabled, setPlacementsEnabled]       = useState(true)
  const [aiEnabled, setAiEnabled]                       = useState(false)
  const [betaFeatures, setBetaFeatures]                 = useState(false)
  const [platformName, setPlatformName]                 = useState('CSE Student Platform')
  const [supportEmail, setSupportEmail]                 = useState('')
  const [maxUploadMb, setMaxUploadMb]                   = useState('10')

  // System health for cache panel
  const { data: health }                    = useAdminSystemHealth()

  // Seed local state when settings load
  useEffect(() => {
    if (!settings) return
    const s = settings as Record<string, unknown>
    if (s['smtp_host'])            setSmtpHost(String(s['smtp_host']))
    if (s['smtp_port'])            setSmtpPort(String(s['smtp_port']))
    if (s['smtp_user'])            setSmtpUser(String(s['smtp_user']))
    if (s['smtp_from'])            setSmtpFrom(String(s['smtp_from']))
    if (s['maintenanceMode'] !== undefined) setMaintenanceMode(Boolean(s['maintenanceMode']))
    if (s['registrationEnabled'] !== undefined) setRegistrationsOpen(Boolean(s['registrationEnabled']))
    if (s['platformName'])         setPlatformName(String(s['platformName']))
    if (s['supportEmail'])         setSupportEmail(String(s['supportEmail']))
    if (s['maxUploadSize'])        setMaxUploadMb(String(s['maxUploadSize']))
  }, [settings])

  const save = (data: Record<string, unknown>) => {
    updateSettings.mutate(data as never, {
      onSuccess: () => {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      },
    })
  }

  return (
    <div className="space-y-5" role="main" aria-label="Platform Settings">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-700/50 border border-slate-700 rounded-lg flex items-center justify-center">
            <Sliders className="w-5 h-5 text-slate-300" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Platform Settings</h1>
            <p className="text-xs text-slate-500">System-wide configuration — persisted to database</p>
          </div>
        </div>
        {saved && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-900/30 border border-emerald-700/30 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-emerald-400 font-medium">Saved successfully</span>
          </div>
        )}
      </div>

      <div className="flex gap-5">
        {/* Side nav */}
        <div className="w-48 flex-shrink-0">
          <nav className="space-y-0.5" aria-label="Platform settings navigation">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                  activeTab === id
                    ? 'bg-blue-600/20 text-blue-300 font-medium'
                    : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300',
                )}
                aria-current={activeTab === id ? 'page' : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Panel */}
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-6">
          {isLoading ? (
            <div className="space-y-4 max-w-lg">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : (
            <>
              {/* ── SMTP ─────────────────────────────────────────────────── */}
              {activeTab === 'smtp' && (
                <div className="space-y-4 max-w-lg">
                  <h2 className="text-sm font-semibold text-white mb-4">SMTP Configuration</h2>
                  {[
                    { id: 'smtp-host', label: 'SMTP Host',   value: smtpHost,  set: setSmtpHost,  placeholder: 'smtp.gmail.com' },
                    { id: 'smtp-port', label: 'Port',         value: smtpPort,  set: setSmtpPort,  placeholder: '587' },
                    { id: 'smtp-user', label: 'Username',     value: smtpUser,  set: setSmtpUser,  placeholder: 'admin@cse.dev' },
                    { id: 'smtp-from', label: 'From Email',   value: smtpFrom,  set: setSmtpFrom,  placeholder: 'noreply@cse.dev' },
                  ].map(({ id, label, value, set, placeholder }) => (
                    <div key={id}>
                      <label htmlFor={id} className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
                      <input
                        id={id}
                        type="text"
                        value={value}
                        onChange={(e) => set(e.target.value)}
                        placeholder={placeholder}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                  <div className="flex gap-3 pt-2">
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                      disabled={updateSettings.isPending}
                      onClick={() => save({ smtp_host: smtpHost, smtp_port: smtpPort, smtp_user: smtpUser, smtp_from: smtpFrom })}
                    >
                      {updateSettings.isPending ? 'Saving…' : 'Save SMTP'}
                    </Button>
                    <Button variant="outline" className="border-slate-700 text-slate-400 hover:bg-slate-800 text-xs">
                      Test Connection
                    </Button>
                  </div>
                </div>
              )}

              {/* ── Branding ─────────────────────────────────────────────── */}
              {activeTab === 'branding' && (
                <div className="space-y-4 max-w-lg">
                  <h2 className="text-sm font-semibold text-white mb-4">Branding</h2>
                  <div>
                    <label htmlFor="platform-name" className="block text-xs font-medium text-slate-400 mb-1.5">Platform Name</label>
                    <input
                      id="platform-name"
                      type="text"
                      value={platformName}
                      onChange={(e) => setPlatformName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="support-email" className="block text-xs font-medium text-slate-400 mb-1.5">Support Email</label>
                    <input
                      id="support-email"
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="max-upload" className="block text-xs font-medium text-slate-400 mb-1.5">Max Upload Size (MB)</label>
                    <input
                      id="max-upload"
                      type="number"
                      value={maxUploadMb}
                      onChange={(e) => setMaxUploadMb(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                    disabled={updateSettings.isPending}
                    onClick={() => save({ platformName, supportEmail, maxUploadSize: Number(maxUploadMb) })}
                  >
                    {updateSettings.isPending ? 'Saving…' : 'Save Branding'}
                  </Button>
                </div>
              )}

              {/* ── Maintenance ───────────────────────────────────────────── */}
              {activeTab === 'maintenance' && (
                <div className="space-y-5 max-w-lg">
                  <h2 className="text-sm font-semibold text-white mb-4">Maintenance Mode</h2>
                  <div className={cn(
                    'p-4 rounded-xl border',
                    maintenanceMode ? 'bg-amber-900/20 border-amber-700/40' : 'bg-slate-800/50 border-slate-700',
                  )}>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="maintenance-toggle" className="text-sm font-semibold text-white">
                          Maintenance Mode
                        </Label>
                        <p className="text-xs text-slate-500 mt-0.5">Block all user access temporarily</p>
                      </div>
                      <Switch
                        id="maintenance-toggle"
                        checked={maintenanceMode}
                        onCheckedChange={(v) => {
                          setMaintenanceMode(v)
                          save({ maintenanceMode: v })
                        }}
                      />
                    </div>
                    {maintenanceMode && (
                      <div className="mt-3 flex items-center gap-2 text-amber-400 text-xs">
                        <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                        Platform is currently in maintenance mode — users cannot access the app
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Feature Flags ─────────────────────────────────────────── */}
              {activeTab === 'flags' && (
                <div className="space-y-4 max-w-lg">
                  <h2 className="text-sm font-semibold text-white mb-4">Feature Flags</h2>
                  {[
                    { id: 'reg',        label: 'Open Registrations', desc: 'Allow new user sign-ups',           value: registrationsOpen,  set: setRegistrationsOpen,  key: 'registrationEnabled' },
                    { id: 'coding',     label: 'Coding Module',      desc: 'Enable the coding practice section', value: codingEnabled,      set: setCodingEnabled,      key: 'codingEnabled' },
                    { id: 'placements', label: 'Placement Module',   desc: 'Enable the placement ecosystem',     value: placementsEnabled,  set: setPlacementsEnabled,  key: 'placementsEnabled' },
                    { id: 'ai',         label: 'AI Features',        desc: 'Enable AI-powered features (beta)', value: aiEnabled,          set: setAiEnabled,          key: 'aiEnabled' },
                    { id: 'beta',       label: 'Beta Features',      desc: 'Show beta features to users',        value: betaFeatures,       set: setBetaFeatures,       key: 'betaFeatures' },
                  ].map(({ id, label, desc, value, set, key }) => (
                    <div key={id} className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0">
                      <div>
                        <Label htmlFor={id} className="text-sm font-medium text-slate-300">{label}</Label>
                        <p className="text-xs text-slate-600 mt-0.5">{desc}</p>
                      </div>
                      <Switch
                        id={id}
                        checked={value}
                        onCheckedChange={(v) => {
                          set(v)
                          save({ [key]: v })
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* ── Cache ─────────────────────────────────────────────────── */}
              {activeTab === 'cache' && (
                <div className="space-y-4 max-w-lg">
                  <h2 className="text-sm font-semibold text-white mb-4">Cache Management</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        label: 'Redis Cache',
                        status: health?.services.find(s => s.name === 'Redis')?.status ?? 'unknown',
                        latency: health?.services.find(s => s.name === 'Redis')?.latencyMs ?? null,
                      },
                      {
                        label: 'PostgreSQL',
                        status: health?.services.find(s => s.name === 'PostgreSQL')?.status ?? 'unknown',
                        latency: health?.services.find(s => s.name === 'PostgreSQL')?.latencyMs ?? null,
                      },
                      { label: 'Static Assets', status: 'healthy', latency: null },
                      { label: 'CDN Cache',      status: 'healthy', latency: null },
                    ].map(({ label, status, latency }) => (
                      <div key={label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                        <p className="text-sm font-medium text-slate-200">{label}</p>
                        {latency !== null && (
                          <p className="text-xs text-slate-500 mt-0.5">{latency}ms latency</p>
                        )}
                        <div className="flex items-center gap-1.5 mt-2">
                          <div className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            status === 'healthy' ? 'bg-emerald-400' : 'bg-amber-400',
                          )} />
                          <span className={cn(
                            'text-xs capitalize',
                            status === 'healthy' ? 'text-emerald-400' : 'text-amber-400',
                          )}>
                            {status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    className="border-red-700/50 text-red-400 hover:bg-red-900/20 text-xs"
                  >
                    Clear All Caches
                  </Button>
                </div>
              )}

              {/* ── Other tabs placeholder ────────────────────────────────── */}
              {!['smtp', 'branding', 'maintenance', 'flags', 'cache'].includes(activeTab) && (
                <div className="text-center py-12">
                  <Sliders className="w-12 h-12 mx-auto text-slate-700 mb-3" aria-hidden="true" />
                  <p className="text-sm text-slate-500 capitalize">{activeTab} settings panel</p>
                  <p className="text-xs text-slate-600 mt-1">Configuration options coming soon</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
