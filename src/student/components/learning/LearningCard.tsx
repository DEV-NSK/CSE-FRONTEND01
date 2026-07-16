import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, BookOpen, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { ProgressRing } from './ProgressRing'
import { DifficultyBadge } from './DifficultyBadge'
import { cn } from '@/shared/lib/utils'
import type { Roadmap, LearningCategory } from '@/shared/types/learning'

// ─── Category Card ────────────────────────────────────────────────────────────

interface CategoryCardProps {
  category: LearningCategory
  className?: string
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.15 }}>
      <Link to={`/dashboard/learning/roadmaps?category=${category.id}`} tabIndex={-1}>
        <Card
          className={cn(
            'h-full hover:shadow-md transition-shadow cursor-pointer group focus-within:ring-2 focus-within:ring-ring',
            className
          )}
        >
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                style={{ backgroundColor: category.color + '20' }}
                aria-hidden="true"
              >
                {category.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {category.name}
                  </h3>
                  {category.progress !== undefined && (
                    <ProgressRing progress={category.progress} size={40} strokeWidth={4} />
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                  {category.description}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs gap-1">
                    <BookOpen className="h-3 w-3" />
                    {category.roadmapCount} roadmap{category.roadmapCount !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}

// ─── Roadmap Card ─────────────────────────────────────────────────────────────

interface RoadmapCardProps {
  roadmap: Roadmap
  viewMode?: 'grid' | 'list'
  className?: string
}

export function RoadmapCard({ roadmap, viewMode = 'grid', className }: RoadmapCardProps) {
  const progress = roadmap.progress ?? 0

  if (viewMode === 'list') {
    return (
      <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.15 }}>
        <Link to={`/dashboard/learning/roadmaps/${roadmap.slug}`} tabIndex={-1}>
          <Card className={cn('hover:shadow-md transition-shadow cursor-pointer group', className)}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <ProgressRing progress={progress} size={52} strokeWidth={5} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {roadmap.title}
                    </h3>
                    <DifficultyBadge difficulty={roadmap.difficulty} />
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                    {roadmap.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {roadmap.estimatedHours}h
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {roadmap.lessonCount} lessons
                    </span>
                    <Badge variant="outline" className="text-xs">{roadmap.category.name}</Badge>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.15 }}>
      <Link to={`/dashboard/learning/roadmaps/${roadmap.slug}`} tabIndex={-1}>
        <Card className={cn('h-full hover:shadow-md transition-shadow cursor-pointer group overflow-hidden', className)}>
          {/* Thumbnail or gradient header */}
          <div
            className="h-3 w-full"
            style={{
              background: `linear-gradient(135deg, ${roadmap.category.color}80, hsl(var(--primary)))`,
            }}
            aria-hidden="true"
          />
          <CardContent className="p-5 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
                  {roadmap.title}
                </h3>
                <Badge variant="outline" className="text-xs">{roadmap.category.name}</Badge>
              </div>
              <ProgressRing progress={progress} size={56} strokeWidth={5} />
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground line-clamp-2">
              {roadmap.description}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {roadmap.estimatedHours}h
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {roadmap.lessonCount} lessons
              </span>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-1">
              <DifficultyBadge difficulty={roadmap.difficulty} />
              {progress > 0 && (
                <span className="text-xs text-muted-foreground">
                  {roadmap.completedLessons}/{roadmap.lessonCount} done
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}
