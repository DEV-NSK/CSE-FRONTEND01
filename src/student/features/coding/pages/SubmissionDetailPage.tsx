import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Clock, MemoryStick, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/feedback/Skeleton'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { SubmissionStatusBadge } from '@/student/components/coding/SubmissionStatusBadge'
import { MonacoEditorWrapper } from '@/student/components/coding/MonacoEditorWrapper'
import { LANGUAGE_LABELS } from '@/shared/hooks/useCoding'
import { useSubmission } from '@/shared/hooks/useCoding'
import { formatDate } from '@/shared/lib/utils'
import { cn } from '@/shared/lib/utils'

export function SubmissionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: submission, isLoading, isError, refetch } = useSubmission(id!)

  if (isError) {
    return (
      <ErrorState
        title="Submission Not Found"
        message="This submission doesn't exist or couldn't be loaded."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Submission Details"
        breadcrumbs={[
          { label: 'Coding', href: '/dashboard/coding' },
          { label: 'Submissions', href: '/dashboard/coding/submissions' },
          { label: 'Details' },
        ]}
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard/coding/submissions">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <SubmissionDetailSkeleton />
      ) : submission ? (
        <div className="space-y-6">
          {/* Result summary card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  {submission.problemTitle && (
                    <Link
                      to={`/dashboard/coding/problems/${submission.problemSlug}`}
                      className="text-lg font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      {submission.problemTitle}
                    </Link>
                  )}
                  <div className="flex items-center flex-wrap gap-3">
                    <SubmissionStatusBadge status={submission.status} />
                    <span className="text-sm text-muted-foreground">
                      {LANGUAGE_LABELS[submission.language] ?? submission.language}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(submission.submittedAt)}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6">
                  {submission.runtime !== undefined && (
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
                        <Clock className="h-3 w-3" />
                        Runtime
                      </div>
                      <p className="text-lg font-bold">{submission.runtime} ms</p>
                    </div>
                  )}
                  {submission.memory !== undefined && (
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
                        <MemoryStick className="h-3 w-3" />
                        Memory
                      </div>
                      <p className="text-lg font-bold">{(submission.memory / 1024).toFixed(1)} MB</p>
                    </div>
                  )}
                  {submission.passedTestCases !== undefined && submission.totalTestCases !== undefined && (
                    <div className="text-center">
                      <p className="text-muted-foreground text-xs mb-1">Test Cases</p>
                      <p
                        className={cn(
                          'text-lg font-bold',
                          submission.passedTestCases === submission.totalTestCases
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-destructive'
                        )}
                      >
                        {submission.passedTestCases}/{submission.totalTestCases}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Failed test case */}
          {submission.failedTestCase && (
            <Card className="border-destructive/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-destructive">
                  <XCircle className="h-5 w-5" />
                  Failed Test Case
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Input</p>
                  <pre className="text-xs font-mono bg-muted/50 rounded-md p-3 overflow-x-auto">
                    {submission.failedTestCase.input}
                  </pre>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Expected Output</p>
                    <pre className="text-xs font-mono bg-green-50/50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded-md p-3 overflow-x-auto">
                      {submission.failedTestCase.expectedOutput}
                    </pre>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Your Output</p>
                    <pre className="text-xs font-mono bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-md p-3 overflow-x-auto">
                      {submission.failedTestCase.actualOutput}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error message */}
          {submission.errorMessage && (
            <Card className="border-destructive/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Error Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs font-mono text-destructive bg-destructive/5 rounded-md p-3 overflow-x-auto whitespace-pre-wrap">
                  {submission.errorMessage}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Execution Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Execution Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex items-center gap-2 text-xs px-3 py-1.5 rounded-full font-medium',
                    submission.status === 'accepted'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  )}
                >
                  {submission.status === 'accepted' ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5" />
                  )}
                  {submission.status === 'accepted' ? 'All test cases passed' : 'Execution failed'}
                </div>
                {submission.runtime !== undefined && (
                  <span className="text-xs text-muted-foreground">in {submission.runtime} ms</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submitted code */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Submitted Code</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-b-lg overflow-hidden" style={{ height: '400px' }}>
                <MonacoEditorWrapper
                  value={submission.code}
                  language={submission.language}
                  readOnly
                  theme="vs-dark"
                  fontSize={13}
                  height="400px"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}

function SubmissionDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-3">
          <Skeleton className="h-6 w-48" />
          <div className="flex gap-3">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-24" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          <Skeleton className="h-96 rounded-lg" />
        </CardContent>
      </Card>
    </div>
  )
}
