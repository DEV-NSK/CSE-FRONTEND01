import { Link } from 'react-router-dom'
import { Clock, MemoryStick, Code2 } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { SubmissionStatusBadge } from './SubmissionStatusBadge'
import { LANGUAGE_LABELS } from '@/shared/hooks/useCoding'
import { formatDate } from '@/shared/lib/utils'
import type { Submission } from '@/shared/types/coding'

interface SubmissionCardProps {
  submission: Submission
  showProblem?: boolean
}

export function SubmissionCard({ submission, showProblem = false }: SubmissionCardProps) {
  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-1.5">
            {showProblem && submission.problemTitle && (
              <Link
                to={`/dashboard/coding/problems/${submission.problemSlug}`}
                className="text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
              >
                {submission.problemTitle}
              </Link>
            )}
            <div className="flex items-center flex-wrap gap-2">
              <SubmissionStatusBadge status={submission.status} />
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Code2 className="h-3 w-3" aria-hidden="true" />
                {LANGUAGE_LABELS[submission.language] ?? submission.language}
              </span>
              {submission.runtime !== undefined && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  {submission.runtime} ms
                </span>
              )}
              {submission.memory !== undefined && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MemoryStick className="h-3 w-3" aria-hidden="true" />
                  {(submission.memory / 1024).toFixed(1)} MB
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDate(submission.submittedAt)}
            </p>
          </div>

          <Link
            to={`/dashboard/coding/submissions/${submission.id}`}
            className="shrink-0 text-xs text-primary hover:underline"
            aria-label={`View submission details`}
          >
            Details
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
