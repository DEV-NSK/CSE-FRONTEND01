import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ExternalLink, Download, User, Clock, ArrowLeft,
  Video, FileText, File, Link2, HelpCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Separator } from '@/shared/components/ui/separator'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { Skeleton } from '@/shared/components/feedback/Skeleton'
import { useResource } from '@/shared/hooks/useLearning'
import { formatDate } from '@/shared/lib/utils'
import type { ResourceType } from '@/shared/types/learning'

const typeConfig: Record<ResourceType, { icon: React.ElementType; label: string; color: string }> = {
  video: { icon: Video, label: 'Video', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  article: { icon: FileText, label: 'Article', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  pdf: { icon: File, label: 'PDF', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
  link: { icon: Link2, label: 'Link', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  quiz: { icon: HelpCircle, label: 'Quiz', color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
}

export function ResourceViewerPage() {
  const { id } = useParams<{ id: string }>()
  const { data: resource, isLoading, isError, refetch } = useResource(id ?? '')

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <Skeleton className="h-48 w-full rounded-lg" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    )
  }

  if (isError || !resource) {
    return (
      <ErrorState
        title="Resource not found"
        message="This resource doesn't exist or is unavailable."
        onRetry={() => refetch()}
      />
    )
  }

  const config = typeConfig[resource.type] ?? typeConfig.link
  const Icon = config.icon

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title={resource.title}
        breadcrumbs={[
          { label: 'Learning', href: '/dashboard/learning' },
          { label: 'Resource' },
        ]}
        actions={
          <Button variant="outline" size="sm" asChild className="gap-1">
            <Link to="/dashboard/learning">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Resource card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${config.color}`}>
                <Icon className="h-7 w-7" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-2 flex-wrap">
                  <h2 className="text-xl font-bold text-foreground">{resource.title}</h2>
                  <Badge variant="outline" className={`text-xs ${config.color}`}>
                    {config.label}
                  </Badge>
                </div>
                {resource.description && (
                  <p className="text-sm text-muted-foreground">{resource.description}</p>
                )}
              </div>
            </div>

            <Separator className="mb-4" />

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {resource.author && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-muted-foreground">Author</p>
                    <p className="font-medium">{resource.author}</p>
                  </div>
                </div>
              )}
              {resource.duration && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="font-medium">{resource.duration} minutes</p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button asChild className="gap-2">
                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                  {resource.type === 'pdf' ? (
                    <>
                      <Download className="h-4 w-4" />
                      Download PDF
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4" />
                      Open {config.label}
                    </>
                  )}
                </a>
              </Button>

              {resource.type === 'pdf' && (
                <Button variant="outline" asChild className="gap-2">
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    View Online
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Embedded video preview */}
        {resource.type === 'video' && resource.url.includes('youtube') && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Video Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <iframe
                  src={resource.url.replace('watch?v=', 'embed/')}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={resource.title}
                  loading="lazy"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  )
}
