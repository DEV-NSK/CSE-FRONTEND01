import { useState } from 'react'
import { CalendarDays, Users, CheckSquare, Archive } from 'lucide-react'
import { ContentTable, ContentRow } from '@/manager/components/ContentTable'

const mockEvents: ContentRow[] = [
  { id: '1', title: 'Google Hiring Drive 2026', status: 'published', category: 'Hiring', updatedAt: 'Jul 20, 2026', author: 'Manager' },
  { id: '2', title: 'React Conference Workshop', status: 'published', category: 'Workshop', updatedAt: 'Jul 18, 2026', author: 'Manager' },
  { id: '3', title: 'Competitive Programming Contest', status: 'draft', category: 'Contest', updatedAt: 'Jul 15, 2026', author: 'Manager' },
  { id: '4', title: 'Placement Orientation', status: 'published', category: 'Orientation', updatedAt: 'Jul 12, 2026', author: 'Manager' },
  { id: '5', title: 'Open Source Hackathon', status: 'draft', category: 'Hackathon', updatedAt: 'Jul 10, 2026', author: 'Manager' },
  { id: '6', title: 'Alumni Tech Talk', status: 'archived', category: 'Talk', updatedAt: 'Jul 5, 2026', author: 'Manager' },
]

export default function ManagerEventsPage() {
  const [view, setView] = useState<'table' | 'calendar'>('table')

  return (
    <div className="space-y-5" role="main" aria-label="Event Management">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-cyan-100 rounded-lg flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-cyan-600" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Event Management</h1>
            <p className="text-xs text-slate-500">Manage events, registrations and attendance</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setView('table')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${view === 'table' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
            aria-pressed={view === 'table'}
          >
            Table
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${view === 'calendar' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
            aria-pressed={view === 'calendar'}
          >
            Calendar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Events', value: '24', icon: CalendarDays, color: 'text-cyan-600 bg-cyan-50' },
          { label: 'Registrations', value: '648', icon: Users, color: 'text-blue-600 bg-blue-50' },
          { label: 'Attendance Rate', value: '72%', icon: CheckSquare, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Archived', value: '8', icon: Archive, color: 'text-slate-600 bg-slate-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
              <Icon className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-xl font-bold text-slate-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {view === 'table' ? (
        <ContentTable
          title="Events"
          rows={mockEvents}
          onCreateNew={() => {}}
          createLabel="New Event"
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-800">July 2026</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs bg-slate-100 rounded-md hover:bg-slate-200">Prev</button>
              <button className="px-3 py-1 text-xs bg-slate-100 rounded-md hover:bg-slate-200">Next</button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-xs">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-center text-slate-400 font-medium py-1">{d}</div>
            ))}
            {Array.from({ length: 35 }, (_, i) => {
              const day = i - 1
              const hasEvent = [18, 20, 25, 28].includes(day)
              return (
                <div
                  key={i}
                  className={`aspect-square flex flex-col items-center justify-start pt-1 rounded-lg text-xs cursor-pointer transition-colors ${
                    day > 0 && day <= 31 ? 'hover:bg-slate-50' : 'opacity-0'
                  }`}
                >
                  {day > 0 && day <= 31 && (
                    <>
                      <span className={`text-xs ${day === 17 ? 'w-5 h-5 bg-cyan-600 text-white rounded-full flex items-center justify-center' : 'text-slate-700'}`}>{day}</span>
                      {hasEvent && <span className="w-1 h-1 bg-cyan-400 rounded-full mt-0.5" aria-hidden="true" />}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
