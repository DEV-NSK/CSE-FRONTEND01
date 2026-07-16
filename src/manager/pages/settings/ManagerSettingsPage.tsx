import { useState } from 'react'
import { Settings, Moon, Sun, Lock, Bell, User } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Switch } from '@/shared/components/ui/switch'
import { Label } from '@/shared/components/ui/label'

const TABS = [
  { id: 'theme', label: 'Theme', icon: Sun },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'password', label: 'Password', icon: Lock },
  { id: 'notifications', label: 'Notification Prefs', icon: Bell },
]

export default function ManagerSettingsPage() {
  const [activeTab, setActiveTab] = useState('theme')
  const [darkMode, setDarkMode] = useState(false)
  const [compactMode, setCompactMode] = useState(false)
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [pushNotifs, setPushNotifs] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(false)

  return (
    <div className="space-y-5 max-w-3xl" role="main" aria-label="Settings">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
          <Settings className="w-5 h-5 text-slate-600" aria-hidden="true" />
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
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                  activeTab === id ? 'bg-violet-50 text-violet-700 font-medium' : 'text-slate-600 hover:bg-slate-50'
                }`}
                aria-current={activeTab === id ? 'page' : undefined}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Panel */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl p-6">
          {activeTab === 'theme' && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-800 mb-4">Appearance</h2>
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <div>
                  <Label htmlFor="dark-mode" className="text-sm font-medium text-slate-700">Dark Mode</Label>
                  <p className="text-xs text-slate-500 mt-0.5">Switch to dark theme</p>
                </div>
                <Switch id="dark-mode" checked={darkMode} onCheckedChange={setDarkMode} />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <div>
                  <Label htmlFor="compact-mode" className="text-sm font-medium text-slate-700">Compact Mode</Label>
                  <p className="text-xs text-slate-500 mt-0.5">Reduce spacing for dense layout</p>
                </div>
                <Switch id="compact-mode" checked={compactMode} onCheckedChange={setCompactMode} />
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-800 mb-4">Edit Profile</h2>
              {[
                { id: 'full-name', label: 'Full Name', placeholder: 'Your full name', type: 'text' },
                { id: 'email', label: 'Email', placeholder: 'your@email.com', type: 'email' },
                { id: 'department', label: 'Department', placeholder: 'e.g. Computer Science', type: 'text' },
                { id: 'designation', label: 'Designation', placeholder: 'e.g. Senior Manager', type: 'text' },
              ].map(({ id, label, placeholder, type }) => (
                <div key={id}>
                  <label htmlFor={id} className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
                  <input
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              ))}
              <Button className="bg-violet-600 hover:bg-violet-700 text-white">Save Changes</Button>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-800 mb-4">Change Password</h2>
              {[
                { id: 'current-pw', label: 'Current Password' },
                { id: 'new-pw', label: 'New Password' },
                { id: 'confirm-pw', label: 'Confirm New Password' },
              ].map(({ id, label }) => (
                <div key={id}>
                  <label htmlFor={id} className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
                  <input
                    id={id}
                    type="password"
                    placeholder="••••••••"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              ))}
              <Button className="bg-violet-600 hover:bg-violet-700 text-white">Update Password</Button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-800 mb-4">Notification Preferences</h2>
              {[
                { id: 'email-notifs', label: 'Email Notifications', desc: 'Receive notifications via email', value: emailNotifs, set: setEmailNotifs },
                { id: 'push-notifs', label: 'Push Notifications', desc: 'In-app push notifications', value: pushNotifs, set: setPushNotifs },
                { id: 'weekly-digest', label: 'Weekly Digest', desc: 'Summary every Monday morning', value: weeklyDigest, set: setWeeklyDigest },
              ].map(({ id, label, desc, value, set }) => (
                <div key={id} className="flex items-center justify-between py-3 border-b border-slate-100">
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
        </div>
      </div>
    </div>
  )
}
