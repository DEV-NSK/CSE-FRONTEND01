import { Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'

interface FavoriteButtonProps {
  isFavorite: boolean
  onToggle: () => void
  loading?: boolean
  size?: 'sm' | 'default'
  className?: string
}

export function FavoriteButton({
  isFavorite,
  onToggle,
  loading,
  size = 'default',
  className,
}: FavoriteButtonProps) {
  return (
    <Button
      variant="ghost"
      size={size === 'sm' ? 'icon-sm' : 'icon'}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onToggle()
      }}
      disabled={loading}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={isFavorite}
      className={cn('relative', className)}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isFavorite ? 'filled' : 'empty'}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <Heart
            className={cn(
              'h-4 w-4 transition-colors',
              isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
            )}
            aria-hidden="true"
          />
        </motion.div>
      </AnimatePresence>
    </Button>
  )
}
