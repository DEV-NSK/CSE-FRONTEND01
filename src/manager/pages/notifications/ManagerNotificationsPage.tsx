/**
 * FPRD-10: Notifications CMS — Module 6
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, Send, History, Users, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/button'
import { CMSTable, type CMSRow } from '@/manager/components/CMSTable'
import { managerService, type CMSNotification } from '@/shared/services/manager.service'
import { useToast } from '@/shared/hooks/useToast'
import { ManagerMetricCard } from '@/manager/components/ManagerMetricCard'

const TABS = [
  { id: 'compose', label: 'Compose', icon: Send },
  { id: 'history', label: 'History', icon: History },
  { id: 'targeted', label: 'Targeted', icon: Users },
]

interface BroadcastForm {
  title: string
  message: string
  type: string
  targetRole: string
}

interface TargetedForm {
  userId: string
  title: string
  message: string
  type: string
}

// ── Compose Tab ────────────────────────────────────────────────────────────────
function ComposeTab() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<BroadcastForm>({
    defaultValues: { title: '', message: '', type: 'SYSTEM', targetRole: '' }
  })

  const broadcastMut = useMutation({
    mutationFn: (d: BroadcastForm) => managerService.broadcastNotification({ title: d.title, message: d.message, type: d.type, targetRole: d.targetRole || undefined }),
    onSuccess: (res) => {
      const count = (res.data.data as { sent?: number })?.sent ?? 0
      toast({ title: `Notification sent to ${count} users` })
      reset()
      qc.invalidateQueries({ queryKey: ['manager', 'notifications'] })
    },
    onError: () => toast({ title: 'Failed to send notification', variant: 'destructive' }),
  })

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-2xl">
      <h2 className="text-sm font-semibold text-slate-800 mb-5">Broadcast Notification</h2>
      <form onSubmit={handleSubmit((d) => broadcastMut.mutateAsync(d))} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="notif-type">Type</label>
            <select id="notif-type" {...register('type')}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white">
              <option value="SYSTEM">System</option>
              <option value="LEARNING">Learning</option>
              <option value="CODING">Coding</option>
              <option value="PLACEMENT">Placement</option>
              <option value="PROJECT">Project</option>
              <option value="EVENT">Event</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="notif-target">Target Audience</label>
            <select id="notif-target" {...register('targetRole')}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white">
              <option value="">Everyone</option>
              <option value="STUDENT">Students</option>
              <option value="MENTOR">Mentors</option>
              <option value="MANAGER">Managers</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="notif-title">
            Title <span className="text-red-500">*</span>
          </label>
          <input id="notif-title" type="text" {...register('title', { required: 'Title is required' })}
            placeholder="Notification title..."
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="notif-message">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea id="notif-message" rows={4} {...register('message', { required: 'Message is required' })}
            placeholder="Write your notification message..."
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
          {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>}
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting} className="bg-amber-500 hover:bg-amber-600 text-white">
            {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</> : <><Send className="w-4 h-4 mr-2" />Send Broadcast</>}
          </Button>
        </div>
      </form>
    </div>
  )
}

// ── Targeted Tab ──────────────────────────────────────────────────────────────
function TargetedTab() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<TargetedForm>({
    defaultValues: { userId: '', title: '', message: '', type: 'SYSTEM' }
  })

  const sendMut = useMutation({
    mutationFn: (d: TargetedForm) => managerService.createNotification({ userId: d.userId, title: d.title, message: d.message, type: d.type }),
    onSuccess: () => { toast({ title: 'Notification sent' }); reset(); qc.invalidateQueries({ queryKey: ['manager', 'notifications'] }) },
    onError: () => toast({ title: 'Failed to send', variant: 'destructive' }),
  })

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-2xl">
      <h2 className="text-sm font-semibold text-slate-800 mb-5">Send to Specific User</h2>
      <form onSubmit={handleSubmit((d) => sendMut.mutateAsync(d))} className="space-y-4" noValidate>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="tgt-user">User ID <span className="text-red-500">*</span></label>
          <input id="tgt-user" type="text" {...register('userId', { required: 'User ID is required' })}
            placeholder="User UUID..."
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          {errors.userId && <p className="text-xs text-red-500 mt-1">{errors.userId.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="tgt-type">Type</label>
          <select id="tgt-type" {...register('type')}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white">
            <option value="SYSTEM">System</option>
            <option value="LEARNING">Learning</option>
            <option value="CODING">Coding</option>
            <option value="PLACEMENT">Placement</option>
            <option value="EVENT">Event</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="tgt-title">Title <span className="text-red-500">*</span></label>
          <input id="tgt-title" type="text" {...register('title', { required: 'Title is required' })}
            placeholder="Notification title..."
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="tgt-message">Message <span className="text-red-500">*</span></label>
          <textarea id="tgt-message" rows={3} {...register('message', { required: 'Message is required' })}
            placeholder="Message..."
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
        </div>
        <Button type="submit" disabled={isSubmitting} className="bg-amber-500 hover:bg-amber-600 text-white">
          {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</> : <><Send className="w-4 h-4 mr-2" />Send Notification</>}
        </Button>
      </form>
    </div>
  )
}

// ── History Tab ────────────────────────────────────────────────────────────────
function HistoryTab() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['manager', 'notifications', search, page],
    queryFn: () => managerService.getNotifications({ search, page }).then((r) => r.data.data),
    staleTime: 30_000,
  })

  const deleteMut = useMutation({
    mutationFn: managerService.deleteNotification,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['manager', 'notifications'] }); toast({ title: 'Notification deleted' }) },
  })

  const rows: CMSRow[] = (data?.data ?? []).map((n: CMSNotification) => ({
    id: n.id,
    title: n.title,
    status: 'published' as const,
    subtitle: n.user ? `→ ${n.user.fullName}` : undefined,
    badge: n.type,
    extra: n.isRead ? 'Read' : 'Unread',
    createdAt: n.createdAt,
  }))

  return (
    <CMSTable
      title="Notification History" rows={rows} total={data?.total} page={page} pageSize={20}
      loading={isLoading} search={search}
      onSearchChange={(v) => { setSearch(v); setPage(1) }}
      onPageChange={setPage}
      onDelete={(id) => deleteMut.mutate(id)}
      actions={{ edit: false, delete: true }}
    />
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ManagerNotificationsPage() {
  const [activeTab, setActiveTab] = useState('compose')

  const { data: stats } = useQuery({
    queryKey: ['manager', 'cms', 'dashboard'],
    queryFn: () => managerService.getCMSDashboard().then((r) => r.data.data as Record<string, Record<string, number>>),
    staleTime: 60_000,
  })
  const notifs = (stats as Record<string, Record<string, number>> | undefined)?.notifications ?? {}

  return (
    <div className="space-y-5" role="main" aria-label="Notifications CMS">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
          <Bell className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Notifications CMS</h1>
          <p className="text-xs text-slate-500">Compose, broadcast and manage notifications</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <ManagerMetricCard title="Total Sent" value={notifs.totalNotifications ?? '—'} icon={Bell} iconColor="text-amber-600" iconBg="bg-amber-50" />
      </div>

      <div className="flex items-center gap-1 border-b border-slate-200" role="tablist">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} role="tab" aria-selected={activeTab === id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
              activeTab === id ? 'border-amber-500 text-amber-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}>
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {activeTab === 'compose' && <ComposeTab />}
        {activeTab === 'history' && <HistoryTab />}
        {activeTab === 'targeted' && <TargetedTab />}
      </div>
    </div>
  )
}
