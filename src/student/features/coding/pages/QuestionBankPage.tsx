// ─── FPRD-16: Question Bank Home — Topic Cards ───────────────────────────────

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, Library, Sparkles } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { TopicCard, TopicCardSkeleton } from '@/student/components/questionBank/TopicCard'
import { useQuestionBankTopics } from '@/shared/hooks/useQuestionBank'
import { debounce } from '@/shared/lib/utils'
import { cn } from '@/shared/lib/utils'

export function QuestionBankPage() {
  const [search, setSearch] = useState('')
  const { data: topics, isLoading, isError, refetch } = useQuestionBankTopics()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(debounce((v: string) => setSearch(v), 200), [])

  const filtered = Array.isArray(topics)
    ? topics.filter((t) =>
        search.trim() === '' ||
        t.name.toLowerCase().includes(search.toLowerCase()),
      )
    : []

  const totalProblems = Array.isArray(topics)
    ? topics.reduce((sum, t) => sum + t.totalProblems, 0)
    : 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Question Bank"
        description="Browse 50+ topics covering every concept from arrays to advanced algorithms."
        breadcrumbs={[
          { label: 'Coding', href: '/dashboard/coding' },
          { label: 'Question Bank' },
        ]}
      />

      {/* Hero stats strip */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 border border-primary/10 p-5"
      >
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Library className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {totalProblems > 0 ? totalProblems.toLocaleString() : '—'}
              </p>
              <p className="text-xs text-muted-foreground">Total Problems</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-secondary" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {Array.isArray(topics) ? topics.length : '—'}
              </p>
              <p className="text-xs text-muted-foreground">Topics</p>
            </div>
          </div>
          <div className="ml-auto text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground">Dataset being prepared</p>
            <p className="text-xs text-muted-foreground">
              Thousands of curated questions — coming soon
            </p>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder="Search topics (Arrays, DP, Graph...)"
          defaultValue={search}
          onChange={(e) => debouncedSearch(e.target.value)}
          className="pl-9"
          aria-label="Search topics"
        />
      </div>

      {/* Content */}
      {isError ? (
        <ErrorState
          title="Failed to load topics"
          message="Check your connection and try again."
          onRetry={() => refetch()}
        />
      ) : (
        <>
          {/* Section label */}
          {!isLoading && (
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">
                {search.trim() ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''}` : 'Popular Topics'}
              </p>
              {search.trim() && filtered.length === 0 && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="text-xs text-primary hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          )}

          {/* Topic grid */}
          <div
            className={cn(
              'grid gap-4',
              'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
            )}
            role="list"
            aria-label="Topics"
            aria-busy={isLoading}
          >
            {isLoading
              ? Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} role="listitem">
                    <TopicCardSkeleton />
                  </div>
                ))
              : filtered.length === 0
              ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                  <span className="text-5xl mb-4" aria-hidden="true">🔍</span>
                  <p className="text-lg font-semibold text-foreground mb-1">No topics found</p>
                  <p className="text-sm text-muted-foreground">
                    Try a different search term.
                  </p>
                </div>
              )
              : filtered.map((topic, idx) => (
                  <div key={topic.id} role="listitem">
                    <TopicCard topic={topic} index={idx} />
                  </div>
                ))}
          </div>
        </>
      )}
    </div>
  )
}
