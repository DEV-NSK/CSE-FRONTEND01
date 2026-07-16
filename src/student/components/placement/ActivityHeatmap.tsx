import { useMemo } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip'
import { cn } from '@/shared/lib/utils'
import type { HeatmapData } from '@/shared/types/analytics'

interface ActivityHeatmapProps {
  data: HeatmapData[]
  year?: number
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

function getColor(count: number): string {
  if (count === 0) return 'bg-muted'
  if (count <= 2) return 'bg-primary/20'
  if (count <= 5) return 'bg-primary/40'
  if (count <= 10) return 'bg-primary/70'
  return 'bg-primary'
}

export function ActivityHeatmap({ data, year = new Date().getFullYear() }: ActivityHeatmapProps) {
  const dataMap = useMemo(() => {
    const m: Record<string, number> = {}
    data.forEach((d) => { m[d.date] = d.count })
    return m
  }, [data])

  const weeks = useMemo(() => {
    const start = new Date(`${year}-01-01`)
    const end = new Date(`${year}-12-31`)
    start.setDate(start.getDate() - start.getDay()) // align to Sunday
    const allWeeks: Date[][] = []
    const cur = new Date(start)
    while (cur <= end) {
      const week: Date[] = []
      for (let d = 0; d < 7; d++) {
        week.push(new Date(cur))
        cur.setDate(cur.getDate() + 1)
      }
      allWeeks.push(week)
    }
    return allWeeks
  }, [year])

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex flex-col gap-1 min-w-max">
        {/* Month labels */}
        <div className="flex gap-1 ml-8">
          {weeks.map((week, wi) => {
            const month = week[0].getMonth()
            const prevMonth = wi > 0 ? weeks[wi - 1][0].getMonth() : -1
            return (
              <div key={wi} className="w-3 text-[9px] text-muted-foreground">
                {month !== prevMonth ? MONTHS[month] : ''}
              </div>
            )
          })}
        </div>
        {/* Day rows */}
        <div className="flex gap-1">
          <div className="flex flex-col gap-1 mr-1 justify-around">
            {DAYS.map((d, i) => (
              <div key={i} className="text-[9px] text-muted-foreground h-3 leading-3 w-6 text-right">{d}</div>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day, di) => {
                const dateStr = day.toISOString().split('T')[0]
                const count = dataMap[dateStr] ?? 0
                const isCurrentYear = day.getFullYear() === year
                return (
                  <Tooltip key={di}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          'h-3 w-3 rounded-sm transition-colors',
                          isCurrentYear ? getColor(count) : 'bg-transparent'
                        )}
                        aria-label={`${dateStr}: ${count} activity`}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      <p>{dateStr}</p>
                      <p>{count} {count === 1 ? 'activity' : 'activities'}</p>
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          ))}
        </div>
        {/* Legend */}
        <div className="flex items-center gap-1 mt-1 ml-8 justify-end">
          <span className="text-[10px] text-muted-foreground mr-1">Less</span>
          {[0, 2, 5, 10, 15].map((v) => (
            <div key={v} className={cn('h-3 w-3 rounded-sm', getColor(v))} />
          ))}
          <span className="text-[10px] text-muted-foreground ml-1">More</span>
        </div>
      </div>
    </div>
  )
}
