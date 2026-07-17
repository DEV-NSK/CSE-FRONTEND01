/**
 * FPRD-10: Activity Timeline — Module 18
 */
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Clock, BookOpen, Code2, FolderKanban, Bell, Trash2, Eye, Edit2, Loader2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { managerService } from '@/shared/services/manager.service'
import { ManagerMetricCard } from '@/manager/components/ManagerMetricCard'

interface ActivityEntry {
  id: string
  action: string
  module?: string
  entity?: string
  entityId?: string
  performedBy: string
  performer?: { id: string; fullName: string }
  newValue?: Record<string, unknown>
  oldValue?: Record<string, unknown>
  createdAt: string
}

interface ActivityData {
  data: ActivityEntry[]
  total: number
  page: number
  limit: number
}

const ACTION_ICON: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  ROADMAP_CREATED:    { icon: BookOpen,      color: 'bg-violet-50 text-violet-600' },
  ROADMAP_UPDATED:    { icon: Edit2,         color: 'bg-blue-50 text-blue-600' },
  ROADMAP_DELETED:    { icon: Trash2,        color: 'bg-red-50 text-red-500' },
  LESSON_CREATED:     { icon: BookOpen,      color: 'bg-indigo-50 text-indigo-600' },
  LESSON_UPDATED:     { icon: Edit2,         color: 'bg-blue-50 text-blue-600' },
  CODING_PROBLEM_CREATED: { icon: Code2,     color: 'bg-emerald-50 text-emerald-600' },
  CODING_PROBLEM_UPDATED: { icon: Edit2,     color: 'bg-teal-50 text-teal-600' },
  CODING_PROBLEM_DELETED: { icon: Trash2,    color: 'bg-red-50 text-red-500' },
  PROJECT_CREATED:    { icon: FolderKanban,  color: 'bg-orange-50 text-orange-600' },
  PROJECT_DELETED:    { icon: Trash2,        color: 'bg-red-50 text-red-500' },
  CONTENT_PUBLISHED:  { icon: Eye,           color: 'bg-emerald-50 text-emerald-600' },
  CONTENT_ARCHIVED:   { icon: Clock,         color: 'bg-slate-50 text-slate-600' },
  NOTIFICATION_SENT:  { icon: Bell,          color: 'bg-amber-50 text-amber-600' },
  BULK_PUBLISHED:     { icon: Eye,           color: 'bg-emerald-50 text-emerald-600' },
  BULK_DELETED:       { icon: Trash2,        color: 'bg-red-50 text-red-500' },
  BANNER_CREATED:     { icon: Eye,           color: 'bg-blue-50 text-blue-600' },
  FAQ_CREATED:        { icon: Edit2,         color: 'bg-teal-50 text-teal-600' },
}

function getActionConfig(action: string) {
  return ACTION_ICON[action] ?? { icon: Clock, color: 'bg-slate-50 text-slate-500' }
}

function formatAction(action: string) {
  return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = (now.getTime() - d.getTime()) / 1000
  if (diff < 60)   return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ManagerActivityPage() {
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 25

  const { data: actData, isLoading } = useQuery({
    queryKey: ['manager', 'activity', page],
    queryFn: () => managerService.getActivityLog({ page, limit: PAGE_SIZE }).then((r) => r.data.data as ActivityData),
    staleTime: 30_000,
    refetchInterval: 60_000,
  })

  const entries = actData?.data ?? []
  const total = actData?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="space-y-5" role="main" aria-label="Activity Timeline">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
          <Clock className="w-5 h-5 text-slate-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Activity Timeline</h1>
          <p className="text-xs text-slate-500">Every content action you've taken, in chronological order</p>
        </div>
      </div>

      <ManagerMetricCard title="Total Actions" value={total} icon={Clock} iconColor="text-slate-600" iconBg="bg-slate-50" />

      {/* Timeline */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-8 h-8 text-slate-200 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No activity yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {entries.map((entry: ActivityEntry, idx: number) => {
              const cfg = getActionConfig(entry.action)
              const Icon = cfg.icon
              const isFirst = idx === 0
              return (
                <div key={entry.id} className="flex items-start gap-3 p-4 hover:bg-slate-50/50 transition-colors">
                  {/* Icon */}
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', cfg.color)}>
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {formatAction(entry.action)}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {entry.entity && (
                            <span className="text-xs text-slate-500">{entry.entity}</span>
                          )}
                          {entry.module && (
                            <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                              {entry.module}
                            </span>
                          )}
                          {isFirst && (
                            <span className="text-[10px] font-medium bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
                              Latest
                            </span>
                          )}
                        </div>
                        {/* Show entity title from newValue if available */}
                        {entry.newValue && typeof entry.newValue === 'object' && 'title' in entry.newValue && (
                          <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[300px]">
                            "{String(entry.newValue.title)}"
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 flex-shrink-0 mt-1">
                        {formatTime(entry.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/30">
            <p className="text-xs text-slate-500">{total} total actions · Page {page} of {totalPages}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 text-xs border border-slate-200 rounded-lg hover:bg-white disabled:opacity-30 transition-colors">
                Previous
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1 text-xs border border-slate-200 rounded-lg hover:bg-white disabled:opacity-30 transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
