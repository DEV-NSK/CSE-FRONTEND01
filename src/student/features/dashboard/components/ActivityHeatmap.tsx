import { memo, useMemo, useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { DashboardActivityDay } from '@/shared/services/dashboard.service'

// ── Color levels (GitHub-style) ───────────────────────────────────────────────
const LEVEL_COLORS_LIGHT = ['#ebedf0', '#0E4429', '#006D32', '#26A641', '#39D353']
const LEVEL_COLORS_DARK  = ['#2d333b', '#0E4429', '#006D32', '#26A641', '#39D353']

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

// ── Motivational quotes ───────────────────────────────────────────────────────
const QUOTES = [
  { text: 'Every expert was once a beginner. Keep going.', author: 'Helen Hayes' },
  { text: 'Code is like humor. When you have to explain it, it\'s bad.', author: 'Cory House' },
  { text: 'The best time to plant a tree was 20 years ago. The second best time is now.', author: 'Chinese Proverb' },
  { text: 'First, solve the problem. Then, write the code.', author: 'John Johnson' },
  { text: 'Programs must be written for people to read.', author: 'Harold Abelson' },
  { text: 'The only way to learn a new programming language is by writing programs in it.', author: 'Dennis Ritchie' },
  { text: 'Consistency beats intensity. Show up every day.', author: '' },
  { text: 'Your only limit is the amount of work you are willing to put in.', author: '' },
]

// Cell dimensions
const SQ  = 11
const GAP = 2

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

function buildYearGrid(activityMap: Map<string, number>) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const start = new Date(today)
  start.setDate(start.getDate() - 364)

  // Align start to Sunday
  start.setDate(start.getDate() - start.getDay())

  const weeks: ({ date: Date; count: number } | null)[][] = []
  const cursor = new Date(start)

  while (cursor <= today) {
    const week: ({ date: Date; count: number } | null)[] = []
    for (let d = 0; d < 7; d++) {
      const day = new Date(cursor)
      week.push(day > today ? null : { date: day, count: activityMap.get(day.toISOString().slice(0, 10)) ?? 0 })
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
}

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

  const [, setThemeTick] = useState(0)
  useEffect(() => {
    const obs = new MutationObserver(() => setThemeTick(t => t + 1))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  const LEVEL_COLORS = getThemeLevelColors()

  // Pick a stable quote (changes daily)
  const quote = useMemo(() => {
    const idx = new Date().getDate() % QUOTES.length
    return QUOTES[idx]
  }, [])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
  }, [isLoading])

  const activityMap = useMemo(() => {
    const m = new Map<string, number>()
    data?.forEach(d => m.set(d.date, d.count))
    return m
  }, [data])

  const weeks = useMemo(() => buildYearGrid(activityMap), [activityMap])
  const monthLabels = useMemo(() => getMonthLabels(weeks), [weeks])
  const totalContributions = useMemo(() => (data ?? []).reduce((s, d) => s + d.count, 0), [data])

  const svgW = weeks.length * (SQ + GAP) - GAP
  const svgH = 7 * (SQ + GAP) - GAP

  // Only Mon / Wed / Fri shown (GitHub style)
  const dayLabels = [
    { label: '',    show: false },
    { label: 'Mon', show: true  },
    { label: '',    show: false },
    { label: 'Wed', show: true  },
    { label: '',    show: false },
    { label: 'Fri', show: true  },
    { label: '',    show: false },
  ]

  const handleEnter = (e: React.MouseEvent<SVGRectElement>, date: Date, count: number) => {
    const rect  = e.currentTarget.getBoundingClientRect()
    const cRect = containerRef.current?.getBoundingClientRect()
    if (!cRect) return
    setTooltip({
      visible: true,
      x: rect.left - cRect.left + SQ / 2,
      y: rect.top  - cRect.top  - 38,
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
      count,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl bg-card border border-border shadow-sm w-full overflow-hidden"
      role="region"
      aria-label="Activity heatmap — last year"
    >
      <div className="px-4 pt-3 pb-3">

        {/* ── Header row: title left, contribution count right ── */}
        <div className="flex items-center justify-between mb-2">
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
          <div className="flex gap-0 overflow-hidden">
            <div className="flex flex-col gap-[2px] pr-1 pt-4" style={{ minWidth: 24 }}>
              {dayLabels.map((d, i) => (
                <div key={i} className="h-[11px] text-[9px] text-muted-foreground/30 flex items-center justify-end pr-1">
                  {d.show ? d.label : ''}
                </div>
              ))}
            </div>
            <div className="flex gap-[2px] overflow-hidden mt-4">
              {Array.from({ length: 52 }).map((_, wi) => (
                <div key={wi} className="flex flex-col gap-[2px]">
                  {Array.from({ length: 7 }).map((__, di) => (
                    <div key={di} className="rounded-sm animate-pulse bg-muted" style={{ width: SQ, height: SQ }} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ── Live grid ── */
          <div ref={containerRef} className="relative">
            {tooltip.visible && (
              <div
                className="absolute z-20 pointer-events-none px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap bg-popover border border-border shadow-lg text-popover-foreground"
                style={{ left: tooltip.x, top: tooltip.y, transform: 'translateX(-50%)' }}
                role="tooltip"
              >
                <span className="font-semibold text-foreground">
                  {tooltip.count} {tooltip.count === 1 ? 'contribution' : 'contributions'}
                </span>
                <span className="text-muted-foreground ml-1">on {tooltip.date}</span>
              </div>
            )}

            {/*
              Desktop (md+): grid left (shrink-0) + quote right (flex-1) — side by side.
              Mobile (<md):  grid on top, quote below — stacked.
            */}
            <div className="flex flex-col md:flex-row md:items-stretch gap-3 w-full">

              {/* Grid — natural pixel width, scrollable on mobile */}
              <div
                ref={scrollRef}
                className="shrink-0 overflow-x-auto"
                style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
              >
                <div className="flex gap-0 min-w-max">
                  {/* Day labels */}
                  <div
                    className="flex flex-col shrink-0 pr-1"
                    style={{ gap: GAP, paddingTop: 16 }}
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

                  {/* SVG grid */}
                  <div className="relative">
                    {/* Month labels */}
                    <div className="flex mb-1 h-4 relative" style={{ width: svgW }} aria-hidden="true">
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

                    <svg
                      width={svgW}
                      height={svgH}
                      onMouseLeave={() => setTooltip(t => ({ ...t, visible: false }))}
                    >
                      {weeks.map((week, wi) =>
                        week.map((cell, di) => {
                          if (!cell) return null
                          return (
                            <rect
                              key={`${wi}-${di}`}
                              x={wi * (SQ + GAP)} y={di * (SQ + GAP)}
                              width={SQ} height={SQ} rx={2} ry={2}
                              fill={LEVEL_COLORS[getLevel(cell.count)]}
                              style={{ cursor: 'pointer' }}
                              onMouseEnter={e => handleEnter(e, cell.date, cell.count)}
                            />
                          )
                        })
                      )}
                    </svg>
                  </div>
                </div>
              </div>

              {/* Quote panel:
                  - Desktop: flex-1, border-l, vertically centered — fills empty right space
                  - Mobile: full width, border-t, compact strip below grid
              */}
              <div className="
                flex flex-col justify-center min-w-0
                pt-2 border-t border-border/40
                md:pt-0 md:border-t-0 md:border-l md:pl-4 md:flex-1
              ">
                <span className="text-base mb-1 leading-none" aria-hidden="true">💡</span>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  <span className="italic text-foreground/75">"{quote.text}"</span>
                </p>
                {quote.author && (
                  <p className="text-[10px] font-semibold text-muted-foreground/70 mt-1">
                    — {quote.author}
                  </p>
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-1 mt-2 justify-end" aria-label="Color legend">
              <span className="text-[10px] text-muted-foreground mr-0.5">Less</span>
              {LEVEL_COLORS.map((color, i) => (
                <div
                  key={i}
                  className="rounded-sm"
                  style={{ width: SQ - 1, height: SQ - 1, background: color, border: '1px solid rgba(0,0,0,0.06)' }}
                />
              ))}
              <span className="text-[10px] text-muted-foreground ml-0.5">More</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
})
