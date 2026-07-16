import { useState } from 'react'
import { Sliders, Mail, Paintbrush, HardDrive, AlertTriangle, Lock, Zap, Flag, Variable, Database } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Switch } from '@/shared/components/ui/switch'
import { Label } from '@/shared/components/ui/label'

const TABS = [
  { id: 'smtp', label: 'SMTP', icon: Mail },
  { id: 'branding', label: 'Branding', icon: Paintbrush },
  { id: 'storage', label: 'Storage', icon: HardDrive },
  { id: 'maintenance', label: 'Maintenance', icon: AlertTriangle },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'api', label: 'API', icon: Zap },
  { id: 'flags', label: 'Feature Flags', icon: Flag },
  { id: 'system', label: 'System Vars', icon: Variable },
  { id: 'cache', label: 'Cache', icon: Database },
]

export default function AdminPlatformPage() {
  const [activeTab, setActiveTab] = useState('smtp')
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [registrationsOpen, setRegistrationsOpen] = useState(true)
  const [codingEnabled, setCodingEnabled] = useState(true)
  const [placementsEnabled, setPlacementsEnabled] = useState(true)
  const [aiEnabled, setAiEnabled] = useState(false)
  const [betaFeatures, setBetaFeatures] = useState(false)

  return (
    <div className="space-y-5" role="main" aria-label="Platform Settings">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-slate-700/50 border border-slate-700 rounded-lg flex items-center justify-center">
          <Sliders className="w-5 h-5 text-slate-300" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Platform Settings</h1>
          <p className="text-xs text-slate-500">System-wide configuration and feature management</p>
        </div>
      </div>

      <div className="flex gap-5">
        {/* Side nav */}
        <div className="w-48 flex-shrink-0">
          <nav className="space-y-0.5" aria-label="Platform settings navigation">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  activeTab === id ? 'bg-blue-600/20 text-blue-300 font-medium' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                }`}
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
          {activeTab === 'smtp' && (
            <div className="space-y-4 max-w-lg">
              <h2 className="text-sm font-semibold text-white mb-4">SMTP Configuration</h2>
              {[
                { id: 'smtp-host', label: 'SMTP Host', placeholder: 'smtp.gmail.com' },
                { id: 'smtp-port', label: 'Port', placeholder: '587' },
                { id: 'smtp-user', label: 'Username', placeholder: 'admin@cse.dev' },
                { id: 'smtp-pass', label: 'Password', placeholder: '••••••••', type: 'password' },
                { id: 'smtp-from', label: 'From Email', placeholder: 'noreply@cse.dev' },
              ].map(({ id, label, placeholder, type }) => (
                <div key={id}>
                  <label htmlFor={id} className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
                  <input
                    id={id}
                    type={type || 'text'}
                    placeholder={placeholder}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs">Save SMTP</Button>
                <Button variant="outline" className="border-slate-700 text-slate-400 hover:bg-slate-800 text-xs">Test Connection</Button>
              </div>
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="space-y-5 max-w-lg">
              <h2 className="text-sm font-semibold text-white mb-4">Maintenance Mode</h2>
              <div className={`p-4 rounded-xl border ${maintenanceMode ? 'bg-amber-900/20 border-amber-700/40' : 'bg-slate-800/50 border-slate-700'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenance-toggle" className="text-sm font-semibold text-white">Maintenance Mode</Label>
                    <p className="text-xs text-slate-500 mt-0.5">Block all user access temporarily</p>
                  </div>
                  <Switch id="maintenance-toggle" checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
                </div>
                {maintenanceMode && (
                  <div className="mt-3 flex items-center gap-2 text-amber-400 text-xs">
                    <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                    Platform is currently in maintenance mode
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'flags' && (
            <div className="space-y-4 max-w-lg">
              <h2 className="text-sm font-semibold text-white mb-4">Feature Flags</h2>
              {[
                { id: 'reg', label: 'Open Registrations', desc: 'Allow new user sign-ups', value: registrationsOpen, set: setRegistrationsOpen },
                { id: 'coding', label: 'Coding Module', desc: 'Enable the coding practice section', value: codingEnabled, set: setCodingEnabled },
                { id: 'placements', label: 'Placement Module', desc: 'Enable the placement ecosystem', value: placementsEnabled, set: setPlacementsEnabled },
                { id: 'ai', label: 'AI Features', desc: 'Enable AI-powered features (beta)', value: aiEnabled, set: setAiEnabled },
                { id: 'beta', label: 'Beta Features', desc: 'Show beta functionality to users', value: betaFeatures, set: setBetaFeatures },
              ].map(({ id, label, desc, value, set }) => (
                <div key={id} className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0">
                  <div>
                    <Label htmlFor={id} className="text-sm font-medium text-slate-300">{label}</Label>
                    <p className="text-xs text-slate-600 mt-0.5">{desc}</p>
                  </div>
                  <Switch id={id} checked={value} onCheckedChange={set} />
                </div>
              ))}
              <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs">Save Flags</Button>
            </div>
          )}

          {activeTab === 'cache' && (
            <div className="space-y-4 max-w-lg">
              <h2 className="text-sm font-semibold text-white mb-4">Cache Management</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Redis Cache', size: '128 MB', status: 'healthy' },
                  { label: 'Query Cache', size: '64 MB', status: 'healthy' },
                  { label: 'Static Assets', size: '512 MB', status: 'healthy' },
                  { label: 'CDN Cache', size: '1.2 GB', status: 'healthy' },
                ].map(({ label, size, status }) => (
                  <div key={label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                    <p className="text-sm font-medium text-slate-200">{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{size} used</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                      <span className="text-xs text-emerald-400 capitalize">{status}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="border-red-700/50 text-red-400 hover:bg-red-900/20 text-xs">Clear All Caches</Button>
            </div>
          )}

          {!['smtp', 'maintenance', 'flags', 'cache'].includes(activeTab) && (
            <div className="text-center py-12">
              <Sliders className="w-12 h-12 mx-auto text-slate-700 mb-3" aria-hidden="true" />
              <p className="text-sm text-slate-500 capitalize">{activeTab} settings panel</p>
              <p className="text-xs text-slate-600 mt-1">Configuration options for this section</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
