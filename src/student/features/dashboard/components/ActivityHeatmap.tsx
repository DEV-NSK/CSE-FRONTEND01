import { memo, useMemo, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import type { DashboardActivityDay } from '@/shared/services/dashboard.service'

// GitHub contribution color levels — these stay the same in both themes
// (they are content colors, not UI surface colors)
const LEVEL_COLORS = ['#161B22', '#0E4429', '#006D32', '#26A641', '#39D353']

function getColor(count: number): string {
  if (count === 0) return LEVEL_COLORS[0]
  if (count === 1) return LEVEL_COLORS[1]
  if (count === 2) return LEVEL_COLORS[2]
  if (count === 3) return LEVEL_COLORS[3]
  return LEVEL_COLORS[4]
}

const MONTHS  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS    = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const SQ      = 12   // square size px
const GAP     = 3    // gap px
const WEEKS   = 53
const ROWS    = 7

interface TooltipState {
  visible: boolean; x: number; y: number; date: string; count: number
}

interface ActivityHeatmapProps {
  data?: DashboardActivityDay[]
  isLoading?: boolean
}

function buildGrid(activityMap: Map<string, number>) {
  const today = new Date(); today.setHours(0,0,0,0)
  const start = new Date(today)
  start.setDate(start.getDate() - start.getDay() - (WEEKS - 1) * 7)

  const grid: { date: Date; count: number }[][] = []
  for (let w = 0; w < WEEKS; w++) {
    const col: { date: Date; count: number }[] = []
    for (let d = 0; d < ROWS; d++) {
      const dt = new Date(start)
      dt.setDate(start.getDate() + w * 7 + d)
      col.push({ date: dt, count: activityMap.get(dt.toISOString().slice(0,10)) ?? 0 })
    }
    grid.push(col)
  }
  return grid
}

function getMonthLabels(grid: { date: Date; count: number }[][]) {
  const labels: { label: string; weekIndex: number }[] = []
  let last = -1
  grid.forEach((col, i) => {
    const m = col[0].date.getMonth()
    if (m !== last) { labels.push({ label: MONTHS[m], weekIndex: i }); last = m }
  })
  return labels
}

export const ActivityHeatmap = memo(function ActivityHeatmap({ data, isLoading }: ActivityHeatmapProps) {
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, date: '', count: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const activityMap = useMemo(() => {
    const m = new Map<string, number>()
    data?.forEach(d => m.set(d.date, d.count))
    return m
  }, [data])

  const grid        = useMemo(() => buildGrid(activityMap), [activityMap])
  const monthLabels = useMemo(() => getMonthLabels(grid), [grid])
  const totalContributions = useMemo(() => (data ?? []).reduce((s, d) => s + d.count, 0), [data])

  const svgW = WEEKS * (SQ + GAP)
  const svgH = ROWS  * (SQ + GAP)

  const handleEnter = (e: React.MouseEvent<SVGRectElement>, date: Date, count: number) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const cRect = containerRef.current?.getBoundingClientRect()
    if (!cRect) return
    setTooltip({
      visible: true,
      x: rect.left - cRect.left + SQ / 2,
      y: rect.top  - cRect.top  - 38,
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      count,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-[18px] p-5 flex flex-col gap-4 bg-card border border-border shadow-sm w-full h-full"
      role="region"
      aria-label="Activity heatmap"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base">🔥</span>
          <span className="text-sm font-semibold text-foreground">Activity</span>
        </div>
        {!isLoading && (
          <span className="text-xs text-muted-foreground">
            {totalContributions.toLocaleString()} contributions in the last year
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="rounded-xl animate-pulse bg-muted" style={{ height: svgH + 20 }} />
      ) : (
        <div ref={containerRef} className="relative overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          {/* Tooltip */}
          {tooltip.visible && (
            <div
              className="absolute z-20 pointer-events-none px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap bg-popover border border-border shadow-lg text-popover-foreground"
              style={{ left: tooltip.x, top: tooltip.y, transform: 'translateX(-50%)' }}
              role="tooltip"
            >
              <span className="text-violet-500">{tooltip.date}</span>
              <span className="ml-2 text-muted-foreground">
                {tooltip.count} {tooltip.count === 1 ? 'activity' : 'activities'}
              </span>
            </div>
          )}

          <div style={{ minWidth: svgW + 28 }}>
            {/* Month labels */}
            <div className="flex mb-1.5" style={{ paddingLeft: 28, height: 14 }} aria-hidden="true">
              <div className="relative flex-1" style={{ height: 14 }}>
                {monthLabels.map(({ label, weekIndex }) => (
                  <span
                    key={`${label}-${weekIndex}`}
                    className="absolute text-[10px] text-muted-foreground"
                    style={{ left: weekIndex * (SQ + GAP), whiteSpace: 'nowrap' }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-1.5">
              {/* Day labels */}
              <div
                className="flex flex-col justify-between"
                style={{ width: 24, height: svgH + (ROWS - 1) * GAP - SQ - GAP }}
                aria-hidden="true"
              >
                {[1, 3, 5].map((di) => (
                  <span key={di} className="text-[10px] leading-none text-muted-foreground"
                    style={{ marginTop: di === 1 ? SQ + GAP : 0 }}>
                    {DAYS[di]}
                  </span>
                ))}
              </div>

              {/* SVG grid */}
              <svg width={svgW} height={svgH + (ROWS - 1) * GAP} aria-label="Activity contribution grid">
                {grid.map((col, wi) =>
                  col.map(({ date, count }, di) => {
                    const x = wi * (SQ + GAP)
                    const y = di * (SQ + GAP)
                    const future = date > new Date()
                    return (
                      <rect
                        key={`${wi}-${di}`}
                        x={x} y={y}
                        width={SQ} height={SQ} rx={2}
                        fill={future ? 'transparent' : getColor(count)}
                        style={{ cursor: count > 0 ? 'pointer' : 'default' }}
                        onMouseEnter={e => !future && handleEnter(e, date, count)}
                        onMouseLeave={() => setTooltip(t => ({ ...t, visible: false }))}
                        aria-label={future ? undefined
                          : `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${count} activities`}
                      />
                    )
                  })
                )}
              </svg>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1.5 mt-3 justify-end" aria-label="Color legend">
            <span className="text-[10px] text-muted-foreground">Less</span>
            {LEVEL_COLORS.map((color, i) => (
              <div
                key={i}
                className="rounded-sm border border-border/30"
                style={{ width: SQ, height: SQ, background: color }}
                aria-label={i === 0 ? 'No activity' : `Level ${i}`}
              />
            ))}
            <span className="text-[10px] text-muted-foreground">More</span>
          </div>
        </div>
      )}
    </motion.div>
  )
})
