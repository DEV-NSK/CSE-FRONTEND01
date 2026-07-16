import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, Video, Link2, File, HelpCircle, Clock, User, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import type { Resource, ResourceType } from '@/shared/types/learning'

const typeConfig: Record<ResourceType, { icon: React.ElementType; label: string; color: string }> = {
  video: { icon: Video, label: 'Video', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  article: { icon: FileText, label: 'Article', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  pdf: { icon: File, label: 'PDF', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
  link: { icon: Link2, label: 'Link', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  quiz: { icon: HelpCircle, label: 'Quiz', color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
}

interface ResourceCardProps {
  resource: Resource
  className?: string
  compact?: boolean
}

export function ResourceCard({ resource, className, compact = false }: ResourceCardProps) {
  const config = typeConfig[resource.type] ?? typeConfig.link
  const Icon = config.icon

  if (compact) {
    return (
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg hover:bg-accent/10 transition-colors group',
          className
        )}
        aria-label={`${resource.title} (${config.label}, opens in new tab)`}
      >
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', config.color)}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
            {resource.title}
          </p>
          {resource.duration && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {resource.duration}m
            </p>
          )}
        </div>
        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
      </a>
    )
  }

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
      <Card className={cn('hover:shadow-sm transition-shadow', className)}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', config.color)}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <Link
                  to={`/dashboard/learning/resources/${resource.id}`}
                  className="text-sm font-medium hover:text-primary transition-colors line-clamp-2"
                >
                  {resource.title}
                </Link>
                <Badge variant="outline" className={cn('text-xs shrink-0', config.color)}>
                  {config.label}
                </Badge>
              </div>
              {resource.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{resource.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {resource.author && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {resource.author}
                </span>
              )}
              {resource.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {resource.duration}m
                </span>
              )}
            </div>
            <Button variant="ghost" size="sm" asChild className="h-7 text-xs gap-1">
              <a href={resource.url} target="_blank" rel="noopener noreferrer">
                Open
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
