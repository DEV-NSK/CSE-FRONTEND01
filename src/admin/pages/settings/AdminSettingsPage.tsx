import { useState } from 'react'
import { Settings, Moon, Lock, Bell, User } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Switch } from '@/shared/components/ui/switch'
import { Label } from '@/shared/components/ui/label'

const TABS = [
  { id: 'theme', label: 'Theme', icon: Moon },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'password', label: 'Password', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
]

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('theme')
  const [compactMode, setCompactMode] = useState(false)
  const [denseInfo, setDenseInfo] = useState(true)
  const [securityAlerts, setSecurityAlerts] = useState(true)
  const [systemAlerts, setSystemAlerts] = useState(true)
  const [weeklyReport, setWeeklyReport] = useState(false)

  return (
    <div className="space-y-5 max-w-3xl" role="main" aria-label="Admin Settings">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-slate-700/50 border border-slate-700 rounded-lg flex items-center justify-center">
          <Settings className="w-5 h-5 text-slate-300" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Settings</h1>
          <p className="text-xs text-slate-500">Account and console preferences</p>
        </div>
      </div>

      <div className="flex gap-5">
        <div className="w-44 flex-shrink-0">
          <nav className="space-y-0.5" aria-label="Settings navigation">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  activeTab === id ? 'bg-blue-600/20 text-blue-300 font-medium' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                }`}
                aria-current={activeTab === id ? 'page' : undefined}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-6">
          {activeTab === 'theme' && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-white mb-4">Appearance</h2>
              {[
                { id: 'compact', label: 'Compact Mode', desc: 'Reduce padding for dense data display', value: compactMode, set: setCompactMode },
                { id: 'dense-info', label: 'Dense Information', desc: 'Show more data per row in tables', value: denseInfo, set: setDenseInfo },
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

          {activeTab === 'profile' && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-white mb-4">Profile</h2>
              {[
                { id: 'sa-name', label: 'Display Name', placeholder: 'Super Admin' },
                { id: 'sa-email', label: 'Email', placeholder: 'admin@cse.dev', type: 'email' },
                { id: 'sa-bio', label: 'Bio', placeholder: 'Platform administrator' },
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
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Save Profile</Button>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-white mb-4">Change Password</h2>
              {['Current Password', 'New Password', 'Confirm New Password'].map((label) => (
                <div key={label}>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Update Password</Button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-white mb-4">Notification Preferences</h2>
              {[
                { id: 'sec-alerts', label: 'Security Alerts', desc: 'Login anomalies, permission changes', value: securityAlerts, set: setSecurityAlerts },
                { id: 'sys-alerts', label: 'System Alerts', desc: 'Downtime, degraded services', value: systemAlerts, set: setSystemAlerts },
                { id: 'weekly-rep', label: 'Weekly Report', desc: 'Platform summary every Monday', value: weeklyReport, set: setWeeklyReport },
              ].map(({ id, label, desc, value, set }) => (
                <div key={id} className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0">
                  <div>
                    <Label htmlFor={id} className="text-sm font-medium text-slate-300">{label}</Label>
                    <p className="text-xs text-slate-600 mt-0.5">{desc}</p>
                  </div>
                  <Switch id={id} checked={value} onCheckedChange={set} />
                </div>
              ))}
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Save Preferences</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
