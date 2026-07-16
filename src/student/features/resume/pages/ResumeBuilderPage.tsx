import { useState, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Download, Save, LayoutTemplate, Target } from 'lucide-react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { ResumeSectionEditor } from '@/student/components/placement/ResumeSectionEditor'
import { ResumePreview } from '@/student/components/placement/ResumePreview'
import { ResumeBuilderSkeleton } from '@/student/components/placement/PlacementSkeletons'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { useResumes, useUpdateResume, useAddResumeSection, useUpdateResumeSection, useDeleteResumeSection, useReorderResumeSections, useAtsScore } from '@/shared/hooks/useResume'
import { useToast } from '@/shared/hooks/useToast'
import type { Resume, ResumeSectionType } from '@/shared/types/placement'
import { FileText } from 'lucide-react'

const SECTION_TYPES: { type: ResumeSectionType; label: string }[] = [
  { type: 'personal_info', label: 'Personal Info' },
  { type: 'education', label: 'Education' },
  { type: 'experience', label: 'Experience' },
  { type: 'skills', label: 'Skills' },
  { type: 'projects', label: 'Projects' },
  { type: 'certifications', label: 'Certifications' },
  { type: 'achievements', label: 'Achievements' },
]

function SortableSection({ id, children }: { id: string; children: (props: object) => React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  return (
    <div ref={setNodeRef} style={style}>
      {children({ dragHandleProps: { ...attributes, ...listeners }, isDragging })}
    </div>
  )
}

export function ResumeBuilderPage() {
  const { data: resumes, isLoading } = useResumes()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const { toast } = useToast()
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const resume: Resume | undefined = resumes?.[0] ?? (activeId ? resumes?.find((r) => r.id === activeId) : undefined)

  const updateResume = useUpdateResume()
  const addSection = useAddResumeSection(resume?.id ?? '')
  const updateSection = useUpdateResumeSection(resume?.id ?? '')
  const deleteSection = useDeleteResumeSection(resume?.id ?? '')
  const reorderSections = useReorderResumeSections(resume?.id ?? '')
  const { data: atsData } = useAtsScore(resume?.id ?? '')

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleUpdate = useCallback((sectionId: string, content: Record<string, unknown>) => {
    if (!resume) return
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
    autoSaveRef.current = setTimeout(async () => {
      try {
        await updateSection.mutateAsync({ sectionId, data: { content } })
      } catch { /* silent autosave */ }
    }, 800)
  }, [resume, updateSection])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id || !resume) return
    const oldIndex = resume.sections.findIndex((s) => s.id === active.id)
    const newIndex = resume.sections.findIndex((s) => s.id === over.id)
    const reordered = arrayMove(resume.sections, oldIndex, newIndex)
    await reorderSections.mutateAsync(reordered.map((s, i) => ({ id: s.id, order: i })))
  }

  const handleAddSection = async (type: ResumeSectionType) => {
    if (!resume) return
    const existing = resume.sections.filter((s) => s.type === type)
    await addSection.mutateAsync({
      type,
      title: SECTION_TYPES.find((s) => s.type === type)?.label ?? type,
      content: {},
      order: resume.sections.length + existing.length,
    })
    toast({ title: 'Section added', description: `${type.replace('_', ' ')} section added.` })
  }

  if (isLoading) return <ResumeBuilderSkeleton />

  if (!resume) return (
    <div className="space-y-4">
      <PageHeader title="Resume Builder" breadcrumbs={[{ label: 'Resume' }]} />
      <EmptyState icon={<FileText className="h-12 w-12" />} title="No resume yet" description="Create your first resume to get started." action={{ label: 'Create Resume', onClick: () => {} }} />
    </div>
  )

  const sortedSections = [...resume.sections].sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-5">
      <PageHeader
        title="Resume Builder"
        description="Build and customize your resume"
        breadcrumbs={[{ label: 'Resume' }]}
        actions={
          <div className="flex items-center gap-2">
            {atsData && (
              <Badge variant={atsData.score >= 80 ? 'success' : atsData.score >= 60 ? 'warning' : 'destructive'} className="gap-1">
                <Target className="h-3 w-3" />ATS {atsData.score}%
              </Badge>
            )}
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <Link to="/dashboard/resume/templates"><LayoutTemplate className="h-4 w-4" />Templates</Link>
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowPreview(!showPreview)}>
              {showPreview ? 'Hide' : 'Preview'}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Panel */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Select onValueChange={(v) => handleAddSection(v as ResumeSectionType)}>
              <SelectTrigger className="h-9 flex-1 text-sm">
                <Plus className="h-4 w-4 mr-1" /><SelectValue placeholder="Add section…" />
              </SelectTrigger>
              <SelectContent>
                {SECTION_TYPES.map((s) => <SelectItem key={s.type} value={s.type}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
            {updateSection.isPending && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Save className="h-3 w-3 animate-spin" />Saving…
              </span>
            )}
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sortedSections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {sortedSections.map((section) => (
                  <SortableSection key={section.id} id={section.id}>
                    {(props) => (
                      <ResumeSectionEditor
                        section={section}
                        onUpdate={handleUpdate}
                        onDelete={(sid) => deleteSection.mutate(sid)}
                        {...props}
                      />
                    )}
                  </SortableSection>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Preview Panel */}
        <div className={showPreview || typeof window !== 'undefined' && window.innerWidth >= 1024 ? 'block' : 'hidden lg:block'}>
          <div className="sticky top-6">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-sm">Live Preview</p>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Download className="h-3.5 w-3.5" />Export PDF
              </Button>
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-180px)] rounded-lg border border-border">
              <ResumePreview resume={resume} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
