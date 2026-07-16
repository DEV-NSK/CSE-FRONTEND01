import { cn } from '@/shared/lib/utils'
import { Card, CardContent } from '@/shared/components/ui/card'
import type { LucideIcon } from 'lucide-react'

interface AnalyticsCardProps {
  label: string
  value: string | number
  suffix?: string
  icon: LucideIcon
  iconColor?: string
  description?: string
  className?: string
}

export function AnalyticsCard({
  label,
  value,
  suffix,
  icon: Icon,
  iconColor = 'text-primary',
  description,
  className,
}: AnalyticsCardProps) {
  return (
    <Card className={cn('', className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          <Icon className={cn('h-4 w-4', iconColor)} aria-hidden="true" />
        </div>
        <p className="text-3xl font-bold text-foreground">
          {value}
          {suffix && <span className="text-lg font-normal text-muted-foreground ml-1">{suffix}</span>}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
