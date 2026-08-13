import { motion } from 'framer-motion'
import { FileText, Eye, Download, BookOpen } from 'lucide-react'
import { usePublishedPdfs } from '@/shared/hooks/useCoursePdfs'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/feedback/Skeleton'
import { cn } from '@/shared/lib/utils'

function formatBytes(bytes: number) {
  if (!bytes) return ''
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function CoursePdfsSection() {
  const { data: pdfs = [], isLoading } = usePublishedPdfs()

  if (!isLoading && pdfs.length === 0) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.1 }}
      aria-label="Course PDFs"
      className="rounded-xl border border-border bg-card"
      style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 sm:px-5 py-3.5 border-b border-border/60">
        <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
          <BookOpen className="w-3.5 h-3.5 text-blue-500" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Study Materials</h2>
          <p className="text-[11px] text-muted-foreground">
            PDF resources for this course
          </p>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-border/40">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 sm:px-5 py-3.5">
                <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-48" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-7 w-16 rounded-lg" />
                <Skeleton className="h-7 w-20 rounded-lg" />
              </div>
            ))
          : pdfs.map((pdf, i) => (
              <motion.div
                key={pdf.id}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}
                className="flex items-center gap-3 px-4 sm:px-5 py-3.5 hover:bg-muted/30 transition-colors group"
              >
                {/* Icon */}
                <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-red-500" aria-hidden="true" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate leading-tight">
                    {pdf.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {pdf.description && (
                      <span className="text-xs text-muted-foreground truncate max-w-[220px]">
                        {pdf.description}
                      </span>
                    )}
                    {pdf.fileSize > 0 && (
                      <span className={cn(
                        'text-[10px] text-muted-foreground/70 shrink-0',
                        pdf.description && 'before:content-["·"] before:mr-2',
                      )}>
                        {formatBytes(pdf.fileSize)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2.5 gap-1 text-xs border-border/60 hover:border-blue-500/40 hover:bg-blue-500/5 hover:text-blue-600 transition-colors"
                    asChild
                    aria-label={`View ${pdf.title}`}
                  >
                    <a href={pdf.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Eye className="w-3 h-3" />
                      <span className="hidden sm:inline">View</span>
                    </a>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2.5 gap-1 text-xs border-border/60 hover:border-emerald-500/40 hover:bg-emerald-500/5 hover:text-emerald-600 transition-colors"
                    asChild
                    aria-label={`Download ${pdf.title}`}
                  >
                    <a href={pdf.fileUrl} download={pdf.fileName}>
                      <Download className="w-3 h-3" />
                      <span className="hidden sm:inline">Download</span>
                    </a>
                  </Button>
                </div>
              </motion.div>
            ))}
      </div>
    </motion.section>
  )
}
