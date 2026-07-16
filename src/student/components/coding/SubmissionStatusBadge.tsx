import { cn } from '@/shared/lib/utils'
import type { SubmissionStatus } from '@/shared/types/coding'

interface SubmissionStatusBadgeProps {
  status: SubmissionStatus
  className?: string
}

const statusConfig: Record<SubmissionStatus, { label: string; className: string }> = {
  accepted: {
    label: 'Accepted',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  wrong_answer: {
    label: 'Wrong Answer',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  time_limit_exceeded: {
    label: 'Time Limit',
    className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  },
  memory_limit_exceeded: {
    label: 'Memory Limit',
    className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  },
  runtime_error: {
    label: 'Runtime Error',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  compile_error: {
    label: 'Compile Error',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  pending: {
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  running: {
    label: 'Running',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
}

export function SubmissionStatusBadge({ status, className }: SubmissionStatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, className: 'bg-muted text-muted-foreground' }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
