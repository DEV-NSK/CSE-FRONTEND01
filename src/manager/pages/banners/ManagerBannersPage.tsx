/**
 * FPRD-10: Banner Management — Module 7
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Image, Monitor } from 'lucide-react'
import { CMSTable, type CMSRow } from '@/manager/components/CMSTable'
import { CMSFormModal } from '@/manager/components/CMSFormModal'
import { managerService } from '@/shared/services/manager.service'
import { useToast } from '@/shared/hooks/useToast'
import { ManagerMetricCard } from '@/manager/components/ManagerMetricCard'

interface Banner {
  id: string
  title: string
  placement: string
  type: 'IMAGE' | 'VIDEO'
  mediaUrl: string
  ctaText?: string
  ctaLink?: string
  priority: number
  isActive: boolean
  scheduledAt?: string
  expiresAt?: string
  createdAt: string
  updatedAt: string
}

const PLACEMENTS = ['HOMEPAGE', 'LEARNING', 'CODING', 'PLACEMENT', 'EVENTS', 'ANNOUNCEMENT']

export default function ManagerBannersPage() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const [placement, setPlacement] = useState('all')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Banner | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['manager', 'banners', placement, page],
    queryFn: () =>
      managerService.getBanners({ placement: placement !== 'all' ? placement : undefined, page })
        .then((r) => r.data.data as { data: Banner[]; total: number }),
    staleTime: 30_000,
  })

  const createMut = useMutation({
    mutationFn: (d: Partial<Banner>) => managerService.createBanner(d as Record<string, unknown>),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['manager', 'banners'] }); toast({ title: 'Banner created' }); setModalOpen(false) },
    onError: () => toast({ title: 'Failed to create', variant: 'destructive' }),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Banner> }) =>
      managerService.updateBanner(id, data as Record<string, unknown>),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['manager', 'banners'] }); toast({ title: 'Banner updated' }); setModalOpen(false) },
    onError: () => toast({ title: 'Failed to update', variant: 'destructive' }),
  })
  const deleteMut = useMutation({
    mutationFn: managerService.deleteBanner,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['manager', 'banners'] }); toast({ title: 'Banner deleted' }) },
  })
  const toggleMut = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      managerService.updateBanner(id, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['manager', 'banners'] }),
  })

  const allBanners = data?.data ?? []
  const activeBanners = allBanners.filter((b: Banner) => b.isActive).length

  const rows: CMSRow[] = allBanners.map((b: Banner) => ({
    id: b.id, title: b.title,
    isPublished: b.isActive,
    subtitle: b.placement,
    badge: b.type,
    badgeColor: b.type === 'IMAGE' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200',
    extra: `Priority: ${b.priority}`,
    updatedAt: b.updatedAt,
  }))

  return (
    <div className="space-y-5" role="main" aria-label="Banner Management">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
          <Image className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Banner Management</h1>
          <p className="text-xs text-slate-500">Control banners across all platform sections</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ManagerMetricCard title="Total Banners" value={data?.total ?? 0} icon={Image} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <ManagerMetricCard title="Active" value={activeBanners} icon={Monitor} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        {PLACEMENTS.slice(0, 2).map((p) => (
          <ManagerMetricCard key={p} title={p.charAt(0) + p.slice(1).toLowerCase()} value={allBanners.filter((b: Banner) => b.placement === p).length} icon={Image} iconColor="text-slate-500" iconBg="bg-slate-50" />
        ))}
      </div>

      {/* Placement filter */}
      <div className="flex items-center gap-1 border-b border-slate-200 flex-wrap">
        {['all', ...PLACEMENTS].map((p) => (
          <button key={p} onClick={() => { setPlacement(p); setPage(1) }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              placement === p ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}>
            {p === 'all' ? 'All' : p.charAt(0) + p.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <CMSTable
        title="Banners" rows={rows} total={data?.total} page={page} pageSize={20}
        loading={isLoading}
        onPageChange={setPage}
        onCreateNew={() => { setEditItem(null); setModalOpen(true) }}
        createLabel="New Banner"
        onEdit={(row) => { const b = allBanners.find((x: Banner) => x.id === row.id); if (b) { setEditItem(b); setModalOpen(true) } }}
        onDelete={(id) => deleteMut.mutate(id)}
        onPublish={(id) => toggleMut.mutate({ id, isActive: true })}
        onArchive={(id) => toggleMut.mutate({ id, isActive: false })}
        actions={{ edit: true, delete: true, publish: true, archive: true }}
      />

      <CMSFormModal<Partial<Banner>>
        open={modalOpen} onClose={() => setModalOpen(false)}
        onSubmit={(d) => editItem ? updateMut.mutateAsync({ id: editItem.id, data: d }) : createMut.mutateAsync(d)}
        title={editItem ? 'Edit Banner' : 'New Banner'}
        editValues={editItem ?? undefined}
        isLoading={createMut.isPending || updateMut.isPending}
        autosaveKey={`banner:${editItem?.id ?? 'new'}`}
        size="lg"
        fields={[
          { name: 'title', label: 'Banner Title', placeholder: 'Summer Placement Drive', rules: { required: 'Title is required' } },
          { name: 'placement', label: 'Placement', type: 'select', rules: { required: 'Placement is required' }, options: PLACEMENTS.map((p) => ({ value: p, label: p.charAt(0) + p.slice(1).toLowerCase() })) },
          { name: 'type', label: 'Type', type: 'select', options: [{ value: 'IMAGE', label: 'Image' }, { value: 'VIDEO', label: 'Video' }] },
          { name: 'mediaUrl', label: 'Media URL', type: 'url', placeholder: 'https://...', rules: { required: 'Media URL is required' } },
          { name: 'ctaText', label: 'CTA Button Text', placeholder: 'Apply Now' },
          { name: 'ctaLink', label: 'CTA Link', type: 'url', placeholder: 'https://...' },
          { name: 'priority', label: 'Priority (higher = shown first)', type: 'number', placeholder: '0' },
          { name: 'scheduledAt', label: 'Schedule Start', type: 'datetime-local' },
          { name: 'expiresAt', label: 'Expires At', type: 'datetime-local' },
          { name: 'isActive', label: 'Active', type: 'switch' },
        ]}
      />
    </div>
  )
}
