import { useState, useCallback, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, BookOpen, Map, PlayCircle, X } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { EmptyLearningState } from '@/student/components/learning/EmptyLearningState'
import { SearchResultsSkeleton } from '@/student/components/learning/LearningSkeletons'
import { DifficultyBadge } from '@/student/components/learning/DifficultyBadge'
import { useSearch } from '@/shared/hooks/useLearning'
import { cn } from '@/shared/lib/utils'
import { debounce } from '@/shared/lib/utils'
import type { LearningCategory, Roadmap, Lesson } from '@/shared/types/learning'

/** Highlights matched query text in a string */
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim() || !text) return <>{text}</>
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-800/50 text-foreground rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

export function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQ = searchParams.get('q') ?? ''
  const [inputValue, setInputValue] = useState(initialQ)
  const [query, setQuery] = useState(initialQ)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetQuery = useCallback(debounce((v: string) => {
    setQuery(v)
    setSearchParams(v ? { q: v } : {})
  }, 300), [])

  useEffect(() => {
    const q = searchParams.get('q') ?? ''
    if (q !== query) {
      setInputValue(q)
      setQuery(q)
    }
  }, [searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

  const onInputChange = (v: string) => {
    setInputValue(v)
    debouncedSetQuery(v)
  }

  const clearSearch = () => {
    setInputValue('')
    setQuery('')
    setSearchParams({})
  }

  const { data: results, isLoading, isError, refetch } = useSearch(query)

  const hasResults = results && (
    results.categories.length > 0 ||
    results.roadmaps.length > 0 ||
    results.lessons.length > 0
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Search"
        description="Search across categories, roadmaps, and lessons."
        breadcrumbs={[
          { label: 'Learning', href: '/dashboard/learning' },
          { label: 'Search' },
        ]}
      />

      {/* Search input */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
        <input
          type="search"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Search roadmaps, lessons, topics..."
          aria-label="Search learning content"
          autoFocus
          className={cn(
            'flex h-11 w-full rounded-lg border border-input bg-background pl-9 pr-10 py-2 text-sm',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          )}
        />
        {inputValue && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Results */}
      <div className="space-y-8" aria-live="polite" aria-label="Search results">
        {!query || query.length < 2 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="h-10 w-10 text-muted-foreground/30 mb-3" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              Type at least 2 characters to search
            </p>
          </div>
        ) : isLoading ? (
          <SearchResultsSkeleton />
        ) : isError ? (
          <ErrorState
            title="Search failed"
            message="Something went wrong. Please try again."
            onRetry={() => refetch()}
          />
        ) : !hasResults ? (
          <EmptyLearningState variant="search" searchQuery={query} />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={query}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Summary */}
              <p className="text-sm text-muted-foreground">
                Found{' '}
                <strong className="text-foreground">{results.total}</strong>{' '}
                result{results.total !== 1 ? 's' : ''} for{' '}
                <strong className="text-foreground">"{query}"</strong>
              </p>

              {/* Categories */}
              {results.categories.length > 0 && (
                <ResultGroup
                  title="Categories"
                  icon={BookOpen}
                  count={results.categories.length}
                >
                  {results.categories.map((cat) => (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Link to={`/dashboard/learning/roadmaps?category=${cat.id}`}>
                        <Card className="hover:shadow-sm transition-shadow cursor-pointer group">
                          <CardContent className="p-4 flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                              style={{ backgroundColor: cat.color + '20' }}
                              aria-hidden="true"
                            >
                              {cat.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium group-hover:text-primary transition-colors">
                                <Highlight text={cat.name} query={query} />
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                <Highlight text={cat.description} query={query} />
                              </p>
                            </div>
                            <Badge variant="secondary" className="text-xs shrink-0">
                              {cat.roadmapCount} roadmaps
                            </Badge>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </ResultGroup>
              )}

              {/* Roadmaps */}
              {results.roadmaps.length > 0 && (
                <ResultGroup
                  title="Roadmaps"
                  icon={Map}
                  count={results.roadmaps.length}
                >
                  {results.roadmaps.map((roadmap) => (
                    <motion.div
                      key={roadmap.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Link to={`/dashboard/learning/roadmaps/${roadmap.slug}`}>
                        <Card className="hover:shadow-sm transition-shadow cursor-pointer group">
                          <CardContent className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                              <Map className="h-5 w-5 text-primary" aria-hidden="true" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium group-hover:text-primary transition-colors">
                                <Highlight text={roadmap.title} query={query} />
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                <Highlight text={roadmap.description} query={query} />
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <DifficultyBadge difficulty={roadmap.difficulty} />
                              <Badge variant="outline" className="text-xs">{roadmap.category.name}</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </ResultGroup>
              )}

              {/* Lessons */}
              {results.lessons.length > 0 && (
                <ResultGroup
                  title="Lessons"
                  icon={PlayCircle}
                  count={results.lessons.length}
                >
                  {results.lessons.map((lesson) => (
                    <motion.div
                      key={lesson.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Link to={`/dashboard/learning/lesson/${lesson.id}`}>
                        <Card className="hover:shadow-sm transition-shadow cursor-pointer group">
                          <CardContent className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center shrink-0">
                              <PlayCircle className="h-5 w-5 text-secondary" aria-hidden="true" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium group-hover:text-primary transition-colors">
                                <Highlight text={lesson.title} query={query} />
                              </p>
                              {lesson.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  <Highlight text={lesson.description} query={query} />
                                </p>
                              )}
                            </div>
                            {lesson.roadmapTitle && (
                              <Badge variant="outline" className="text-xs shrink-0 hidden sm:flex">
                                {lesson.roadmapTitle}
                              </Badge>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </ResultGroup>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

// ─── Result group wrapper ─────────────────────────────────────────────────────

function ResultGroup({
  title,
  icon: Icon,
  count,
  children,
}: {
  title: string
  icon: React.ElementType
  count: number
  children: React.ReactNode
}) {
  return (
    <section aria-labelledby={`group-${title}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <h2 id={`group-${title}`} className="text-sm font-semibold text-foreground">
          {title}
        </h2>
        <Badge variant="secondary" className="text-xs">{count}</Badge>
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  )
}
