/**
 * ProjectHubCard — CAMPUSRANK-native card for Project Hub public projects.
 *
 * Renders a single public Project Hub project using CAMPUSRANK's existing
 * design system (Card, Badge, Avatar, Button, motion). Does NOT embed or
 * replicate Project Hub's UI — this is a CAMPUSRANK-native discovery card.
 *
 * Primary CTA: "View Project" → opens Project Hub showcase in a new tab.
 * Security: uses getProjectHubShowcaseUrl() — never navigates to arbitrary URLs.
 */

import { memo } from 'react'
import { motion } from 'framer-motion'
import { Users, Clock, ExternalLink, FolderOpen } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { getProjectHubShowcaseUrl } from '@/shared/lib/projectHub.config'
import { getInitials } from '@/shared/lib/utils'
import { cn } from '@/shared/lib/utils'
import type { PHPublicProject } from '@/shared/types/projectHub'

interface ProjectHubCardProps {
  project: PHPublicProject
  /** Additional class names for the card wrapper */
  className?: string
  /** If true the card is shown in a compact list-row style */
  compact?: boolean
}

/**
 * Safely formats the updatedAt timestamp to a human-readable relative string.
 * Returns an empty string on any parse error.
 */
function formatRelativeTime(isoString: string): string {
  try {
    const diff = Date.now() - new Date(isoString).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 30) return `${days}d ago`
    const months = Math.floor(days / 30)
    if (months < 12) return `${months}mo ago`
    return `${Math.floor(months / 12)}y ago`
  } catch {
    return ''
  }
}

export const ProjectHubCard = memo(function ProjectHubCard({
  project,
  className,
  compact = false,
}: ProjectHubCardProps) {
  const showcaseUrl = project.showcaseUrl ?? getProjectHubShowcaseUrl(project.slug)
  const relativeTime = formatRelativeTime(project.updatedAt)

  const handleViewProject = () => {
    // Construct URL from our helper, not from project.showcaseUrl directly,
    // to prevent open-redirect from untrusted API data.
    const safeUrl = getProjectHubShowcaseUrl(project.slug)
    const win = window.open(safeUrl, '_blank', 'noopener,noreferrer')
    if (win) win.opener = null
  }

  if (compact) {
    return (
      <Card
        className={cn(
          'group hover:shadow-md transition-shadow overflow-hidden',
          className,
        )}
      >
        <CardContent className="p-3 flex items-center gap-3">
          {/* Thumbnail */}
          <div className="relative h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 shrink-0 overflow-hidden">
            {project.imageUrl ? (
              <img
                src={project.imageUrl}
                alt=""
                aria-hidden="true"
                className="h-full w-full object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            ) : (
              <FolderOpen
                className="h-5 w-5 text-primary/40 absolute inset-0 m-auto"
                aria-hidden="true"
              />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate leading-tight">
              {project.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {project.shortDescription ?? project.tagline}
            </p>
          </div>

          {/* CTA */}
          <Button
            size="sm"
            variant="outline"
            className="shrink-0 gap-1.5 h-7 text-xs"
            onClick={handleViewProject}
            aria-label={`View ${project.name} on Project Hub`}
          >
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
            View
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.15 }}>
      <Card
        className={cn(
          'group overflow-hidden hover:shadow-lg transition-all duration-200 h-full flex flex-col',
          className,
        )}
      >
        {/* ── Cover image ── */}
        <div className="relative h-40 bg-gradient-to-br from-primary/15 via-accent/10 to-secondary/15 shrink-0 overflow-hidden">
          {project.imageUrl ? (
            <img
              src={project.imageUrl}
              alt={`${project.name} cover`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                // Fallback: hide broken image, show placeholder icon
                const img = e.target as HTMLImageElement
                img.style.display = 'none'
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FolderOpen
                className="h-12 w-12 text-primary/25"
                aria-hidden="true"
              />
            </div>
          )}

          {/* Progress badge — only if data is present */}
          {project.progress !== null && project.progress !== undefined && (
            <div className="absolute bottom-2 right-2">
              <Badge
                variant="secondary"
                className="text-[10px] font-semibold bg-background/90 backdrop-blur-sm border-0 shadow"
              >
                {project.progress}% done
              </Badge>
            </div>
          )}
        </div>

        {/* ── Card body ── */}
        <CardContent className="p-4 flex flex-col flex-1 gap-2.5">
          {/* Title */}
          <h3 className="font-bold text-sm text-foreground leading-snug line-clamp-2">
            {project.name}
          </h3>

          {/* Description */}
          {(project.shortDescription ?? project.tagline) && (
            <p className="text-xs text-muted-foreground line-clamp-2 flex-1 leading-relaxed">
              {project.shortDescription ?? project.tagline}
            </p>
          )}

          {/* Technology tags */}
          {project.technologies && project.technologies.length > 0 && (
            <div
              className="flex flex-wrap gap-1 mt-auto"
              aria-label="Technologies"
            >
              {project.technologies.slice(0, 4).map((tech) => (
                <Badge
                  key={tech}
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 h-4 font-medium"
                >
                  {tech}
                </Badge>
              ))}
              {project.technologies.length > 4 && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 h-4 text-muted-foreground"
                >
                  +{project.technologies.length - 4}
                </Badge>
              )}
            </div>
          )}

          {/* ── Footer ── */}
          <div className="flex items-center justify-between pt-2 mt-1 border-t border-border/50">
            {/* Owner */}
            <div className="flex items-center gap-1.5 min-w-0">
              <Avatar className="h-5 w-5 shrink-0">
                <AvatarImage
                  src={project.owner.avatarUrl ?? undefined}
                  alt={project.owner.displayName}
                />
                <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-semibold">
                  {getInitials(project.owner.displayName)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                {project.owner.displayName}
              </span>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
              {project.teamSize !== null && project.teamSize !== undefined && (
                <span
                  className="flex items-center gap-1"
                  aria-label={`${project.teamSize} team members`}
                >
                  <Users className="h-3 w-3" aria-hidden="true" />
                  {project.teamSize}
                </span>
              )}
              {relativeTime && (
                <span
                  className="flex items-center gap-1"
                  aria-label={`Updated ${relativeTime}`}
                >
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  {relativeTime}
                </span>
              )}
            </div>
          </div>

          {/* View Project CTA */}
          <Button
            size="sm"
            className="w-full gap-1.5 mt-1 h-8"
            onClick={handleViewProject}
            aria-label={`View ${project.name} on Project Hub`}
          >
            View Project
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
})
