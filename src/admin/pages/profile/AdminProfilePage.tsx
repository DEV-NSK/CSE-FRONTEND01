import { useAuthStore } from '@/shared/store/authStore'
import { User, Mail, Shield, Clock, Smartphone, Globe, Key, History } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'

const loginHistory = [
  { device: 'Chrome · Windows 11', ip: '192.168.1.1', location: 'Chennai, IN', time: 'Jul 17, 2026 10:30', current: true },
  { device: 'Firefox · MacOS', ip: '192.168.1.2', location: 'Mumbai, IN', time: 'Jul 16, 2026 14:20', current: false },
  { device: 'Safari · iPhone', ip: '192.168.1.3', location: 'Delhi, IN', time: 'Jul 15, 2026 09:10', current: false },
  { device: 'Chrome · Linux', ip: '192.168.1.4', location: 'Bangalore, IN', time: 'Jul 14, 2026 11:05', current: false },
]

const activeSessions = [
  { device: 'Chrome · Windows 11', location: 'Chennai, IN', started: '10:30 AM Today', current: true },
  { device: 'Mobile App · Android', location: 'Chennai, IN', started: '8:15 AM Today', current: false },
]

export default function AdminProfilePage() {
  const { user } = useAuthStore()
  const initials = user?.fullName?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'SA'

  return (
    <div className="space-y-5 max-w-4xl" role="main" aria-label="Admin Profile">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-slate-700/50 border border-slate-700 rounded-lg flex items-center justify-center">
          <User className="w-5 h-5 text-slate-300" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Profile</h1>
          <p className="text-xs text-slate-500">Super Admin profile, sessions and security</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
          <Avatar className="w-20 h-20 mx-auto mb-3">
            <AvatarImage src={user?.profileImage ?? undefined} />
            <AvatarFallback className="bg-blue-800 text-white text-2xl font-bold">{initials}</AvatarFallback>
          </Avatar>
          <h2 className="text-base font-bold text-white">{user?.fullName || 'Super Admin'}</h2>
          <p className="text-sm text-slate-500 mb-2">{user?.email || 'admin@cse.dev'}</p>
          <Badge className="bg-blue-900/40 text-blue-300 border-blue-700/40 text-xs mb-4">Super Admin</Badge>

          <div className="space-y-2.5 text-left text-sm mt-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Mail className="w-4 h-4 text-slate-600" aria-hidden="true" />
              <span className="truncate text-xs">{user?.email || 'admin@cse.dev'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Shield className="w-4 h-4 text-slate-600" aria-hidden="true" />
              <span className="text-xs">Full platform access</span>
            </div>
            {user?.bio && (
              <div className="flex items-start gap-2 text-slate-400">
                <Globe className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-xs leading-relaxed">{user.bio}</span>
              </div>
            )}
          </div>
          <Button variant="outline" className="w-full mt-4 border-slate-700 text-slate-400 hover:bg-slate-800 text-xs">
            Edit Profile
          </Button>
        </div>

        {/* Login History */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-blue-400" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-white">Login History</h3>
          </div>
          <div className="space-y-2.5">
            {loginHistory.map(({ device, ip, location, time, current }, i) => (
              <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${current ? 'border-blue-700/40 bg-blue-900/10' : 'border-slate-800 bg-slate-800/20'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${current ? 'bg-blue-800/40' : 'bg-slate-800'}`}>
                    <Smartphone className={`w-4 h-4 ${current ? 'text-blue-400' : 'text-slate-500'}`} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-300">{device}</p>
                    <p className="text-[10px] text-slate-600">{ip} · {location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500">{time}</p>
                  {current && (
                    <span className="text-[10px] text-emerald-400 font-medium">Current session</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sessions + Security */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Active Sessions */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-400" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-white">Active Sessions</h3>
            </div>
            <Button variant="outline" size="sm" className="border-red-700/50 text-red-400 hover:bg-red-900/20 text-xs">
              Revoke All
            </Button>
          </div>
          <div className="space-y-3">
            {activeSessions.map(({ device, location, started, current }, i) => (
              <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${current ? 'border-blue-700/40 bg-blue-900/10' : 'border-slate-800'}`}>
                <div>
                  <p className="text-xs font-medium text-slate-300">{device}</p>
                  <p className="text-[10px] text-slate-600">{location} · Started {started}</p>
                </div>
                {current ? (
                  <span className="text-[10px] text-emerald-400 font-medium">Active</span>
                ) : (
                  <button className="text-[10px] text-red-400 hover:text-red-300 font-medium transition-colors" aria-label={`Revoke session for ${device}`}>
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-4 h-4 text-blue-400" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-white">Security</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Two-Factor Authentication', status: 'Enabled', statusColor: 'text-emerald-400', action: 'Manage' },
              { label: 'Password', status: 'Last changed 30d ago', statusColor: 'text-slate-500', action: 'Change' },
              { label: 'API Keys', status: '2 active keys', statusColor: 'text-blue-400', action: 'Manage' },
              { label: 'Trusted Devices', status: '2 devices', statusColor: 'text-slate-500', action: 'View' },
            ].map(({ label, status, statusColor, action }, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-slate-800 last:border-0">
                <div>
                  <p className="text-sm text-slate-300">{label}</p>
                  <p className={`text-xs mt-0.5 ${statusColor}`}>{status}</p>
                </div>
                <button className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">{action}</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
