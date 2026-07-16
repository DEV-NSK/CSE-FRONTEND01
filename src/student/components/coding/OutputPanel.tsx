import { CheckCircle2, XCircle, Clock, MemoryStick, AlertTriangle } from 'lucide-react'
import { SubmissionStatusBadge } from './SubmissionStatusBadge'
import { LoadingSpinner } from '@/shared/components/feedback/LoadingSpinner'
import { cn } from '@/shared/lib/utils'
import type { RunResult } from '@/shared/types/coding'

interface OutputPanelProps {
  result: RunResult | null
  isRunning: boolean
  className?: string
}

export function OutputPanel({ result, isRunning, className }: OutputPanelProps) {
  if (isRunning) {
    return (
      <div className={cn('flex h-full items-center justify-center', className)}>
        <LoadingSpinner size="md" label="Running code..." />
      </div>
    )
  }

  if (!result) {
    return (
      <div className={cn('flex h-full items-center justify-center text-muted-foreground', className)}>
        <div className="text-center space-y-2">
          <p className="text-sm">Run or submit your code to see output.</p>
        </div>
      </div>
    )
  }

  const isAccepted = result.status === 'accepted'
  const hasError = result.errorMessage

  return (
    <div className={cn('h-full overflow-y-auto p-3 space-y-3', className)}>
      {/* Status */}
      <div className="flex items-center gap-2">
        {isAccepted ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" aria-hidden="true" />
        ) : (
          <XCircle className="h-5 w-5 text-destructive" aria-hidden="true" />
        )}
        <SubmissionStatusBadge status={result.status} />
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        {result.runtime !== undefined && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden="true" />
            {result.runtime} ms
          </span>
        )}
        {result.memory !== undefined && (
          <span className="flex items-center gap-1">
            <MemoryStick className="h-3 w-3" aria-hidden="true" />
            {(result.memory / 1024).toFixed(1)} MB
          </span>
        )}
        {result.passedTestCases !== undefined && result.totalTestCases !== undefined && (
          <span className={cn(isAccepted ? 'text-green-600 dark:text-green-400' : 'text-destructive')}>
            {result.passedTestCases} / {result.totalTestCases} test cases passed
          </span>
        )}
      </div>

      {/* Error message */}
      {hasError && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" aria-hidden="true" />
            <pre className="text-xs text-destructive whitespace-pre-wrap font-mono overflow-x-auto">
              {result.errorMessage}
            </pre>
          </div>
        </div>
      )}

      {/* Test case results */}
      {result.testCaseResults && result.testCaseResults.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Test Cases</p>
          {result.testCaseResults.map((tc, idx) => (
            <div
              key={idx}
              className={cn(
                'rounded-md border p-2.5 space-y-1.5',
                tc.passed
                  ? 'border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-950/20'
                  : 'border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Case {idx + 1}</span>
                {tc.passed ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" aria-hidden="true" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-destructive" aria-hidden="true" />
                )}
              </div>
              {tc.input && (
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">Input</p>
                  <pre className="text-xs font-mono bg-background/60 rounded px-2 py-1 overflow-x-auto">
                    {tc.input}
                  </pre>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">Expected</p>
                  <pre className="text-xs font-mono bg-background/60 rounded px-2 py-1 overflow-x-auto">
                    {tc.expectedOutput}
                  </pre>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">Got</p>
                  <pre
                    className={cn(
                      'text-xs font-mono rounded px-2 py-1 overflow-x-auto',
                      tc.passed ? 'bg-background/60' : 'bg-red-100/60 dark:bg-red-950/30'
                    )}
                  >
                    {tc.actualOutput}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Output panel fallback */}
      {result.output && !result.testCaseResults?.length && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Output</p>
          <pre className="text-xs bg-muted/50 rounded-md p-2.5 overflow-x-auto font-mono text-foreground whitespace-pre-wrap">
            {result.output}
          </pre>
        </div>
      )}
    </div>
  )
}
