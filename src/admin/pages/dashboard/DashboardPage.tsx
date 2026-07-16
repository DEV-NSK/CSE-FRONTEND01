import React from 'react'
import { 
  Users, 
  BookOpen, 
  FolderKanban, 
  BriefcaseBusiness, 
  Activity, 
  Server, 
  Zap 
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'
import { AdminMetricCard } from '@/admin/components/AdminMetricCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'

const mockActivityData = [
  { name: 'Mon', users: 400, views: 240 },
  { name: 'Tue', users: 300, views: 139 },
  { name: 'Wed', users: 200, views: 980 },
  { name: 'Thu', users: 278, views: 390 },
  { name: 'Fri', users: 189, views: 480 },
  { name: 'Sat', users: 239, views: 380 },
  { name: 'Sun', users: 349, views: 430 },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back! Here's what's happening.</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminMetricCard 
          title="Total Users" 
          value="2,543" 
          icon={Users} 
          trend="up" 
          trendValue="12%" 
        />
        <AdminMetricCard 
          title="Learning Content" 
          value="142" 
          icon={BookOpen} 
          trend="neutral" 
          trendValue="0%" 
        />
        <AdminMetricCard 
          title="Active Projects" 
          value="89" 
          icon={FolderKanban} 
          trend="up" 
          trendValue="8%" 
        />
        <AdminMetricCard 
          title="Open Positions" 
          value="15" 
          icon={BriefcaseBusiness} 
          trend="down" 
          trendValue="3%" 
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-700">User Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockActivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '0.5rem' }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#2563eb" 
                    strokeWidth={2} 
                    dot={{ r: 3, fill: '#2563eb' }}
                    activeDot={{ r: 5, fill: '#2563eb' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-700">Content Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockActivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '0.5rem' }} 
                  />
                  <Bar dataKey="views" fill="#64748b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <Card className="border-slate-200 shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex gap-4 items-start py-2">
                <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                <div>
                  <p className="text-sm text-slate-900">New user registered</p>
                  <p className="text-xs text-slate-500 mt-1">2 minutes ago</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Server Status & Quick Actions */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Server className="h-4 w-4" />
                Server Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">API</span>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Database</span>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Storage</span>
                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">80%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <button className="w-full text-left text-sm px-3 py-2 rounded-md hover:bg-slate-50 text-slate-700">
                Create New Roadmap
              </button>
              <button className="w-full text-left text-sm px-3 py-2 rounded-md hover:bg-slate-50 text-slate-700">
                Add New Job Posting
              </button>
              <button className="w-full text-left text-sm px-3 py-2 rounded-md hover:bg-slate-50 text-slate-700">
                Schedule Event
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
