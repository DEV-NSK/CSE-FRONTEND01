/**
 * FPRD-10: Testimonials CMS — Module 9
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Star, Award } from 'lucide-react'
import { CMSTable, type CMSRow } from '@/manager/components/CMSTable'
import { CMSFormModal } from '@/manager/components/CMSFormModal'
import { managerService } from '@/shared/services/manager.service'
import { useToast } from '@/shared/hooks/useToast'
import { ManagerMetricCard } from '@/manager/components/ManagerMetricCard'

interface Testimonial {
  id: string; studentName: string; studentId?: string; role?: string; company?: string
  content: string; rating: number; avatarUrl?: string
  isFeatured: boolean; isPublished: boolean; createdAt: string; updatedAt: string
}

export default function ManagerTestimonialsPage() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Testimonial | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['manager', 'testimonials', status, page],
    queryFn: () =>
      managerService.getTestimonials({
        isPublished: status === 'published' ? true : status === 'draft' ? false : undefined,
        page,
      }).then((r) => r.data.data as { data: Testimonial[]; total: number }),
    staleTime: 30_000,
  })

  const createMut = useMutation({
    mutationFn: (d: Partial<Testimonial>) => managerService.createTestimonial(d as Record<string, unknown>),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['manager', 'testimonials'] }); toast({ title: 'Testimonial created' }); setModalOpen(false) },
    onError: () => toast({ title: 'Failed to create', variant: 'destructive' }),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Testimonial> }) =>
      managerService.updateTestimonial(id, data as Record<string, unknown>),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['manager', 'testimonials'] }); toast({ title: 'Updated' }); setModalOpen(false) },
    onError: () => toast({ title: 'Failed to update', variant: 'destructive' }),
  })
  const deleteMut = useMutation({
    mutationFn: managerService.deleteTestimonial,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['manager', 'testimonials'] }); toast({ title: 'Deleted' }) },
  })

  const featuredCount = (data?.data ?? []).filter((t: Testimonial) => t.isFeatured).length

  const rows: CMSRow[] = (data?.data ?? []).map((t: Testimonial) => ({
    id: t.id, title: t.studentName,
    isPublished: t.isPublished,
    subtitle: t.company ? `${t.role ?? ''} at ${t.company}` : t.role ?? undefined,
    badge: t.isFeatured ? '⭐ Featured' : undefined,
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    extra: '★'.repeat(Math.min(5, t.rating ?? 0)),
    updatedAt: t.updatedAt,
  }))

  return (
    <div className="space-y-5" role="main" aria-label="Testimonials Management">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
          <Star className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Testimonials</h1>
          <p className="text-xs text-slate-500">Manage student reviews, ratings and success stories</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ManagerMetricCard title="Total Reviews" value={data?.total ?? 0} icon={Star} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <ManagerMetricCard title="Featured" value={featuredCount} icon={Award} iconColor="text-violet-600" iconBg="bg-violet-50" />
      </div>

      <CMSTable
        title="Testimonials" rows={rows} total={data?.total} page={page} pageSize={20}
        loading={isLoading} statusFilter={status}
        onStatusChange={(v) => { setStatus(v); setPage(1) }}
        onPageChange={setPage}
        onCreateNew={() => { setEditItem(null); setModalOpen(true) }}
        createLabel="Add Testimonial"
        onEdit={(row) => { const t = data?.data.find((x: Testimonial) => x.id === row.id); if (t) { setEditItem(t); setModalOpen(true) } }}
        onDelete={(id) => deleteMut.mutate(id)}
        onPublish={(id) => updateMut.mutate({ id, data: { isPublished: true } })}
        onArchive={(id) => updateMut.mutate({ id, data: { isPublished: false } })}
        actions={{ edit: true, delete: true, publish: true, archive: true }}
      />

      <CMSFormModal<Partial<Testimonial>>
        open={modalOpen} onClose={() => setModalOpen(false)}
        onSubmit={(d) => editItem ? updateMut.mutateAsync({ id: editItem.id, data: d }) : createMut.mutateAsync(d)}
        title={editItem ? 'Edit Testimonial' : 'Add Testimonial'}
        editValues={editItem ?? undefined}
        isLoading={createMut.isPending || updateMut.isPending}
        autosaveKey={`testimonial:${editItem?.id ?? 'new'}`}
        size="lg"
        fields={[
          { name: 'studentName', label: 'Student Name', placeholder: 'Arjun Sharma', rules: { required: 'Name is required' } },
          { name: 'role', label: 'Role / Title', placeholder: 'Software Engineer' },
          { name: 'company', label: 'Company', placeholder: 'Google' },
          { name: 'content', label: 'Review Content', type: 'textarea', placeholder: 'This platform helped me...', rules: { required: 'Content is required' } },
          { name: 'rating', label: 'Rating (1–5)', type: 'number', placeholder: '5' },
          { name: 'avatarUrl', label: 'Avatar URL', type: 'url', placeholder: 'https://...' },
          { name: 'isFeatured', label: 'Featured on Homepage', type: 'switch' },
          { name: 'isPublished', label: 'Published', type: 'switch' },
        ]}
      />
    </div>
  )
}
