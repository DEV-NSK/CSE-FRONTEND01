import React from 'react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/components/ui/button'

interface EmptyStateProps {
  /**
   * Accepts either:
   *   - A React element (rendered JSX):  icon={<BookOpen className="h-10 w-10" />}
   *   - A React component constructor:   icon={BookOpen}
   * When a constructor is passed it is rendered as <Icon className="h-10 w-10" />.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any
  title: string
  description?: string
  /**
   * Accepts either:
   *   - A React node (already-rendered element):  action={<Button>Create</Button>}
   *   - A plain config object:                    action={{ label: 'Create', onClick: () => {} }}
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action?: any
  className?: string
  /** Compact variant: smaller padding and icon */
  compact?: boolean
}

export function EmptyState({ icon, title, description, action, className, compact }: EmptyStateProps) {
  // Render icon safely: component constructor → JSX element, React element → as-is
  const iconNode: React.ReactNode = React.useMemo(() => {
    if (!icon) return null
    // Already a rendered React element (has $$typeof Symbol)
    if (React.isValidElement(icon)) return icon
    // Component constructor (function or class) — render it
    if (typeof icon === 'function') {
      const Icon = icon
      return <Icon className={compact ? 'h-8 w-8' : 'h-10 w-10'} />
    }
    // Fallback: treat as ReactNode (string, number, etc.)
    return icon as React.ReactNode
  }, [icon, compact])

  // Render action safely: {label, onClick} config → Button, React node → as-is
  const actionNode: React.ReactNode = React.useMemo(() => {
    if (!action) return null
    if (React.isValidElement(action)) return action
    if (typeof action === 'object' && 'label' in action && 'onClick' in action) {
      return <Button onClick={action.onClick}>{action.label}</Button>
    }
    return null
  }, [action])

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-4 text-center',
        compact ? 'py-8' : 'py-16',
        className,
      )}
      role="status"
    >
      {iconNode != null && (
        <div className="mb-4 text-muted-foreground/50">{iconNode}</div>
      )}
      <h3 className={cn('font-semibold text-foreground mb-2', compact ? 'text-base' : 'text-lg')}>
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      )}
      {actionNode != null && <div>{actionNode}</div>}
    </div>
  )
}
