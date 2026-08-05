import { memo, useMemo, useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { DashboardActivityDay } from '@/shared/services/dashboard.service'

// ── Color levels ──────────────────────────────────────────────────────────────
const LEVEL_COLORS_LIGHT = ['#E2E8F0', '#0E4429', '#006D32', '#26A641', '#39D353']
const LEVEL_COLORS_DARK  = ['#2D3748', '#0E4429', '#006D32', '#26A641', '#39D353']

function getThemeLevelColors(): string[] {
  if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) {
    return LEVEL_COLORS_DARK
  }
  return LEVEL_COLORS_LIGHT
}

function getColor(count: number, colors: string[]): string {
  if (count === 0) return colors[0]
  if (count === 1) return colors[1]
  if (count === 2) return colors[2]
  if (count === 3) return colors[3]
  return colors[4]
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const SQ  = 13   // cell size px
const GAP = 3    // gap px

interface TooltipState {
  visible: boolean; x: number; y: number; date: string; count: number
}

interface ActivityHeatmapProps {
  data?: DashboardActivityDay[]
  isLoading?: boolean
}

/**
 * Build a grid for a single month.
 * Returns: array of weeks, each week is an array of 7 day cells.
 * Cells before the 1st or after the last day are null (padding).
 */
function buildMonthGrid(year: number, month: number, activityMap: Map<string, number>) {
  const firstDay = new Date(year, month, 1)
  const lastDay  = new Date(year, month + 1, 0)
  const startDow = firstDay.getDay()  // 0=Sun

  const weeks: (null | { date: Date; count: number })[][] = []
  let week: (null | { date: Date; count: number })[] = Array(startDow).fill(null)

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dt   = new Date(year, month, d)
    const key  = dt.toISOString().slice(0, 10)
    const future = dt > new Date()
    week.push(future ? null : { date: dt, count: activityMap.get(key) ?? 0 })
    if (week.length === 7) { weeks.push(week); week = [] }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null)
    weeks.push(week)
  }
  return weeks
}

export const ActivityHeatmap = memo(function ActivityHeatmap({ data, isLoading }: ActivityHeatmapProps) {
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, date: '', count: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Re-derive theme colors on dark/light toggle
  const [, setThemeTick] = useState(0)
  useEffect(() => {
    const obs = new MutationObserver(() => setThemeTick(t => t + 1))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  const LEVEL_COLORS = getThemeLevelColors()

  const activityMap = useMemo(() => {
    const m = new Map<string, number>()
    data?.forEach(d => m.set(d.date, d.count))
    return m
  }, [data])

  // Current month
  const now          = new Date()
  const year         = now.getFullYear()
  const month        = now.getMonth()
  const monthName    = now.toLocaleString('default', { month: 'long' })
  const totalDays    = new Date(year, month + 1, 0).getDate()

  // Total contributions this month only
  const monthContributions = useMemo(() => {
    let total = 0
    for (let d = 1; d <= totalDays; d++) {
      const key = new Date(year, month, d).toISOString().slice(0, 10)
      total += activityMap.get(key) ?? 0
    }
    return total
  }, [activityMap, year, month, totalDays])

  const grid = useMemo(() => buildMonthGrid(year, month, activityMap), [activityMap, year, month])

  const svgW = grid.length * (SQ + GAP) - GAP
  const svgH = 7 * (SQ + GAP) - GAP

  const handleEnter = (e: React.MouseEvent<SVGRectElement>, date: Date, count: number) => {
    const rect  = e.currentTarget.getBoundingClientRect()
    const cRect = containerRef.current?.getBoundingClientRect()
    if (!cRect) return
    setTooltip({
      visible: true,
      x: rect.left - cRect.left + SQ / 2,
      y: rect.top  - cRect.top  - 36,
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      count,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl p-4 bg-card border border-border shadow-sm w-full"
      role="region"
      aria-label="Activity heatmap"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base" aria-hidden="true">🔥</span>
          <span className="text-sm font-semibold text-foreground">Activity</span>
          <span className="text-xs text-muted-foreground font-medium">— {monthName} {year}</span>
        </div>
        {!isLoading && (
          <span className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{monthContributions}</span> activities this month
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="rounded-lg animate-pulse bg-muted" style={{ height: svgH + 24 }} />
      ) : (
        <div ref={containerRef} className="relative">
          {/* Tooltip */}
          {tooltip.visible && (
            <div
              className="absolute z-20 pointer-events-none px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap bg-popover border border-border shadow-md text-popover-foreground"
              style={{ left: tooltip.x, top: tooltip.y, transform: 'translateX(-50%)' }}
              role="tooltip"
            >
              <span className="text-primary">{tooltip.date}</span>
              <span className="ml-1.5 text-muted-foreground">
                {tooltip.count} {tooltip.count === 1 ? 'activity' : 'activities'}
              </span>
            </div>
          )}

          <div className="flex gap-3">
            {/* Day-of-week labels */}
            <div className="flex flex-col" style={{ gap: GAP, paddingTop: 0 }} aria-hidden="true">
              {DAY_NAMES.map((d, i) => (
                <div
                  key={d}
                  className="text-[10px] text-muted-foreground leading-none flex items-center justify-end"
                  style={{ height: SQ, visibility: i % 2 === 1 ? 'visible' : 'hidden' }}
                >
                  {d.slice(0, 1)}
                </div>
              ))}
            </div>

            {/* Month grid */}
            <div className="flex-1">
              {/* Week date labels */}
              <div className="flex mb-1" style={{ gap: GAP }}>
                {grid.map((week, wi) => {
                  const firstReal = week.find(c => c !== null)
                  return (
                    <div
                      key={wi}
                      className="text-[10px] text-muted-foreground text-center"
                      style={{ width: SQ, flexShrink: 0 }}
                      aria-hidden="true"
                    >
                      {firstReal ? firstReal.date.getDate() : ''}
                    </div>
                  )
                })}
              </div>

              {/* SVG cell grid */}
              <svg
                width={svgW}
                height={svgH}
                aria-label={`${monthName} activity grid`}
              >
                {grid.map((week, wi) =>
                  week.map((cell, di) => {
                    if (!cell) return null
                    const x = wi * (SQ + GAP)
                    const y = di * (SQ + GAP)
                    return (
                      <rect
                        key={`${wi}-${di}`}
                        x={x} y={y}
                        width={SQ} height={SQ} rx={2}
                        fill={getColor(cell.count, LEVEL_COLORS)}
                        style={{ cursor: cell.count > 0 ? 'pointer' : 'default' }}
                        onMouseEnter={e => handleEnter(e, cell.date, cell.count)}
                        onMouseLeave={() => setTooltip(t => ({ ...t, visible: false }))}
                        aria-label={`${cell.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${cell.count} activities`}
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
                className="rounded-sm"
                style={{ width: SQ - 2, height: SQ - 2, background: color }}
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
