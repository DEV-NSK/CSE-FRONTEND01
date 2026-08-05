import { memo, useMemo, useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { DashboardActivityDay } from '@/shared/services/dashboard.service'

// ── Color levels (GitHub-style) ───────────────────────────────────────────────
const LEVEL_COLORS_LIGHT = ['#ebedf0', '#0E4429', '#006D32', '#26A641', '#39D353']
const LEVEL_COLORS_DARK  = ['#161b22', '#0E4429', '#006D32', '#26A641', '#39D353']

function getThemeLevelColors(): string[] {
  if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) {
    return LEVEL_COLORS_DARK
  }
  return LEVEL_COLORS_LIGHT
}

function getLevel(count: number): number {
  if (count === 0) return 0
  if (count === 1) return 1
  if (count === 2) return 2
  if (count <= 4) return 3
  return 4
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Cell dimensions
const SQ  = 11   // cell size px
const GAP = 2    // gap between cells

interface TooltipState {
  visible: boolean
  x: number
  y: number
  date: string
  count: number
}

interface ActivityHeatmapProps {
  data?: DashboardActivityDay[]
  isLoading?: boolean
}

/**
 * Build 52-week grid (Sunday-start) for the last 365 days.
 * Returns array of weeks (newest week last), each week is 7 day slots (Sun→Sat).
 * Slots before today-364 or in the future are null.
 */
function buildYearGrid(activityMap: Map<string, number>) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Go back 364 days (52 full weeks + today = 365 days)
  const start = new Date(today)
  start.setDate(start.getDate() - 364)

  // Align start to Sunday
  const startDow = start.getDay() // 0=Sun
  start.setDate(start.getDate() - startDow)

  const weeks: ({ date: Date; count: number } | null)[][] = []
  const cursor = new Date(start)

  while (cursor <= today) {
    const week: ({ date: Date; count: number } | null)[] = []
    for (let d = 0; d < 7; d++) {
      const day = new Date(cursor)
      if (day > today) {
        week.push(null)
      } else {
        const key = day.toISOString().slice(0, 10)
        week.push({ date: day, count: activityMap.get(key) ?? 0 })
      }
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
}

/**
 * Get month label positions — returns { label, weekIndex } for each month change.
 */
function getMonthLabels(weeks: ({ date: Date; count: number } | null)[][]) {
  const labels: { label: string; weekIndex: number }[] = []
  let lastMonth = -1
  weeks.forEach((week, wi) => {
    const firstReal = week.find(c => c !== null)
    if (!firstReal) return
    const m = firstReal.date.getMonth()
    if (m !== lastMonth) {
      labels.push({ label: MONTH_NAMES[m], weekIndex: wi })
      lastMonth = m
    }
  })
  return labels
}

export const ActivityHeatmap = memo(function ActivityHeatmap({ data, isLoading }: ActivityHeatmapProps) {
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, date: '', count: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Watch dark/light class changes
  const [, setThemeTick] = useState(0)
  useEffect(() => {
    const obs = new MutationObserver(() => setThemeTick(t => t + 1))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  const LEVEL_COLORS = getThemeLevelColors()

  // Auto-scroll to end (most recent) on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [isLoading])

  const activityMap = useMemo(() => {
    const m = new Map<string, number>()
    data?.forEach(d => m.set(d.date, d.count))
    return m
  }, [data])

  const weeks = useMemo(() => buildYearGrid(activityMap), [activityMap])
  const monthLabels = useMemo(() => getMonthLabels(weeks), [weeks])

  const totalContributions = useMemo(
    () => (data ?? []).reduce((s, d) => s + d.count, 0),
    [data],
  )

  // SVG dimensions
  const svgW = weeks.length * (SQ + GAP) - GAP
  const svgH = 7 * (SQ + GAP) - GAP

  // Day labels (only Mon, Wed, Fri — alternating, matching GitHub)
  const dayLabels = [
    { label: '',    show: false }, // Sun
    { label: 'Mon', show: true  }, // Mon
    { label: '',    show: false }, // Tue
    { label: 'Wed', show: true  }, // Wed
    { label: '',    show: false }, // Thu
    { label: 'Fri', show: true  }, // Fri
    { label: '',    show: false }, // Sat
  ]

  const handleEnter = (e: React.MouseEvent<SVGRectElement>, date: Date, count: number) => {
    const rect  = e.currentTarget.getBoundingClientRect()
    const cRect = containerRef.current?.getBoundingClientRect()
    if (!cRect) return
    setTooltip({
      visible: true,
      x: rect.left - cRect.left + SQ / 2,
      y: rect.top  - cRect.top  - 40,
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
      count,
    })
  }

  const skeletonWeeks = 52

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl p-4 bg-card border border-border shadow-sm w-full"
      role="region"
      aria-label="Activity heatmap — last year"
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm" aria-hidden="true">🔥</span>
          <span className="text-sm font-semibold text-foreground">Activity</span>
        </div>
        {!isLoading && (
          <span className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{totalContributions}</span>
            {' '}contributions in the last year
          </span>
        )}
      </div>

      {isLoading ? (
        /* ── Skeleton ── */
        <div className="overflow-x-auto">
          <div className="flex gap-1.5 min-w-max">
            {/* day labels column */}
            <div className="flex flex-col gap-[2px] pt-4" style={{ minWidth: 24 }}>
              {dayLabels.map((d, i) => (
                <div key={i} className="h-[11px] text-[9px] text-muted-foreground/40 flex items-center justify-end pr-1">
                  {d.show ? d.label : ''}
                </div>
              ))}
            </div>
            {/* skeleton columns */}
            {Array.from({ length: skeletonWeeks }).map((_, wi) => (
              <div key={wi} className="flex flex-col gap-[2px] mt-4">
                {Array.from({ length: 7 }).map((__, di) => (
                  <div
                    key={di}
                    className="rounded-sm animate-pulse bg-muted"
                    style={{ width: SQ, height: SQ }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div ref={containerRef} className="relative">
          {/* Tooltip */}
          {tooltip.visible && (
            <div
              className="absolute z-20 pointer-events-none px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap bg-popover border border-border shadow-lg text-popover-foreground"
              style={{ left: tooltip.x, top: tooltip.y, transform: 'translateX(-50%)' }}
              role="tooltip"
            >
              <span className="font-semibold text-foreground">{tooltip.count} {tooltip.count === 1 ? 'contribution' : 'contributions'}</span>
              <span className="text-muted-foreground ml-1">on {tooltip.date}</span>
            </div>
          )}

          {/* Scrollable heatmap */}
          <div
            ref={scrollRef}
            className="overflow-x-auto pb-1"
            style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
          >
            <div className="flex gap-0 min-w-max">
              {/* Day-of-week labels column */}
              <div
                className="flex flex-col shrink-0 pr-1"
                style={{ gap: GAP, paddingTop: 16 /* leave room for month labels */ }}
                aria-hidden="true"
              >
                {dayLabels.map((d, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-end text-[9px] text-muted-foreground"
                    style={{ height: SQ, minWidth: 24 }}
                  >
                    {d.show ? d.label : ''}
                  </div>
                ))}
              </div>

              {/* Grid column */}
              <div className="relative">
                {/* Month labels row */}
                <div
                  className="flex mb-1 h-4 relative"
                  style={{ width: svgW }}
                  aria-hidden="true"
                >
                  {monthLabels.map(({ label, weekIndex }) => (
                    <span
                      key={`${label}-${weekIndex}`}
                      className="absolute text-[10px] text-muted-foreground"
                      style={{ left: weekIndex * (SQ + GAP) }}
                    >
                      {label}
                    </span>
                  ))}
                </div>

                {/* SVG cell grid */}
                <svg
                  width={svgW}
                  height={svgH}
                  aria-label="Contribution grid for the last year"
                  onMouseLeave={() => setTooltip(t => ({ ...t, visible: false }))}
                >
                  {weeks.map((week, wi) =>
                    week.map((cell, di) => {
                      if (!cell) return null
                      const x = wi * (SQ + GAP)
                      const y = di * (SQ + GAP)
                      const color = LEVEL_COLORS[getLevel(cell.count)]
                      return (
                        <rect
                          key={`${wi}-${di}`}
                          x={x} y={y}
                          width={SQ} height={SQ}
                          rx={2} ry={2}
                          fill={color}
                          style={{ cursor: 'pointer', transition: 'opacity 0.1s' }}
                          onMouseEnter={e => handleEnter(e, cell.date, cell.count)}
                          aria-label={`${cell.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${cell.count} contributions`}
                        />
                      )
                    })
                  )}
                </svg>
              </div>
            </div>
          </div>

          {/* Legend row */}
          <div className="flex items-center gap-1 mt-2 justify-end" aria-label="Color legend">
            <span className="text-[10px] text-muted-foreground mr-0.5">Less</span>
            {LEVEL_COLORS.map((color, i) => (
              <div
                key={i}
                className="rounded-sm"
                style={{ width: SQ - 1, height: SQ - 1, background: color, border: '1px solid rgba(0,0,0,0.06)' }}
                aria-label={i === 0 ? 'No contributions' : `Level ${i}`}
              />
            ))}
            <span className="text-[10px] text-muted-foreground ml-0.5">More</span>
          </div>
        </div>
      )}
    </motion.div>
  )
})
