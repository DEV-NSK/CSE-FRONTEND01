import { Shield, Check, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'

const ROLES = ['Manager', 'Senior Manager', 'Head Manager', 'Super Admin']

const PERMISSION_GROUPS = [
  {
    group: 'Learning',
    permissions: [
      { key: 'learning.view', label: 'View Content', access: [true, true, true, true] },
      { key: 'learning.create', label: 'Create Content', access: [true, true, true, true] },
      { key: 'learning.publish', label: 'Publish', access: [false, true, true, true] },
      { key: 'learning.delete', label: 'Delete', access: [false, false, true, true] },
    ],
  },
  {
    group: 'Coding',
    permissions: [
      { key: 'coding.view', label: 'View Problems', access: [true, true, true, true] },
      { key: 'coding.create', label: 'Create Problems', access: [true, true, true, true] },
      { key: 'coding.bulk', label: 'Bulk Actions', access: [false, true, true, true] },
    ],
  },
  {
    group: 'Users',
    permissions: [
      { key: 'users.view', label: 'View Users', access: [false, false, false, true] },
      { key: 'users.manage', label: 'Manage Users', access: [false, false, false, true] },
      { key: 'users.promote', label: 'Promote Users', access: [false, false, false, true] },
    ],
  },
  {
    group: 'Platform',
    permissions: [
      { key: 'platform.settings', label: 'Platform Settings', access: [false, false, false, true] },
      { key: 'platform.analytics', label: 'Platform Analytics', access: [false, false, true, true] },
      { key: 'platform.audit', label: 'Audit Logs', access: [false, false, false, true] },
    ],
  },
]

export default function AdminPermissionsPage() {
  return (
    <div className="space-y-5" role="main" aria-label="Permission Management">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-purple-400" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Permission Management</h1>
            <p className="text-xs text-slate-500">Role-based access control matrix</p>
          </div>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs">Save Changes</Button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Permission matrix">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-56">Permission</th>
                {ROLES.map((role) => (
                  <th key={role} className="px-4 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                    {role}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSION_GROUPS.map(({ group, permissions }) => (
                <>
                  <tr key={`group-${group}`} className="border-b border-slate-800 bg-slate-800/40">
                    <td colSpan={ROLES.length + 1} className="px-5 py-2.5">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{group}</span>
                    </td>
                  </tr>
                  {permissions.map(({ key, label, access }) => (
                    <tr key={key} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                      <td className="px-5 py-3 text-sm text-slate-300">{label}</td>
                      {access.map((granted, i) => (
                        <td key={i} className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            defaultChecked={granted}
                            className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 cursor-pointer w-4 h-4"
                            aria-label={`${label} for ${ROLES[i]}`}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
