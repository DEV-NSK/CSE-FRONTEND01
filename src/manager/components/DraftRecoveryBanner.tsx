/**
 * FPRD-10: Module 21 — Draft Recovery Banner
 * Shows when a previous unsaved draft is detected in localStorage
 */
import { RotateCcw, X, Clock } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'

interface DraftRecoveryBannerProps {
  savedAt?: string | null
  onRecover: () => void
  onDiscard: () => void
  className?: string
}

export function DraftRecoveryBanner({ savedAt, onRecover, onDiscard, className }: DraftRecoveryBannerProps) {
  const formattedTime = savedAt
    ? new Date(savedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <div
      className={cn('flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl', className)}
      role="alert"
      aria-live="polite"
    >
      <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-amber-800">Unsaved draft detected</p>
        {formattedTime && (
          <p className="text-xs text-amber-600 mt-0.5">Last autosaved: {formattedTime}</p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-3 text-xs border-amber-300 text-amber-700 hover:bg-amber-100"
          onClick={onRecover}
        >
          <RotateCcw className="w-3 h-3 mr-1.5" />
          Recover Draft
        </Button>
        <button
          onClick={onDiscard}
          className="p-1 rounded-lg hover:bg-amber-100 text-amber-500 transition-colors"
          aria-label="Discard draft"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
