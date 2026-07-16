import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LayoutGrid, LayoutList, RotateCcw, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ProblemCard } from '@/student/components/coding/ProblemCard'
import { ProblemTable } from '@/student/components/coding/ProblemTable'
import { ProblemCardSkeleton, ProblemTableSkeleton } from '@/student/components/coding/CodingSkeletons'
import { useProblems, useCodingCategories, useCodingTags, useCodingCompanies } from '@/shared/hooks/useCoding'
import { useCodingStore } from '@/shared/store/codingStore'
import { debounce } from '@/shared/lib/utils'
import { Code2 } from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }

const PAGE_SIZE = 20

export function ProblemsListPage() {
  const [searchParams] = useSearchParams()
  const {
    problemsViewMode,
    setProblemsViewMode,
    problemFilters,
    setProblemFilters,
    resetProblemFilters,
    problemsPage,
    setProblemsPage,
  } = useCodingStore()

  const [localSearch, setLocalSearch] = useState(
    searchParams.get('search') || problemFilters.search
  )

  // Sync URL search param on mount
  useEffect(() => {
    const urlSearch = searchParams.get('search')
    if (urlSearch && urlSearch !== problemFilters.search) {
      setProblemFilters({ search: urlSearch })
      setLocalSearch(urlSearch)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((val: string) => setProblemFilters({ search: val }), 300),
    []
  )

  const onSearchChange = (val: string) => {
    setLocalSearch(val)
    debouncedSearch(val)
  }

  const { data: categories } = useCodingCategories()
  const { data: tags } = useCodingTags()
  const { data: companies } = useCodingCompanies()

  const { data, isLoading, isError, refetch } = useProblems({
    ...problemFilters,
    page: problemsPage,
    limit: PAGE_SIZE,
  })

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1

  const hasActiveFilters =
    problemFilters.difficulty !== 'all' ||
    problemFilters.categoryId !== 'all' ||
    problemFilters.tagIds.length > 0 ||
    problemFilters.companyId !== 'all' ||
    problemFilters.status !== 'all' ||
    problemFilters.search !== ''

  return (
    <div className="space-y-6">
      <PageHeader
        title="Problems"
        description="Browse and filter coding problems."
        breadcrumbs={[{ label: 'Coding', href: '/dashboard/coding' }, { label: 'Problems' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={problemsViewMode === 'table' ? 'default' : 'outline'}
              size="icon-sm"
              onClick={() => setProblemsViewMode('table')}
              aria-label="Table view"
              aria-pressed={problemsViewMode === 'table'}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant={problemsViewMode === 'card' ? 'default' : 'outline'}
              size="icon-sm"
              onClick={() => setProblemsViewMode('card')}
              aria-label="Card view"
              aria-pressed={problemsViewMode === 'card'}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-3" role="search" aria-label="Filter problems">
        {/* Search bar */}
        <Input
          placeholder="Search problems by title..."
          value={localSearch}
          onChange={(e) => onSearchChange(e.target.value)}
          leftIcon={<Filter className="h-4 w-4" aria-hidden="true" />}
          aria-label="Search problems"
        />

        {/* Filter row */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Difficulty */}
          <Select
            value={problemFilters.difficulty}
            onValueChange={(val) =>
              setProblemFilters({ difficulty: val as typeof problemFilters.difficulty })
            }
          >
            <SelectTrigger className="w-[130px] h-9 text-sm" aria-label="Difficulty filter">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>

          {/* Category */}
          <Select
            value={problemFilters.categoryId}
            onValueChange={(val) => setProblemFilters({ categoryId: val })}
          >
            <SelectTrigger className="w-[140px] h-9 text-sm" aria-label="Category filter">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Company */}
          <Select
            value={problemFilters.companyId}
            onValueChange={(val) => setProblemFilters({ companyId: val })}
          >
            <SelectTrigger className="w-[140px] h-9 text-sm" aria-label="Company filter">
              <SelectValue placeholder="Company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              {companies?.map((co) => (
                <SelectItem key={co.id} value={co.id}>
                  {co.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status */}
          <Select
            value={problemFilters.status}
            onValueChange={(val) =>
              setProblemFilters({ status: val as typeof problemFilters.status })
            }
          >
            <SelectTrigger className="w-[120px] h-9 text-sm" aria-label="Status filter">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="solved">Solved</SelectItem>
              <SelectItem value="unsolved">Unsolved</SelectItem>
            </SelectContent>
          </Select>

          {/* Tags — multi-select simplified */}
          <Select
            value={problemFilters.tagIds[0] ?? 'all'}
            onValueChange={(val) =>
              setProblemFilters({ tagIds: val === 'all' ? [] : [val] })
            }
          >
            <SelectTrigger className="w-[130px] h-9 text-sm" aria-label="Tag filter">
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {tags?.map((tag) => (
                <SelectItem key={tag.id} value={tag.id}>
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Reset */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetProblemFilters}
              className="gap-1 text-xs h-9"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Results count */}
      {data && (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {data.total} problem{data.total !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Content */}
      {isError ? (
        <ErrorState
          title="Failed to load problems"
          message="Check your connection and try again."
          onRetry={() => refetch()}
        />
      ) : isLoading ? (
        problemsViewMode === 'table' ? (
          <ProblemTableSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <ProblemCardSkeleton key={i} />
            ))}
          </div>
        )
      ) : !data?.data?.length ? (
        <EmptyState
          icon={<Code2 className="h-12 w-12" />}
          title="No problems found"
          description="Try adjusting your filters or search term."
          action={
            hasActiveFilters
              ? { label: 'Clear filters', onClick: resetProblemFilters }
              : undefined
          }
        />
      ) : problemsViewMode === 'table' ? (
        <ProblemTable problems={data.data} />
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {data.data.map((prob) => (
            <motion.div key={prob.id} variants={item}>
              <ProblemCard problem={prob} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2" role="navigation" aria-label="Pagination">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setProblemsPage(problemsPage - 1)}
            disabled={problemsPage <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {problemsPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setProblemsPage(problemsPage + 1)}
            disabled={problemsPage >= totalPages}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
