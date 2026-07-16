import { LucideIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface AnalyticsCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'up' | 'down' | 'neutral'
  icon: LucideIcon
  className?: string
  sub?: string
}

export function AnalyticsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  className,
  sub,
}: AnalyticsCardProps) {
  return (
    <div
      className={cn(
        'bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors',
        className
      )}
      role="region"
      aria-label={`${title}: ${value}`}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">{title}</p>
        <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-blue-400" aria-hidden="true" />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-slate-600 mt-0.5">{sub}</p>}
      {change && (
        <p className={cn(
          'text-xs font-medium mt-2',
          changeType === 'up' ? 'text-emerald-400' :
          changeType === 'down' ? 'text-red-400' :
          'text-slate-500'
        )}>
          {changeType === 'up' ? '↑' : changeType === 'down' ? '↓' : ''} {change}
        </p>
      )}
    </div>
  )
}
