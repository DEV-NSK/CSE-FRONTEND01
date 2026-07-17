/**
 * FPRD-10: Projects CMS — Module 3
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FolderKanban, Tag, Cpu } from 'lucide-react'
import { CMSTable, type CMSRow } from '@/manager/components/CMSTable'
import { CMSFormModal } from '@/manager/components/CMSFormModal'
import { managerService, type Project, type ProjectCategory } from '@/shared/services/manager.service'
import { useToast } from '@/shared/hooks/useToast'
import { ManagerMetricCard } from '@/manager/components/ManagerMetricCard'

const TABS = [
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'categories', label: 'Categories', icon: Tag },
]

function ProjectsTab() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Project | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['manager', 'projects', search, status, page],
    queryFn: () => managerService.getProjects({ search, status: status !== 'all' ? status as 'published' | 'draft' : undefined, page }).then((r) => r.data.data),
    staleTime: 30_000,
  })

  const { data: cats } = useQuery({
    queryKey: ['manager', 'project-categories'],
    queryFn: () => managerService.getProjectCategories({ limit: 100 }).then((r) => r.data.data?.data ?? []),
    staleTime: 60_000,
  })

  const createMut = useMutation({
    mutationFn: (d: Partial<Project>) => managerService.createProject(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['manager', 'projects'] }); toast({ title: 'Project created' }); setModalOpen(false) },
    onError: () => toast({ title: 'Failed to create', variant: 'destructive' }),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) => managerService.updateProject(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['manager', 'projects'] }); toast({ title: 'Project updated' }); setModalOpen(false) },
    onError: () => toast({ title: 'Failed to update', variant: 'destructive' }),
  })
  const deleteMut = useMutation({ mutationFn: managerService.deleteProject, onSuccess: () => qc.invalidateQueries({ queryKey: ['manager', 'projects'] }) })
  const publishMut = useMutation({ mutationFn: managerService.publishProject, onSuccess: () => qc.invalidateQueries({ queryKey: ['manager', 'projects'] }) })
  const archiveMut = useMutation({ mutationFn: managerService.archiveProject, onSuccess: () => qc.invalidateQueries({ queryKey: ['manager', 'projects'] }) })
  const bulkPublishMut = useMutation({ mutationFn: (ids: string[]) => managerService.bulkPublish('projects', ids), onSuccess: () => qc.invalidateQueries({ queryKey: ['manager', 'projects'] }) })
  const bulkArchiveMut = useMutation({ mutationFn: (ids: string[]) => managerService.bulkArchive('projects', ids), onSuccess: () => qc.invalidateQueries({ queryKey: ['manager', 'projects'] }) })
  const bulkDeleteMut = useMutation({ mutationFn: (ids: string[]) => managerService.bulkDelete('projects', ids), onSuccess: () => qc.invalidateQueries({ queryKey: ['manager', 'projects'] }) })

  const rows: CMSRow[] = (data?.data ?? []).map((p: Project) => ({
    id: p.id, title: p.title,
    isPublished: p.isPublished,
    subtitle: p.category?.name,
    badge: p.difficulty,
    badgeColor: p.difficulty === 'BEGINNER' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : p.difficulty === 'INTERMEDIATE' ? 'bg-amber-50 text-amber-700 border-amber-200'
      : p.difficulty === 'ADVANCED' ? 'bg-orange-50 text-orange-700 border-orange-200'
      : 'bg-red-50 text-red-700 border-red-200',
    extra: p.estimatedDuration ?? undefined,
    updatedAt: p.updatedAt,
  }))

  const categoryOptions = (cats as ProjectCategory[] ?? []).map((c: ProjectCategory) => ({ value: c.id, label: c.name }))

  return (
    <>
      <CMSTable
        title="Projects" rows={rows} total={data?.total} page={page} pageSize={20}
        loading={isLoading} search={search} statusFilter={status}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        onStatusChange={(v) => { setStatus(v); setPage(1) }}
        onPageChange={setPage}
        onCreateNew={() => { setEditItem(null); setModalOpen(true) }}
        createLabel="New Project"
        onEdit={(row) => { const p = data?.data.find((x: Project) => x.id === row.id); if (p) { setEditItem(p); setModalOpen(true) } }}
        onDelete={(id) => deleteMut.mutate(id)}
        onPublish={(id) => publishMut.mutate(id)}
        onArchive={(id) => archiveMut.mutate(id)}
        onBulkPublish={(ids) => bulkPublishMut.mutate(ids)}
        onBulkArchive={(ids) => bulkArchiveMut.mutate(ids)}
        onBulkDelete={(ids) => bulkDeleteMut.mutate(ids)}
        actions={{ edit: true, delete: true, publish: true, archive: true }}
      />
      <CMSFormModal<Partial<Project>>
        open={modalOpen} onClose={() => setModalOpen(false)}
        onSubmit={(d) => editItem ? updateMut.mutateAsync({ id: editItem.id, data: d }) : createMut.mutateAsync(d)}
        title={editItem ? 'Edit Project' : 'New Project'}
        editValues={editItem ?? undefined}
        isLoading={createMut.isPending || updateMut.isPending}
        size="lg"
        fields={[
          { name: 'title', label: 'Project Name', placeholder: 'E-Commerce Platform', rules: { required: 'Title is required' } },
          { name: 'slug', label: 'Slug', placeholder: 'ecommerce-platform' },
          { name: 'categoryId', label: 'Category', type: 'select', options: categoryOptions, rules: { required: 'Category is required' } },
          { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Brief project description...' },
          { name: 'overview', label: 'Full Overview', type: 'textarea', placeholder: 'Detailed project overview...' },
          { name: 'difficulty', label: 'Difficulty', type: 'select', options: [
            { value: 'BEGINNER', label: 'Beginner' }, { value: 'INTERMEDIATE', label: 'Intermediate' },
            { value: 'ADVANCED', label: 'Advanced' }, { value: 'EXPERT', label: 'Expert' },
          ] },
          { name: 'estimatedDuration', label: 'Estimated Duration', placeholder: '4-6 weeks' },
          { name: 'githubRepository', label: 'GitHub Repository URL', type: 'url', placeholder: 'https://github.com/...' },
          { name: 'liveDemo', label: 'Live Demo URL', type: 'url', placeholder: 'https://...' },
          { name: 'requirements', label: 'Requirements', type: 'textarea', placeholder: 'What do students need to complete this?' },
          { name: 'learningOutcomes', label: 'Learning Outcomes', type: 'textarea', placeholder: 'What will students learn?' },
          { name: 'thumbnail', label: 'Thumbnail URL', type: 'url', placeholder: 'https://...' },
        ]}
      />
    </>
  )
}

function ProjectCategoriesTab() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<ProjectCategory | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['manager', 'project-categories-list', search, page],
    queryFn: () => managerService.getProjectCategories({ search: search || undefined, page, limit: 20 }).then((r) => r.data.data),
    staleTime: 30_000,
  })

  const createMut = useMutation({
    mutationFn: (d: Partial<ProjectCategory>) => managerService.createProjectCategory(d as { name: string; slug: string; description?: string; icon?: string }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['manager', 'project-categories'] }); qc.invalidateQueries({ queryKey: ['manager', 'project-categories-list'] }); toast({ title: 'Category created' }); setModalOpen(false) },
    onError: (e: Error) => toast({ title: e.message, variant: 'destructive' }),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProjectCategory> }) => managerService.updateProjectCategory(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['manager', 'project-categories-list'] }); toast({ title: 'Category updated' }); setModalOpen(false) },
    onError: (e: Error) => toast({ title: e.message, variant: 'destructive' }),
  })
  const deleteMut = useMutation({
    mutationFn: managerService.deleteProjectCategory,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['manager', 'project-categories-list'] }); toast({ title: 'Category deleted' }) },
    onError: (e: Error) => toast({ title: e.message, variant: 'destructive' }),
  })

  const rows: CMSRow[] = (data?.data ?? []).map((c: ProjectCategory) => ({
    id: c.id, title: c.name,
    status: c.isActive ? 'published' : 'draft',
    extra: c.description ?? undefined,
  }))

  return (
    <>
      <CMSTable
        title="Project Categories" rows={rows} total={data?.total} page={page} pageSize={20}
        loading={isLoading} search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        onPageChange={setPage}
        onCreateNew={() => { setEditItem(null); setModalOpen(true) }}
        createLabel="New Category"
        onEdit={(row) => { const c = data?.data.find((x: ProjectCategory) => x.id === row.id); if (c) { setEditItem(c); setModalOpen(true) } }}
        onDelete={(id) => deleteMut.mutate(id)}
        actions={{ edit: true, delete: true }}
      />
      <CMSFormModal<Partial<ProjectCategory>>
        open={modalOpen} onClose={() => setModalOpen(false)}
        onSubmit={(d) => editItem ? updateMut.mutateAsync({ id: editItem.id, data: d }) : createMut.mutateAsync(d)}
        title={editItem ? 'Edit Category' : 'New Project Category'}
        editValues={editItem ?? undefined}
        isLoading={createMut.isPending || updateMut.isPending}
        fields={[
          { name: 'name', label: 'Category Name', placeholder: 'Web Development', rules: { required: 'Name is required' } },
          { name: 'slug', label: 'Slug', placeholder: 'web-development', hint: 'URL-friendly identifier' },
          { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Short description...' },
          { name: 'icon', label: 'Icon URL or emoji', placeholder: '🌐 or https://…' },
          { name: 'displayOrder', label: 'Display Order', type: 'number', placeholder: '0' },
          { name: 'isActive', label: 'Active', type: 'switch' },
        ]}
      />
    </>
  )
}

export default function ManagerProjectsPage() {
  const [activeTab, setActiveTab] = useState('projects')

  const { data: stats } = useQuery({
    queryKey: ['manager', 'cms', 'dashboard'],
    queryFn: () => managerService.getCMSDashboard().then((r) => r.data.data as Record<string, Record<string, number>>),
    staleTime: 60_000,
  })
  const projects = (stats as Record<string, Record<string, number>> | undefined)?.projects ?? {}

  return (
    <div className="space-y-5" role="main" aria-label="Projects Management CMS">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center">
          <FolderKanban className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Projects CMS</h1>
          <p className="text-xs text-slate-500">Manage projects, categories and technologies</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ManagerMetricCard title="Total Projects" value={projects.totalProjects ?? '—'} icon={FolderKanban} iconColor="text-orange-600" iconBg="bg-orange-50" />
        <ManagerMetricCard title="Published" value={projects.publishedProjects ?? '—'} icon={Cpu} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
      </div>

      <div className="flex items-center gap-1 border-b border-slate-200" role="tablist">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} role="tab" aria-selected={activeTab === id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
              activeTab === id ? 'border-orange-500 text-orange-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}>
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {activeTab === 'projects' && <ProjectsTab />}
        {activeTab === 'categories' && <ProjectCategoriesTab />}
      </div>
    </div>
  )
}
