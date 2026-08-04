import { memo, useMemo, useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { DashboardActivityDay } from '@/shared/services/dashboard.service'

// Color levels matching GitHub contribution graph
const LEVEL_COLORS = [
  '#161B22', // 0 - no activity
  '#0E4429', // 1
  '#006D32', // 2
  '#26A641', // 3
  '#39D353', // 4+
]

function getColor(count: number): string {
  if (count === 0) return LEVEL_COLORS[0]
  if (count === 1) return LEVEL_COLORS[1]
  if (count === 2) return LEVEL_COLORS[2]
  if (count === 3) return LEVEL_COLORS[3]
  return LEVEL_COLORS[4]
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const SQUARE_SIZE = 12
const GAP = 3
const WEEKS = 53
const ROWS = 7

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

// Build a 53×7 grid of { date, count } starting from the Sunday 53 weeks ago
function buildGrid(activityMap: Map<string, number>): { date: Date; count: number }[][] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Start from the Sunday that is 52 full weeks before today's week-start
  const startDate = new Date(today)
  const dayOfWeek = startDate.getDay() // 0=Sun
  startDate.setDate(startDate.getDate() - dayOfWeek - (WEEKS - 1) * 7)

  const grid: { date: Date; count: number }[][] = []

  for (let week = 0; week < WEEKS; week++) {
    const col: { date: Date; count: number }[] = []
    for (let day = 0; day < ROWS; day++) {
      const d = new Date(startDate)
      d.setDate(startDate.getDate() + week * 7 + day)
      const key = d.toISOString().slice(0, 10)
      col.push({ date: d, count: activityMap.get(key) ?? 0 })
    }
    grid.push(col)
  }
  return grid
}

// Get month label positions
function getMonthLabels(grid: { date: Date; count: number }[][]): { label: string; weekIndex: number }[] {
  const labels: { label: string; weekIndex: number }[] = []
  let lastMonth = -1
  grid.forEach((col, i) => {
    const month = col[0].date.getMonth()
    if (month !== lastMonth) {
      labels.push({ label: MONTHS[month], weekIndex: i })
      lastMonth = month
    }
  })
  return labels
}

export const ActivityHeatmap = memo(function ActivityHeatmap({
  data,
  isLoading,
}: ActivityHeatmapProps) {
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, date: '', count: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const activityMap = useMemo(() => {
    const m = new Map<string, number>()
    if (data) {
      data.forEach((d) => m.set(d.date, d.count))
    }
    return m
  }, [data])

  const grid = useMemo(() => buildGrid(activityMap), [activityMap])
  const monthLabels = useMemo(() => getMonthLabels(grid), [grid])

  const totalContributions = useMemo(
    () => (data ?? []).reduce((sum, d) => sum + d.count, 0),
    [data],
  )

  const handleMouseEnter = (
    e: React.MouseEvent<SVGRectElement>,
    date: Date,
    count: number,
  ) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const containerRect = containerRef.current?.getBoundingClientRect()
    if (!containerRect) return
    setTooltip({
      visible: true,
      x: rect.left - containerRect.left + SQUARE_SIZE / 2,
      y: rect.top - containerRect.top - 36,
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      count,
    })
  }

  const handleMouseLeave = () => setTooltip((t) => ({ ...t, visible: false }))

  const svgWidth = WEEKS * (SQUARE_SIZE + GAP)
  const svgHeight = ROWS * (SQUARE_SIZE + GAP)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-[18px] p-5 flex flex-col gap-4"
      style={{
        background: '#0F1629',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}
      role="region"
      aria-label="Activity heatmap"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base">🔥</span>
          <span className="text-sm font-semibold" style={{ color: '#fff' }}>
            Activity
          </span>
        </div>
        {!isLoading && (
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {totalContributions.toLocaleString()} contributions in the last year
          </span>
        )}
      </div>

      {isLoading ? (
        <div
          className="rounded-xl animate-pulse"
          style={{
            height: svgHeight + 20,
            background: 'rgba(255,255,255,0.04)',
          }}
          aria-label="Loading activity heatmap"
        />
      ) : (
        <div
          ref={containerRef}
          className="relative overflow-x-auto"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* Tooltip */}
          {tooltip.visible && (
            <div
              className="absolute z-20 pointer-events-none px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
              style={{
                left: tooltip.x,
                top: tooltip.y,
                transform: 'translateX(-50%)',
                background: 'rgba(15,22,41,0.95)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              }}
              role="tooltip"
            >
              <span style={{ color: '#A78BFA' }}>{tooltip.date}</span>
              <span className="ml-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {tooltip.count} {tooltip.count === 1 ? 'activity' : 'activities'}
              </span>
            </div>
          )}

          <div style={{ minWidth: svgWidth + 28 }}>
            {/* Month labels */}
            <div
              className="flex mb-1.5"
              style={{ paddingLeft: 28, height: 14 }}
              aria-hidden="true"
            >
              <div className="relative flex-1" style={{ height: 14 }}>
                {monthLabels.map(({ label, weekIndex }) => (
                  <span
                    key={`${label}-${weekIndex}`}
                    className="absolute text-[10px]"
                    style={{
                      left: weekIndex * (SQUARE_SIZE + GAP),
                      color: 'rgba(255,255,255,0.4)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Grid with day labels */}
            <div className="flex gap-1.5">
              {/* Day labels */}
              <div
                className="flex flex-col justify-between"
                style={{ width: 24, height: svgHeight + (ROWS - 1) * GAP - SQUARE_SIZE - GAP }}
                aria-hidden="true"
              >
                {[1, 3, 5].map((dayIdx) => (
                  <span
                    key={dayIdx}
                    className="text-[10px] leading-none"
                    style={{
                      color: 'rgba(255,255,255,0.35)',
                      marginTop: dayIdx === 1 ? SQUARE_SIZE + GAP : 0,
                    }}
                  >
                    {DAYS[dayIdx]}
                  </span>
                ))}
              </div>

              {/* SVG heatmap */}
              <svg
                width={svgWidth}
                height={svgHeight + (ROWS - 1) * GAP}
                aria-label="Activity contribution grid"
              >
                {grid.map((col, weekIdx) =>
                  col.map(({ date, count }, dayIdx) => {
                    const x = weekIdx * (SQUARE_SIZE + GAP)
                    const y = dayIdx * (SQUARE_SIZE + GAP)
                    const isFuture = date > new Date()
                    const color = isFuture ? 'transparent' : getColor(count)
                    return (
                      <rect
                        key={`${weekIdx}-${dayIdx}`}
                        x={x}
                        y={y}
                        width={SQUARE_SIZE}
                        height={SQUARE_SIZE}
                        rx={2}
                        fill={color}
                        style={{ cursor: count > 0 ? 'pointer' : 'default' }}
                        onMouseEnter={(e) => !isFuture && handleMouseEnter(e, date, count)}
                        onMouseLeave={handleMouseLeave}
                        aria-label={
                          isFuture
                            ? undefined
                            : `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${count} activities`
                        }
                      />
                    )
                  }),
                )}
              </svg>
            </div>
          </div>

          {/* Legend */}
          <div
            className="flex items-center gap-1.5 mt-3 justify-end"
            aria-label="Color legend"
          >
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Less
            </span>
            {LEVEL_COLORS.map((color, i) => (
              <div
                key={i}
                className="rounded-sm"
                style={{
                  width: SQUARE_SIZE,
                  height: SQUARE_SIZE,
                  background: color,
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
                aria-label={i === 0 ? 'No activity' : `Level ${i}`}
              />
            ))}
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
              More
            </span>
          </div>
        </div>
      )}
    </motion.div>
  )
})
