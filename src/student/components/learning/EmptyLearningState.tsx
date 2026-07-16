import { motion } from 'framer-motion'
import { BookOpen, Bookmark, Search, History, PlayCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Link } from 'react-router-dom'
import { cn } from '@/shared/lib/utils'

type StateVariant = 'roadmaps' | 'lessons' | 'bookmarks' | 'search' | 'continue' | 'recent' | 'categories'

interface EmptyLearningStateProps {
  variant: StateVariant
  searchQuery?: string
  className?: string
  onAction?: () => void
}

const config: Record<StateVariant, {
  icon: React.ElementType
  title: string
  description: (q?: string) => string
  actionLabel?: string
  actionHref?: string
}> = {
  roadmaps: {
    icon: BookOpen,
    title: 'No roadmaps found',
    description: (q) => q
      ? `No roadmaps match "${q}". Try adjusting your filters.`
      : "You haven't started any roadmaps yet. Explore our learning paths!",
    actionLabel: 'Browse Roadmaps',
    actionHref: '/dashboard/learning/roadmaps',
  },
  lessons: {
    icon: PlayCircle,
    title: 'No lessons found',
    description: (q) => q ? `No lessons match "${q}".` : 'No lessons available.',
  },
  bookmarks: {
    icon: Bookmark,
    title: 'No bookmarks yet',
    description: () => 'Save roadmaps and lessons for quick access. Look for the bookmark icon.',
    actionLabel: 'Browse Learning',
    actionHref: '/dashboard/learning',
  },
  search: {
    icon: Search,
    title: 'No results found',
    description: (q) => q
      ? `No results for "${q}". Try a different keyword.`
      : 'Start typing to search across categories, roadmaps, and lessons.',
  },
  continue: {
    icon: PlayCircle,
    title: 'Nothing in progress',
    description: () => "You haven't started any lessons yet. Pick a roadmap and begin your learning journey.",
    actionLabel: 'Start Learning',
    actionHref: '/dashboard/learning/roadmaps',
  },
  recent: {
    icon: History,
    title: 'No recent activity',
    description: () => 'Lessons you view will appear here.',
    actionLabel: 'Browse Lessons',
    actionHref: '/dashboard/learning/roadmaps',
  },
  categories: {
    icon: BookOpen,
    title: 'No categories found',
    description: (q) => q ? `No categories match "${q}".` : 'No learning categories available yet.',
  },
}

export function EmptyLearningState({ variant, searchQuery, className, onAction }: EmptyLearningStateProps) {
  const { icon: Icon, title, description, actionLabel, actionHref } = config[variant]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex flex-col items-center justify-center py-20 px-6 text-center', className)}
      role="status"
    >
      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-muted-foreground/50" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">{description(searchQuery)}</p>

      {actionHref && actionLabel && (
        <Button asChild size="sm">
          <Link to={actionHref} onClick={onAction}>{actionLabel}</Link>
        </Button>
      )}
      {onAction && !actionHref && actionLabel && (
        <Button size="sm" onClick={onAction}>{actionLabel}</Button>
      )}
    </motion.div>
  )
}
