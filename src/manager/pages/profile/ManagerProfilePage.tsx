import { useAuthStore } from '@/shared/store/authStore'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Building2, Award, Shield, Activity } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { useQuery } from '@tanstack/react-query'
import { managerService } from '@/shared/services/manager.service'

const ALL_MODULES = [
  { key: 'LEARNING',      label: 'Learning Management' },
  { key: 'CODING',        label: 'Coding Management' },
  { key: 'PROJECTS',      label: 'Project Management' },
  { key: 'PLACEMENTS',    label: 'Placement Management' },
  { key: 'EVENTS',        label: 'Event Management' },
  { key: 'NOTIFICATIONS', label: 'Notifications' },
  { key: 'REPORTS',       label: 'Reports' },
]

export default function ManagerProfilePage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const initials = user?.fullName?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'MG'

  const { data: activityData } = useQuery({
    queryKey: ['manager', 'activity', 1],
    queryFn: () => managerService.getActivityLog({ page: 1, limit: 5 }).then((r) => r.data.data),
    staleTime: 60_000,
  })

  const recentActivity = (activityData as { data?: Array<{ id: string; action: string; entity?: string; createdAt?: string }> } | undefined)?.data ?? []

  const isSuperAdmin = user?.role === 'SUPER_ADMIN'
  const userPermissions = user?.permissions ?? []

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
            <AvatarImage src={user?.profileImage ?? undefined} />
            <AvatarFallback className="bg-violet-700 text-white text-2xl font-bold">{initials}</AvatarFallback>
          </Avatar>
          <h2 className="text-base font-bold text-slate-900">{user?.fullName || 'Manager'}</h2>
          <p className="text-sm text-slate-500 mb-1">{user?.email}</p>
          <Badge className="bg-violet-100 text-violet-700 border-violet-200 text-xs mb-4">
            {isSuperAdmin ? 'Super Admin' : 'Manager'}
          </Badge>

          <div className="space-y-2.5 text-left text-sm">
            {user?.collegeName && (
              <div className="flex items-center gap-2 text-slate-600">
                <Building2 className="w-4 h-4 text-slate-400" aria-hidden="true" />
                <span className="truncate">{user.collegeName}</span>
              </div>
            )}
            {user?.branch && (
              <div className="flex items-center gap-2 text-slate-600">
                <Award className="w-4 h-4 text-slate-400" aria-hidden="true" />
                <span className="truncate">{user.branch}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400" aria-hidden="true" />
              <span className="truncate">{user?.email || 'manager@cse.dev'}</span>
            </div>
          </div>

          <Button variant="outline" className="w-full mt-4 text-xs" onClick={() => navigate('/manager/settings')}>
            Edit Profile
          </Button>
        </div>

        {/* Permissions */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-violet-600" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-slate-800">Module Permissions</h3>
          </div>
          <div className="space-y-2.5">
            {ALL_MODULES.map(({ key, label }) => {
              const granted = isSuperAdmin || userPermissions.includes('*') || userPermissions.includes(key)
              return (
                <div key={key} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                  <span className="text-sm text-slate-700">{label}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${granted ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                    {granted ? 'Granted' : 'Denied'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Activity */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-violet-600" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-slate-800">Recent Activity</h3>
            </div>
            <button onClick={() => navigate('/manager/activity')} className="text-xs text-violet-600 hover:underline">
              View all
            </button>
          </div>
          <div className="space-y-3.5">
            {recentActivity.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No activity yet</p>
            ) : (
              recentActivity.map((item) => (
                <div key={item.id} className="flex gap-2.5">
                  <div className="w-1.5 h-1.5 bg-violet-400 rounded-full mt-1.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {item.action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                      {item.entity ? ` (${item.entity})` : ''}
                    </p>
                    {item.createdAt && (
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
