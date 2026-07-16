import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutGrid, List, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { RoadmapCard } from '@/student/components/learning/LearningCard'
import { RoadmapCardSkeleton } from '@/student/components/learning/LearningSkeletons'
import { SearchFilters } from '@/student/components/learning/SearchFilters'
import { EmptyLearningState } from '@/student/components/learning/EmptyLearningState'
import { useRoadmaps, useCategories } from '@/shared/hooks/useLearning'
import { useLearningStore } from '@/shared/store/learningStore'
import { debounce } from '@/shared/lib/utils'
import type { Difficulty } from '@/shared/types/learning'

const LIMIT = 12

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const cardItem = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

export function RoadmapsPage() {
  const {
    roadmapsViewMode, setRoadmapsViewMode,
    roadmapFilters, setRoadmapFilters, resetRoadmapFilters,
  } = useLearningStore()

  const [localSearch, setLocalSearch] = useState(roadmapFilters.search)
  const [page, setPage] = useState(1)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetSearch = useCallback(
    debounce((v: string) => {
      setRoadmapFilters({ search: v })
      setPage(1)
    }, 300),
    []
  )

  const onSearchChange = (v: string) => {
    setLocalSearch(v)
    debouncedSetSearch(v)
  }

  // Reset page when filters change
  useEffect(() => { setPage(1) }, [roadmapFilters.difficulty, roadmapFilters.categoryId, roadmapFilters.status])

  const { data: categories } = useCategories()
  const { data, isLoading, isError, refetch } = useRoadmaps({
    search: roadmapFilters.search,
    difficulty: roadmapFilters.difficulty !== 'all' ? roadmapFilters.difficulty : undefined,
    categoryId: roadmapFilters.categoryId !== 'all' ? roadmapFilters.categoryId : undefined,
    status: roadmapFilters.status !== 'all' ? roadmapFilters.status : undefined,
    page,
    limit: LIMIT,
  })

  const roadmaps = data?.data ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0

  const activeFilterCount = [
    roadmapFilters.difficulty !== 'all',
    roadmapFilters.categoryId !== 'all',
    roadmapFilters.status !== 'all',
    roadmapFilters.search !== '',
  ].filter(Boolean).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roadmaps"
        description="Structured learning paths to master any topic."
        breadcrumbs={[
          { label: 'Learning', href: '/dashboard/learning' },
          { label: 'Roadmaps' },
        ]}
        actions={
          <div className="flex items-center gap-1 border rounded-md p-1" role="group" aria-label="View mode">
            <Button
              variant={roadmapsViewMode === 'grid' ? 'default' : 'ghost'}
              size="icon-sm"
              onClick={() => setRoadmapsViewMode('grid')}
              aria-label="Grid view"
              aria-pressed={roadmapsViewMode === 'grid'}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={roadmapsViewMode === 'list' ? 'default' : 'ghost'}
              size="icon-sm"
              onClick={() => setRoadmapsViewMode('list')}
              aria-label="List view"
              aria-pressed={roadmapsViewMode === 'list'}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <SearchFilters
        search={localSearch}
        onSearchChange={onSearchChange}
        difficulty={roadmapFilters.difficulty}
        onDifficultyChange={(v) => setRoadmapFilters({ difficulty: v as Difficulty | 'all' })}
        categoryId={roadmapFilters.categoryId}
        onCategoryChange={(v) => setRoadmapFilters({ categoryId: v })}
        categories={categories}
        status={roadmapFilters.status}
        onStatusChange={(v) => setRoadmapFilters({ status: v as typeof roadmapFilters.status })}
        onReset={resetRoadmapFilters}
        activeFilterCount={activeFilterCount}
        placeholder="Search roadmaps..."
      />

      {/* Results count */}
      {!isLoading && !isError && (
        <p className="text-sm text-muted-foreground">
          {total} roadmap{total !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Content */}
      {isError ? (
        <ErrorState
          title="Couldn't load roadmaps"
          message="Something went wrong. Please try again."
          onRetry={() => refetch()}
        />
      ) : isLoading ? (
        <div className={roadmapsViewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
          : 'space-y-3'
        }>
          {Array.from({ length: 8 }).map((_, i) => <RoadmapCardSkeleton key={i} />)}
        </div>
      ) : !roadmaps.length ? (
        <EmptyLearningState
          variant="roadmaps"
          searchQuery={roadmapFilters.search}
          onAction={activeFilterCount > 0 ? resetRoadmapFilters : undefined}
        />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${roadmapsViewMode}-${page}`}
            variants={container}
            initial="hidden"
            animate="show"
            className={roadmapsViewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-3'
            }
          >
            {roadmaps.map((roadmap) => (
              <motion.div key={roadmap.id} variants={cardItem}>
                <RoadmapCard roadmap={roadmap} viewMode={roadmapsViewMode} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4" role="navigation" aria-label="Pagination">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
            return (
              <Button
                key={pageNum}
                variant={page === pageNum ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPage(pageNum)}
                aria-label={`Page ${pageNum}`}
                aria-current={page === pageNum ? 'page' : undefined}
                className="w-9"
              >
                {pageNum}
              </Button>
            )
          })}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
