import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { TemplateCard } from '@/student/components/placement/TemplateCard'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogContent } from '@/shared/components/ui/dialog'
import { ResumePreview } from '@/student/components/placement/ResumePreview'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { LayoutTemplate } from 'lucide-react'
import { useResumeTemplates, useResumes, useUpdateResume } from '@/shared/hooks/useResume'
import { useToast } from '@/shared/hooks/useToast'
import type { Resume } from '@/shared/types/placement'

export function ResumeTemplatesPage() {
  const { data: templates, isLoading } = useResumeTemplates()
  const { data: resumes } = useResumes()
  const updateResume = useUpdateResume()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null)

  const currentResume = resumes?.[0]
  const selectedTemplate = currentResume?.template ?? 'classic'

  const handleSelect = async (templateId: string) => {
    if (!currentResume) {
      toast({ title: 'No resume', description: 'Create a resume first to select a template.' })
      navigate('/dashboard/resume')
      return
    }
    try {
      await updateResume.mutateAsync({ id: currentResume.id, data: { template: templateId } })
      toast({ title: 'Template applied', description: 'Your resume template has been updated.' })
    } catch {
      toast({ title: 'Error', description: 'Could not update template.', variant: 'destructive' })
    }
  }

  const previewResume: Resume | null = currentResume
    ? { ...currentResume, template: previewTemplate ?? selectedTemplate }
    : null

  if (isLoading) return (
    <div className="space-y-4">
      <PageHeader title="Resume Templates" breadcrumbs={[{ label: 'Resume', href: '/dashboard/resume' }, { label: 'Templates' }]} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resume Templates"
        description="Choose a template that represents you best"
        breadcrumbs={[{ label: 'Resume', href: '/dashboard/resume' }, { label: 'Templates' }]}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/resume')}>
            ← Back to Builder
          </Button>
        }
      />

      {!templates || templates.length === 0 ? (
        <EmptyState icon={<LayoutTemplate className="h-12 w-12" />} title="No templates available" description="Templates will appear here once configured." />
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {templates.map((template, i) => (
            <motion.div key={template.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <TemplateCard
                template={template}
                isSelected={selectedTemplate === template.id}
                onSelect={handleSelect}
                onPreview={(id) => setPreviewTemplate(id)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background z-10">
            <h2 className="font-semibold text-sm">Template Preview</h2>
            <Button variant="ghost" size="icon-sm" onClick={() => setPreviewTemplate(null)} aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-4">
            <ResumePreview resume={previewResume} template={previewTemplate ?? undefined} />
          </div>
          <div className="p-4 border-t border-border flex justify-end gap-2 sticky bottom-0 bg-background">
            <Button variant="outline" onClick={() => setPreviewTemplate(null)}>Cancel</Button>
            <Button onClick={() => { handleSelect(previewTemplate!); setPreviewTemplate(null) }} loading={updateResume.isPending}>
              Use This Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
