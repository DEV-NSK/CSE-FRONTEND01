import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Play, ExternalLink, ChevronLeft, ChevronRight,
  Maximize2, ZoomIn, Check, Award, Sparkles,
  BookOpen, Radio, Clock, BarChart3,
  Image as ImageIcon, Link2,
} from 'lucide-react'
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { Separator } from '@/shared/components/ui/separator'
import { useToast } from '@/shared/hooks/useToast'
import { cn } from '@/shared/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

// ─── NotesViewer ─────────────────────────────────────────────────────────────

interface NotesViewerProps {
  notes: LearningNoteImage[]
  startIndex?: number
}

function NotesViewer({ notes, startIndex = 0 }: NotesViewerProps) {
  const [idx, setIdx] = useState(startIndex)
  const [fsOpen, setFsOpen] = useState(false)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    if (idx >= notes.length) setIdx(0)
  }, [notes.length, idx])

  if (notes.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-10">
          <EmptyState
            icon={ImageIcon}
            title="No notes for this lesson yet"
            description="Notes will appear here when the SUPER_ADMIN uploads them."
            compact
          />
        </CardContent>
      </Card>
    )
  }

  const current = notes[idx]
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

  const ImageStage = (
    <div className="relative w-full bg-slate-950 rounded-xl overflow-hidden group border border-border">
      <ScrollArea className="w-full aspect-[4/3] lg:aspect-[16/10]">
        <div className="w-full h-full flex items-center justify-center p-2 transition-transform" style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}>
          <img
            src={current.imageUrl}
            alt={`Notes page ${idx + 1}`}
            className="max-w-full max-h-full object-contain rounded-lg select-none"
            draggable={false}
          />
        </div>
      </ScrollArea>
      {notes.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous notes page"
            className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/40 text-white backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            aria-label="Next notes page"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/40 text-white backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
      <div className="absolute top-2 right-2 flex items-center gap-1.5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setZoom((z) => Math.min(2, z + 0.25))}
                className="h-8 w-8 rounded-md bg-black/40 text-white backdrop-blur flex items-center justify-center hover:bg-black/60"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Zoom in</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setFsOpen(true)}
                className="h-8 w-8 rounded-md bg-black/40 text-white backdrop-blur flex items-center justify-center hover:bg-black/60"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Fullscreen (F)</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
        <Badge variant="outline" className="bg-black/60 border-white/10 text-white backdrop-blur text-xs font-mono">
          {idx + 1} / {notes.length}
        </Badge>
      </div>
    </div>
  )

  return (
    <div className="space-y-3">
      {ImageStage}

      {notes.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {notes.map((n, i) => (
            <button
              key={n.id}
              onClick={() => setIdx(i)}
              className={cn(
                'flex-shrink-0 w-16 h-16 rounded-lg border overflow-hidden transition-all',
                i === idx ? 'border-primary ring-2 ring-primary/30 scale-105' : 'border-border hover:border-border/80 opacity-70 hover:opacity-100',
              )}
              aria-label={`Notes page ${i + 1}`}
            >
              <img src={n.imageUrl} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <Dialog open={fsOpen} onOpenChange={setFsOpen}>
        <DialogContent className="max-w-[95vw] w-[95vw] p-0 border-0 bg-transparent shadow-none" showCloseButton={false}>
          <div className="relative w-full h-[90vh] bg-slate-950 rounded-2xl overflow-hidden border border-border">
            <button
              onClick={() => setFsOpen(false)}
              className="absolute top-4 right-4 z-10 h-9 w-9 rounded-full bg-black/60 text-white backdrop-blur flex items-center justify-center hover:bg-black/80"
            >
              <ChevronRight className="w-5 h-5 rotate-45" />
            </button>
            <ScrollArea className="w-full h-full">
              <div className="w-full h-full min-h-[90vh] flex items-center justify-center p-6" style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}>
                <img
                  src={current.imageUrl}
                  alt={`Notes page ${idx + 1}`}
                  className="max-w-full max-h-full object-contain rounded-lg select-none"
                />
              </div>
            </ScrollArea>
            {notes.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-black/60 text-white backdrop-blur flex items-center justify-center hover:bg-black/80"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-black/60 text-white backdrop-blur flex items-center justify-center hover:bg-black/80"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
              <button
                onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
                className="h-9 w-9 rounded-full bg-black/60 text-white backdrop-blur flex items-center justify-center hover:bg-black/80 text-lg font-bold"
              >
                −
              </button>
              <Badge variant="outline" className="bg-black/60 border-white/10 text-white backdrop-blur text-xs font-mono px-3 py-1">
                {idx + 1} / {notes.length} · {Math.round(zoom * 100)}%
              </Badge>
              <button
                onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                className="h-9 w-9 rounded-full bg-black/60 text-white backdrop-blur flex items-center justify-center hover:bg-black/80 text-lg font-bold"
              >
                +
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Completion Dialog ───────────────────────────────────────────────────────

interface CompletionDialogProps {
  open: boolean
  onOpenChange: (o: boolean) => void
  completed: {
    levelNumber: number
    dayNumber: number
    topicName: string
  }
  next: {
    contentId: string
    levelNumber: number
    dayNumber: number
    topicName: string
  } | null
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
      <DialogContent className="sm:max-w-lg border-0 bg-gradient-to-br from-emerald-500/10 via-card to-card overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative p-6 sm:p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.05 }}
            className="relative mx-auto w-20 h-20 mb-5"
          >
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Check className="w-10 h-10 text-white" strokeWidth={3} />
            </div>
            <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-amber-400 fill-amber-400/30" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-mono text-xs mb-3">
              L{completed.levelNumber.toString().padStart(2, '0')} · Day {completed.dayNumber.toString().padStart(2, '0')}
            </Badge>
            <DialogTitle className="text-2xl font-bold text-foreground mb-2">
              Lesson Completed!
            </DialogTitle>
            <DialogDescription className="text-base mb-5">
              You completed <span className="font-semibold text-foreground">{completed.topicName}</span>.
              Fantastic progress — keep the streak alive!
            </DialogDescription>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6 p-3 rounded-xl bg-card border-border/60 border"
          >
            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground mb-1.5">
              <span>Your Journey</span>
              <span>
                {progress.completed}/{progress.total} · {progress.percentage.toFixed(1)}%
              </span>
            </div>
            <Progress value={progress.percentage} className="h-2" />
          </motion.div>

          {next ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mb-6 p-4 rounded-xl bg-card border border-border/60 text-left"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" /> Next Up
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-mono font-bold text-primary text-xs">
                  D{next.dayNumber.toString().padStart(2, '0')}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-mono text-muted-foreground">
                    L{next.levelNumber.toString().padStart(2, '0')} · Day {next.dayNumber.toString().padStart(2, '0')}
                  </p>
                  <p className="text-sm font-semibold truncate">{next.topicName}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="mb-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20"
            >
              <p className="text-sm font-semibold text-amber-400">🎉 You're All Caught Up!</p>
              <p className="text-xs text-muted-foreground mt-1">
                New content is published daily. Check back tomorrow for the next lesson.
              </p>
            </motion.div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-3">
            <Button variant="outline" onClick={onClose} className="sm:flex-1">
              Back to Roadmap
            </Button>
            {next ? (
              <Button onClick={() => onContinue(next.contentId)} className="sm:flex-1 gap-1.5">
                Continue to Day {next.dayNumber.toString().padStart(2, '0')}
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={onClose} variant="default" className="sm:flex-1 gap-1.5">
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

// ─── Detail Page ─────────────────────────────────────────────────────────────

export default function StudentLearningDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const { data: content, isLoading, error } = useStudentLearningContent(id)
  const startMutation = useStartLesson()
  const completeMutation = useCompleteLesson()

  const [viewStarted, setViewStarted] = useState(false)
  const [completionDialog, setCompletionDialog] = useState<{
    open: boolean
    completed: { levelNumber: number; dayNumber: number; topicName: string }
    next: { contentId: string; levelNumber: number; dayNumber: number; topicName: string } | null
    progress: { completed: number; total: number; percentage: number }
  } | null>(null)
  const [markingComplete, setMarkingComplete] = useState(false)

  useEffect(() => {
    if (!content || viewStarted) return
    if (content.progressStatus !== 'COMPLETED') {
      startMutation.mutateAsync(content.id).then(() => setViewStarted(true)).catch(() => setViewStarted(true))
    } else {
      setViewStarted(true)
    }
  }, [content, viewStarted, startMutation])

  const handleMarkComplete = async () => {
    if (!content || markingComplete) return
    setMarkingComplete(true)
    try {
      const res = await completeMutation.mutateAsync(content.id)
      const result = res.data.data!
      setCompletionDialog({
        open: true,
        completed: {
          levelNumber: result.completedContent.levelNumber,
          dayNumber: result.completedContent.dayNumber,
          topicName: result.completedContent.topicName,
        },
        next: result.nextContent
          ? {
              contentId: result.nextContent.id,
              levelNumber: result.nextContent.levelNumber,
              dayNumber: result.nextContent.dayNumber,
              topicName: result.nextContent.topicName,
            }
          : null,
        progress: result.progress,
      })
      toast({ title: 'Lesson completed!', variant: 'success' })
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>
        <Skeleton className="h-56 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <Skeleton className="h-12 w-40" />
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !content) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/learning/roadmap')} className="text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Roadmap
        </Button>
        <EmptyState
          icon={BookOpen}
          title="Lesson not available"
          description={error ? 'This content may be unpublished or the link is invalid.' : ''}
          action={
            <Button onClick={() => navigate('/dashboard/learning/roadmap')}>
              View Roadmap
            </Button>
          }
        />
      </div>
    )
  }

  const statusBadge = (s: LearningProgressStatus | null | undefined) => {
    if (s === 'COMPLETED') return <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 gap-1.5"><Check className="w-3 h-3" /> Completed</Badge>
    if (s === 'IN_PROGRESS') return <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/20 gap-1.5"><Clock className="w-3 h-3" /> In Progress</Badge>
    return <Badge variant="outline" className="gap-1.5"><Radio className="w-3 h-3" /> Not Started</Badge>
  }

  return (
    <div className="space-y-6" role="main" aria-label="Lesson Detail">
      <div className="flex flex-wrap items-start gap-4 justify-between">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/learning/roadmap')} className="text-muted-foreground -ml-2">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary">
                L{content.levelNumber.toString().padStart(2, '0')} · Day {content.dayNumber.toString().padStart(2, '0')}
              </Badge>
              {statusBadge(content.progressStatus)}
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">{content.topicName}</h1>
          </div>
        </div>
      </div>

      {content.description && (
        <p className="text-muted-foreground leading-relaxed max-w-3xl">{content.description}</p>
      )}

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* ── Reel ── */}
          <Card>
            <CardHeader className="py-3.5 px-5 pb-2 flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Play className="w-4 h-4 text-pink-500 fill-pink-500/10" />
                  Watch Reel
                </CardTitle>
                <CardDescription className="text-xs">
                  Short-form lesson on Instagram
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] text-pink-500 border-pink-500/30 bg-pink-500/5">
                Instagram
              </Badge>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <a
                href={content.reelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <div className="relative aspect-[9/16] max-h-[520px] mx-auto w-full max-w-xs rounded-2xl overflow-hidden bg-gradient-to-br from-pink-500/20 via-purple-500/10 to-indigo-500/10 border border-pink-500/20">
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 group-hover:scale-105 transition-transform">
                    <div className="w-16 h-16 rounded-full bg-pink-500/90 flex items-center justify-center mb-5 shadow-xl shadow-pink-500/30 group-hover:scale-110 transition-transform">
                      <Play className="w-7 h-7 text-white fill-white ml-1" />
                    </div>
                    <p className="font-bold text-foreground text-lg mb-1">🎥 Watch Reel</p>
                    <p className="text-xs text-muted-foreground max-w-[220px]">
                      Day {content.dayNumber.toString().padStart(2, '0')} — {content.topicName}
                    </p>
                    <div className="mt-5 flex items-center gap-1.5 text-xs text-pink-400/80 font-medium">
                      Open in Instagram
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-3 right-3 text-[10px] font-mono text-white/60">
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
              </a>
            </CardContent>
          </Card>

          {/* ── Notes ── */}
          <Card>
            <CardHeader className="py-3.5 px-5 pb-2 flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-500" />
                  Notes
                </CardTitle>
                <CardDescription className="text-xs">
                  {content.notes.length} image{content.notes.length !== 1 ? 's' : ''} · Use arrows or ← / → to navigate, F for fullscreen
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-[11px]">
                {content.notes.length}/5
              </Badge>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <NotesViewer notes={content.notes ?? []} />
            </CardContent>
          </Card>

          {/* ── Resources ── */}
          {content.resources && content.resources.length > 0 && (
            <Card>
              <CardHeader className="py-3.5 px-5 pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-indigo-400" />
                  Additional Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-2">
                {content.resources.map((r) => (
                  <a
                    key={r.id}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border/60 hover:bg-accent/40 hover:border-border transition-colors group"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-md bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                      <Link2 className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{r.title}</p>
                      <p className="text-[11px] text-muted-foreground font-mono truncate">{r.url}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground" />
                  </a>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4 lg:sticky lg:top-4 self-start">
          <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-primary/80">
                    Your Progress
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Mark this lesson as complete when you're done.
                  </p>
                </div>
                <BarChart3 className="w-5 h-5 text-primary/70" />
              </div>

              {content.progressStatus === 'COMPLETED' ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-400">Already Completed</p>
                      <p className="text-[11px] text-muted-foreground">Nicely done! Keep going.</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full gap-1.5" onClick={() => navigate('/dashboard/learning/roadmap')}>
                    <BookOpen className="w-4 h-4" /> View Roadmap
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Progress value={content.progressStatus === 'IN_PROGRESS' ? 50 : 5} className="h-1.5" />
                  <AnimatePresence>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Button
                        size="lg"
                        onClick={handleMarkComplete}
                        disabled={markingComplete}
                        className="w-full gap-2"
                      >
                        <Check className="w-4 h-4" />
                        {markingComplete ? 'Saving...' : 'Mark as Complete'}
                      </Button>
                    </motion.div>
                  </AnimatePresence>
                  <p className="text-[11px] text-center text-muted-foreground">
                    Completing lessons tracks your progress.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {content.youtubeUrl && (
            <Card>
              <CardHeader className="py-3.5 px-4 pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Play className="w-4 h-4 text-red-500" />
                  YouTube Deep Dive
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <a
                  href={content.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 rounded-lg bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 transition-colors"
                >
                  <p className="text-sm font-medium text-foreground">Watch on YouTube</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                    External link <ExternalLink className="w-3 h-3 inline" />
                  </p>
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

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
