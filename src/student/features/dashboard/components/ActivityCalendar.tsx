import { memo, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { DashboardActivityDay } from '@/shared/services/dashboard.service'

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const DAY_NAMES = ['Su','Mo','Tu','We','Th','Fr','Sa']

interface ActivityCalendarProps {
  activityData?: DashboardActivityDay[]
  isLoading?: boolean
}

function fmtKey(y: number, m: number, d: number) {
  return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
}

function ActivityPopup({ date, count, onClose }: { date: string; count: number; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 8 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="rounded-[18px] p-5 min-w-[220px] relative bg-card border border-border shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <p className="text-sm font-semibold text-foreground mb-3">{date}</p>
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${count > 0 ? 'bg-green-500' : 'bg-muted-foreground/30'}`} aria-hidden="true" />
          <span className="text-sm text-muted-foreground">
            {count > 0 ? `${count} ${count === 1 ? 'activity' : 'activities'}` : 'No activities recorded'}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export const ActivityCalendar = memo(function ActivityCalendar({ activityData, isLoading }: ActivityCalendarProps) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selected, setSelected] = useState<{ date: string; count: number } | null>(null)

  const activityMap = useMemo(() => {
    const m = new Map<string, number>()
    activityData?.forEach(d => m.set(d.date, d.count))
    return m
  }, [activityData])

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDay    = new Date(viewYear, viewMonth, 1).getDay()

  const prevMonth = () => viewMonth === 0
    ? (setViewMonth(11), setViewYear(y => y - 1))
    : setViewMonth(m => m - 1)
  const nextMonth = () => viewMonth === 11
    ? (setViewMonth(0), setViewYear(y => y + 1))
    : setViewMonth(m => m + 1)

  const handleDay = (day: number) => {
    const dt = new Date(viewYear, viewMonth, day)
    if (dt > today) return
    setSelected({
      date: dt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      count: activityMap.get(fmtKey(viewYear, viewMonth, day)) ?? 0,
    })
  }

  return (
    <>
      <AnimatePresence>
        {selected && (
          <ActivityPopup date={selected.date} count={selected.count} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.22 }}
        className="rounded-[18px] p-5 flex flex-col gap-4 h-full w-full bg-card border border-border shadow-sm"
        role="region"
        aria-label="Activity calendar"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="h-7 w-7 rounded-lg flex items-center justify-center bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextMonth}
              className="h-7 w-7 rounded-lg flex items-center justify-center bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="animate-pulse grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-8 rounded-lg bg-muted" />
            ))}
          </div>
        ) : (
          <>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1" aria-hidden="true">
              {DAY_NAMES.map(d => (
                <div key={d} className="text-center text-[10px] font-semibold uppercase text-muted-foreground">
                  {d}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-1" role="grid" aria-label={`${MONTH_NAMES[viewMonth]} ${viewYear}`}>
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`b${i}`} role="gridcell" aria-hidden="true" />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const count   = activityMap.get(fmtKey(viewYear, viewMonth, day)) ?? 0
                const isToday = today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day
                const future  = new Date(viewYear, viewMonth, day) > today

                return (
                  <button
                    key={day}
                    role="gridcell"
                    aria-label={`${day} ${MONTH_NAMES[viewMonth]}${count > 0 ? `, ${count} activities` : ''}`}
                    aria-current={isToday ? 'date' : undefined}
                    onClick={() => handleDay(day)}
                    disabled={future}
                    className={[
                      'relative h-8 rounded-lg flex items-center justify-center text-[12px] font-medium transition-all duration-150 outline-none',
                      isToday  ? 'bg-violet-500 text-white'
                      : future ? 'text-muted-foreground/30 cursor-default'
                      :          'text-foreground hover:bg-muted cursor-pointer',
                    ].join(' ')}
                  >
                    {day}
                    {/* Activity dot */}
                    {!isToday && count > 0 && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-green-500" aria-hidden="true" />
                    )}
                  </button>
                )
              })}
            </div>
          </>
        )}

        {/* Legend */}
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-sm inline-block bg-violet-500" aria-hidden="true" />Today
          </div>
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full inline-block bg-green-500" aria-hidden="true" />Activity
          </div>
        </div>
      </motion.div>
    </>
  )
})
