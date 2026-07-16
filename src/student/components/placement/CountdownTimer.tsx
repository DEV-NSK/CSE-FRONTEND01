import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface CountdownTimerProps {
  targetDate: string
  className?: string
  showLabel?: boolean
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calcTimeLeft(target: string): TimeLeft | null {
  const diff = new Date(target).getTime() - Date.now()
  if (diff <= 0) return null
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export function CountdownTimer({ targetDate, className, showLabel = true }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => calcTimeLeft(targetDate))

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calcTimeLeft(targetDate)), 1000)
    return () => clearInterval(id)
  }, [targetDate])

  if (!timeLeft) {
    return (
      <div className={cn('flex items-center gap-1.5 text-sm text-muted-foreground', className)}>
        <Clock className="h-4 w-4" />
        <span>Event has started</span>
      </div>
    )
  }

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showLabel && <Clock className="h-4 w-4 text-muted-foreground shrink-0" />}
      <div className="flex items-center gap-1.5">
        {timeLeft.days > 0 && (
          <>
            <TimeUnit value={timeLeft.days} label="d" />
            <span className="text-muted-foreground text-sm">:</span>
          </>
        )}
        <TimeUnit value={pad(timeLeft.hours) as unknown as number} label="h" />
        <span className="text-muted-foreground text-sm">:</span>
        <TimeUnit value={pad(timeLeft.minutes) as unknown as number} label="m" />
        <span className="text-muted-foreground text-sm">:</span>
        <TimeUnit value={pad(timeLeft.seconds) as unknown as number} label="s" />
      </div>
    </div>
  )
}

function TimeUnit({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-sm font-mono font-bold text-foreground tabular-nums">{value}</span>
      <span className="text-[10px] text-muted-foreground leading-none">{label}</span>
    </div>
  )
}
