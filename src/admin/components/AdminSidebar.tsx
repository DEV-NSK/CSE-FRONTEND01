import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  BookOpen, 
  FolderKanban, 
  BriefcaseBusiness, 
  Calendar, 
  BarChart3, 
  Users, 
  Bell, 
  Settings, 
  User, 
  ChevronRight,
  Cpu
} from 'lucide-react'

const SidebarNavGroup = ({ title, items }: { title: string, items: any[] }) => (
  <div className="mb-6">
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">
      {title}
    </p>
    <ul className="space-y-1">
      {items.map((item, idx) => (
        <li key={idx}>
          <NavLink
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  </div>
)

export function AdminSidebar() {
  const navItems = [
    {
      title: 'Overview',
      items: [
        { path: '/administrator', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'Content',
      items: [
        { path: '/administrator/learning', label: 'Learning', icon: BookOpen },
        { path: '/administrator/projects', label: 'Projects', icon: FolderKanban }
      ]
    },
    {
      title: 'Management',
      items: [
        { path: '/administrator/placements', label: 'Placements', icon: BriefcaseBusiness },
        { path: '/administrator/events', label: 'Events', icon: Calendar },
        { path: '/administrator/users', label: 'Users', icon: Users }
      ]
    },
    {
      title: 'Analytics',
      items: [
        { path: '/administrator/analytics', label: 'Analytics', icon: BarChart3 }
      ]
    },
    {
      title: 'System',
      items: [
        { path: '/administrator/notifications', label: 'Notifications', icon: Bell },
        { path: '/administrator/profile', label: 'Profile', icon: User },
        { path: '/administrator/settings', label: 'Settings', icon: Settings }
      ]
    }
  ]

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-full flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Cpu className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900">Admin Console</span>
        </div>
      </div>
      <nav className="flex-1 py-6 overflow-y-auto">
        {navItems.map((group, idx) => (
          <SidebarNavGroup key={idx} title={group.title} items={group.items} />
        ))}
      </nav>
    </aside>
  )
}
