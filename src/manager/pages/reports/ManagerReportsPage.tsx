import { BarChart3, BookOpen, Code2, FolderKanban, Briefcase, CalendarDays, Download, FileSpreadsheet, FileText } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area,
} from 'recharts'
import { Button } from '@/shared/components/ui/button'

const learningData = [
  { month: 'Jan', enrollments: 120, completions: 80 },
  { month: 'Feb', enrollments: 145, completions: 95 },
  { month: 'Mar', enrollments: 132, completions: 88 },
  { month: 'Apr', enrollments: 168, completions: 112 },
  { month: 'May', enrollments: 190, completions: 134 },
  { month: 'Jun', enrollments: 154, completions: 108 },
]

const codingData = [
  { week: 'W1', submissions: 420, solved: 280 },
  { week: 'W2', submissions: 510, solved: 340 },
  { week: 'W3', submissions: 390, solved: 260 },
  { week: 'W4', submissions: 590, solved: 410 },
]

const placementData = [
  { company: 'Google', offers: 8 },
  { company: 'Microsoft', offers: 12 },
  { company: 'Amazon', offers: 18 },
  { company: 'Infosys', offers: 34 },
  { company: 'Wipro', offers: 28 },
]

const eventData = [
  { event: 'Hiring Drive', registered: 180, attended: 142 },
  { event: 'Workshop', registered: 95, attended: 78 },
  { event: 'Hackathon', registered: 64, attended: 58 },
  { event: 'Orientation', registered: 220, attended: 198 },
]

const REPORT_SECTIONS = [
  { id: 'learning', label: 'Learning Reports', icon: BookOpen, color: 'text-violet-600' },
  { id: 'coding', label: 'Coding Reports', icon: Code2, color: 'text-emerald-600' },
  { id: 'projects', label: 'Project Reports', icon: FolderKanban, color: 'text-orange-600' },
  { id: 'placements', label: 'Placement Reports', icon: Briefcase, color: 'text-pink-600' },
  { id: 'events', label: 'Events Reports', icon: CalendarDays, color: 'text-cyan-600' },
]

export default function ManagerReportsPage() {
  return (
    <div className="space-y-6" role="main" aria-label="Reports">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-indigo-600" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Reports</h1>
            <p className="text-xs text-slate-500">Analytics and data exports across all modules</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5" aria-hidden="true" /> Export Excel
          </Button>
          <Button variant="outline" size="sm" className="text-xs gap-1.5">
            <FileText className="w-3.5 h-3.5" aria-hidden="true" /> Export PDF
          </Button>
          <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white text-xs gap-1.5">
            <Download className="w-3.5 h-3.5" aria-hidden="true" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Learning Reports */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-violet-600" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-slate-800">Learning Reports – Enrollments vs Completions</h2>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={learningData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Area type="monotone" dataKey="enrollments" stroke="#7c3aed" fill="#ede9fe" name="Enrollments" />
            <Area type="monotone" dataKey="completions" stroke="#06b6d4" fill="#cffafe" name="Completions" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Coding Reports */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Code2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-slate-800">Coding – Submissions vs Solved</h2>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={codingData} barSize={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="submissions" fill="#d1fae5" radius={[4, 4, 0, 0]} name="Submissions" />
              <Bar dataKey="solved" fill="#10b981" radius={[4, 4, 0, 0]} name="Solved" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Placement Reports */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-4 h-4 text-pink-600" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-slate-800">Placements – Offers by Company</h2>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={placementData} layout="vertical" barSize={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="company" type="category" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={70} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="offers" fill="#ec4899" radius={[0, 4, 4, 0]} name="Offers" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Events */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="w-4 h-4 text-cyan-600" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-slate-800">Events – Registrations vs Attendance</h2>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={eventData} barSize={16}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="event" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Bar dataKey="registered" fill="#a5f3fc" radius={[4, 4, 0, 0]} name="Registered" />
            <Bar dataKey="attended" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Attended" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
