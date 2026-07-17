/**
 * FPRD-10: Learning CMS — Module 1
 * Real API integration for Categories, Roadmaps, Sections, Lessons, Resources
 * Module 12: Version History via VersionHistoryDrawer
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BookOpen, Tag, Layers, FileText, Link2, History } from 'lucide-react'
import { CMSTable, type CMSRow } from '@/manager/components/CMSTable'
import { CMSFormModal } from '@/manager/components/CMSFormModal'
import { VersionHistoryDrawer } from '@/manager/components/VersionHistoryDrawer'
import { managerService, type Category, type Roadmap, type Lesson, type Resource } from '@/shared/services/manager.service'
import { useToast } from '@/shared/hooks/useToast'
import { ManagerMetricCard } from '@/manager/components/ManagerMetricCard'
import { Button } from '@/shared/components/ui/button'

const TABS = [
  { id: 'categories', label: 'Categories', icon: Tag },
  { id: 'roadmaps', label: 'Roadmaps', icon: Layers },
  { id: 'lessons', label: 'Lessons', icon: FileText },
  { id: 'resources', label: 'Resources', icon: Link2 },
]

// ── Stats row ──────────────────────────────────────────────────────────────────
function useLearningStats() {
  return useQuery({
    queryKey: ['manager', 'cms', 'dashboard'],
    queryFn: () => managerService.getCMSDashboard().then((r) => r.data.data as Record<string, Record<string, number>>),
    staleTime: 60_000,
  })
}

// ── Categories Tab ─────────────────────────────────────────────────────────────
function CategoriesTab() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Category | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['manager', 'categories', search, status, page],
    queryFn: () => managerService.getCategories({ search, status: status !== 'all' ? status as 'published' | 'draft' | 'archived' : undefined, page }).then((r) => r.data.data),
    staleTime: 30_000,
  })

  const createMut = useMutation({
    mutationFn: (d: Partial<Category>) => managerService.createCategory(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['manager', 'categories'] }); toast({ title: 'Category created', variant: 'default' }); setModalOpen(false) },
    onError: () => toast({ title: 'Failed to create category', variant: 'destructive' }),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) => managerService.updateCategory(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['manager', 'categories'] }); toast({ title: 'Category updated' }); setModalOpen(false) },
    onError: () => toast({ title: 'Failed to update', variant: 'destructive' }),
  })

  const deleteMut = useMutation({
    mutationFn: managerService.deleteCategory,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['manager', 'categories'] }); toast({ title: 'Category deleted' }) },
    onError: () => toast({ title: 'Failed to delete', variant: 'destructive' }),
  })

  const rows: CMSRow[] = (data?.data ?? []).map((c: Category) => ({
    id: c.id, title: c.title,
    status: c.isActive ? 'published' : 'draft',
    subtitle: c.description ?? undefined,
    extra: `Order: ${c.displayOrder}`,
    updatedAt: c.updatedAt,
  }))

  return (
    <>
      <CMSTable
        title="Categories" rows={rows} total={data?.total} page={page} pageSize={20}
        loading={isLoading} search={search} statusFilter={status}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        onStatusChange={(v) => { setStatus(v); setPage(1) }}
        onPageChange={setPage}
        onCreateNew={() => { setEditItem(null); setModalOpen(true) }}
        createLabel="New Category"
        onEdit={(row) => { const cat = data?.data.find((c: Category) => c.id === row.id); if (cat) { setEditItem(cat); setModalOpen(true) } }}
        onDelete={(id) => deleteMut.mutate(id)}
        onPublish={(id) => updateMut.mutate({ id, data: { isActive: true } })}
        onArchive={(id) => updateMut.mutate({ id, data: { isActive: false } })}
        actions={{ edit: true, delete: true, publish: true, archive: true }}
      />
      <CMSFormModal<Partial<Category>>
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={(d) => editItem ? updateMut.mutateAsync({ id: editItem.id, data: d }) : createMut.mutateAsync(d)}
        title={editItem ? 'Edit Category' : 'New Category'}
        editValues={editItem ?? undefined}
        isLoading={createMut.isPending || updateMut.isPending}
        fields={[
          { name: 'title', label: 'Title', placeholder: 'Category title', rules: { required: 'Title is required' } },
          { name: 'slug', label: 'Slug', placeholder: 'category-slug', hint: 'URL-friendly identifier' },
          { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Short description...' },
          { name: 'icon', label: 'Icon URL', type: 'url', placeholder: 'https://...' },
          { name: 'displayOrder', label: 'Display Order', type: 'number', placeholder: '0' },
          { name: 'isActive', label: 'Active (Published)', type: 'switch' },
        ]}
      />
    </>
  )
}

// ── Roadmaps Tab ───────────────────────────────────────────────────────────────
function RoadmapsTab() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Roadmap | null>(null)
  // Module 12 — Version History
  const [versionDrawer, setVersionDrawer] = useState<{ open: boolean; id: string; title: string }>({ open: false, id: '', title: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['manager', 'roadmaps', search, status, page],
    queryFn: () => managerService.getRoadmaps({ search, status: status !== 'all' ? status as 'published' | 'draft' : undefined, page }).then((r) => r.data.data),
    staleTime: 30_000,
  })

  const { data: cats } = useQuery({
    queryKey: ['manager', 'categories', '', 'all', 1],
    queryFn: () => managerService.getCategories({ limit: 100 }).then((r) => r.data.data?.data ?? []),
    staleTime: 60_000,
  })

  const createMut = useMutation({
    mutationFn: (d: Partial<Roadmap>) => managerService.createRoadmap(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['manager', 'roadmaps'] }); toast({ title: 'Roadmap created' }); setModalOpen(false) },
    onError: () => toast({ title: 'Failed to create', variant: 'destructive' }),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Roadmap> }) => managerService.updateRoadmap(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['manager', 'roadmaps'] }); toast({ title: 'Roadmap updated' }); setModalOpen(false) },
    onError: () => toast({ title: 'Failed to update', variant: 'destructive' }),
  })
  const deleteMut = useMutation({ mutationFn: managerService.deleteRoadmap, onSuccess: () => { qc.invalidateQueries({ queryKey: ['manager', 'roadmaps'] }); toast({ title: 'Roadmap deleted' }) } })
  const publishMut = useMutation({ mutationFn: managerService.publishRoadmap, onSuccess: () => { qc.invalidateQueries({ queryKey: ['manager', 'roadmaps'] }); toast({ title: 'Roadmap published' }) } })
  const archiveMut = useMutation({ mutationFn: managerService.archiveRoadmap, onSuccess: () => { qc.invalidateQueries({ queryKey: ['manager', 'roadmaps'] }); toast({ title: 'Archived' }) } })
  const dupMut = useMutation({ mutationFn: managerService.duplicateRoadmap, onSuccess: () => { qc.invalidateQueries({ queryKey: ['manager', 'roadmaps'] }); toast({ title: 'Roadmap duplicated' }) } })
  const bulkPublishMut = useMutation({ mutationFn: (ids: string[]) => managerService.bulkPublish('roadmaps', ids), onSuccess: () => qc.invalidateQueries({ queryKey: ['manager', 'roadmaps'] }) })
  const bulkArchiveMut = useMutation({ mutationFn: (ids: string[]) => managerService.bulkArchive('roadmaps', ids), onSuccess: () => qc.invalidateQueries({ queryKey: ['manager', 'roadmaps'] }) })
  const bulkDeleteMut = useMutation({ mutationFn: (ids: string[]) => managerService.bulkDelete('roadmaps', ids), onSuccess: () => qc.invalidateQueries({ queryKey: ['manager', 'roadmaps'] }) })

  const rows: CMSRow[] = (data?.data ?? []).map((r: Roadmap) => ({
    id: r.id, title: r.title,
    isPublished: r.isPublished,
    subtitle: r.category?.title,
    badge: r.difficulty,
    badgeColor: r.difficulty === 'BEGINNER' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : r.difficulty === 'INTERMEDIATE' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200',
    updatedAt: r.updatedAt,
  }))

  const categoryOptions = (cats as Category[] ?? []).map((c: Category) => ({ value: c.id, label: c.title }))

  return (
    <>
      <CMSTable
        title="Roadmaps" rows={rows} total={data?.total} page={page} pageSize={20}
        loading={isLoading} search={search} statusFilter={status}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        onStatusChange={(v) => { setStatus(v); setPage(1) }}
        onPageChange={setPage}
        onCreateNew={() => { setEditItem(null); setModalOpen(true) }}
        createLabel="New Roadmap"
        onEdit={(row) => { const rm = data?.data.find((r: Roadmap) => r.id === row.id); if (rm) { setEditItem(rm); setModalOpen(true) } }}
        onDelete={(id) => deleteMut.mutate(id)}
        onPublish={(id) => publishMut.mutate(id)}
        onArchive={(id) => archiveMut.mutate(id)}
        onDuplicate={(id) => dupMut.mutate(id)}
        onBulkPublish={(ids) => bulkPublishMut.mutate(ids)}
        onBulkArchive={(ids) => bulkArchiveMut.mutate(ids)}
        onBulkDelete={(ids) => bulkDeleteMut.mutate(ids)}
        actions={{ edit: true, delete: true, publish: true, archive: true, duplicate: true }}
        extraFilters={
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 text-slate-600"
            onClick={() => {
              const first = data?.data?.[0]
              if (first) setVersionDrawer({ open: true, id: first.id, title: first.title })
            }}
            disabled={!data?.data?.length}>
            <History className="w-3.5 h-3.5" />
            History
          </Button>
        }
      />
      <CMSFormModal<Partial<Roadmap>>
        open={modalOpen} onClose={() => setModalOpen(false)}
        onSubmit={(d) => editItem ? updateMut.mutateAsync({ id: editItem.id, data: d }) : createMut.mutateAsync(d)}
        title={editItem ? 'Edit Roadmap' : 'New Roadmap'}
        editValues={editItem ?? undefined}
        isLoading={createMut.isPending || updateMut.isPending}
        size="lg"
        fields={[
          { name: 'title', label: 'Roadmap Title', placeholder: 'Full Stack Developer Path', rules: { required: 'Title is required' } },
          { name: 'slug', label: 'Slug', placeholder: 'full-stack-developer-path', hint: 'URL-friendly identifier (auto-generated if blank)' },
          { name: 'categoryId', label: 'Category', type: 'select', options: categoryOptions, rules: { required: 'Category is required' } },
          { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe this roadmap...' },
          { name: 'difficulty', label: 'Difficulty', type: 'select', options: [{ value: 'BEGINNER', label: 'Beginner' }, { value: 'INTERMEDIATE', label: 'Intermediate' }, { value: 'ADVANCED', label: 'Advanced' }] },
          { name: 'estimatedHours', label: 'Estimated Hours', type: 'number', placeholder: '40' },
          { name: 'prerequisites', label: 'Prerequisites', type: 'textarea', placeholder: 'What should students know before starting?' },
          { name: 'learningOutcomes', label: 'Learning Outcomes', type: 'textarea', placeholder: 'What will students achieve?' },
          { name: 'tags', label: 'Tags', placeholder: 'react, typescript, web-dev (comma-separated)' },
          { name: 'visibility', label: 'Visibility', type: 'select', options: [{ value: 'PUBLIC', label: 'Public' }, { value: 'PRIVATE', label: 'Private' }, { value: 'INVITE_ONLY', label: 'Invite Only' }] },
          { name: 'thumbnail', label: 'Thumbnail URL', type: 'url', placeholder: 'https://...' },
          { name: 'banner', label: 'Banner URL', type: 'url', placeholder: 'https://...' },
          { name: 'seoTitle', label: 'SEO Title', placeholder: 'Full Stack Developer Roadmap 2026' },
          { name: 'seoDescription', label: 'SEO Description', type: 'textarea', placeholder: 'Meta description for search engines...' },
        ]}
        autosaveKey={`roadmap:${editItem?.id ?? 'new'}`}
      />
      {/* Module 12 — Version History Drawer */}
      <VersionHistoryDrawer
        open={versionDrawer.open}
        onClose={() => setVersionDrawer((v) => ({ ...v, open: false }))}
        entity="Roadmap"
        entityId={versionDrawer.id}
        entityTitle={versionDrawer.title}
      />
    </>
  )
}

// ── Lessons Tab ────────────────────────────────────────────────────────────────
function LessonsTab() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Lesson | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['manager', 'lessons', search, status, page],
    queryFn: () => managerService.getLessons({ search, status: status !== 'all' ? status as 'published' | 'draft' : undefined, page }).then((r) => r.data.data),
    staleTime: 30_000,
  })

  const createMut = useMutation({
    mutationFn: (d: Partial<Lesson>) => managerService.createLesson(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['manager', 'lessons'] }); toast({ title: 'Lesson created' }); setModalOpen(false) },
    onError: () => toast({ title: 'Failed to create', variant: 'destructive' }),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Lesson> }) => managerService.updateLesson(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['manager', 'lessons'] }); toast({ title: 'Lesson updated' }); setModalOpen(false) },
    onError: () => toast({ title: 'Failed to update', variant: 'destructive' }),
  })
  const deleteMut = useMutation({ mutationFn: managerService.deleteLesson, onSuccess: () => qc.invalidateQueries({ queryKey: ['manager', 'lessons'] }) })
  const updateStatusMut = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) => managerService.updateLesson(id, { isPublished }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['manager', 'lessons'] }),
  })

  const rows: CMSRow[] = (data?.data ?? []).map((l: Lesson) => ({
    id: l.id, title: l.title,
    isPublished: l.isPublished,
    subtitle: l.section?.roadmap?.title,
    badge: l.contentType,
    extra: l.estimatedMinutes ? `${l.estimatedMinutes} min` : undefined,
    updatedAt: l.updatedAt,
  }))

  return (
    <>
      <CMSTable
        title="Lessons" rows={rows} total={data?.total} page={page} pageSize={20}
        loading={isLoading} search={search} statusFilter={status}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        onStatusChange={(v) => { setStatus(v); setPage(1) }}
        onPageChange={setPage}
        onCreateNew={() => { setEditItem(null); setModalOpen(true) }}
        createLabel="New Lesson"
        onEdit={(row) => { const l = data?.data.find((x: Lesson) => x.id === row.id); if (l) { setEditItem(l); setModalOpen(true) } }}
        onDelete={(id) => deleteMut.mutate(id)}
        onPublish={(id) => updateStatusMut.mutate({ id, isPublished: true })}
        onArchive={(id) => updateStatusMut.mutate({ id, isPublished: false })}
        actions={{ edit: true, delete: true, publish: true, archive: true }}
      />
      <CMSFormModal<Partial<Lesson>>
        open={modalOpen} onClose={() => setModalOpen(false)}
        onSubmit={(d) => editItem ? updateMut.mutateAsync({ id: editItem.id, data: d }) : createMut.mutateAsync(d)}
        title={editItem ? 'Edit Lesson' : 'New Lesson'}
        editValues={editItem ?? undefined}
        isLoading={createMut.isPending || updateMut.isPending}
        size="lg"
        fields={[
          { name: 'title', label: 'Lesson Title', placeholder: 'Introduction to Binary Trees', rules: { required: 'Title is required' } },
          { name: 'slug', label: 'Slug', placeholder: 'intro-binary-trees', hint: 'URL-friendly identifier' },
          { name: 'sectionId', label: 'Section ID', placeholder: 'section-uuid', hint: 'The section this lesson belongs to', rules: { required: 'Section is required' } },
          { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Brief lesson overview...' },
          { name: 'content', label: 'Content (Markdown / Rich Text)', type: 'textarea', placeholder: '## Introduction\n\nWrite your lesson content here...' },
          { name: 'contentType', label: 'Content Type', type: 'select', options: [
            { value: 'NOTE', label: 'Note' }, { value: 'VIDEO', label: 'Video' },
            { value: 'ARTICLE', label: 'Article' }, { value: 'QUIZ', label: 'Quiz' },
            { value: 'ASSIGNMENT', label: 'Assignment' }, { value: 'CODING_PROBLEM', label: 'Coding Problem' },
          ] },
          { name: 'estimatedMinutes', label: 'Estimated Minutes', type: 'number', placeholder: '30' },
          { name: 'order', label: 'Display Order', type: 'number', placeholder: '0' },
          { name: 'isPublished', label: 'Published', type: 'switch' },
        ]}
        autosaveKey={`lesson:${editItem?.id ?? 'new'}`}
      />
    </>
  )
}

// ── Resources Tab ──────────────────────────────────────────────────────────────
function ResourcesTab() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Resource | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['manager', 'resources', search, page],
    queryFn: () => managerService.getResources({ search, page }).then((r) => r.data.data),
    staleTime: 30_000,
  })

  const createMut = useMutation({
    mutationFn: (d: Partial<Resource>) => managerService.createResource(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['manager', 'resources'] }); toast({ title: 'Resource created' }); setModalOpen(false) },
    onError: () => toast({ title: 'Failed to create', variant: 'destructive' }),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Resource> }) => managerService.updateResource(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['manager', 'resources'] }); toast({ title: 'Resource updated' }); setModalOpen(false) },
    onError: () => toast({ title: 'Failed to update', variant: 'destructive' }),
  })
  const deleteMut = useMutation({ mutationFn: managerService.deleteResource, onSuccess: () => qc.invalidateQueries({ queryKey: ['manager', 'resources'] }) })

  const rows: CMSRow[] = (data?.data ?? []).map((r: Resource) => ({
    id: r.id, title: r.title,
    status: 'published' as const,
    subtitle: r.lesson?.title,
    badge: r.type,
    extra: r.author ?? undefined,
    createdAt: r.createdAt,
  }))

  return (
    <>
      <CMSTable
        title="Resources" rows={rows} total={data?.total} page={page} pageSize={20}
        loading={isLoading} search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        onPageChange={setPage}
        onCreateNew={() => { setEditItem(null); setModalOpen(true) }}
        createLabel="New Resource"
        onEdit={(row) => { const r = data?.data.find((x: Resource) => x.id === row.id); if (r) { setEditItem(r); setModalOpen(true) } }}
        onDelete={(id) => deleteMut.mutate(id)}
        actions={{ edit: true, delete: true }}
      />
      <CMSFormModal<Partial<Resource>>
        open={modalOpen} onClose={() => setModalOpen(false)}
        onSubmit={(d) => editItem ? updateMut.mutateAsync({ id: editItem.id, data: d }) : createMut.mutateAsync(d)}
        title={editItem ? 'Edit Resource' : 'New Resource'}
        editValues={editItem ?? undefined}
        isLoading={createMut.isPending || updateMut.isPending}
        fields={[
          { name: 'title', label: 'Title', placeholder: 'Resource title', rules: { required: 'Title is required' } },
          { name: 'lessonId', label: 'Lesson ID', placeholder: 'lesson-uuid', rules: { required: 'Lesson is required' } },
          { name: 'type', label: 'Type', type: 'select', rules: { required: 'Type is required' }, options: [
            { value: 'PDF', label: 'PDF' }, { value: 'VIDEO', label: 'Video' },
            { value: 'ARTICLE', label: 'Article' }, { value: 'GITHUB', label: 'GitHub' },
            { value: 'DOCUMENTATION', label: 'Documentation' }, { value: 'PRACTICE_LINK', label: 'Practice Link' },
          ] },
          { name: 'url', label: 'URL', type: 'url', placeholder: 'https://...', rules: { required: 'URL is required' } },
          { name: 'author', label: 'Author', placeholder: 'Author name' },
          { name: 'duration', label: 'Duration (minutes)', type: 'number', placeholder: '15' },
        ]}
      />
    </>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ManagerLearningPage() {
  const [activeTab, setActiveTab] = useState('categories')
  const { data: stats } = useLearningStats()
  const learning = (stats as Record<string, Record<string, number>> | undefined)?.learning ?? {}

  return (
    <div className="space-y-5" role="main" aria-label="Learning Management CMS">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-violet-100 rounded-lg flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Learning CMS</h1>
          <p className="text-xs text-slate-500">Manage categories, roadmaps, lessons and resources</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ManagerMetricCard title="Categories" value={learning.totalCategories ?? '—'} icon={Tag} iconColor="text-violet-600" iconBg="bg-violet-50" />
        <ManagerMetricCard title="Published Roadmaps" value={learning.publishedRoadmaps ?? '—'} icon={Layers} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <ManagerMetricCard title="Total Lessons" value={learning.totalLessons ?? '—'} icon={FileText} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        <ManagerMetricCard title="Resources" value={learning.totalResources ?? '—'} icon={Link2} iconColor="text-orange-600" iconBg="bg-orange-50" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200" role="tablist">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} role="tab" aria-selected={activeTab === id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
              activeTab === id ? 'border-violet-600 text-violet-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}>
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div role="tabpanel">
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'roadmaps' && <RoadmapsTab />}
        {activeTab === 'lessons' && <LessonsTab />}
        {activeTab === 'resources' && <ResourcesTab />}
      </div>
    </div>
  )
}
