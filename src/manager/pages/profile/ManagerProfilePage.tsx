import { useAuthStore } from '@/shared/store/authStore'
import { User, Mail, Building2, Award, Shield, Activity, MapPin, Phone, Globe } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'

const recentActivity = [
  { action: 'Published roadmap "Advanced React Patterns"', time: '2 hours ago' },
  { action: 'Created coding problem "Graph BFS"', time: '5 hours ago' },
  { action: 'Updated placement listing for Google', time: '1 day ago' },
  { action: 'Sent broadcast notification to all students', time: '2 days ago' },
  { action: 'Archived 3 outdated lessons', time: '3 days ago' },
]

const permissions = [
  { label: 'Learning Management', granted: true },
  { label: 'Coding Management', granted: true },
  { label: 'Project Management', granted: true },
  { label: 'Placement Management', granted: true },
  { label: 'Event Management', granted: true },
  { label: 'Notifications', granted: true },
  { label: 'Reports', granted: true },
  { label: 'User Management', granted: false },
  { label: 'Platform Settings', granted: false },
]

export default function ManagerProfilePage() {
  const { user } = useAuthStore()
  const initials = user?.fullName?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'MG'

  return (
    <div className="space-y-5 max-w-4xl" role="main" aria-label="Manager Profile">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-violet-100 rounded-lg flex items-center justify-center">
          <User className="w-5 h-5 text-violet-600" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Profile</h1>
          <p className="text-xs text-slate-500">Your manager profile and permissions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
          <Avatar className="w-20 h-20 mx-auto mb-3">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-violet-700 text-white text-2xl font-bold">{initials}</AvatarFallback>
          </Avatar>
          <h2 className="text-base font-bold text-slate-900">{user?.fullName || 'Manager'}</h2>
          <p className="text-sm text-slate-500 mb-1">{user?.email}</p>
          <Badge className="bg-violet-100 text-violet-700 border-violet-200 text-xs mb-4">Manager</Badge>

          <div className="space-y-2.5 text-left text-sm">
            {user?.department && (
              <div className="flex items-center gap-2 text-slate-600">
                <Building2 className="w-4 h-4 text-slate-400" aria-hidden="true" />
                <span>{user.department}</span>
              </div>
            )}
            {user?.designation && (
              <div className="flex items-center gap-2 text-slate-600">
                <Award className="w-4 h-4 text-slate-400" aria-hidden="true" />
                <span>{user.designation}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400" aria-hidden="true" />
              <span className="truncate">{user?.email || 'manager@cse.dev'}</span>
            </div>
          </div>

          <Button variant="outline" className="w-full mt-4 text-xs">Edit Profile</Button>
        </div>

        {/* Permissions */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-violet-600" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-slate-800">Permissions</h3>
          </div>
          <div className="space-y-2.5">
            {permissions.map(({ label, granted }) => (
              <div key={label} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                <span className="text-sm text-slate-700">{label}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${granted ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                  {granted ? 'Granted' : 'Denied'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-violet-600" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-slate-800">Recent Activity</h3>
          </div>
          <div className="space-y-3.5">
            {recentActivity.map(({ action, time }, i) => (
              <div key={i} className="flex gap-2.5">
                <div className="w-1.5 h-1.5 bg-violet-400 rounded-full mt-1.5 flex-shrink-0" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-700 leading-relaxed">{action}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
