import { LucideIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface ManagerMetricCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'up' | 'down' | 'neutral'
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  description?: string
  className?: string
}

export function ManagerMetricCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'text-violet-600',
  iconBg = 'bg-violet-50',
  description,
  className,
}: ManagerMetricCardProps) {
  return (
    <div
      className={cn(
        'bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow',
        className
      )}
      role="region"
      aria-label={`${title} metric`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
          {change && (
            <p className={cn(
              'text-xs font-medium mt-1.5',
              changeType === 'up' ? 'text-emerald-600' :
              changeType === 'down' ? 'text-red-500' :
              'text-slate-500'
            )}>
              {changeType === 'up' ? '↑' : changeType === 'down' ? '↓' : ''} {change}
            </p>
          )}
        </div>
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', iconBg)}>
          <Icon className={cn('w-5 h-5', iconColor)} aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}
