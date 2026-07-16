import { WifiOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus'

export function OfflineBanner() {
  const isOnline = useOnlineStatus()

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-destructive text-destructive-foreground py-2 px-4 flex items-center justify-center gap-2 text-sm font-medium"
          role="alert"
          aria-live="assertive"
        >
          <WifiOff className="h-4 w-4" aria-hidden="true" />
          You're offline. Check your internet connection.
        </motion.div>
      )}
    </AnimatePresence>
  )
}
