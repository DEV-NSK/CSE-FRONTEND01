import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Clock, FolderKanban } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { DifficultyBadge } from './DifficultyBadge'
import { TechnologyBadge } from './TechnologyBadge'
import { cn } from '@/shared/lib/utils'
import type { ProjectListItem } from '@/shared/types/project'

interface ProjectCardProps {
  project: ProjectListItem
  className?: string
}

export function ProjectCard({ project, className }: ProjectCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
    >
      <Link
        to={`/dashboard/projects/${project.id}`}
        aria-label={`View project: ${project.title}`}
      >
        <Card className={cn('overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col', className)}>
          {/* Thumbnail */}
          <div className="relative h-36 bg-gradient-to-br from-primary/20 to-accent/20 shrink-0">
            {project.thumbnail ? (
              <img
                src={project.thumbnail}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FolderKanban className="h-10 w-10 text-primary/40" aria-hidden="true" />
              </div>
            )}
            <div className="absolute top-2 left-2">
              <DifficultyBadge difficulty={project.difficulty} />
            </div>
          </div>

          <CardContent className="p-4 flex flex-col flex-1 gap-2">
            {/* Category */}
            <p className="text-xs text-muted-foreground">{project.category?.name}</p>

            {/* Title */}
            <h3 className="font-semibold text-sm leading-snug line-clamp-2">{project.title}</h3>

            {/* Description */}
            {project.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
                {project.description}
              </p>
            )}

            {/* Technologies */}
            {project.technologies && project.technologies.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-auto">
                {project.technologies.slice(0, 3).map((t) => (
                  <TechnologyBadge
                    key={t.technology.id}
                    name={t.technology.name}
                    icon={t.technology.icon}
                  />
                ))}
                {project.technologies.length > 3 && (
                  <span className="text-xs text-muted-foreground self-center">
                    +{project.technologies.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
              {project.estimatedDuration && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  {project.estimatedDuration}
                </span>
              )}
              {project._count?.teams !== undefined && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" aria-hidden="true" />
                  {project._count.teams} team{project._count.teams !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}

export function ProjectCardSkeleton() {
  return (
    <Card className="overflow-hidden h-full">
      <div className="h-36 bg-muted animate-pulse" />
      <CardContent className="p-4 space-y-3">
        <div className="h-3 w-1/3 bg-muted animate-pulse rounded" />
        <div className="h-4 w-4/5 bg-muted animate-pulse rounded" />
        <div className="h-3 w-full bg-muted animate-pulse rounded" />
        <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
        <div className="flex gap-1 mt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-5 w-16 bg-muted animate-pulse rounded-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
