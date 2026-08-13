import { useState, useEffect, useCallback } from 'react'
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
  Instagram,
  Link2,
  CheckCircle2,
  Clock,
  Circle,
  X,
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
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { useToast } from '@/shared/hooks/useToast'
import { cn } from '@/shared/lib/utils'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusConfig(s: LearningProgressStatus | null | undefined) {
  if (s === 'COMPLETED')
    return {
      label: 'Completed',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      className: 'text-emerald-600 border-emerald-500/30 bg-emerald-500/8',
    }
  if (s === 'IN_PROGRESS')
    return {
      label: 'In Progress',
      icon: <Clock className="w-3.5 h-3.5" />,
      className: 'text-blue-600 border-blue-500/30 bg-blue-500/8',
    }
  return {
    label: 'Available',
    icon: <Circle className="w-3.5 h-3.5" />,
    className: 'text-muted-foreground border-border',
  }
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-16 rounded-lg" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-7 w-72" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Skeleton className="h-[400px] rounded-2xl" />
          <Skeleton className="h-[360px] rounded-2xl" />
        </div>
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

// ─── Notes Viewer ─────────────────────────────────────────────────────────────

interface NotesViewerProps {
  notes: LearningNoteImage[]
}

function NotesViewer({ notes }: NotesViewerProps) {
  const [idx, setIdx] = useState(0)
  const [fsOpen, setFsOpen] = useState(false)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    if (idx >= notes.length && notes.length > 0) setIdx(0)
  }, [notes.length, idx])

  const prev = () => setIdx((i) => (i - 1 + notes.length) % notes.length)
  const next = () => setIdx((i) => (i + 1) % notes.length)

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

  if (notes.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border py-12">
        <EmptyState
          icon={BookOpen}
          title="No notes uploaded yet"
          description="Notes will appear here when the admin uploads them."
          compact
        />
      </div>
    )
  }

  const current = notes[idx]

  return (
    <div className="space-y-3">
      {/* Main image stage */}
      <div className="relative rounded-xl overflow-hidden border border-border bg-slate-950 group">
        <div
          className="w-full flex items-center justify-center p-2 transition-transform duration-200"
          style={{
            minHeight: '300px',
            transform: `scale(${zoom})`,
            transformOrigin: 'center top',
          }}
        >
          <img
            src={current.imageUrl}
            alt={`Notes page ${idx + 1}`}
            className="max-w-full object-contain rounded-lg select-none"
            style={{ maxHeight: '480px' }}
            draggable={false}
          />
        </div>

        {/* Prev / Next overlays */}
        {notes.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous page"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/50 text-white backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              aria-label="Next page"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/50 text-white backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Top-right controls */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          <button
            onClick={() => setZoom((z) => Math.min(2, z + 0.25))}
            className="h-8 w-8 rounded-md bg-black/50 text-white backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
            className="h-8 w-8 rounded-md bg-black/50 text-white backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setFsOpen(true)}
            className="h-8 w-8 rounded-md bg-black/50 text-white backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
            aria-label="Fullscreen (F)"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom page indicator */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2">
          <Badge
            variant="outline"
            className="bg-black/60 border-white/10 text-white backdrop-blur-sm text-xs font-mono"
          >
            {idx + 1} / {notes.length}
          </Badge>
        </div>
      </div>

      {/* Navigation bar */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={prev}
          disabled={notes.length <= 1}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Previous
        </button>

        {/* Dot indicators */}
        {notes.length > 1 && (
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
        )}

        <button
          onClick={next}
          disabled={notes.length <= 1}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Thumbnail strip */}
      {notes.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
          {notes.map((n, i) => (
            <button
              key={n.id}
              onClick={() => setIdx(i)}
              className={cn(
                'shrink-0 w-14 h-14 rounded-lg border overflow-hidden transition-all duration-150',
                i === idx
                  ? 'border-blue-500 ring-2 ring-blue-500/25 opacity-100'
                  : 'border-border opacity-50 hover:opacity-80 hover:border-border/80',
              )}
              aria-label={`Notes page ${i + 1}`}
            >
              <img src={n.imageUrl} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen dialog */}
      <Dialog open={fsOpen} onOpenChange={setFsOpen}>
        <DialogContent
          className="max-w-[96vw] w-[96vw] p-0 border-0 bg-transparent shadow-none"
        >
          <div className="relative w-full h-[90vh] bg-slate-950 rounded-2xl overflow-hidden border border-border">
            {/* Close */}
            <button
              onClick={() => setFsOpen(false)}
              className="absolute top-3 right-3 z-10 h-9 w-9 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
              aria-label="Close fullscreen"
            >
              <X className="w-5 h-5" />
            </button>

            <ScrollArea className="w-full h-full">
              <div
                className="w-full min-h-[90vh] flex items-center justify-center p-8"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
              >
                <img
                  src={current.imageUrl}
                  alt={`Notes page ${idx + 1} fullscreen`}
                  className="max-w-full max-h-full object-contain rounded-lg select-none"
                />
              </div>
            </ScrollArea>

            {notes.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
              <button
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                className="h-8 w-8 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black/90"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <Badge
                variant="outline"
                className="bg-black/70 border-white/10 text-white text-xs font-mono px-3 py-1"
              >
                {idx + 1} / {notes.length} · {Math.round(zoom * 100)}%
              </Badge>
              <button
                onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                className="h-8 w-8 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black/90"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Reel panel ───────────────────────────────────────────────────────────────

interface ReelPanelProps {
  reelUrl: string
  topicName: string
  dayNumber: number
}

function ReelPanel({ reelUrl, topicName, dayNumber }: ReelPanelProps) {
  return (
    <a
      href={reelUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50 rounded-2xl"
      aria-label={`Watch reel for Day ${dayNumber}: ${topicName} on Instagram`}
    >
      {/* 9:16 Reel container — max-width on desktop so it doesn't stretch too wide */}
      <div
        className="relative mx-auto w-full rounded-2xl overflow-hidden border border-pink-500/20 bg-gradient-to-b from-pink-950/60 via-purple-950/40 to-slate-950"
        style={{ aspectRatio: '9/16', maxWidth: '260px' }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />

        {/* Play button */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-xl shadow-pink-500/40 mb-4 group-hover:shadow-pink-500/60 transition-shadow"
          >
            <Play className="w-7 h-7 text-white fill-white ml-1" />
          </motion.div>

          <p className="font-bold text-white text-base leading-snug mb-1.5">
            Watch Reel
          </p>
          <p className="text-xs text-white/60 line-clamp-2 max-w-[180px]">
            Day {String(dayNumber).padStart(2, '0')} — {topicName}
          </p>
        </div>

        {/* Instagram badge bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 flex items-center justify-center">
              <Instagram className="w-3 h-3 text-white" />
            </div>
            <span className="text-[11px] text-white/70 font-medium">Instagram</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-white/50">
            Open
            <ExternalLink className="w-3 h-3" />
          </div>
        </div>

        {/* Subtle shine on hover */}
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5 group-hover:ring-white/10 transition-all" />
      </div>

      {/* Label below */}
      <p className="text-center text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1 group-hover:text-pink-500 transition-colors">
        Open in Instagram
        <ExternalLink className="w-3 h-3" />
      </p>
    </a>
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
          {/* Icon */}
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

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
          >
            <Badge
              variant="outline"
              className="font-mono text-xs mb-3 bg-emerald-500/8 text-emerald-600 border-emerald-500/20"
            >
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

          {/* Progress */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-5 p-3 rounded-xl bg-muted/50 border border-border/60"
          >
            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground mb-1.5">
              <span>Journey Progress</span>
              <span>
                {progress.completed}/{progress.total} · {progress.percentage.toFixed(1)}%
              </span>
            </div>
            <Progress value={progress.percentage} className="h-1.5" />
          </motion.div>

          {/* Next up */}
          {next ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26 }}
              className="mb-5 p-3.5 rounded-xl bg-card border border-border text-left"
            >
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.26 }}
              className="mb-5 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-left"
            >
              <p className="text-sm font-semibold text-amber-600">🎉 All Caught Up!</p>
              <p className="text-xs text-muted-foreground mt-1">
                New content is published daily. Check back tomorrow for the next lesson.
              </p>
            </motion.div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2 pt-1">
            <Button variant="outline" onClick={onClose} className="sm:flex-1">
              Back to Roadmap
            </Button>
            {next ? (
              <Button onClick={() => onContinue(next.contentId)} className="sm:flex-1 gap-1.5">
                Continue to Day {String(next.dayNumber).padStart(2, '0')}
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={onClose} className="sm:flex-1 gap-1.5">
                Done
                <Check className="w-4 h-4" />
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
  const [completionDialog, setCompletionDialog] = useState<{
    open: boolean
    completed: { levelNumber: number; dayNumber: number; topicName: string }
    next: { contentId: string; levelNumber: number; dayNumber: number; topicName: string } | null
    progress: { completed: number; total: number; percentage: number }
  } | null>(null)

  // Auto-start on view
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

  // ── Loading ──
  if (isLoading) return <DetailSkeleton />

  // ── Error ──
  if (error || !content) {
    return (
      <div className="space-y-4 py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard/learning/roadmap')}
          className="gap-1.5 text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Roadmap
        </Button>
        <EmptyState
          icon={BookOpen}
          title="Lesson not available"
          description="This content may be unpublished or the link is invalid."
          action={
            <Button onClick={() => navigate('/dashboard/learning/roadmap')}>
              View Roadmap
            </Button>
          }
        />
      </div>
    )
  }

  const sc = statusConfig(content.progressStatus)

  return (
    <div className="space-y-6 pb-12" role="main" aria-label="Lesson Detail">

      {/* ── Minimal lesson header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard/learning/roadmap')}
            className="gap-1.5 text-muted-foreground shrink-0 -ml-2 mt-0.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="font-mono text-xs font-bold text-blue-500 bg-blue-500/8 border border-blue-500/20 px-2 py-0.5 rounded-md">
                L{String(content.levelNumber ?? 0).padStart(2, '0')} · Day{' '}
                {String(content.dayNumber ?? 0).padStart(2, '0')}
              </span>
              <Badge variant="outline" className={cn('gap-1.5 text-xs', sc.className)}>
                {sc.icon}
                {sc.label}
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-snug">
              {content.topicName}
            </h1>
            {content.description && (
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed max-w-2xl">
                {content.description}
              </p>
            )}
          </div>
        </div>

        {/* Mark as complete — desktop top-right */}
        <div className="hidden lg:block shrink-0">
          {content.progressStatus === 'COMPLETED' ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/8 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-semibold text-emerald-600">Lesson Completed</span>
            </div>
          ) : (
            <Button
              onClick={handleMarkComplete}
              disabled={markingComplete}
              className="gap-2 font-semibold"
            >
              <Check className="w-4 h-4" />
              {markingComplete ? 'Saving…' : 'Mark as Complete'}
            </Button>
          )}
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="h-px bg-border/60" />

      {/* ── Main 2-col layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── LEFT — 60% — Watch Reel + Today's Notes ── */}
        <div className="lg:col-span-3 space-y-8">

          {/* Watch Reel */}
          <section>
            <div className="mb-4">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                  <Play className="w-3 h-3 text-pink-500 fill-pink-500/70" />
                </div>
                Watch Reel
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5 ml-7">
                Short-form lesson
              </p>
            </div>

            <ReelPanel
              reelUrl={content.reelUrl}
              topicName={content.topicName}
              dayNumber={content.dayNumber ?? 0}
            />
          </section>

          {/* Today's Notes */}
          <section>
            <div className="mb-4">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <BookOpen className="w-3 h-3 text-blue-500" />
                </div>
                Today's Notes
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5 ml-7">
                Read along and understand the concept
              </p>
            </div>

            <NotesViewer notes={content.notes ?? []} />
          </section>

          {/* Additional Resources */}
          {content.resources && content.resources.length > 0 && (
            <section>
              <div className="mb-3">
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <Link2 className="w-3 h-3 text-indigo-500" />
                  </div>
                  Additional Resources
                </h2>
              </div>
              <div className="space-y-2">
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
            </section>
          )}
        </div>

        {/* ── RIGHT — 40% — Progress card + YouTube ── */}
        <div className="lg:col-span-2 space-y-4 lg:sticky lg:top-4 self-start">

          {/* Progress / Mark Complete Card */}
          <div
            className="rounded-2xl border bg-card overflow-hidden"
            style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.06)' }}
          >
            <div className="px-5 pt-5 pb-4 border-b border-border/60">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Lesson Progress
              </p>
            </div>

            <div className="p-5 space-y-4">
              {content.progressStatus === 'COMPLETED' ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-600">Already Completed</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        You've finished this lesson. Keep going!
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full gap-1.5"
                    onClick={() => navigate('/dashboard/learning/roadmap')}
                  >
                    <MapIcon className="w-4 h-4" />
                    View Roadmap
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {content.progressStatus === 'IN_PROGRESS' ? 'In Progress' : 'Not Started'}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {content.progressStatus === 'IN_PROGRESS' ? '50%' : '0%'}
                      </span>
                    </div>
                    <Progress
                      value={content.progressStatus === 'IN_PROGRESS' ? 50 : 5}
                      className="h-1.5"
                    />
                  </div>

                  <AnimatePresence>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Button
                        size="lg"
                        onClick={handleMarkComplete}
                        disabled={markingComplete}
                        className="w-full gap-2 font-semibold"
                      >
                        <Check className="w-4 h-4" />
                        {markingComplete ? 'Saving…' : 'Mark as Complete'}
                      </Button>
                    </motion.div>
                  </AnimatePresence>

                  <p className="text-[11px] text-center text-muted-foreground/70">
                    Completing lessons tracks your daily progress
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* YouTube card */}
          {content.youtubeUrl && (
            <a
              href={content.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl border border-border bg-card p-4 hover:bg-muted/30 hover:border-red-500/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                  <Play className="w-4 h-4 text-red-500 fill-red-500/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">YouTube Deep Dive</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    Watch full lesson
                    <ExternalLink className="w-3 h-3" />
                  </p>
                </div>
              </div>
            </a>
          )}

          {/* Mobile: Mark as complete */}
          <div className="lg:hidden">
            {content.progressStatus === 'COMPLETED' ? (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-semibold text-emerald-600">Lesson Completed</span>
              </div>
            ) : (
              <Button
                size="lg"
                onClick={handleMarkComplete}
                disabled={markingComplete}
                className="w-full gap-2 font-semibold"
              >
                <Check className="w-4 h-4" />
                {markingComplete ? 'Saving…' : 'Mark as Complete'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Lesson Navigation ── */}
      <div className="border-t border-border/60 pt-6">
        <div className="flex items-stretch gap-3">
          {/* Previous — disabled for now since we'd need prev/next IDs from API */}
          <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border border-border/60 bg-muted/20 text-muted-foreground/40 cursor-not-allowed select-none">
            <ChevronLeft className="w-4 h-4 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest font-semibold">Previous</p>
              <p className="text-xs truncate">
                L{String(content.levelNumber ?? 0).padStart(2, '0')} · Day{' '}
                {String(Math.max(1, (content.dayNumber ?? 1) - 1)).padStart(2, '0')}
              </p>
            </div>
          </div>

          {/* Back to roadmap center */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard/learning/roadmap')}
            className="shrink-0 hidden sm:flex gap-1.5 text-xs"
          >
            <MapIcon className="w-3.5 h-3.5" />
            Roadmap
          </Button>

          {/* Next / Complete CTA */}
          {content.progressStatus === 'COMPLETED' ? (
            <div className="flex-1 flex items-center justify-end gap-2 px-4 py-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
              <div className="text-right min-w-0 mr-2">
                <p className="text-[10px] uppercase tracking-widest font-semibold text-emerald-600">
                  Lesson Completed ✓
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Continue to next lesson
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => navigate('/dashboard/learning/roadmap')}
                className="shrink-0 gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white border-0"
              >
                Continue
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleMarkComplete}
              disabled={markingComplete}
              className="flex-1 flex items-center justify-end gap-2 px-4 py-3 rounded-xl border border-border/60 bg-card hover:bg-muted/30 hover:border-blue-500/30 transition-all text-right group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="min-w-0 mr-2">
                <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground group-hover:text-blue-500 transition-colors">
                  Next Lesson
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  L{String(content.levelNumber ?? 0).padStart(2, '0')} · Day{' '}
                  {String((content.dayNumber ?? 0) + 1).padStart(2, '0')}
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
