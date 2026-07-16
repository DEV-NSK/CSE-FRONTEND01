import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/shared/lib/utils'

interface TechnologyBadgeProps {
  name: string
  icon?: string
  className?: string
}

export function TechnologyBadge({ name, icon, className }: TechnologyBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn('gap-1 text-xs font-normal', className)}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {name}
    </Badge>
  )
}
