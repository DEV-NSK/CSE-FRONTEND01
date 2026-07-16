import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, LayoutGrid, List, Filter, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { ProjectCard, ProjectCardSkeleton } from '@/student/components/project/ProjectCard'
import { useProjects, useProjectCategories, useProjectTechnologies } from '@/shared/hooks/useProjects'
import { useProjectStore } from '@/shared/store/projectStore'
import { debounce } from '@/shared/lib/utils'
import type { ProjectDifficulty } from '@/shared/types/project'

const DIFFICULTIES: { value: ProjectDifficulty | ''; label: string }[] = [
  { value: '', label: 'All Levels' },
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
  { value: 'EXPERT', label: 'Expert' },
]

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }

export function ProjectsExplorePage() {
  const { projectViewMode, setProjectViewMode, projectFilters, setProjectFilters, resetProjectFilters } = useProjectStore()
  const [searchInput, setSearchInput] = useState(projectFilters.search ?? '')
  const [showFilters, setShowFilters] = useState(false)

  const { data: categoriesData } = useProjectCategories()
  const { data: technologiesData } = useProjectTechnologies()

  const { data, isLoading, isError } = useProjects({
    ...projectFilters,
    isPublished: true,
    limit: 12,
  })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((val: string) => setProjectFilters({ search: val || undefined }), 350),
    []
  )

  const handleSearch = (val: string) => {
    setSearchInput(val)
    debouncedSearch(val)
  }

  const hasActiveFilters =
    !!projectFilters.search || !!projectFilters.categoryId || !!projectFilters.difficulty || !!projectFilters.technologyId

  const totalPages = data?.totalPages ?? 1
  const currentPage = projectFilters.page ?? 1

  return (
    <div className="space-y-6">
      <PageHeader
        title="Explore Projects"
        description="Discover projects to work on, build your portfolio, and collaborate with peers."
        breadcrumbs={[{ label: 'Projects', href: '/dashboard/projects' }, { label: 'Explore' }]}
      />

      {/* Search + Controls bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search projects by title, description..."
            aria-label="Search projects"
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
            {hasActiveFilters && <Badge variant="destructive" className="h-4 w-4 p-0 text-[10px] flex items-center justify-center">!</Badge>}
          </Button>

          {/* View toggle */}
          <div className="flex items-center border border-input rounded-lg overflow-hidden">
            <button
              onClick={() => setProjectViewMode('grid')}
              className={`p-2 transition-colors ${projectViewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              aria-label="Grid view"
              aria-pressed={projectViewMode === 'grid'}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setProjectViewMode('list')}
              className={`p-2 transition-colors ${projectViewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              aria-label="List view"
              aria-pressed={projectViewMode === 'list'}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex flex-wrap gap-3 p-4 rounded-xl border border-border bg-muted/30"
        >
          {/* Category */}
          <Select
            value={projectFilters.categoryId ?? ''}
            onValueChange={(v) => setProjectFilters({ categoryId: v || undefined })}
          >
            <SelectTrigger className="w-44 h-9 text-sm">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categoriesData?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Difficulty */}
          <Select
            value={projectFilters.difficulty ?? ''}
            onValueChange={(v) => setProjectFilters({ difficulty: (v as ProjectDifficulty) || undefined })}
          >
            <SelectTrigger className="w-44 h-9 text-sm">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTIES.map((d) => (
                <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Technology */}
          <Select
            value={projectFilters.technologyId ?? ''}
            onValueChange={(v) => setProjectFilters({ technologyId: v || undefined })}
          >
            <SelectTrigger className="w-44 h-9 text-sm">
              <SelectValue placeholder="Technology" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Technologies</SelectItem>
              {technologiesData?.map((tech) => (
                <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
              onClick={() => { resetProjectFilters(); setSearchInput('') }}
            >
              <X className="h-3.5 w-3.5" /> Clear filters
            </Button>
          )}
        </motion.div>
      )}

      {/* Results summary */}
      {!isLoading && data && (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {data.total} project{data.total !== 1 ? 's' : ''} found
          {hasActiveFilters && ' (filtered)'}
        </p>
      )}

      {/* Content */}
      {isError ? (
        <ErrorState title="Failed to load projects" message="Check your connection and try again." />
      ) : isLoading ? (
        <div className={projectViewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
          : 'space-y-3'
        }>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <ProjectCardSkeleton key={i} />)}
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className={projectViewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'space-y-3'
          }
        >
          {data.data.map((proj) => (
            <motion.div key={proj.id} variants={item}>
              <ProjectCard project={proj} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <EmptyState
          title="No projects found"
          description={hasActiveFilters ? 'Try adjusting your filters.' : 'No published projects yet.'}
          action={hasActiveFilters ? { label: 'Clear Filters', onClick: () => { resetProjectFilters(); setSearchInput('') } } : undefined}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4" role="navigation" aria-label="Pagination">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setProjectFilters({ page: currentPage - 1 })}
            aria-label="Previous page"
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setProjectFilters({ page: currentPage + 1 })}
            aria-label="Next page"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
