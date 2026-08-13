/**
 * FPRD-20: Lesson Completion Modal
 * Beautiful animation: 🎉 confetti + XP/Coins + next lesson unlock
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, ArrowRight, X, Star, Zap, Coins } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'

interface LessonCompletionModalProps {
  isOpen: boolean
  onClose: () => void
  lessonTitle: string
  xp?: number
  coins?: number
  nextLessonId?: string
  nextLessonTitle?: string
  lessonsCompleted?: number
  totalLessons?: number
}

// Simple confetti particles
function Confetti() {
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: ['#facc15', '#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ec4899'][i % 6],
    delay: Math.random() * 0.4,
    duration: 0.8 + Math.random() * 0.6,
  }))
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl" aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-2 h-2 rounded-sm"
          style={{ left: `${p.x}%`, backgroundColor: p.color, top: -8 }}
          initial={{ y: 0, opacity: 1, rotate: 0 }}
          animate={{ y: 300, opacity: 0, rotate: 360 }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  )
}

export function LessonCompletionModal({
  isOpen,
  onClose,
  lessonTitle,
  xp = 20,
  coins = 5,
  nextLessonId,
  nextLessonTitle,
  lessonsCompleted,
  totalLessons,
}: LessonCompletionModalProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true)
      const t = setTimeout(() => setShowConfetti(false), 1500)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-md rounded-2xl bg-background border border-border shadow-2xl pointer-events-auto overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Lesson completed"
            >
              {showConfetti && <Confetti />}

              {/* Close */}
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute top-3 right-3 z-10"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Header gradient */}
              <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 px-8 pt-10 pb-8 text-center text-white">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1 }}
                  className="text-6xl mb-3"
                  aria-hidden="true"
                >
                  🎉
                </motion.div>
                <h2 className="text-2xl font-bold mb-1">Lesson Completed!</h2>
                <p className="text-white/80 text-sm">{lessonTitle}</p>
              </div>

              {/* Rewards */}
              <div className="px-8 py-6 space-y-4">
                {/* XP + Coins */}
                <div className="flex items-center justify-center gap-6">
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                      <Zap className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <span className="text-xl font-black text-yellow-600 dark:text-yellow-400">
                      +{xp} XP
                    </span>
                    <span className="text-xs text-muted-foreground">Experience</span>
                  </motion.div>

                  <div className="h-12 w-px bg-border" aria-hidden="true" />

                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <Star className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="text-xl font-black text-amber-600 dark:text-amber-400">
                      +{coins} Coins
                    </span>
                    <span className="text-xs text-muted-foreground">Earned</span>
                  </motion.div>
                </div>

                {/* Progress */}
                {lessonsCompleted !== undefined && totalLessons !== undefined && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="rounded-xl bg-muted/50 p-3 text-center"
                  >
                    <p className="text-sm text-muted-foreground mb-1.5">Course Progress</p>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.round((lessonsCompleted / totalLessons) * 100)}%`,
                        }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {lessonsCompleted} / {totalLessons} lessons
                    </p>
                  </motion.div>
                )}

                {/* Next lesson */}
                {nextLessonId && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="rounded-xl border border-primary/30 bg-primary/5 p-3"
                  >
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      Next Lesson Unlocked!
                    </div>
                    <p className="text-sm font-medium text-foreground truncate">
                      {nextLessonTitle ?? 'Next Lesson'}
                    </p>
                  </motion.div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" className="flex-1" onClick={onClose}>
                    Stay Here
                  </Button>
                  {nextLessonId ? (
                    <Button className="flex-1 gap-2" asChild>
                      <Link to={`/dashboard/learning/${nextLessonId}`} onClick={onClose}>
                        Next Lesson
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  ) : (
                    <Button className="flex-1" asChild onClick={onClose}>
                      <Link to="/dashboard/learning">Back to Roadmap</Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
