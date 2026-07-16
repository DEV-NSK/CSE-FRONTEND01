import { cn } from '@/shared/lib/utils'
import type { CodingTag } from '@/shared/types/coding'

interface TagChipProps {
  tag: CodingTag | string
  onClick?: () => void
  active?: boolean
  className?: string
}

export function TagChip({ tag, onClick, active, className }: TagChipProps) {
  const label = typeof tag === 'string' ? tag : tag.name

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium transition-colors',
        'border border-border bg-muted/50 text-muted-foreground',
        onClick && 'cursor-pointer hover:bg-primary/10 hover:text-primary hover:border-primary/30',
        active && 'bg-primary/10 text-primary border-primary/30',
        !onClick && 'cursor-default',
        className
      )}
    >
      {label}
    </button>
  )
}
