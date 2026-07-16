import { Bookmark, BookmarkCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'

interface BookmarkButtonProps {
  isBookmarked: boolean
  onToggle: () => void
  loading?: boolean
  size?: 'sm' | 'default'
  className?: string
  label?: string
}

export function BookmarkButton({
  isBookmarked,
  onToggle,
  loading,
  size = 'default',
  className,
  label,
}: BookmarkButtonProps) {
  return (
    <Button
      variant="outline"
      size={size === 'sm' ? 'icon-sm' : 'icon'}
      onClick={onToggle}
      disabled={loading}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      aria-pressed={isBookmarked}
      className={cn(
        'transition-colors',
        isBookmarked && 'border-primary/40 text-primary bg-primary/5 hover:bg-primary/10',
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isBookmarked ? 'bookmarked' : 'not-bookmarked'}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.7, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-1.5"
        >
          {isBookmarked ? (
            <BookmarkCheck className={cn(size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
          ) : (
            <Bookmark className={cn(size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
          )}
          {label && <span className="text-sm">{label}</span>}
        </motion.span>
      </AnimatePresence>
    </Button>
  )
}
