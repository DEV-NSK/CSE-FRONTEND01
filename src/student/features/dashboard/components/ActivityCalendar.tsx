import { memo, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { DashboardActivityDay } from '@/shared/services/dashboard.service'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

interface ActivityCalendarProps {
  activityData?: DashboardActivityDay[]
  isLoading?: boolean
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function formatDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

interface PopupProps {
  date: string
  count: number
  onClose: () => void
}

function ActivityPopup({ date, count, onClose }: PopupProps) {
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
      aria-label={`Activity for ${date}`}
    >
      <div
        className="rounded-[18px] p-5 min-w-[220px] relative"
        style={{
          background: '#0F1629',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-lg transition-colors duration-150"
          style={{ color: 'rgba(255,255,255,0.4)' }}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <p className="text-sm font-semibold mb-3" style={{ color: '#fff' }}>
          {date}
        </p>
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: count > 0 ? '#22C55E' : 'rgba(255,255,255,0.2)' }}
            aria-hidden="true"
          />
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {count > 0
              ? `${count} ${count === 1 ? 'activity' : 'activities'}`
              : 'No activities recorded'}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export const ActivityCalendar = memo(function ActivityCalendar({
  activityData,
  isLoading,
}: ActivityCalendarProps) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<{ date: string; count: number } | null>(null)

  const activityMap = useMemo(() => {
    const m = new Map<string, number>()
    if (activityData) {
      activityData.forEach((d) => m.set(d.date, d.count))
    }
    return m
  }, [activityData])

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
  }

  const handleDayClick = (day: number) => {
    const key = formatDateKey(viewYear, viewMonth, day)
    const count = activityMap.get(key) ?? 0
    const displayDate = new Date(viewYear, viewMonth, day).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })
    setSelectedDate({ date: displayDate, count })
  }

  // Blank cells before month starts
  const blanks = Array.from({ length: firstDay })
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <>
      <AnimatePresence>
        {selectedDate && (
          <ActivityPopup
            date={selectedDate.date}
            count={selectedDate.count}
            onClose={() => setSelectedDate(null)}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.22 }}
        className="rounded-[18px] p-5 flex flex-col gap-4 h-full"
        style={{
          background: '#0F1629',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        }}
        role="region"
        aria-label="Activity calendar"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold" style={{ color: '#fff' }}>
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="h-7 w-7 rounded-lg flex items-center justify-center transition-colors duration-150"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)' }}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextMonth}
              className="h-7 w-7 rounded-lg flex items-center justify-center transition-colors duration-150"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)' }}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="animate-pulse grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-8 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }} />
            ))}
          </div>
        ) : (
          <>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1" aria-hidden="true">
              {DAY_NAMES.map((d) => (
                <div
                  key={d}
                  className="text-center text-[10px] font-semibold uppercase"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1" role="grid" aria-label={`${MONTH_NAMES[viewMonth]} ${viewYear}`}>
              {blanks.map((_, i) => (
                <div key={`blank-${i}`} role="gridcell" aria-hidden="true" />
              ))}
              {days.map((day) => {
                const key = formatDateKey(viewYear, viewMonth, day)
                const count = activityMap.get(key) ?? 0
                const isToday =
                  today.getFullYear() === viewYear &&
                  today.getMonth() === viewMonth &&
                  today.getDate() === day
                const hasActivity = count > 0
                // Future date check
                const thisDate = new Date(viewYear, viewMonth, day)
                const isFuture = thisDate > today

                return (
                  <button
                    key={day}
                    role="gridcell"
                    aria-label={`${day} ${MONTH_NAMES[viewMonth]}${count > 0 ? `, ${count} activities` : ''}`}
                    aria-current={isToday ? 'date' : undefined}
                    onClick={() => handleDayClick(day)}
                    className="relative h-8 rounded-lg flex items-center justify-center text-[12px] font-medium transition-all duration-150"
                    style={{
                      background: isToday
                        ? '#7C5CFC'
                        : 'transparent',
                      color: isToday
                        ? '#fff'
                        : isFuture
                        ? 'rgba(255,255,255,0.2)'
                        : 'rgba(255,255,255,0.75)',
                      cursor: isFuture ? 'default' : 'pointer',
                      outline: 'none',
                    }}
                    disabled={isFuture}
                  >
                    {day}
                    {/* Indicator dots */}
                    {!isToday && hasActivity && (
                      <span
                        className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full"
                        style={{ background: '#22C55E' }}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </>
        )}

        {/* Legend */}
        <div className="flex items-center gap-3 text-[10px] flex-wrap" style={{ color: 'rgba(255,255,255,0.35)' }} aria-label="Calendar legend">
          <div className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-sm inline-block" style={{ background: '#7C5CFC' }} aria-hidden="true" />
            Today
          </div>
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full inline-block" style={{ background: '#22C55E' }} aria-hidden="true" />
            Activity
          </div>
        </div>
      </motion.div>
    </>
  )
})
