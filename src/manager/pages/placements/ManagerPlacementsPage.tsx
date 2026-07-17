/**
 * FPRD-10: Placement CMS — Module 4
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Briefcase, Building2 } from 'lucide-react'
import { CMSTable, type CMSRow } from '@/manager/components/CMSTable'
import { CMSFormModal } from '@/manager/components/CMSFormModal'
import { managerService, type Company, type JobPosting } from '@/shared/services/manager.service'
import { useToast } from '@/shared/hooks/useToast'
import { ManagerMetricCard } from '@/manager/components/ManagerMetricCard'

const TABS = [
  { id: 'companies', label: 'Companies', icon: Building2 },
  { id: 'jobs', label: 'Jobs', icon: Briefcase },
]

// ── Companies Tab ──────────────────────────────────────────────────────────────
function CompaniesTab() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Company | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['manager', 'placement-companies', search, page],
    queryFn: () => managerService.getCompanies({ search, page }).then((r) => r.data.data),
    staleTime: 30_000,
  })

  const createMut = useMutation({
    mutationFn: (d: Partial<Company>) => managerService.createCompany(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['manager', 'placement-companies'] }); toast({ title: 'Company created' }); setModalOpen(false) },
    onError: () => toast({ title: 'Failed to create', variant: 'destructive' }),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Company> }) => managerService.updateCompany(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['manager', 'placement-companies'] }); toast({ title: 'Company updated' }); setModalOpen(false) },
    onError: () => toast({ title: 'Failed to update', variant: 'destructive' }),
  })
  const deleteMut = useMutation({ mutationFn: managerService.deleteCompany, onSuccess: () => qc.invalidateQueries({ queryKey: ['manager', 'placement-companies'] }) })

  const rows: CMSRow[] = (data?.data ?? []).map((c: Company) => ({
    id: c.id, title: c.name,
    status: c.verified ? 'published' : 'draft',
    badge: c.industry ?? undefined,
    extra: c.website ?? undefined,
  }))

  return (
    <>
      <CMSTable
        title="Companies" rows={rows} total={data?.total} page={page} pageSize={20}
        loading={isLoading} search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        onPageChange={setPage}
        onCreateNew={() => { setEditItem(null); setModalOpen(true) }}
        createLabel="Add Company"
        onEdit={(row) => { const c = data?.data.find((x: Company) => x.id === row.id); if (c) { setEditItem(c); setModalOpen(true) } }}
        onDelete={(id) => deleteMut.mutate(id)}
        actions={{ edit: true, delete: true }}
      />
      <CMSFormModal<Partial<Company>>
        open={modalOpen} onClose={() => setModalOpen(false)}
        onSubmit={(d) => editItem ? updateMut.mutateAsync({ id: editItem.id, data: d }) : createMut.mutateAsync(d)}
        title={editItem ? 'Edit Company' : 'Add Company'}
        editValues={editItem ?? undefined}
        isLoading={createMut.isPending || updateMut.isPending}
        size="lg"
        fields={[
          { name: 'name', label: 'Company Name', placeholder: 'Google', rules: { required: 'Name is required' } },
          { name: 'slug', label: 'Slug', placeholder: 'google', hint: 'URL-friendly identifier' },
          { name: 'industry', label: 'Industry', placeholder: 'Technology' },
          { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Company description...' },
          { name: 'website', label: 'Website', type: 'url', placeholder: 'https://google.com' },
          { name: 'headquarters', label: 'Headquarters', placeholder: 'Mountain View, CA' },
          { name: 'careersUrl', label: 'Careers URL', type: 'url', placeholder: 'https://careers.google.com' },
          { name: 'logo', label: 'Logo URL', type: 'url', placeholder: 'https://...' },
          { name: 'verified', label: 'Verified Company', type: 'switch' },
        ]}
      />
    </>
  )
}

// ── Jobs Tab ───────────────────────────────────────────────────────────────────
function JobsTab() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<JobPosting | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['manager', 'jobs', search, status, page],
    queryFn: () => managerService.getJobs({ search, status: status !== 'all' ? status as 'published' | 'draft' : undefined, page }).then((r) => r.data.data),
    staleTime: 30_000,
  })

  const { data: companies } = useQuery({
    queryKey: ['manager', 'placement-companies', '', 1],
    queryFn: () => managerService.getCompanies({ limit: 200 }).then((r) => r.data.data?.data ?? []),
    staleTime: 60_000,
  })

  const createMut = useMutation({
    mutationFn: (d: Partial<JobPosting>) => managerService.createJob(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['manager', 'jobs'] }); toast({ title: 'Job created' }); setModalOpen(false) },
    onError: () => toast({ title: 'Failed to create', variant: 'destructive' }),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<JobPosting> }) => managerService.updateJob(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['manager', 'jobs'] }); toast({ title: 'Job updated' }); setModalOpen(false) },
    onError: () => toast({ title: 'Failed to update', variant: 'destructive' }),
  })
  const deleteMut = useMutation({ mutationFn: managerService.deleteJob, onSuccess: () => qc.invalidateQueries({ queryKey: ['manager', 'jobs'] }) })
  const publishMut = useMutation({ mutationFn: managerService.publishJob, onSuccess: () => qc.invalidateQueries({ queryKey: ['manager', 'jobs'] }) })
  const bulkDeleteMut = useMutation({ mutationFn: (ids: string[]) => managerService.bulkDelete('jobs', ids), onSuccess: () => qc.invalidateQueries({ queryKey: ['manager', 'jobs'] }) })

  const rows: CMSRow[] = (data?.data ?? []).map((j: JobPosting) => ({
    id: j.id, title: j.title,
    isPublished: j.isPublished,
    subtitle: j.company?.name,
    badge: j.type,
    badgeColor: j.type === 'INTERNSHIP' ? 'bg-blue-50 text-blue-700 border-blue-200' : j.type === 'FULL_TIME' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200',
    extra: j.workMode,
    updatedAt: j.updatedAt,
  }))

  const companyOptions = (companies as Company[] ?? []).map((c: Company) => ({ value: c.id, label: c.name }))

  return (
    <>
      <CMSTable
        title="Jobs" rows={rows} total={data?.total} page={page} pageSize={20}
        loading={isLoading} search={search} statusFilter={status}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        onStatusChange={(v) => { setStatus(v); setPage(1) }}
        onPageChange={setPage}
        onCreateNew={() => { setEditItem(null); setModalOpen(true) }}
        createLabel="Post Job"
        onEdit={(row) => { const j = data?.data.find((x: JobPosting) => x.id === row.id); if (j) { setEditItem(j); setModalOpen(true) } }}
        onDelete={(id) => deleteMut.mutate(id)}
        onPublish={(id) => publishMut.mutate(id)}
        onBulkDelete={(ids) => bulkDeleteMut.mutate(ids)}
        actions={{ edit: true, delete: true, publish: true }}
      />
      <CMSFormModal<Partial<JobPosting>>
        open={modalOpen} onClose={() => setModalOpen(false)}
        onSubmit={(d) => editItem ? updateMut.mutateAsync({ id: editItem.id, data: d }) : createMut.mutateAsync(d)}
        title={editItem ? 'Edit Job' : 'Post New Job'}
        editValues={editItem ?? undefined}
        isLoading={createMut.isPending || updateMut.isPending}
        size="lg"
        fields={[
          { name: 'title', label: 'Job Title', placeholder: 'Software Engineer', rules: { required: 'Title is required' } },
          { name: 'companyId', label: 'Company', type: 'select', options: companyOptions, rules: { required: 'Company is required' } },
          { name: 'type', label: 'Job Type', type: 'select', rules: { required: 'Type is required' }, options: [
            { value: 'FULL_TIME', label: 'Full-Time' }, { value: 'INTERNSHIP', label: 'Internship' }, { value: 'PART_TIME', label: 'Part-Time' },
          ] },
          { name: 'workMode', label: 'Work Mode', type: 'select', options: [
            { value: 'ONSITE', label: 'On-site' }, { value: 'REMOTE', label: 'Remote' }, { value: 'HYBRID', label: 'Hybrid' },
          ] },
          { name: 'location', label: 'Location', placeholder: 'Bangalore, India' },
          { name: 'description', label: 'Job Description', type: 'textarea', rules: { required: 'Description is required' }, placeholder: 'Describe the role...' },
          { name: 'requirements', label: 'Requirements', type: 'textarea', placeholder: 'What qualifications are needed?' },
          { name: 'salaryRange', label: 'Salary Range', placeholder: '₹15–25 LPA' },
          { name: 'experienceRequired', label: 'Experience Required', placeholder: '0–2 years' },
          { name: 'applicationUrl', label: 'Application URL', type: 'url', placeholder: 'https://...' },
          { name: 'applicationDeadline', label: 'Application Deadline', type: 'datetime-local' },
        ]}
      />
    </>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ManagerPlacementsPage() {
  const [activeTab, setActiveTab] = useState('companies')

  const { data: stats } = useQuery({
    queryKey: ['manager', 'cms', 'dashboard'],
    queryFn: () => managerService.getCMSDashboard().then((r) => r.data.data as Record<string, Record<string, number>>),
    staleTime: 60_000,
  })
  const placements = (stats as Record<string, Record<string, number>> | undefined)?.placements ?? {}

  return (
    <div className="space-y-5" role="main" aria-label="Placement Management CMS">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-pink-100 rounded-lg flex items-center justify-center">
          <Briefcase className="w-5 h-5 text-pink-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Placement CMS</h1>
          <p className="text-xs text-slate-500">Manage companies, jobs and placements</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <ManagerMetricCard title="Companies" value={placements.totalCompanies ?? '—'} icon={Building2} iconColor="text-pink-600" iconBg="bg-pink-50" />
        <ManagerMetricCard title="Total Jobs" value={placements.totalJobs ?? '—'} icon={Briefcase} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <ManagerMetricCard title="Active Jobs" value={placements.publishedJobs ?? '—'} icon={Briefcase} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
      </div>

      <div className="flex items-center gap-1 border-b border-slate-200" role="tablist">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} role="tab" aria-selected={activeTab === id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
              activeTab === id ? 'border-pink-500 text-pink-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}>
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {activeTab === 'companies' && <CompaniesTab />}
        {activeTab === 'jobs' && <JobsTab />}
      </div>
    </div>
  )
}
