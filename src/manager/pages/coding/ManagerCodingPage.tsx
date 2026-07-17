/**
 * FPRD-10: Coding CMS — Module 2
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Code2, Tag, Building2, FileCode, BarChart3 } from 'lucide-react'
import { CMSTable, type CMSRow } from '@/manager/components/CMSTable'
import { CMSFormModal } from '@/manager/components/CMSFormModal'
import { managerService, type CodingProblem, type ProblemCategory } from '@/shared/services/manager.service'
import { useToast } from '@/shared/hooks/useToast'
import { ManagerMetricCard } from '@/manager/components/ManagerMetricCard'

const TABS = [
  { id: 'problems', label: 'Problems', icon: FileCode },
  { id: 'categories', label: 'Categories', icon: Tag },
  { id: 'companies', label: 'Companies', icon: Building2 },
]

// ── Problems Tab ───────────────────────────────────────────────────────────────
function ProblemsTab() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<CodingProblem | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['manager', 'problems', search, status, page],
    queryFn: () => managerService.getProblems({ search, status: status !== 'all' ? status as 'published' | 'draft' : undefined, page }).then((r) => r.data.data),
    staleTime: 30_000,
  })

  const { data: cats } = useQuery({
    queryKey: ['manager', 'problem-categories'],
    queryFn: () => managerService.getProblemCategories({ limit: 100 }).then((r) => r.data.data?.data ?? []),
    staleTime: 60_000,
  })

  const createMut = useMutation({
    mutationFn: (d: Partial<CodingProblem>) => managerService.createProblem(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['manager', 'problems'] }); toast({ title: 'Problem created' }); setModalOpen(false) },
    onError: () => toast({ title: 'Failed to create', variant: 'destructive' }),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CodingProblem> }) => managerService.updateProblem(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['manager', 'problems'] }); toast({ title: 'Problem updated' }); setModalOpen(false) },
    onError: () => toast({ title: 'Failed to update', variant: 'destructive' }),
  })
  const deleteMut = useMutation({ mutationFn: managerService.deleteProblem, onSuccess: () => qc.invalidateQueries({ queryKey: ['manager', 'problems'] }) })
  const publishMut = useMutation({ mutationFn: managerService.publishProblem, onSuccess: () => qc.invalidateQueries({ queryKey: ['manager', 'problems'] }) })
  const archiveMut = useMutation({ mutationFn: managerService.archiveProblem, onSuccess: () => qc.invalidateQueries({ queryKey: ['manager', 'problems'] }) })
  const dupMut = useMutation({ mutationFn: managerService.duplicateProblem, onSuccess: () => { qc.invalidateQueries({ queryKey: ['manager', 'problems'] }); toast({ title: 'Problem duplicated' }) } })
  const bulkPublishMut = useMutation({ mutationFn: (ids: string[]) => managerService.bulkPublish('problems', ids), onSuccess: () => qc.invalidateQueries({ queryKey: ['manager', 'problems'] }) })
  const bulkArchiveMut = useMutation({ mutationFn: (ids: string[]) => managerService.bulkArchive('problems', ids), onSuccess: () => qc.invalidateQueries({ queryKey: ['manager', 'problems'] }) })
  const bulkDeleteMut = useMutation({ mutationFn: (ids: string[]) => managerService.bulkDelete('problems', ids), onSuccess: () => qc.invalidateQueries({ queryKey: ['manager', 'problems'] }) })

  const rows: CMSRow[] = (data?.data ?? []).map((p: CodingProblem) => ({
    id: p.id, title: p.title,
    isPublished: p.isPublished,
    subtitle: p.category?.name,
    badge: p.difficulty,
    badgeColor: p.difficulty === 'EASY' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : p.difficulty === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200',
    extra: `${p.acceptanceRate.toFixed(1)}% acceptance`,
    updatedAt: p.updatedAt,
  }))

  const categoryOptions = (cats as ProblemCategory[] ?? []).map((c: ProblemCategory) => ({ value: c.id, label: c.name }))

  return (
    <>
      <CMSTable
        title="Problems" rows={rows} total={data?.total} page={page} pageSize={20}
        loading={isLoading} search={search} statusFilter={status}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        onStatusChange={(v) => { setStatus(v); setPage(1) }}
        onPageChange={setPage}
        onCreateNew={() => { setEditItem(null); setModalOpen(true) }}
        createLabel="New Problem"
        onEdit={(row) => { const p = data?.data.find((x: CodingProblem) => x.id === row.id); if (p) { setEditItem(p); setModalOpen(true) } }}
        onDelete={(id) => deleteMut.mutate(id)}
        onPublish={(id) => publishMut.mutate(id)}
        onArchive={(id) => archiveMut.mutate(id)}
        onDuplicate={(id) => dupMut.mutate(id)}
        onBulkPublish={(ids) => bulkPublishMut.mutate(ids)}
        onBulkArchive={(ids) => bulkArchiveMut.mutate(ids)}
        onBulkDelete={(ids) => bulkDeleteMut.mutate(ids)}
        actions={{ edit: true, delete: true, publish: true, archive: true, duplicate: true }}
      />
      <CMSFormModal<Partial<CodingProblem>>
        open={modalOpen} onClose={() => setModalOpen(false)}
        onSubmit={(d) => editItem ? updateMut.mutateAsync({ id: editItem.id, data: d }) : createMut.mutateAsync(d)}
        title={editItem ? 'Edit Problem' : 'New Problem'}
        editValues={editItem ?? undefined}
        isLoading={createMut.isPending || updateMut.isPending}
        size="lg"
        fields={[
          { name: 'title', label: 'Problem Title', placeholder: 'Two Sum', rules: { required: 'Title is required' } },
          { name: 'slug', label: 'Slug', placeholder: 'two-sum', hint: 'URL slug' },
          { name: 'categoryId', label: 'Category', type: 'select', options: categoryOptions, rules: { required: 'Category is required' } },
          { name: 'difficulty', label: 'Difficulty', type: 'select', rules: { required: 'Difficulty is required' }, options: [
            { value: 'EASY', label: 'Easy' }, { value: 'MEDIUM', label: 'Medium' }, { value: 'HARD', label: 'Hard' },
          ] },
          { name: 'description', label: 'Short Description', type: 'textarea', placeholder: 'Brief problem description...' },
          { name: 'problemStatement', label: 'Problem Statement', type: 'textarea', placeholder: 'Full problem statement...', rules: { required: 'Problem statement is required' } },
          { name: 'inputFormat', label: 'Input Format', type: 'textarea', placeholder: 'Describe the input...' },
          { name: 'outputFormat', label: 'Output Format', type: 'textarea', placeholder: 'Describe the expected output...' },
          { name: 'constraints', label: 'Constraints', type: 'textarea', placeholder: '1 ≤ n ≤ 10^5' },
          { name: 'sampleInput', label: 'Sample Input', type: 'textarea', placeholder: '[2, 7, 11, 15]\n9' },
          { name: 'sampleOutput', label: 'Sample Output', type: 'textarea', placeholder: '[0, 1]' },
          { name: 'timeLimit', label: 'Time Limit (ms)', type: 'number', placeholder: '1000' },
          { name: 'memoryLimit', label: 'Memory Limit (MB)', type: 'number', placeholder: '256' },
          { name: 'points', label: 'Points', type: 'number', placeholder: '0' },
        ]}
      />
    </>
  )
}

// ── Problem Categories Tab ─────────────────────────────────────────────────────
function ProblemCategoriesTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['manager', 'problem-categories-list'],
    queryFn: () => managerService.getProblemCategories({ limit: 100 }).then((r) => r.data.data),
    staleTime: 60_000,
  })

  const rows: CMSRow[] = (data?.data ?? []).map((c: ProblemCategory) => ({
    id: c.id, title: c.name,
    status: c.isActive ? 'published' : 'draft',
    extra: c.description ?? undefined,
    createdAt: c.createdAt,
  }))

  return (
    <CMSTable
      title="Problem Categories" rows={rows} loading={isLoading}
      actions={{ edit: false, delete: false }}
    />
  )
}

// ── Companies Tab ──────────────────────────────────────────────────────────────
function CompaniesTab() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['manager', 'companies', search, page],
    queryFn: () => managerService.getCompanies({ search, page }).then((r) => r.data.data),
    staleTime: 30_000,
  })

  const deleteMut = useMutation({
    mutationFn: managerService.deleteCompany,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['manager', 'companies'] }); toast({ title: 'Company deleted' }) },
  })

  const rows: CMSRow[] = (data?.data ?? []).map((c: { id: string; name: string; industry?: string; verified: boolean }) => ({
    id: c.id, title: c.name,
    status: c.verified ? 'published' : 'draft',
    extra: c.industry ?? undefined,
  }))

  return (
    <CMSTable
      title="Companies (Coding)" rows={rows} total={data?.total} page={page} pageSize={20}
      loading={isLoading} search={search}
      onSearchChange={(v) => { setSearch(v); setPage(1) }}
      onPageChange={setPage}
      onCreateNew={() => setModalOpen(true)}
      createLabel="Add Company"
      onDelete={(id) => deleteMut.mutate(id)}
      actions={{ edit: false, delete: true }}
    />
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ManagerCodingPage() {
  const [activeTab, setActiveTab] = useState('problems')

  const { data: stats } = useQuery({
    queryKey: ['manager', 'cms', 'dashboard'],
    queryFn: () => managerService.getCMSDashboard().then((r) => r.data.data as Record<string, Record<string, number>>),
    staleTime: 60_000,
  })
  const coding = (stats as Record<string, Record<string, number>> | undefined)?.coding ?? {}

  return (
    <div className="space-y-5" role="main" aria-label="Coding Management CMS">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
          <Code2 className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Coding CMS</h1>
          <p className="text-xs text-slate-500">Manage problems, tags, companies and daily challenges</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <ManagerMetricCard title="Total Problems" value={coding.totalProblems ?? '—'} icon={FileCode} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        <ManagerMetricCard title="Published" value={coding.publishedProblems ?? '—'} icon={Code2} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <ManagerMetricCard title="Drafts" value={coding.draftProblems ?? '—'} icon={BarChart3} iconColor="text-amber-600" iconBg="bg-amber-50" />
      </div>

      <div className="flex items-center gap-1 border-b border-slate-200" role="tablist">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} role="tab" aria-selected={activeTab === id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
              activeTab === id ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}>
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {activeTab === 'problems' && <ProblemsTab />}
        {activeTab === 'categories' && <ProblemCategoriesTab />}
        {activeTab === 'companies' && <CompaniesTab />}
      </div>
    </div>
  )
}
