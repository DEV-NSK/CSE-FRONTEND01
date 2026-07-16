import { motion } from 'framer-motion'
import { Card, CardContent } from '@/shared/components/ui/card'
import { cn } from '@/shared/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface DashboardStatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: { value: number; label: string }
  colorClass?: string
  index?: number
}

export function DashboardStatCard({
  title, value, icon: Icon, description, trend, colorClass = 'text-primary', index = 0,
}: DashboardStatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
              {description && (
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
              )}
              {trend && (
                <p className={cn('text-xs mt-1 font-medium', trend.value >= 0 ? 'text-success' : 'text-destructive')}>
                  {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
                </p>
              )}
            </div>
            <div className={cn('p-2.5 rounded-lg bg-muted', colorClass)}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
