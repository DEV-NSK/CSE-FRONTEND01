import { useState, useEffect } from 'react'

function formatTimeLeft(ms: number): string {
  if (ms <= 0) return '0s'
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
}

export function useCountdown(expiresAt: string | null): string | null {
  const [timeLeft, setTimeLeft] = useState<string | null>(null)

  useEffect(() => {
    if (!expiresAt) return

    const update = () => {
      const diff = new Date(expiresAt).getTime() - Date.now()
      setTimeLeft(diff > 0 ? formatTimeLeft(diff) : null)
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  return timeLeft
}
