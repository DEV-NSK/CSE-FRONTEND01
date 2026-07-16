import { useCallback, useState } from 'react'
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { SubmissionCard } from '@/student/components/coding/SubmissionCard'
import { SubmissionCardSkeleton } from '@/student/components/coding/CodingSkeletons'
import { useSubmissions, LANGUAGE_LABELS } from '@/shared/hooks/useCoding'
import { useCodingStore } from '@/shared/store/codingStore'
import { debounce } from '@/shared/lib/utils'
import { Code2 } from 'lucide-react'
import type { Language, SubmissionStatus } from '@/shared/types/coding'

const PAGE_SIZE = 20

const STATUS_OPTIONS: { value: SubmissionStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'wrong_answer', label: 'Wrong Answer' },
  { value: 'time_limit_exceeded', label: 'Time Limit' },
  { value: 'runtime_error', label: 'Runtime Error' },
  { value: 'compile_error', label: 'Compile Error' },
]

const LANGUAGE_OPTIONS: { value: Language | 'all'; label: string }[] = [
  { value: 'all', label: 'All Languages' },
  ...(['javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'go', 'rust'] as Language[]).map(
    (lang) => ({ value: lang, label: LANGUAGE_LABELS[lang] })
  ),
]

export function SubmissionHistoryPage() {
  const {
    submissionFilters,
    setSubmissionFilters,
    resetSubmissionFilters,
    submissionsPage,
    setSubmissionsPage,
  } = useCodingStore()

  const [localSearch, setLocalSearch] = useState(submissionFilters.search)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((val: string) => setSubmissionFilters({ search: val }), 300),
    []
  )

  const onSearchChange = (val: string) => {
    setLocalSearch(val)
    debouncedSearch(val)
  }

  const { data, isLoading, isError, refetch } = useSubmissions({
    ...submissionFilters,
    page: submissionsPage,
    limit: PAGE_SIZE,
  })

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1

  const hasFilters =
    submissionFilters.search !== '' ||
    submissionFilters.status !== 'all' ||
    submissionFilters.language !== 'all'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Submission History"
        description="Review all your code submissions."
        breadcrumbs={[
          { label: 'Coding', href: '/dashboard/coding' },
          { label: 'Submissions' },
        ]}
      />

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <Input
          placeholder="Search by problem title..."
          value={localSearch}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search submissions"
        />
        <div className="flex flex-wrap gap-2 items-center">
          <Select
            value={submissionFilters.status}
            onValueChange={(val) =>
              setSubmissionFilters({ status: val as SubmissionStatus | 'all' })
            }
          >
            <SelectTrigger className="w-[150px] h-9 text-sm" aria-label="Status filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={submissionFilters.language}
            onValueChange={(val) =>
              setSubmissionFilters({ language: val as Language | 'all' })
            }
          >
            <SelectTrigger className="w-[150px] h-9 text-sm" aria-label="Language filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                resetSubmissionFilters()
                setLocalSearch('')
              }}
              className="gap-1 text-xs h-9"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Result count */}
      {data && (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {data.total} submission{data.total !== 1 ? 's' : ''}
        </p>
      )}

      {/* Content */}
      {isError ? (
        <ErrorState
          title="Failed to load submissions"
          message="Please try again."
          onRetry={() => refetch()}
        />
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <SubmissionCardSkeleton key={i} />
          ))}
        </div>
      ) : !data?.data?.length ? (
        <EmptyState
          icon={<Code2 className="h-12 w-12" />}
          title="No submissions found"
          description={
            hasFilters
              ? 'Try adjusting your filters.'
              : 'Submit a solution to see it here.'
          }
          action={hasFilters ? { label: 'Clear filters', onClick: resetSubmissionFilters } : undefined}
        />
      ) : (
        <div className="space-y-3">
          {data.data.map((sub) => (
            <SubmissionCard key={sub.id} submission={sub} showProblem />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2" role="navigation" aria-label="Pagination">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSubmissionsPage(submissionsPage - 1)}
            disabled={submissionsPage <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {submissionsPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSubmissionsPage(submissionsPage + 1)}
            disabled={submissionsPage >= totalPages}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
