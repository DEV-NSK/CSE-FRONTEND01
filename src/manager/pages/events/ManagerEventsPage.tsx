/**
 * FPRD-10: Events CMS — Module 5
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, Users } from 'lucide-react'
import { CMSTable, type CMSRow } from '@/manager/components/CMSTable'
import { CMSFormModal } from '@/manager/components/CMSFormModal'
import { managerService, type CMSEvent } from '@/shared/services/manager.service'
import { useToast } from '@/shared/hooks/useToast'
import { ManagerMetricCard } from '@/manager/components/ManagerMetricCard'

export default function ManagerEventsPage() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<CMSEvent | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['manager', 'events', search, status, page],
    queryFn: () => managerService.getEvents({ search, status: status !== 'all' ? status as 'published' | 'draft' : undefined, page }).then((r) => r.data.data),
    staleTime: 30_000,
  })

  const { data: stats } = useQuery({
    queryKey: ['manager', 'cms', 'dashboard'],
    queryFn: () => managerService.getCMSDashboard().then((r) => r.data.data as Record<string, Record<string, number>>),
    staleTime: 60_000,
  })
  const events = (stats as Record<string, Record<string, number>> | undefined)?.events ?? {}

  const createMut = useMutation({
    mutationFn: (d: Partial<CMSEvent>) => managerService.createEvent(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['manager', 'events'] }); toast({ title: 'Event created' }); setModalOpen(false) },
    onError: () => toast({ title: 'Failed to create', variant: 'destructive' }),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CMSEvent> }) => managerService.updateEvent(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['manager', 'events'] }); toast({ title: 'Event updated' }); setModalOpen(false) },
    onError: () => toast({ title: 'Failed to update', variant: 'destructive' }),
  })
  const deleteMut = useMutation({ mutationFn: managerService.deleteEvent, onSuccess: () => qc.invalidateQueries({ queryKey: ['manager', 'events'] }) })
  const publishMut = useMutation({ mutationFn: managerService.publishEvent, onSuccess: () => qc.invalidateQueries({ queryKey: ['manager', 'events'] }) })
  const archiveMut = useMutation({ mutationFn: managerService.archiveEvent, onSuccess: () => qc.invalidateQueries({ queryKey: ['manager', 'events'] }) })
  const bulkDeleteMut = useMutation({ mutationFn: (ids: string[]) => managerService.bulkDelete('events', ids), onSuccess: () => qc.invalidateQueries({ queryKey: ['manager', 'events'] }) })

  const formatEventDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) } catch { return d }
  }

  const rows: CMSRow[] = (data?.data ?? []).map((e: CMSEvent) => ({
    id: e.id, title: e.title,
    isPublished: e.isPublished,
    subtitle: e.organizer ?? undefined,
    badge: e.type,
    extra: formatEventDate(e.startTime),
    updatedAt: e.updatedAt,
  }))

  return (
    <div className="space-y-5" role="main" aria-label="Events Management CMS">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-cyan-100 rounded-lg flex items-center justify-center">
          <CalendarDays className="w-5 h-5 text-cyan-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Events CMS</h1>
          <p className="text-xs text-slate-500">Manage workshops, hackathons, webinars and more</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ManagerMetricCard title="Total Events" value={events.totalEvents ?? '—'} icon={CalendarDays} iconColor="text-cyan-600" iconBg="bg-cyan-50" />
        <ManagerMetricCard title="Published" value={events.publishedEvents ?? '—'} icon={Users} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
      </div>

      <CMSTable
        title="Events" rows={rows} total={data?.total} page={page} pageSize={20}
        loading={isLoading} search={search} statusFilter={status}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        onStatusChange={(v) => { setStatus(v); setPage(1) }}
        onPageChange={setPage}
        onCreateNew={() => { setEditItem(null); setModalOpen(true) }}
        createLabel="New Event"
        onEdit={(row) => { const e = data?.data.find((x: CMSEvent) => x.id === row.id); if (e) { setEditItem(e); setModalOpen(true) } }}
        onDelete={(id) => deleteMut.mutate(id)}
        onPublish={(id) => publishMut.mutate(id)}
        onArchive={(id) => archiveMut.mutate(id)}
        onBulkDelete={(ids) => bulkDeleteMut.mutate(ids)}
        actions={{ edit: true, delete: true, publish: true, archive: true }}
      />

      <CMSFormModal<Partial<CMSEvent>>
        open={modalOpen} onClose={() => setModalOpen(false)}
        onSubmit={(d) => editItem ? updateMut.mutateAsync({ id: editItem.id, data: d }) : createMut.mutateAsync(d)}
        title={editItem ? 'Edit Event' : 'New Event'}
        editValues={editItem ?? undefined}
        isLoading={createMut.isPending || updateMut.isPending}
        size="lg"
        fields={[
          { name: 'title', label: 'Event Title', placeholder: 'Google Hiring Drive 2026', rules: { required: 'Title is required' } },
          { name: 'type', label: 'Type', type: 'select', rules: { required: 'Type is required' }, options: [
            { value: 'HACKATHON', label: 'Hackathon' }, { value: 'WEBINAR', label: 'Webinar' },
            { value: 'WORKSHOP', label: 'Workshop' }, { value: 'CONTEST', label: 'Contest' },
            { value: 'BOOTCAMP', label: 'Bootcamp' }, { value: 'MEETUP', label: 'Meetup' },
          ] },
          { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Event description...' },
          { name: 'organizer', label: 'Organizer', placeholder: 'Google' },
          { name: 'location', label: 'Location / Venue', placeholder: 'Online or address...' },
          { name: 'startTime', label: 'Start Time', type: 'datetime-local', rules: { required: 'Start time is required' } },
          { name: 'endTime', label: 'End Time', type: 'datetime-local', rules: { required: 'End time is required' } },
          { name: 'registrationUrl', label: 'Registration URL', type: 'url', placeholder: 'https://...' },
          { name: 'maxParticipants', label: 'Max Participants', type: 'number', placeholder: '100' },
        ]}
      />
    </div>
  )
}
