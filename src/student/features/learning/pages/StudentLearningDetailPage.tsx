import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Play,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Check,
  Award,
  Sparkles,
  BookOpen,
  Link2,
  CheckCircle2,
  Clock,
  Circle,
  X,
  Download,
  Map as MapIcon,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useStudentLearningContent,
  useStartLesson,
  useCompleteLesson,
} from '@/shared/hooks/useStudentLearning'
import type { LearningProgressStatus, LearningNoteImage } from '@/shared/types/learning-cms'
import { Skeleton } from '@/shared/components/feedback/Skeleton'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Progress } from '@/shared/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { useToast } from '@/shared/hooks/useToast'
import { cn } from '@/shared/lib/utils'

// ─── Status config ────────────────────────────────────────────────────────────

function statusConfig(s: LearningProgressStatus | null | undefined) {
  if (s === 'COMPLETED')
    return {
      label: 'Completed',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      className: 'text-emerald-600 border-emerald-500/40 bg-emerald-500/10',
    }
  if (s === 'IN_PROGRESS')
    return {
      label: 'In Progress',
      icon: <Clock className="w-3.5 h-3.5" />,
      className: 'text-blue-600 border-blue-500/40 bg-blue-500/10',
    }
  return {
    label: 'Available',
    icon: <Circle className="w-3.5 h-3.5" />,
    className: 'text-muted-foreground border-border',
  }
}

// ─── Convert Instagram reel URL → embed URL ───────────────────────────────────
// Handles formats:
//   https://www.instagram.com/reel/SHORTCODE/
//   https://www.instagram.com/p/SHORTCODE/

function toInstagramEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url)
    if (!u.hostname.includes('instagram.com')) return null
    // Normalise: strip trailing slash, add /embed/
    const clean = u.pathname.replace(/\/$/, '')
    return `https://www.instagram.com${clean}/embed/`
  } catch {
    return null
  }
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="space-y-5">
      {/* header */}
      <div className="flex items-start gap-3">
        <Skeleton className="h-8 w-16 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-7 w-72" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>
      {/* two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Skeleton className="h-[560px] rounded-2xl" />
        <Skeleton className="h-[560px] rounded-2xl" />
      </div>
    </div>
  )
}

// ─── Reel iframe panel ────────────────────────────────────────────────────────

interface ReelPanelProps {
  reelUrl: string
  topicName: string
  dayNumber: number
}

function ReelPanel({ reelUrl, topicName, dayNumber }: ReelPanelProps) {
  const embedUrl = toInstagramEmbedUrl(reelUrl)

  return (
    <div className="flex flex-col h-full">
      {/* Section heading */}
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded bg-pink-500/10 border border-pink-500/20">
            <Play className="w-3 h-3 text-pink-500 fill-pink-500/80" />
          </span>
          Watch Reel
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5 ml-7">Short-form lesson</p>
      </div>

      {/* Reel container — pink border as in reference */}
      <div className="flex-1 rounded-2xl border-2 border-pink-400/30 bg-card overflow-hidden flex flex-col items-center justify-center p-4 gap-3">
        {embedUrl ? (
          <>
            {/* 9:16 iframe */}
            <div
              className="relative w-full overflow-hidden rounded-xl"
              style={{ maxWidth: '320px', aspectRatio: '9/16' }}
            >
              <iframe
                src={embedUrl}
                className="absolute inset-0 w-full h-full border-0 rounded-xl"
                allowFullScreen
                scrolling="no"
                title={`Reel: Day ${dayNumber} — ${topicName}`}
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              />
            </div>

            {/* Open in Instagram link */}
            <a
              href={reelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-pink-500 transition-colors"
            >
              Open in Instagram
              <ExternalLink className="w-3 h-3" />
            </a>
          </>
        ) : (
          /* Fallback when URL is not a valid Instagram link */
          <a
            href={reelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-4 p-8 text-center"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg shadow-pink-500/30 group-hover:scale-105 transition-transform"
              style={{
                background: 'linear-gradient(135deg, #f472b6, #a855f7, #6366f1)',
              }}
            >
              <Play className="w-7 h-7 text-white fill-white ml-1" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-base">Watch Reel</p>
              <p className="text-xs text-muted-foreground mt-1">
                Day {String(dayNumber).padStart(2, '0')} — {topicName}
              </p>
            </div>
            <span className="text-xs text-pink-500 flex items-center gap-1">
              Open in Instagram <ExternalLink className="w-3 h-3" />
            </span>
          </a>
        )}
      </div>
    </div>
  )
}

// ─── Notes viewer ─────────────────────────────────────────────────────────────

interface NotesViewerProps {
  notes: LearningNoteImage[]
}

function NotesViewer({ notes }: NotesViewerProps) {
  const [idx, setIdx] = useState(0)
  const [fsOpen, setFsOpen] = useState(false)
  const [zoom, setZoom] = useState(1)

  // Reset index when notes change
  useEffect(() => {
    if (idx >= notes.length && notes.length > 0) setIdx(0)
  }, [notes.length, idx])

  const prev = () => setIdx((i) => (i - 1 + notes.length) % notes.length)
  const next = () => setIdx((i) => (i + 1) % notes.length)

  // Keyboard nav when fullscreen
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'Escape') setFsOpen(false)
      else if (e.key === 'f') setFsOpen((v) => !v)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useEffect(() => {
    if (!fsOpen) return
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [fsOpen, handleKey])

  // Download current note image
  const handleDownload = async () => {
    if (!notes[idx]) return
    try {
      const res = await fetch(notes[idx].imageUrl)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `note-page-${idx + 1}.jpg`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // fallback: open in new tab
      window.open(notes[idx].imageUrl, '_blank')
    }
  }

  if (notes.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded bg-blue-500/10 border border-blue-500/20">
              <BookOpen className="w-3 h-3 text-blue-500" />
            </span>
            Today's Notes
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 ml-7">Read along and understand the concept</p>
        </div>
        <div className="flex-1 rounded-2xl border border-dashed border-border flex items-center justify-center">
          <EmptyState
            icon={BookOpen}
            title="No notes uploaded yet"
            description="Notes will appear here when uploaded."
            compact
          />
        </div>
      </div>
    )
  }

  const current = notes[idx]

  return (
    <div className="flex flex-col h-full">
      {/* Section heading */}
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded bg-blue-500/10 border border-blue-500/20">
            <BookOpen className="w-3 h-3 text-blue-500" />
          </span>
          Today's Notes
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5 ml-7">Read along and understand the concept</p>
      </div>

      {/* Notes container — matching height style of reel panel */}
      <div className="flex-1 rounded-2xl border border-border bg-card overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-muted/20">
          <span className="text-xs font-mono text-muted-foreground">
            {idx + 1} / {notes.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
              className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
              className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDownload}
              className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Download note"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => { setZoom(1); setFsOpen(true) }}
              className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Fullscreen (F)"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Image area */}
        <div className="flex-1 relative overflow-hidden bg-muted/10 group">
          <ScrollArea className="w-full h-full" style={{ minHeight: '400px' }}>
            <div
              className="w-full flex items-center justify-center p-3 transition-transform duration-200"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center top', minHeight: '400px' }}
            >
              <img
                src={current.imageUrl}
                alt={`Notes page ${idx + 1}`}
                className="max-w-full object-contain rounded-lg select-none"
                style={{ maxHeight: '480px' }}
                draggable={false}
              />
            </div>
          </ScrollArea>

          {/* Side nav arrows */}
          {notes.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 border border-border shadow-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 border border-border shadow-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Bottom nav */}
        {notes.length > 1 && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/60">
            <button
              onClick={prev}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </button>

            {/* Dot indicators */}
            <div className="flex items-center gap-1.5">
              {notes.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={cn(
                    'rounded-full transition-all duration-150',
                    i === idx
                      ? 'w-4 h-1.5 bg-blue-500'
                      : 'w-1.5 h-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60',
                  )}
                  aria-label={`Go to page ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {notes.length > 1 && (
        <div className="flex items-center gap-2 mt-2.5 overflow-x-auto pb-1">
          {notes.map((n, i) => (
            <button
              key={n.id}
              onClick={() => setIdx(i)}
              className={cn(
                'shrink-0 w-12 h-12 rounded-lg border overflow-hidden transition-all duration-150',
                i === idx
                  ? 'border-blue-500 ring-2 ring-blue-500/25'
                  : 'border-border opacity-50 hover:opacity-80',
              )}
              aria-label={`Notes page ${i + 1}`}
            >
              <img src={n.imageUrl} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* ── Fullscreen dialog ── */}
      <Dialog open={fsOpen} onOpenChange={setFsOpen}>
        <DialogContent className="max-w-[95vw] w-[95vw] p-0 border-0 bg-transparent shadow-none">
          <div className="relative w-full h-[92vh] bg-slate-950 rounded-2xl overflow-hidden border border-border">
            {/* Toolbar */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-sm">
              <span className="text-xs font-mono text-white/70">
                {idx + 1} / {notes.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                  className="h-7 w-7 rounded-md bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-mono text-white/60 w-10 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                  className="h-7 w-7 rounded-md bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleDownload}
                  className="h-7 w-7 rounded-md bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label="Download"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setFsOpen(false)}
                  className="h-7 w-7 rounded-md bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Image */}
            <ScrollArea className="w-full h-full">
              <div
                className="w-full min-h-[92vh] flex items-center justify-center p-8 pt-16"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center top' }}
              >
                <img
                  src={current.imageUrl}
                  alt={`Notes page ${idx + 1} fullscreen`}
                  className="max-w-full max-h-full object-contain rounded-lg select-none"
                />
              </div>
            </ScrollArea>

            {/* Side arrows */}
            {notes.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Completion Dialog ────────────────────────────────────────────────────────

interface CompletionDialogProps {
  open: boolean
  onOpenChange: (o: boolean) => void
  completed: { levelNumber: number; dayNumber: number; topicName: string }
  next: { contentId: string; levelNumber: number; dayNumber: number; topicName: string } | null
  onContinue: (nextId: string) => void
  onClose: () => void
  progress: { completed: number; total: number; percentage: number }
}

function CompletionDialog({
  open,
  onOpenChange,
  completed,
  next,
  onContinue,
  onClose,
  progress,
}: CompletionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-0 overflow-hidden bg-card">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-2 pt-2 pb-1 text-center"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.05 }}
            className="relative mx-auto w-20 h-20 mb-5"
          >
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Check className="w-9 h-9 text-white" strokeWidth={2.5} />
            </div>
            <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-amber-400 fill-amber-400/30" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
            <Badge variant="outline" className="font-mono text-xs mb-3 bg-emerald-500/8 text-emerald-600 border-emerald-500/20">
              L{String(completed.levelNumber).padStart(2, '0')} · Day {String(completed.dayNumber).padStart(2, '0')}
            </Badge>
            <DialogTitle className="text-xl font-bold text-foreground mb-1.5">
              Lesson Completed!
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mb-5">
              You finished{' '}
              <span className="font-semibold text-foreground">{completed.topicName}</span>.
              Keep the momentum going!
            </DialogDescription>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-5 p-3 rounded-xl bg-muted/50 border border-border/60">
            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground mb-1.5">
              <span>Journey Progress</span>
              <span>{progress.completed}/{progress.total} · {progress.percentage.toFixed(1)}%</span>
            </div>
            <Progress value={progress.percentage} className="h-1.5" />
          </motion.div>

          {next ? (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }} className="mb-5 p-3.5 rounded-xl bg-card border border-border text-left">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                <Award className="w-3 h-3" /> Next Up
              </p>
              <div className="flex items-center gap-3">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-mono font-bold text-blue-500 text-xs">
                  D{String(next.dayNumber).padStart(2, '0')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-mono text-muted-foreground">
                    L{String(next.levelNumber).padStart(2, '0')} · Day {String(next.dayNumber).padStart(2, '0')}
                  </p>
                  <p className="text-sm font-semibold truncate">{next.topicName}</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.26 }} className="mb-5 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-left">
              <p className="text-sm font-semibold text-amber-600">🎉 All Caught Up!</p>
              <p className="text-xs text-muted-foreground mt-1">New content is published daily. Check back tomorrow.</p>
            </motion.div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2 pt-1">
            <Button variant="outline" onClick={onClose} className="sm:flex-1">Back to Roadmap</Button>
            {next ? (
              <Button onClick={() => onContinue(next.contentId)} className="sm:flex-1 gap-1.5">
                Continue to Day {String(next.dayNumber).padStart(2, '0')}
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={onClose} className="sm:flex-1 gap-1.5">
                Done <Check className="w-4 h-4" />
              </Button>
            )}
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StudentLearningDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const { data: content, isLoading, error } = useStudentLearningContent(id)
  const startMutation = useStartLesson()
  const completeMutation = useCompleteLesson()

  const [viewStarted, setViewStarted] = useState(false)
  const [markingComplete, setMarkingComplete] = useState(false)
  // Mobile tab: 'reel' | 'notes'
  const [mobileTab, setMobileTab] = useState<'reel' | 'notes'>('reel')
  const [completionDialog, setCompletionDialog] = useState<{
    open: boolean
    completed: { levelNumber: number; dayNumber: number; topicName: string }
    next: { contentId: string; levelNumber: number; dayNumber: number; topicName: string } | null
    progress: { completed: number; total: number; percentage: number }
  } | null>(null)

  // Auto-start
  useEffect(() => {
    if (!content || viewStarted) return
    if (content.progressStatus !== 'COMPLETED') {
      startMutation.mutateAsync(content.id)
        .then(() => setViewStarted(true))
        .catch(() => setViewStarted(true))
    } else {
      setViewStarted(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content])

  const handleMarkComplete = async () => {
    if (!content || markingComplete) return
    setMarkingComplete(true)
    try {
      const res = await completeMutation.mutateAsync(content.id)
      const result = res.data.data!
      setCompletionDialog({
        open: true,
        completed: {
          levelNumber: result.completedContent.levelNumber ?? content.levelNumber,
          dayNumber: result.completedContent.dayNumber ?? content.dayNumber,
          topicName: result.completedContent.topicName ?? content.topicName,
        },
        next: result.nextContent
          ? {
              contentId: result.nextContent.id,
              levelNumber: result.nextContent.levelNumber ?? 0,
              dayNumber: result.nextContent.dayNumber ?? 0,
              topicName: result.nextContent.topicName ?? '',
            }
          : null,
        progress: {
          completed: result.progress?.completed ?? 0,
          total: result.progress?.total ?? 0,
          percentage: result.progress?.percentage ?? 0,
        },
      })
      toast({ title: 'Lesson completed! 🎉', variant: 'success' })
    } catch {
      toast({ title: 'Failed to mark complete', variant: 'error' })
    } finally {
      setMarkingComplete(false)
    }
  }

  const handleContinue = (nextId: string) => {
    setCompletionDialog(null)
    navigate(`/dashboard/learning/${nextId}`, { replace: true })
  }

  if (isLoading) return <DetailSkeleton />

  if (error || !content) {
    return (
      <div className="space-y-4 py-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/learning/roadmap')} className="gap-1.5 text-muted-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to Roadmap
        </Button>
        <EmptyState
          icon={BookOpen}
          title="Lesson not available"
          description="This content may be unpublished or the link is invalid."
          action={<Button onClick={() => navigate('/dashboard/learning/roadmap')}>View Roadmap</Button>}
        />
      </div>
    )
  }

  const sc = statusConfig(content.progressStatus)

  return (
    <div className="space-y-5 pb-10" role="main" aria-label="Lesson Detail">

      {/* ── Header — matches reference exactly ── */}
      <div className="space-y-2">
        {/* Row 1: Back · badges · Mark as Complete */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard/learning/roadmap')}
            className="gap-1.5 text-muted-foreground h-8 -ml-2 shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Button>

          {/* L00 · Day 01 badge */}
          <Badge variant="outline" className="font-mono text-xs border-blue-500/40 text-blue-600 bg-blue-500/8 gap-1 py-0.5 shrink-0">
            L{String(content.levelNumber ?? 0).padStart(2, '0')} · Day {String(content.dayNumber ?? 0).padStart(2, '0')}
          </Badge>

          {/* Status badge */}
          <Badge variant="outline" className={cn('text-xs gap-1.5 py-0.5 shrink-0', sc.className)}>
            {sc.icon}
            {sc.label}
          </Badge>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Mark complete / completed button — top right */}
          {content.progressStatus === 'COMPLETED' ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/8 shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium text-emerald-600">Lesson Completed</span>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={handleMarkComplete}
              disabled={markingComplete}
              className="gap-1.5 shrink-0"
            >
              <Check className="w-3.5 h-3.5" />
              {markingComplete ? 'Saving…' : 'Mark as Complete'}
            </Button>
          )}
        </div>

        {/* Row 2: Title */}
        <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-snug">
          {content.topicName}
        </h1>

        {/* Row 3: Description */}
        {content.description && (
          <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
            {content.description}
          </p>
        )}
      </div>

      {/* ── DESKTOP: two-column side by side ── */}
      {/* ── MOBILE: tab switcher ── */}

      {/* Mobile tab bar */}
      <div className="flex lg:hidden items-center gap-2 border-b border-border pb-0">
        <button
          onClick={() => setMobileTab('reel')}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
            mobileTab === 'reel'
              ? 'border-pink-500 text-pink-600'
              : 'border-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          <Play className="w-3.5 h-3.5" />
          Watch Reel
        </button>
        <button
          onClick={() => setMobileTab('notes')}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
            mobileTab === 'notes'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Today's Notes
        </button>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ── LEFT: Watch Reel ── */}
        <div className={cn(
          'lg:block',
          mobileTab === 'reel' ? 'block' : 'hidden',
        )}>
          <ReelPanel
            reelUrl={content.reelUrl}
            topicName={content.topicName}
            dayNumber={content.dayNumber ?? 0}
          />
        </div>

        {/* ── RIGHT: Today's Notes ── */}
        <div className={cn(
          'lg:block',
          mobileTab === 'notes' ? 'block' : 'hidden',
        )}>
          <NotesViewer notes={content.notes ?? []} />
        </div>
      </div>

      {/* ── Resources (below columns if present) ── */}
      {content.resources && content.resources.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
            <span className="flex items-center justify-center w-5 h-5 rounded bg-indigo-500/10 border border-indigo-500/20">
              <Link2 className="w-3 h-3 text-indigo-500" />
            </span>
            Additional Resources
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {content.resources.map((r) => (
              <a
                key={r.id}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/70 hover:bg-muted/50 hover:border-border transition-all group"
              >
                <div className="shrink-0 w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Link2 className="w-3.5 h-3.5 text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{r.title}</p>
                  <p className="text-[11px] text-muted-foreground font-mono truncate">{r.url}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ── YouTube deep dive ── */}
      {content.youtubeUrl && (
        <a
          href={content.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/30 hover:border-red-500/30 transition-all group w-full"
        >
          <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <Play className="w-4 h-4 text-red-500 fill-red-500/70" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">YouTube Deep Dive</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              Watch full lesson on YouTube <ExternalLink className="w-3 h-3" />
            </p>
          </div>
        </a>
      )}

      {/* ── Bottom lesson nav ── */}
      <div className="border-t border-border/60 pt-5">
        <div className="flex items-stretch gap-3">
          {/* Previous (visual only — IDs not in API) */}
          <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border border-border/50 bg-muted/20 text-muted-foreground/40 select-none">
            <ChevronLeft className="w-4 h-4 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest font-semibold">Previous</p>
              <p className="text-xs font-mono truncate">
                Day {String(Math.max(1, (content.dayNumber ?? 1) - 1)).padStart(2, '0')}
              </p>
            </div>
          </div>

          {/* Roadmap shortcut */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard/learning/roadmap')}
            className="shrink-0 hidden sm:flex gap-1.5 text-xs"
          >
            <MapIcon className="w-3.5 h-3.5" />
            Roadmap
          </Button>

          {/* Next / Complete */}
          {content.progressStatus === 'COMPLETED' ? (
            <button
              type="button"
              onClick={() => navigate('/dashboard/learning/roadmap')}
              className="flex-1 flex items-center justify-end gap-2 px-4 py-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5 hover:bg-emerald-500/8 transition-colors group"
            >
              <div className="text-right min-w-0 mr-2">
                <p className="text-[10px] uppercase tracking-widest font-semibold text-emerald-600">
                  Lesson Completed ✓
                </p>
                <p className="text-xs text-muted-foreground">View roadmap</p>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-500 shrink-0" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleMarkComplete}
              disabled={markingComplete}
              className="flex-1 flex items-center justify-end gap-2 px-4 py-3 rounded-xl border border-border/60 bg-card hover:bg-muted/30 hover:border-blue-500/30 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-right min-w-0 mr-2">
                <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground group-hover:text-blue-500 transition-colors">
                  Next Lesson
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  Day {String((content.dayNumber ?? 0) + 1).padStart(2, '0')}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-500 transition-colors shrink-0" />
            </button>
          )}
        </div>
      </div>

      {/* ── Completion dialog ── */}
      {completionDialog && (
        <CompletionDialog
          open={completionDialog.open}
          onOpenChange={(o) => {
            if (!o) {
              setCompletionDialog(null)
              navigate('/dashboard/learning/roadmap')
            }
          }}
          completed={completionDialog.completed}
          next={completionDialog.next}
          progress={completionDialog.progress}
          onContinue={handleContinue}
          onClose={() => {
            setCompletionDialog(null)
            navigate('/dashboard/learning/roadmap')
          }}
        />
      )}
    </div>
  )
}
