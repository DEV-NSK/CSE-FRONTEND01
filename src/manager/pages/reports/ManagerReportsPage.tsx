/**
 * FPRD-10: Reports Page — Real data + Export (Module 16)
 */
import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { BarChart3, BookOpen, Code2, FolderKanban, Briefcase, CalendarDays, Loader2, AlertCircle, Download, FileSpreadsheet, FileJson } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Button } from '@/shared/components/ui/button'
import { managerService } from '@/shared/services/manager.service'
import { useToast } from '@/shared/hooks/useToast'

export default function ManagerReportsPage() {
  const [exportEntity, setExportEntity] = useState('roadmaps')
  const { toast } = useToast()

  const { data: rawData, isLoading, isError } = useQuery({
    queryKey: ['manager', 'reports'],
    queryFn: () => managerService.getReports().then((r) => r.data.data),
    staleTime: 5 * 60_000,
  })

  const { data: cmsData } = useQuery({
    queryKey: ['manager', 'cms', 'dashboard'],
    queryFn: () => managerService.getCMSDashboard().then((r) => r.data.data),
    staleTime: 60_000,
  })

  const exportMut = useMutation({
    mutationFn: ({ entity, format }: { entity: string; format: 'json' | 'csv' }) =>
      managerService.exportContent(entity, format),
    onSuccess: (res, { entity, format }) => {
      const exportData = res.data.data as { format: string; data: unknown; count: number }
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(exportData.data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = `${entity}-export.json`; a.click()
        URL.revokeObjectURL(url)
      } else {
        const blob = new Blob([String(exportData.data)], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = `${entity}-export.csv`; a.click()
        URL.revokeObjectURL(url)
      }
      toast({ title: `Exported ${exportData.count} records as ${format.toUpperCase()}` })
    },
    onError: () => toast({ title: 'Export failed', variant: 'destructive' }),
  })

  const d = rawData as Record<string, Record<string, number>> | undefined
  const cms = cmsData as Record<string, Record<string, number>> | undefined

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-red-600">Failed to load reports.</p>
        </div>
      </div>
    )
  }

  const summaryStats = [
    { label: 'Total Roadmaps', value: cms?.learning?.totalRoadmaps ?? 0, published: cms?.learning?.publishedRoadmaps ?? 0, icon: BookOpen, color: 'text-violet-600' },
    { label: 'Total Problems', value: cms?.coding?.totalProblems ?? 0, published: cms?.coding?.publishedProblems ?? 0, icon: Code2, color: 'text-emerald-600' },
    { label: 'Total Projects', value: cms?.projects?.totalProjects ?? 0, published: cms?.projects?.publishedProjects ?? 0, icon: FolderKanban, color: 'text-orange-600' },
    { label: 'Total Jobs', value: cms?.placements?.totalJobs ?? 0, published: cms?.placements?.publishedJobs ?? 0, icon: Briefcase, color: 'text-pink-600' },
    { label: 'Total Events', value: cms?.events?.totalEvents ?? 0, published: cms?.events?.publishedEvents ?? 0, icon: CalendarDays, color: 'text-cyan-600' },
  ]

  const contentOverview = summaryStats.map((s) => ({
    name: s.label.replace('Total ', ''),
    total: s.value,
    published: s.published,
    draft: s.value - s.published,
  }))

  return (
    <div className="space-y-6" role="main" aria-label="Reports">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Content Reports</h1>
            <p className="text-xs text-slate-500">
              Period: {d?.period?.startDate ?? 'All time'} → {d?.period?.endDate ?? 'Present'}
              {d?.generatedAt && <span className="ml-2 text-slate-400">· Generated {new Date(d.generatedAt as unknown as string).toLocaleString()}</span>}
            </p>
          </div>
        </div>
        {/* Export panel */}
        <div className="flex items-center gap-2">
          <select
            value={exportEntity}
            onChange={(e) => setExportEntity(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-slate-700"
          >
            {['roadmaps','lessons','problems','projects','companies','jobs','events'].map((e) => (
              <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>
            ))}
          </select>
          <Button variant="outline" size="sm" className="text-xs h-8 gap-1.5"
            disabled={exportMut.isPending}
            onClick={() => exportMut.mutate({ entity: exportEntity, format: 'csv' })}>
            <FileSpreadsheet className="w-3.5 h-3.5" />CSV
          </Button>
          <Button variant="outline" size="sm" className="text-xs h-8 gap-1.5"
            disabled={exportMut.isPending}
            onClick={() => exportMut.mutate({ entity: exportEntity, format: 'json' })}>
            <FileJson className="w-3.5 h-3.5" />JSON
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {summaryStats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4">
              <div className={`w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center mb-2`}>
                <Icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-emerald-600 mt-0.5">{s.published} published</p>
            </div>
          )
        })}
      </div>

      {/* Content overview chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Content Overview — Published vs Draft</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={contentOverview} barSize={14}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
            <Bar dataKey="published" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Published" />
            <Bar dataKey="draft" fill="#ddd6fe" radius={[4, 4, 0, 0]} name="Draft" />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2">
          <div className="flex items-center gap-1.5"><span className="w-3 h-1.5 bg-violet-600 rounded-full inline-block" /><span className="text-xs text-slate-500">Published</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-1.5 bg-violet-200 rounded-full inline-block" /><span className="text-xs text-slate-500">Draft</span></div>
        </div>
      </div>

      {/* Summary numbers from API */}
      {d?.summary && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Period Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(d.summary as Record<string, number>).map(([key, val]) => (
              <div key={key} className="text-center">
                <p className="text-2xl font-bold text-slate-900">{val}</p>
                <p className="text-xs text-slate-500 mt-0.5 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
