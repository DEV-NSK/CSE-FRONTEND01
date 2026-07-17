/**
 * FPRD-10: FAQ CMS — Module 8
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { HelpCircle, FolderOpen } from 'lucide-react'
import { CMSTable, type CMSRow } from '@/manager/components/CMSTable'
import { CMSFormModal } from '@/manager/components/CMSFormModal'
import { managerService } from '@/shared/services/manager.service'
import { useToast } from '@/shared/hooks/useToast'
import { ManagerMetricCard } from '@/manager/components/ManagerMetricCard'

interface FaqCategory { id: string; name: string; slug: string; displayOrder: number; isActive: boolean }
interface Faq {
  id: string; categoryId?: string; question: string; answer: string
  searchKeywords?: string; isPublished: boolean; displayOrder: number
  createdAt: string; updatedAt: string
  category?: FaqCategory
}

const TABS = [
  { id: 'faqs',       label: 'Questions',   icon: HelpCircle },
  { id: 'categories', label: 'Categories',  icon: FolderOpen },
]

function FaqsTab() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Faq | null>(null)

  const { data: catsData } = useQuery({
    queryKey: ['manager', 'faq-categories'],
    queryFn: () => managerService.getFaqCategories().then((r) => r.data.data as FaqCategory[] ?? []),
    staleTime: 60_000,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['manager', 'faqs', search, status, page],
    queryFn: () =>
      managerService.getFaqs({
        search: search || undefined,
        isPublished: status === 'published' ? true : status === 'draft' ? false : undefined,
        page,
      }).then((r) => r.data.data as { data: Faq[]; total: number }),
    staleTime: 30_000,
  })

  const createMut = useMutation({
    mutationFn: (d: Partial<Faq>) => managerService.createFaq(d as Record<string, unknown>),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['manager', 'faqs'] }); toast({ title: 'FAQ created' }); setModalOpen(false) },
    onError: () => toast({ title: 'Failed to create', variant: 'destructive' }),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Faq> }) =>
      managerService.updateFaq(id, data as Record<string, unknown>),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['manager', 'faqs'] }); toast({ title: 'FAQ updated' }); setModalOpen(false) },
    onError: () => toast({ title: 'Failed to update', variant: 'destructive' }),
  })
  const deleteMut = useMutation({
    mutationFn: managerService.deleteFaq,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['manager', 'faqs'] }); toast({ title: 'FAQ deleted' }) },
  })

  const rows: CMSRow[] = (data?.data ?? []).map((f: Faq) => ({
    id: f.id, title: f.question,
    isPublished: f.isPublished,
    subtitle: f.category?.name,
    extra: f.searchKeywords?.slice(0, 40) ?? undefined,
    updatedAt: f.updatedAt,
  }))

  const catOptions = (catsData ?? []).map((c: FaqCategory) => ({ value: c.id, label: c.name }))

  return (
    <>
      <CMSTable
        title="FAQs" rows={rows} total={data?.total} page={page} pageSize={20}
        loading={isLoading} search={search} statusFilter={status}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        onStatusChange={(v) => { setStatus(v); setPage(1) }}
        onPageChange={setPage}
        onCreateNew={() => { setEditItem(null); setModalOpen(true) }}
        createLabel="New FAQ"
        onEdit={(row) => { const f = data?.data.find((x: Faq) => x.id === row.id); if (f) { setEditItem(f); setModalOpen(true) } }}
        onDelete={(id) => deleteMut.mutate(id)}
        onPublish={(id) => updateMut.mutate({ id, data: { isPublished: true } })}
        onArchive={(id) => updateMut.mutate({ id, data: { isPublished: false } })}
        actions={{ edit: true, delete: true, publish: true, archive: true }}
      />
      <CMSFormModal<Partial<Faq>>
        open={modalOpen} onClose={() => setModalOpen(false)}
        onSubmit={(d) => editItem ? updateMut.mutateAsync({ id: editItem.id, data: d }) : createMut.mutateAsync(d)}
        title={editItem ? 'Edit FAQ' : 'New FAQ'}
        editValues={editItem ?? undefined}
        isLoading={createMut.isPending || updateMut.isPending}
        autosaveKey={`faq:${editItem?.id ?? 'new'}`}
        size="lg"
        fields={[
          { name: 'question', label: 'Question', placeholder: 'What is...?', rules: { required: 'Question is required' } },
          { name: 'answer', label: 'Answer', type: 'textarea', placeholder: 'The answer is...', rules: { required: 'Answer is required' } },
          { name: 'categoryId', label: 'Category', type: 'select', options: catOptions },
          { name: 'searchKeywords', label: 'Search Keywords', placeholder: 'comma, separated, keywords', hint: 'Helps students find this FAQ' },
          { name: 'displayOrder', label: 'Display Order', type: 'number', placeholder: '0' },
          { name: 'isPublished', label: 'Published', type: 'switch' },
        ]}
      />
    </>
  )
}

function CategoriesTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['manager', 'faq-categories'],
    queryFn: () => managerService.getFaqCategories().then((r) => r.data.data as FaqCategory[] ?? []),
    staleTime: 60_000,
  })
  const rows: CMSRow[] = (data ?? []).map((c: FaqCategory) => ({
    id: c.id, title: c.name,
    status: c.isActive ? 'published' : 'draft',
    extra: `Order: ${c.displayOrder}`,
  }))
  return <CMSTable title="FAQ Categories" rows={rows} loading={isLoading} actions={{ edit: false, delete: false }} />
}

export default function ManagerFaqPage() {
  const [activeTab, setActiveTab] = useState('faqs')
  const { data: countData } = useQuery({
    queryKey: ['manager', 'faqs', '', 'all', 1],
    queryFn: () => managerService.getFaqs({ limit: 1 }).then((r) => (r.data.data as { total?: number })?.total ?? 0),
    staleTime: 60_000,
  })

  return (
    <div className="space-y-5" role="main" aria-label="FAQ Management">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-teal-100 rounded-lg flex items-center justify-center">
          <HelpCircle className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">FAQ CMS</h1>
          <p className="text-xs text-slate-500">Manage frequently asked questions and categories</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ManagerMetricCard title="Total FAQs" value={countData ?? 0} icon={HelpCircle} iconColor="text-teal-600" iconBg="bg-teal-50" />
        <ManagerMetricCard title="Categories" value="—" icon={FolderOpen} iconColor="text-slate-500" iconBg="bg-slate-50" />
      </div>

      <div className="flex items-center gap-1 border-b border-slate-200">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === id ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}>
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'faqs' && <FaqsTab />}
        {activeTab === 'categories' && <CategoriesTab />}
      </div>
    </div>
  )
}
