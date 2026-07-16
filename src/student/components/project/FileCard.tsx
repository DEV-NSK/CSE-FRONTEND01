import { motion } from 'framer-motion'
import { FileText, Image, Archive, File, Presentation, ExternalLink, Download, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { getInitials } from '@/shared/lib/utils'
import type { ProjectFile } from '@/shared/types/project'

interface FileCardProps {
  file: ProjectFile
  currentUserId?: string
  isOwner?: boolean
  onPreview?: (file: ProjectFile) => void
  onDelete?: (file: ProjectFile) => void
}

function getFileIcon(fileType: string) {
  if (fileType.includes('pdf')) return FileText
  if (fileType.includes('image')) return Image
  if (fileType.includes('zip') || fileType.includes('rar')) return Archive
  if (fileType.includes('presentation') || fileType.includes('pptx')) return Presentation
  return File
}

function formatFileSize(bytes?: number) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const fileTypeColors: Record<string, string> = {
  pdf: 'text-red-500 bg-red-100 dark:bg-red-900/40',
  image: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/40',
  zip: 'text-amber-500 bg-amber-100 dark:bg-amber-900/40',
  pptx: 'text-orange-500 bg-orange-100 dark:bg-orange-900/40',
  docx: 'text-blue-500 bg-blue-100 dark:bg-blue-900/40',
}

function getFileColorClass(fileType: string) {
  for (const [key, cls] of Object.entries(fileTypeColors)) {
    if (fileType.includes(key)) return cls
  }
  return 'text-muted-foreground bg-muted'
}

export function FileCard({ file, currentUserId, isOwner, onPreview, onDelete }: FileCardProps) {
  const Icon = getFileIcon(file.fileType)
  const colorClass = getFileColorClass(file.fileType)
  const canDelete = isOwner || file.uploadedBy === currentUserId

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className="hover:shadow-sm transition-shadow group">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`flex items-center justify-center h-10 w-10 rounded-lg shrink-0 ${colorClass}`}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{file.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {file.fileType.split('/').pop()?.toUpperCase() ?? 'FILE'}
              </p>

              {file.uploader && (
                <div className="flex items-center gap-1.5 mt-2">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={file.uploader.profileImage} alt={file.uploader.fullName} />
                    <AvatarFallback className="text-[8px]">
                      {getInitials(file.uploader.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">{file.uploader.fullName}</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(file.uploadedAt).toLocaleDateString()}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => onPreview?.(file)}
                  aria-label={`Preview ${file.title}`}
                >
                  <ExternalLink className="h-3 w-3" />
                  Preview
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  asChild
                  aria-label={`Download ${file.title}`}
                >
                  <a href={file.fileUrl} download={file.title} target="_blank" rel="noreferrer">
                    <Download className="h-3 w-3" />
                    Download
                  </a>
                </Button>
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
                    onClick={() => onDelete?.(file)}
                    aria-label={`Delete ${file.title}`}
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
