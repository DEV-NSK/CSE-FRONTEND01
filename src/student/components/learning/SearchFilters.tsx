import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select'
import { cn } from '@/shared/lib/utils'
import type { LearningCategory, Difficulty } from '@/shared/types/learning'

interface SearchFiltersProps {
  search: string
  onSearchChange: (value: string) => void

  difficulty?: Difficulty | 'all'
  onDifficultyChange?: (value: Difficulty | 'all') => void

  categoryId?: string | 'all'
  onCategoryChange?: (value: string) => void
  categories?: LearningCategory[]

  status?: string
  onStatusChange?: (value: string) => void

  onReset?: () => void
  activeFilterCount?: number
  className?: string
  placeholder?: string
}

export function SearchFilters({
  search,
  onSearchChange,
  difficulty,
  onDifficultyChange,
  categoryId,
  onCategoryChange,
  categories,
  status,
  onStatusChange,
  onReset,
  activeFilterCount = 0,
  className,
  placeholder = 'Search...',
}: SearchFiltersProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            aria-label="Search"
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm',
              'placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filters row */}
        <div className="flex gap-2 flex-wrap">
          {onDifficultyChange && (
            <Select
              value={difficulty ?? 'all'}
              onValueChange={(v) => onDifficultyChange(v as Difficulty | 'all')}
            >
              <SelectTrigger className="h-10 w-[140px] text-sm" aria-label="Filter by difficulty">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          )}

          {onCategoryChange && categories && (
            <Select
              value={categoryId ?? 'all'}
              onValueChange={onCategoryChange}
            >
              <SelectTrigger className="h-10 w-[160px] text-sm" aria-label="Filter by category">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {onStatusChange && (
            <Select
              value={status ?? 'all'}
              onValueChange={onStatusChange}
            >
              <SelectTrigger className="h-10 w-[130px] text-sm" aria-label="Filter by status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="not_started">Not Started</SelectItem>
              </SelectContent>
            </Select>
          )}

          {onReset && activeFilterCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="h-10 gap-1.5"
              aria-label={`Clear ${activeFilterCount} active filter${activeFilterCount > 1 ? 's' : ''}`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Clear
              <Badge variant="destructive" className="h-4 px-1 text-[10px]">
                {activeFilterCount}
              </Badge>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
