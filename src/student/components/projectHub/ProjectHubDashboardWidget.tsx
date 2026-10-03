/**
 * ProjectHubDashboardWidget — compact Project Hub section for the dashboard.
 *
 * Shows a brief intro + 2–3 featured public projects + CTAs.
 * Designed to be resilient: if Project Hub is unavailable, the widget
 * shows a graceful degraded state. The rest of the dashboard is unaffected.
 *
 * Used by: DashboardPage (WidgetErrorBoundary-wrapped)
 */

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FolderKanban, ArrowRight, Plus, ExternalLink,
  AlertCircle, Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { ProjectHubCard } from './ProjectHubCard'
import { ProjectHubCardSkeleton } from './ProjectHubCardSkeleton'
import { usePublicProjects } from '@/shared/hooks/useProjectHub'
import { getProjectHubCreateUrl } from '@/shared/lib/projectHub.config'

const FEATURED_COUNT = 3

export function ProjectHubDashboardWidget() {
  const { data, isLoading, isError } = usePublicProjects({
    limit: FEATURED_COUNT,
    page: 1,
  })

  const openCreate = () => {
    const url = getProjectHubCreateUrl()
    const win = window.open(url, '_blank', 'noopener,noreferrer')
    if (win) win.opener = null
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FolderKanban className="h-4.5 w-4.5 text-primary" aria-hidden="true" />
            Project Hub
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={openCreate}
              aria-label="Create a new project on Project Hub"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Build
            </Button>
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" asChild>
              <Link to="/dashboard/projects">
                Explore
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Discover what students are building and start your own project.
        </p>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Loading */}
        {isLoading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <ProjectHubCardSkeleton key={i} compact />
            ))}
          </div>
        )}

        {/* Error — contained, does not affect dashboard */}
        {isError && (
          <div
            className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-3 text-xs text-muted-foreground"
            role="status"
            aria-label="Project Hub temporarily unavailable"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-muted-foreground/60" aria-hidden="true" />
            <span>Project Hub is temporarily unavailable. Try again later.</span>
          </div>
        )}

        {/* Projects */}
        {!isLoading && !isError && data?.projects && data.projects.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            {data.projects.slice(0, FEATURED_COUNT).map((project) => (
              <ProjectHubCard key={project.slug} project={project} compact />
            ))}
          </motion.div>
        )}

        {/* Empty */}
        {!isLoading && !isError && (!data?.projects || data.projects.length === 0) && (
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground mb-3">
              No public projects yet. Be the first to build one!
            </p>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={openCreate}>
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Start Building
              <ExternalLink className="h-3 w-3 opacity-60" aria-hidden="true" />
            </Button>
          </div>
        )}

        {/* Footer link — only when projects are showing */}
        {!isLoading && !isError && data?.projects && data.projects.length > 0 && (
          <Button variant="outline" size="sm" className="w-full gap-1.5 mt-1" asChild>
            <Link to="/dashboard/projects">
              <FolderKanban className="h-3.5 w-3.5" aria-hidden="true" />
              View All Projects
              <ArrowRight className="h-3.5 w-3.5 ml-auto" aria-hidden="true" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
