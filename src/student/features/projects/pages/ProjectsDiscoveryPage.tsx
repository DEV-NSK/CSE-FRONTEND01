/**
 * ProjectsDiscoveryPage — /dashboard/projects
 *
 * CAMPUSRANK's primary discovery layer for Project Hub.
 * Fetches public projects from the external Project Hub API and presents
 * them using CAMPUSRANK's native design system.
 *
 * This page does NOT embed Project Hub. It is a fully CAMPUSRANK-native
 * page that deep-links into Project Hub for the full project experience.
 *
 * Architecture:
 *   CAMPUSRANK (discovery) → Project Hub (execution)
 */

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Plus, Compass, ExternalLink,
  Filter, X, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent } from '@/shared/components/ui/card'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { ProjectHubCard } from '@/student/components/projectHub/ProjectHubCard'
import { ProjectHubGridSkeleton } from '@/student/components/projectHub/ProjectHubCardSkeleton'
import { usePublicProjects } from '@/shared/hooks/useProjectHub'
import { getProjectHubCreateUrl } from '@/shared/lib/projectHub.config'
import { debounce } from '@/shared/lib/utils'
import type { PHProjectsQueryParams } from '@/shared/types/projectHub'

// ─── Technology filter chips ──────────────────────────────────────────────────
// These map to technology strings that Project Hub returns.
// If the API supports a tech filter param, it is forwarded.
const TECH_FILTERS = [
  { label: 'All', value: '' },
  { label: 'React', value: 'React' },
  { label: 'Node.js', value: 'Node.js' },
  { label: 'Python', value: 'Python' },
  { label: 'AI / ML', value: 'AI' },
  { label: 'Flutter', value: 'Flutter' },
  { label: 'Next.js', value: 'Next.js' },
  { label: 'Vue', value: 'Vue' },
]

const ITEMS_PER_PAGE = 12

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }

export function ProjectsDiscoveryPage() {
  const [searchInput, setSearchInput] = useState('')
  const [activeTech, setActiveTech] = useState('')
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  // Debounced search value forwarded to the query
  const [debouncedQ, setDebouncedQ] = useState('')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetQ = useCallback(
    debounce((val: string) => {
      setDebouncedQ(val)
      setPage(1) // reset pagination on new search
    }, 400),
    [],
  )

  const handleSearch = (val: string) => {
    setSearchInput(val)
    debouncedSetQ(val)
  }

  const handleTechFilter = (tech: string) => {
    setActiveTech(tech)
    setPage(1)
  }

  const params: PHProjectsQueryParams = {
    ...(debouncedQ ? { q: debouncedQ } : {}),
    ...(activeTech ? { technology: activeTech } : {}),
    page,
    limit: ITEMS_PER_PAGE,
  }

  const { data, isLoading, isError, refetch, isFetching } = usePublicProjects(params)

  const hasActiveFilters = !!debouncedQ || !!activeTech

  const clearFilters = () => {
    setSearchInput('')
    setDebouncedQ('')
    setActiveTech('')
    setPage(1)
  }

  const totalPages = data?.pagination?.totalPages ?? 1
  const totalProjects = data?.pagination?.total ?? 0
  const projects = data?.projects ?? []

  const openCreateProject = () => {
    const url = getProjectHubCreateUrl()
    const win = window.open(url, '_blank', 'noopener,noreferrer')
    if (win) win.opener = null
  }

  return (
    <div className="space-y-6 pb-8">
      {/* ── Page header ── */}
      <PageHeader
        title="Projects"
        description="Discover what students are building, explore real-world projects, and start building your own."
        breadcrumbs={[{ label: 'Projects' }]}
        actions={
          <Button size="sm" className="gap-1.5" onClick={openCreateProject}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Build a Project
          </Button>
        }
      />

      {/* ── Hero CTA banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-violet-600/90 via-purple-600/80 to-indigo-600/70 p-6 sm:p-8 text-white"
      >
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-1 flex items-center gap-2">
              <Compass className="h-5 w-5" aria-hidden="true" />
              Project Hub
            </h2>
            <p className="text-white/75 text-sm max-w-md">
              Turn ideas into real projects. Find teammates, ship products,
              and build your portfolio with Project Hub.
            </p>
          </div>
          <div className="flex gap-3 shrink-0 flex-wrap">
            <Button
              size="sm"
              variant="secondary"
              className="gap-1.5"
              onClick={openCreateProject}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Build a Project
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── Search + filter bar ── */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search projects by name or description..."
              aria-label="Search projects"
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setShowFilters((v) => !v)}
              aria-expanded={showFilters}
              aria-controls="filter-panel"
            >
              <Filter className="h-3.5 w-3.5" aria-hidden="true" />
              Filters
              {hasActiveFilters && (
                <Badge
                  variant="destructive"
                  className="h-4 w-4 p-0 text-[10px] flex items-center justify-center ml-0.5"
                >
                  !
                </Badge>
              )}
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-muted-foreground"
                onClick={clearFilters}
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Technology filter chips */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              id="filter-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-border bg-muted/30">
                <p className="text-xs text-muted-foreground self-center mr-1 font-medium">
                  Technology:
                </p>
                {TECH_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => handleTechFilter(f.value)}
                    className={[
                      'px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 border',
                      activeTech === f.value
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-background text-muted-foreground border-input hover:border-primary/40 hover:text-foreground',
                    ].join(' ')}
                    aria-pressed={activeTech === f.value}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Results count ── */}
      {!isLoading && !isError && (
        <p
          className="text-sm text-muted-foreground"
          aria-live="polite"
          aria-atomic="true"
        >
          {isFetching
            ? 'Updating…'
            : `${totalProjects} project${totalProjects !== 1 ? 's' : ''} found${hasActiveFilters ? ' (filtered)' : ''}`}
        </p>
      )}

      {/* ── Content ── */}
      {isError ? (
        <ErrorState
          title="Unable to load projects"
          message="Project Hub may be temporarily unavailable. Your other CAMPUSRANK features are unaffected."
          onRetry={() => refetch()}
        />
      ) : isLoading ? (
        <ProjectHubGridSkeleton count={ITEMS_PER_PAGE} />
      ) : projects.length > 0 ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {projects.map((project) => (
            <motion.div key={project.slug} variants={item}>
              <ProjectHubCard project={project} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <EmptyState
          title={hasActiveFilters ? 'No matching projects' : 'No public projects yet'}
          description={
            hasActiveFilters
              ? 'Try adjusting your search or filters.'
              : 'Be one of the first students to build and showcase something real.'
          }
          action={
            hasActiveFilters
              ? { label: 'Clear Filters', onClick: clearFilters }
              : { label: 'Start Building', onClick: openCreateProject }
          }
        />
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <nav
          className="flex items-center justify-center gap-3 pt-4"
          aria-label="Project list pagination"
        >
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Prev
          </Button>
          <span className="text-sm text-muted-foreground tabular-nums">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            aria-label="Next page"
          >
            Next
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </nav>
      )}

      {/* ── Bottom CTA ── */}
      {!isLoading && !isError && projects.length > 0 && (
        <Card className="bg-gradient-to-r from-violet-500/5 to-indigo-500/5 border-violet-200/30 dark:border-violet-800/30">
          <CardContent className="py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-foreground text-sm">
                Ready to build something?
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Create your project on Project Hub and let the CAMPUSRANK community discover it.
              </p>
            </div>
            <Button
              size="sm"
              className="gap-1.5 shrink-0"
              onClick={openCreateProject}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create Project
              <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
