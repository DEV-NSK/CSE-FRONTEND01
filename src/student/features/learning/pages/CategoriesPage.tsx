import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { CategoryCard } from '@/student/components/learning/LearningCard'
import { CategoryCardSkeleton } from '@/student/components/learning/LearningSkeletons'
import { EmptyLearningState } from '@/student/components/learning/EmptyLearningState'
import { useCategories } from '@/shared/hooks/useLearning'
import { useLearningStore } from '@/shared/store/learningStore'
import { debounce } from '@/shared/lib/utils'
import { Search, SortAsc } from 'lucide-react'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select'
import { cn } from '@/shared/lib/utils'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

export function CategoriesPage() {
  const { categorySearch, categorySort, setCategorySearch, setCategorySort } = useLearningStore()
  const [localSearch, setLocalSearch] = useState(categorySearch)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetSearch = useCallback(debounce((v: string) => setCategorySearch(v), 300), [])

  const onSearchChange = (v: string) => {
    setLocalSearch(v)
    debouncedSetSearch(v)
  }

  const { data: categories, isLoading, isError, refetch } = useCategories({
    search: categorySearch,
    sort: categorySort,
  })

  const filtered = categories ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning Categories"
        description="Explore topics organized by subject area."
        breadcrumbs={[
          { label: 'Learning', href: '/dashboard/learning' },
          { label: 'Categories' },
        ]}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
          <input
            type="search"
            value={localSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search categories..."
            aria-label="Search categories"
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm',
              'placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            )}
          />
        </div>
        <Select value={categorySort} onValueChange={setCategorySort}>
          <SelectTrigger className="h-10 w-[160px]" aria-label="Sort categories">
            <SortAsc className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name (A–Z)</SelectItem>
            <SelectItem value="-name">Name (Z–A)</SelectItem>
            <SelectItem value="roadmapCount">Most Roadmaps</SelectItem>
            <SelectItem value="progress">Progress</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      {!isLoading && !isError && (
        <p className="text-sm text-muted-foreground">
          {filtered.length} categor{filtered.length !== 1 ? 'ies' : 'y'}
          {categorySearch ? ` matching "${categorySearch}"` : ''}
        </p>
      )}

      {/* Content */}
      {isError ? (
        <ErrorState
          title="Couldn't load categories"
          message="Failed to fetch learning categories."
          onRetry={() => refetch()}
        />
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <CategoryCardSkeleton key={i} />)}
        </div>
      ) : !filtered.length ? (
        <EmptyLearningState variant="categories" searchQuery={categorySearch} />
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filtered.map((cat) => (
            <motion.div key={cat.id} variants={item}>
              <CategoryCard category={cat} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
