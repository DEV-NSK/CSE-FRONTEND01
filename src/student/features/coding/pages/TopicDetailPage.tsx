// ─── FPRD-16: Topic Detail Page — Problems grouped by difficulty ─────────────

import { useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Search, ChevronRight, Filter, RotateCcw, SlidersHorizontal,
} from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Skeleton } from '@/shared/components/feedback/Skeleton'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { DifficultySection } from '@/student/components/questionBank/DifficultySection'
import { getTopicMeta } from '@/student/components/questionBank/topicIcons'
import { useQuestionBankTopic } from '@/shared/hooks/useQuestionBank'
import { useCodingCompanies, useCodingTags } from '@/shared/hooks/useCoding'
import { debounce } from '@/shared/lib/utils'
import { cn } from '@/shared/lib/utils'
import type { QuestionBankProblem, TopicFilters } from '@/shared/types/questionBank'

const defaultFilters: TopicFilters = {
  search: '',
  difficulty: 'all',
  status: 'all',
  companyId: 'all',
  tagId: 'all',
  sort: 'default',
}

export function TopicDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [filters, setFilters] = useState<TopicFilters>(defaultFilters)
  const [localSearch, setLocalSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const topicMeta = getTopicMeta(slug ?? '')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((v: string) => setFilters((f) => ({ ...f, search: v })), 300),
    [],
  )

  const { data, isLoading, isError, refetch } = useQuestionBankTopic(slug ?? '', {
    search: filters.search || undefined,
    companyId: filters.companyId === 'all' ? undefined : filters.companyId,
    tagId: filters.tagId === 'all' ? undefined : filters.tagId,
    limit: 100,
  })

  const { data: companies } = useCodingCompanies()
  const { data: tags } = useCodingTags()

  const topic = data?.topic
  const raw = data?.problems ?? { easy: [], medium: [], hard: [] }

  // Apply client-side difficulty / status / sort filters
  const applyFilters = (problems: QuestionBankProblem[]): QuestionBankProblem[] => {
    let list = [...problems]

    if (filters.status === 'solved') list = list.filter((p) => p.isSolved)
    else if (filters.status === 'unsolved') list = list.filter((p) => !p.isSolved)

    if (filters.sort === 'title_asc') list.sort((a, b) => a.title.localeCompare(b.title))
    else if (filters.sort === 'title_desc') list.sort((a, b) => b.title.localeCompare(a.title))
    else if (filters.sort === 'acceptance_asc') list.sort((a, b) => a.acceptanceRate - b.acceptanceRate)
    else if (filters.sort === 'acceptance_desc') list.sort((a, b) => b.acceptanceRate - a.acceptanceRate)

    return list
  }

  const easy   = filters.difficulty !== 'all' && filters.difficulty !== 'easy'   ? [] : applyFilters(raw.easy)
  const medium = filters.difficulty !== 'all' && filters.difficulty !== 'medium' ? [] : applyFilters(raw.medium)
  const hard   = filters.difficulty !== 'all' && filters.difficulty !== 'hard'   ? [] : applyFilters(raw.hard)

  const hasFilters =
    filters.search !== '' ||
    filters.difficulty !== 'all' ||
    filters.status !== 'all' ||
    filters.companyId !== 'all' ||
    filters.tagId !== 'all' ||
    filters.sort !== 'default'

  const resetFilters = () => {
    setFilters(defaultFilters)
    setLocalSearch('')
  }

  if (isError) {
    return (
      <div className="flex h-64 items-center justify-center">
        <ErrorState
          title="Topic not found"
          message="This topic doesn't exist or failed to load."
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/dashboard/coding" className="hover:text-foreground transition-colors">
          Coding
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <Link to="/dashboard/coding/question-bank" className="hover:text-foreground transition-colors">
          Question Bank
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        {isLoading ? (
          <Skeleton className="h-4 w-24" />
        ) : (
          <span className="text-foreground font-medium">{topic?.name}</span>
        )}
      </nav>

      {/* Topic header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-4"
      >
        {/* Icon */}
        <div
          className={cn(
            'flex items-center justify-center h-14 w-14 rounded-xl text-2xl shrink-0',
            topicMeta.color,
          )}
          aria-hidden="true"
        >
          {topicMeta.icon}
        </div>

        {/* Title + stats */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-foreground">{topic?.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="text-sm text-muted-foreground">
                  {topic?.totalProblems ?? 0} Problems
                </span>
                {topic && topic.totalProblems > 0 && (
                  <>
                    <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 text-xs">
                      Easy {topic.easy}
                    </Badge>
                    <Badge variant="outline" className="text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800 text-xs">
                      Medium {topic.medium}
                    </Badge>
                    <Badge variant="outline" className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 text-xs">
                      Hard {topic.hard}
                    </Badge>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Filter bar */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur pt-2 pb-3 -mx-1 px-1 space-y-3">
        {/* Search + toggle */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="Search questions..."
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value)
                debouncedSearch(e.target.value)
              }}
              className="pl-9"
              aria-label="Search questions in this topic"
            />
          </div>
          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
            className="gap-1.5 shrink-0"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Filters</span>
            {hasFilters && (
              <span className="ml-0.5 h-2 w-2 rounded-full bg-primary" aria-label="Active filters" />
            )}
          </Button>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="gap-1 text-xs shrink-0"
              aria-label="Reset all filters"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reset
            </Button>
          )}
        </div>

        {/* Expanded filter row */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {/* Difficulty */}
            <Select
              value={filters.difficulty}
              onValueChange={(v) => setFilters((f) => ({ ...f, difficulty: v as any }))}
            >
              <SelectTrigger className="w-[130px] h-9 text-sm" aria-label="Difficulty filter">
                <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>

            {/* Status */}
            <Select
              value={filters.status}
              onValueChange={(v) => setFilters((f) => ({ ...f, status: v as any }))}
            >
              <SelectTrigger className="w-[120px] h-9 text-sm" aria-label="Status filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="solved">Solved</SelectItem>
                <SelectItem value="unsolved">Unsolved</SelectItem>
              </SelectContent>
            </Select>

            {/* Company */}
            <Select
              value={filters.companyId}
              onValueChange={(v) => setFilters((f) => ({ ...f, companyId: v }))}
            >
              <SelectTrigger className="w-[140px] h-9 text-sm" aria-label="Company filter">
                <SelectValue placeholder="Company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {Array.isArray(companies) && companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Tags */}
            <Select
              value={filters.tagId}
              onValueChange={(v) => setFilters((f) => ({ ...f, tagId: v }))}
            >
              <SelectTrigger className="w-[120px] h-9 text-sm" aria-label="Tag filter">
                <SelectValue placeholder="Tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {Array.isArray(tags) && tags.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select
              value={filters.sort}
              onValueChange={(v) => setFilters((f) => ({ ...f, sort: v as any }))}
            >
              <SelectTrigger className="w-[160px] h-9 text-sm" aria-label="Sort order">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="title_asc">Title A → Z</SelectItem>
                <SelectItem value="title_desc">Title Z → A</SelectItem>
                <SelectItem value="acceptance_asc">Acceptance ↑</SelectItem>
                <SelectItem value="acceptance_desc">Acceptance ↓</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>
        )}
      </div>

      {/* Problem sections grouped by difficulty */}
      <div className="space-y-4">
        <DifficultySection
          difficulty="easy"
          problems={easy}
          totalCount={topic?.easy ?? 0}
          isLoading={isLoading}
          defaultOpen={true}
        />
        <DifficultySection
          difficulty="medium"
          problems={medium}
          totalCount={topic?.medium ?? 0}
          isLoading={isLoading}
          defaultOpen={true}
        />
        <DifficultySection
          difficulty="hard"
          problems={hard}
          totalCount={topic?.hard ?? 0}
          isLoading={isLoading}
          defaultOpen={false}
        />
      </div>
    </div>
  )
}
