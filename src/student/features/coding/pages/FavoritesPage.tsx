import { useCallback, useState } from 'react'
import { LayoutGrid, LayoutList, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ProblemCard } from '@/student/components/coding/ProblemCard'
import { ProblemTable } from '@/student/components/coding/ProblemTable'
import { ProblemCardSkeleton, ProblemTableSkeleton } from '@/student/components/coding/CodingSkeletons'
import { useFavorites } from '@/shared/hooks/useCoding'
import { useCodingStore } from '@/shared/store/codingStore'
import { debounce } from '@/shared/lib/utils'
import { Heart } from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }

export function FavoritesPage() {
  const { favoriteFilters, setFavoriteFilters, favoritesViewMode, setFavoritesViewMode } = useCodingStore()
  const [localSearch, setLocalSearch] = useState(favoriteFilters.search)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((val: string) => setFavoriteFilters({ search: val }), 300),
    []
  )

  const onSearchChange = (val: string) => {
    setLocalSearch(val)
    debouncedSearch(val)
  }

  const { data, isLoading, isError, refetch } = useFavorites({
    search: favoriteFilters.search,
    difficulty: favoriteFilters.difficulty !== 'all' ? favoriteFilters.difficulty : undefined,
    limit: 100,
  })

  const hasFilters = favoriteFilters.search !== '' || favoriteFilters.difficulty !== 'all'

  // Map favorites to ProblemListItem for table/card components
  const problems = data?.data?.map((fav) => fav.problem) ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Favorite Problems"
        description="Problems you've bookmarked for later."
        breadcrumbs={[{ label: 'Coding', href: '/dashboard/coding' }, { label: 'Favorites' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={favoritesViewMode === 'list' ? 'default' : 'outline'}
              size="icon-sm"
              onClick={() => setFavoritesViewMode('list')}
              aria-label="Table view"
              aria-pressed={favoritesViewMode === 'list'}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant={favoritesViewMode === 'grid' ? 'default' : 'outline'}
              size="icon-sm"
              onClick={() => setFavoritesViewMode('grid')}
              aria-label="Grid view"
              aria-pressed={favoritesViewMode === 'grid'}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[180px]">
          <Input
            placeholder="Search favorites..."
            value={localSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search favorites"
          />
        </div>
        <Select
          value={favoriteFilters.difficulty}
          onValueChange={(val) =>
            setFavoriteFilters({ difficulty: val as typeof favoriteFilters.difficulty })
          }
        >
          <SelectTrigger className="w-[140px] h-10 text-sm" aria-label="Difficulty filter">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFavoriteFilters({ search: '', difficulty: 'all' })
              setLocalSearch('')
            }}
            className="gap-1 text-xs h-10"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        )}
      </div>

      {/* Result count */}
      {data && (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {data.total} favorite{data.total !== 1 ? 's' : ''}
        </p>
      )}

      {/* Content */}
      {isError ? (
        <ErrorState
          title="Failed to load favorites"
          message="Please try again."
          onRetry={() => refetch()}
        />
      ) : isLoading ? (
        favoritesViewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProblemCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <ProblemTableSkeleton />
        )
      ) : !problems.length ? (
        <EmptyState
          icon={<Heart className="h-12 w-12" />}
          title="No favorites yet"
          description={
            hasFilters
              ? 'No favorites match your filters.'
              : 'Heart a problem to add it to your favorites.'
          }
          action={hasFilters ? {
            label: 'Clear filters',
            onClick: () => {
              setFavoriteFilters({ search: '', difficulty: 'all' })
              setLocalSearch('')
            },
          } : undefined}
        />
      ) : favoritesViewMode === 'grid' ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {problems.map((prob) => (
            <motion.div key={prob.id} variants={item}>
              <ProblemCard problem={prob} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <ProblemTable problems={problems} />
      )}
    </div>
  )
}
