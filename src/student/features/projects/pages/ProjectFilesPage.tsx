import { useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, LayoutGrid, List, FolderOpen, X, ExternalLink } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { FileCard } from '@/student/components/project/FileCard'
import { FileCardSkeleton } from '@/student/components/project/ProjectSkeletons'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { useTeam, useProjectFiles, useUploadProjectFile, useDeleteProjectFile } from '@/shared/hooks/useProjects'
import { useProjectStore } from '@/shared/store/projectStore'
import { useAuthStore } from '@/shared/store/authStore'
import { useToast } from '@/shared/hooks/useToast'
import type { ProjectFile } from '@/shared/types/project'

const ACCEPTED_TYPES = '.pdf,.png,.jpg,.jpeg,.gif,.zip,.rar,.docx,.doc,.pptx,.ppt'

export function ProjectFilesPage() {
  const { id: teamId } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const { toast } = useToast()
  const { filePreviewUrl, filePreviewTitle, openFilePreview, closeFilePreview } = useProjectStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [uploading, setUploading] = useState(false)

  const { data: team } = useTeam(teamId!)
  const { data: filesData, isLoading, isError } = useProjectFiles(team?.projectId ?? '')
  const { mutate: uploadFile } = useUploadProjectFile(team?.projectId ?? '')
  const { mutate: deleteFile } = useDeleteProjectFile(team?.projectId ?? '')

  const myMembership = team?.members?.find((m) => m.userId === user?.id)
  const canManage = myMembership?.role === 'OWNER' || myMembership?.role === 'LEADER'
  const isMember = !!myMembership

  const files = filesData?.data ?? []

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const title = file.name.replace(/\.[^.]+$/, '')
    setUploading(true)
    uploadFile(
      { file, title },
      {
        onSuccess: () => { toast({ title: 'File uploaded!' }); setUploading(false) },
        onError: () => { toast({ title: 'Upload failed', variant: 'destructive' }); setUploading(false) },
      }
    )
    e.target.value = ''
  }

  const handlePreview = (file: ProjectFile) => {
    openFilePreview(file.fileUrl, file.title)
  }

  const handleDelete = (file: ProjectFile) => {
    deleteFile(file.id, {
      onSuccess: () => toast({ title: 'File deleted' }),
      onError: () => toast({ title: 'Failed to delete file', variant: 'destructive' }),
    })
  }

  if (isError) return <ErrorState title="Failed to load files" message="Please try again." />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Project Files"
        description={team?.name}
        breadcrumbs={[
          { label: 'Projects', href: '/dashboard/projects' },
          { label: team?.name ?? 'Team', href: `/dashboard/projects/team/${teamId}` },
          { label: 'Files' },
        ]}
        actions={
          isMember ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES}
                onChange={handleFileSelect}
                className="hidden"
                aria-hidden="true"
              />
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => fileInputRef.current?.click()}
                loading={uploading}
              >
                <Upload className="h-4 w-4" />
                Upload File
              </Button>
            </>
          ) : undefined
        }
      />

      {/* Controls */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {files.length} file{files.length !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center border border-input rounded-lg overflow-hidden">
          {(['grid', 'list'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`p-2 transition-colors ${viewMode === mode ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              aria-label={`${mode} view`}
              aria-pressed={viewMode === mode}
            >
              {mode === 'grid' ? <LayoutGrid className="h-3.5 w-3.5" /> : <List className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* Files */}
      {isLoading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {[1,2,3,4,5,6].map((i) => <FileCardSkeleton key={i} />)}
        </div>
      ) : files.length > 0 ? (
        <motion.div
          initial="hidden" animate="show"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
          className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}
        >
          <AnimatePresence>
            {files.map((file) => (
              <motion.div
                key={file.id}
                variants={{ hidden: { opacity: 0, scale: 0.96 }, show: { opacity: 1, scale: 1 } }}
                exit={{ opacity: 0, scale: 0.94 }}
              >
                <FileCard
                  file={file}
                  currentUserId={user?.id}
                  isOwner={canManage}
                  onPreview={handlePreview}
                  onDelete={handleDelete}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <EmptyState
          icon={<FolderOpen className="h-10 w-10" />}
          title="No files yet"
          description={isMember ? 'Upload files to share with your team.' : 'No files have been uploaded yet.'}
          action={isMember ? { label: 'Upload File', onClick: () => fileInputRef.current?.click() } : undefined}
        />
      )}

      {/* File preview modal */}
      <Dialog open={!!filePreviewUrl} onOpenChange={(open) => !open && closeFilePreview()}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between pr-8">
              <DialogTitle className="truncate">{filePreviewTitle}</DialogTitle>
              <Button variant="ghost" size="sm" className="gap-1.5 shrink-0" asChild>
                <a href={filePreviewUrl ?? '#'} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" /> Open
                </a>
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-auto rounded-lg border bg-muted/20 min-h-64">
            {filePreviewUrl && (
              filePreviewUrl.match(/\.(png|jpg|jpeg|gif|webp)/i) ? (
                <img src={filePreviewUrl} alt={filePreviewTitle ?? ''} className="max-w-full mx-auto" />
              ) : filePreviewUrl.match(/\.pdf/i) ? (
                <iframe
                  src={filePreviewUrl}
                  title={filePreviewTitle ?? 'File preview'}
                  className="w-full h-[70vh]"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <FolderOpen className="h-12 w-12 mb-3" aria-hidden="true" />
                  <p className="text-sm">Preview not available for this file type.</p>
                  <Button variant="outline" size="sm" className="mt-4" asChild>
                    <a href={filePreviewUrl} download target="_blank" rel="noreferrer">Download File</a>
                  </Button>
                </div>
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
