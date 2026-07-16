import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutGrid, List, Bookmark, BookmarkX, BookOpen,
  PlayCircle, Clock, Trash2,
} from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { EmptyLearningState } from '@/student/components/learning/EmptyLearningState'
import { BookmarkCardSkeleton } from '@/student/components/learning/LearningSkeletons'
import { useBookmarks, useRemoveBookmark } from '@/shared/hooks/useLearning'
import { useLearningStore } from '@/shared/store/learningStore'
import { debounce } from '@/shared/lib/utils'
import { formatDate, cn } from '@/shared/lib/utils'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select'
import { Search } from 'lucide-react'
import type { BookmarkType } from '@/shared/types/learning'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }

const typeIcon: Record<BookmarkType | 'all', React.ElementType> = {
  roadmap: BookOpen,
  lesson: PlayCircle,
  resource: Bookmark,
  all: Bookmark,
}

export function BookmarksPage() {
  const { bookmarksViewMode, setBookmarksViewMode, bookmarkFilters, setBookmarkFilters } = useLearningStore()
  const [localSearch, setLocalSearch] = useState(bookmarkFilters.search)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetSearch = useCallback(
    debounce((v: string) => setBookmarkFilters({ search: v }), 300),
    []
  )

  const onSearchChange = (v: string) => {
    setLocalSearch(v)
    debouncedSetSearch(v)
  }

  const { data: bookmarks, isLoading, isError, refetch } = useBookmarks({
    search: bookmarkFilters.search,
    sort: bookmarkFilters.sort,
    type: bookmarkFilters.type !== 'all' ? bookmarkFilters.type : undefined,
  })

  const { mutate: removeBookmark, isPending: removing } = useRemoveBookmark()

  const filtered = bookmarks ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookmarks"
        description="Your saved roadmaps, lessons, and resources."
        breadcrumbs={[
          { label: 'Learning', href: '/dashboard/learning' },
          { label: 'Bookmarks' },
        ]}
        actions={
          <div className="flex items-center gap-1 border rounded-md p-1" role="group" aria-label="View mode">
            <Button
              variant={bookmarksViewMode === 'grid' ? 'default' : 'ghost'}
              size="icon-sm"
              onClick={() => setBookmarksViewMode('grid')}
              aria-label="Grid view"
              aria-pressed={bookmarksViewMode === 'grid'}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={bookmarksViewMode === 'list' ? 'default' : 'ghost'}
              size="icon-sm"
              onClick={() => setBookmarksViewMode('list')}
              aria-label="List view"
              aria-pressed={bookmarksViewMode === 'list'}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
          <input
            type="search"
            value={localSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search bookmarks..."
            aria-label="Search bookmarks"
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm',
              'placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            )}
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={bookmarkFilters.type}
            onValueChange={(v) => setBookmarkFilters({ type: v as BookmarkType | 'all' })}
          >
            <SelectTrigger className="h-10 w-[130px]" aria-label="Filter by type">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="roadmap">Roadmaps</SelectItem>
              <SelectItem value="lesson">Lessons</SelectItem>
              <SelectItem value="resource">Resources</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={bookmarkFilters.sort}
            onValueChange={(v) => setBookmarkFilters({ sort: v as 'newest' | 'oldest' })}
          >
            <SelectTrigger className="h-10 w-[120px]" aria-label="Sort bookmarks">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Count */}
      {!isLoading && !isError && (
        <p className="text-sm text-muted-foreground">
          {filtered.length} bookmark{filtered.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Content */}
      {isError ? (
        <ErrorState
          title="Couldn't load bookmarks"
          message="Failed to fetch your bookmarks."
          onRetry={() => refetch()}
        />
      ) : isLoading ? (
        <div className={bookmarksViewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'space-y-3'
        }>
          {[1, 2, 3, 4, 5, 6].map((i) => <BookmarkCardSkeleton key={i} />)}
        </div>
      ) : !filtered.length ? (
        <EmptyLearningState variant="bookmarks" searchQuery={bookmarkFilters.search} />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={bookmarksViewMode}
            variants={container}
            initial="hidden"
            animate="show"
            className={bookmarksViewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3'
            }
          >
            {filtered.map((bm) => {
              const TypeIcon = typeIcon[bm.type] ?? Bookmark
              const href = bm.type === 'roadmap'
                ? `/dashboard/learning/roadmaps/${bm.itemId}`
                : bm.type === 'lesson'
                  ? `/dashboard/learning/lesson/${bm.itemId}`
                  : `/dashboard/learning/resources/${bm.itemId}`

              return (
                <motion.div key={bm.id} variants={item} layout>
                  <Card className="hover:shadow-sm transition-shadow group">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                          <TypeIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            to={href}
                            className="text-sm font-medium hover:text-primary transition-colors line-clamp-2"
                          >
                            {bm.title}
                          </Link>
                          {bm.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{bm.description}</p>
                          )}
                          {bm.roadmapTitle && (
                            <p className="text-xs text-muted-foreground mt-0.5">{bm.roadmapTitle}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs capitalize">{bm.type}</Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(bm.createdAt)}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            asChild
                            className="h-7 w-7 text-muted-foreground hover:text-primary"
                          >
                            <Link to={href} aria-label={`Open ${bm.title}`}>
                              <BookOpen className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => removeBookmark(bm.id)}
                            disabled={removing}
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            aria-label={`Remove bookmark: ${bm.title}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
