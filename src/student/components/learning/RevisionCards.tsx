/**
 * FPRD-20: Revision Cards (Flashcards)
 * Flip animation — front shows question, back shows answer.
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, RotateCcw, RefreshCw } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/shared/lib/utils'

export interface FlashCard {
  id: string
  front: string  // question / concept
  back: string   // answer / explanation
  category?: string
}

interface RevisionCardsProps {
  cards: FlashCard[]
  title?: string
}

export function RevisionCards({ cards, title = 'Revision Cards' }: RevisionCardsProps) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [known, setKnown] = useState<Set<string>>(new Set())
  const [needsReview, setNeedsReview] = useState<Set<string>>(new Set())

  const card = cards[currentIdx]
  const isFirst = currentIdx === 0
  const isLast = currentIdx === cards.length - 1

  const next = () => { setCurrentIdx((i) => Math.min(i + 1, cards.length - 1)); setIsFlipped(false) }
  const prev = () => { setCurrentIdx((i) => Math.max(i - 1, 0)); setIsFlipped(false) }
  const restart = () => { setCurrentIdx(0); setIsFlipped(false); setKnown(new Set()); setNeedsReview(new Set()) }

  const markKnown = () => {
    setKnown((k) => new Set([...k, card.id]))
    setNeedsReview((r) => { const next = new Set(r); next.delete(card.id); return next })
    if (!isLast) next()
  }

  const markReview = () => {
    setNeedsReview((r) => new Set([...r, card.id]))
    setKnown((k) => { const next = new Set(k); next.delete(card.id); return next })
    if (!isLast) next()
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <RefreshCw className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-base font-bold">{title}</h3>
            <p className="text-xs text-muted-foreground">{cards.length} cards · click to flip</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {known.size > 0 && (
            <Badge variant="success" className="text-xs gap-1">
              ✓ {known.size} known
            </Badge>
          )}
          {needsReview.size > 0 && (
            <Badge variant="warning" className="text-xs gap-1">
              📚 {needsReview.size} review
            </Badge>
          )}
        </div>
      </div>

      {/* Card */}
      <div
        className="relative cursor-pointer select-none"
        style={{ perspective: 1000 }}
        onClick={() => setIsFlipped((f) => !f)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' || e.key === ' ' ? setIsFlipped((f) => !f) : undefined}
        aria-label={isFlipped ? 'Show question' : 'Show answer'}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative"
        >
          {/* Front */}
          <div
            className={cn(
              'rounded-xl border border-border shadow-sm bg-card',
              'min-h-[180px] flex flex-col items-center justify-center p-8',
              'backface-hidden',
            )}
            style={{ backfaceVisibility: 'hidden' }}
          >
            <Badge variant="outline" className="mb-4 text-xs">
              {card.category ?? 'Concept'}
            </Badge>
            <p className="text-center font-semibold text-lg text-foreground leading-relaxed">
              {card.front}
            </p>
            <p className="text-xs text-muted-foreground mt-4">Click to reveal answer →</p>
          </div>

          {/* Back */}
          <div
            className={cn(
              'absolute inset-0 rounded-xl border border-primary/40 shadow-sm',
              'bg-gradient-to-br from-primary/5 via-card to-primary/5',
              'min-h-[180px] flex flex-col items-center justify-center p-8',
            )}
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <Badge variant="default" className="mb-4 text-xs">Answer</Badge>
            <p className="text-center text-foreground leading-relaxed">{card.back}</p>
          </div>
        </motion.div>
      </div>

      {/* Know / Review buttons */}
      <AnimatePresence>
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex gap-2"
          >
            <Button
              variant="outline"
              className="flex-1 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
              size="sm"
              onClick={(e) => { e.stopPropagation(); markReview() }}
            >
              📚 Needs Review
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-green-300 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950/30"
              size="sm"
              onClick={(e) => { e.stopPropagation(); markKnown() }}
            >
              ✓ Got It!
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon-sm" onClick={prev} disabled={isFirst} className="h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Dots */}
        <div className="flex items-center gap-1">
          {cards.map((c, i) => (
            <button
              key={c.id}
              onClick={() => { setCurrentIdx(i); setIsFlipped(false) }}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === currentIdx
                  ? 'w-4 bg-primary'
                  : known.has(c.id)
                    ? 'w-1.5 bg-green-400'
                    : needsReview.has(c.id)
                      ? 'w-1.5 bg-amber-400'
                      : 'w-1.5 bg-muted-foreground/30',
              )}
              aria-label={`Card ${i + 1}`}
            />
          ))}
        </div>

        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={restart}
            className="h-8 w-8"
            aria-label="Restart"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={next} disabled={isLast} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        {currentIdx + 1} / {cards.length}
      </p>
    </div>
  )
}
