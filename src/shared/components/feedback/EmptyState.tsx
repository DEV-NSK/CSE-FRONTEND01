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
  // Render icon safely: handles all valid React component types and elements
  const iconNode: React.ReactNode = React.useMemo(() => {
    if (icon == null) return null

    // Already a rendered React element — render as-is
    if (React.isValidElement(icon)) return icon

    // Plain function component or class component
    if (typeof icon === 'function') {
      const Icon = icon as React.ElementType
      return <Icon className={compact ? 'h-8 w-8' : 'h-10 w-10'} />
    }

    // React.forwardRef / React.memo components (typeof === 'object' with $$typeof symbol)
    // e.g. Lucide v1.x icons — forwardRef returns { $$typeof: Symbol(react.forward_ref), render }
    if (
      typeof icon === 'object' &&
      icon !== null &&
      '$$typeof' in (icon as object)
    ) {
      const Icon = icon as React.ElementType
      return <Icon className={compact ? 'h-8 w-8' : 'h-10 w-10'} />
    }

    // Primitives (string, number) are valid React children — render directly
    if (typeof icon === 'string' || typeof icon === 'number') {
      return icon
    }

    // Anything else (plain object, boolean, etc.) — swallow it; never render raw objects
    return null
  }, [icon, compact])

  // Render action safely: {label, onClick} config → Button, React node → as-is
  const actionNode: React.ReactNode = React.useMemo(() => {
    if (action == null) return null

    // Already a rendered React element (e.g. <Button>...</Button>)
    if (React.isValidElement(action)) return action

    // Config object with label + onClick
    if (
      typeof action === 'object' &&
      action !== null &&
      'label' in (action as object) &&
      'onClick' in (action as object)
    ) {
      const cfg = action as { label: string; onClick: () => void }
      return <Button onClick={cfg.onClick}>{cfg.label}</Button>
    }

    // Everything else: do NOT render — avoids Error #31 from plain objects
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
