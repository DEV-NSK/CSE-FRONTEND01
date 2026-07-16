import React from 'react'
import { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'

interface AdminMetricCardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
}

export function AdminMetricCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue 
}: AdminMetricCardProps) {
  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-slate-400" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        {trend && trendValue && (
          <p className={`text-xs ${
            trend === 'up' ? 'text-emerald-600' : 
            trend === 'down' ? 'text-rose-600' : 'text-slate-500'
          } mt-1`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue} from last period
          </p>
        )}
      </CardContent>
    </Card>
  )
}
