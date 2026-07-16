import { useParams, Link, useNavigate } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, CheckCircle2, Menu, X,
  Clock, BookOpen, ExternalLink,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { Separator } from '@/shared/components/ui/separator'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LessonSidebar } from '@/student/components/learning/LessonSidebar'
import { LessonViewerSkeleton } from '@/student/components/learning/LearningSkeletons'
import { BookmarkButton } from '@/student/components/learning/BookmarkButton'
import { ResourceCard } from '@/student/components/learning/ResourceCard'
import { useLesson, useMarkLessonComplete, useMarkLessonStarted, useRoadmap, useToggleLessonBookmark } from '@/shared/hooks/useLearning'
import { useLearningStore } from '@/shared/store/learningStore'

// Lazy-load markdown renderer for performance
const MarkdownRenderer = lazy(() => import('@/student/components/learning/MarkdownRenderer'))

export function LessonViewerPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { lessonSidebarOpen, setLessonSidebarOpen } = useLearningStore()

  const { data: lesson, isLoading, isError, refetch } = useLesson(id ?? '')
  const { mutate: markComplete, isPending: completing } = useMarkLessonComplete()
  const { mutate: markStarted } = useMarkLessonStarted()
  const { mutate: toggleBookmark, isPending: bookmarkPending } = useToggleLessonBookmark()

  // Fetch roadmap for sidebar (only if lesson has roadmapId)
  const { data: roadmap } = useRoadmap(lesson?.roadmapId ? 'by-id' : '')

  // Mark lesson as started when opened
  useEffect(() => {
    if (id && lesson?.status === 'not_started') {
      markStarted(id)
    }
  }, [id, lesson?.status]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleComplete = () => {
    if (!id) return
    markComplete(id, {
      onSuccess: () => {
        if (lesson?.nextLessonId) {
          navigate(`/dashboard/learning/lesson/${lesson.nextLessonId}`)
        }
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] -m-6">
        <div className="hidden lg:flex w-72 border-r border-border">
          <div className="p-4 space-y-3 w-full">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
        <div className="flex-1 p-6 lg:p-8">
          <LessonViewerSkeleton />
        </div>
      </div>
    )
  }

  if (isError || !lesson) {
    return (
      <ErrorState
        title="Lesson not found"
        message="This lesson doesn't exist or isn't available."
        onRetry={() => refetch()}
      />
    )
  }

  const mockSections = lesson.roadmapId ? [] : []

  return (
    <div className="flex h-[calc(100vh-3.5rem)] -m-6 overflow-hidden">
      {/* ── Left: Lesson navigation sidebar ── */}
      <>
        {/* Mobile overlay */}
        <AnimatePresence>
          {lessonSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setLessonSidebarOpen(false)}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <AnimatePresence initial={false}>
          {(lessonSidebarOpen) && (
            <motion.aside
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="fixed lg:relative left-0 top-0 lg:top-auto z-50 lg:z-auto h-full w-72 border-r border-border bg-card lg:bg-background flex flex-col shrink-0"
              aria-label="Lesson navigation"
            >
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setLessonSidebarOpen(false)}
                className="absolute right-2 top-2 z-10 lg:hidden"
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
              </Button>

              {mockSections.length > 0 ? (
                <LessonSidebar
                  sections={mockSections}
                  currentLessonId={lesson.id}
                  roadmapTitle={lesson.roadmapTitle ?? 'Roadmap'}
                  roadmapSlug={lesson.roadmapId ?? ''}
                />
              ) : (
                <div className="p-4">
                  <Button variant="ghost" size="sm" asChild className="mb-3 -ml-1 h-7 text-xs gap-1 text-muted-foreground">
                    <Link to="/dashboard/learning/roadmaps">
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Back to Roadmaps
                    </Link>
                  </Button>
                  <p className="text-sm text-muted-foreground">Navigation available when viewing a full roadmap.</p>
                </div>
              )}
            </motion.aside>
          )}
        </AnimatePresence>
      </>

      {/* ── Center: Content ── */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0" id="lesson-content">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-background/95 backdrop-blur shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setLessonSidebarOpen(!lessonSidebarOpen)}
              aria-label={lessonSidebarOpen ? 'Hide lesson navigation' : 'Show lesson navigation'}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <h1 className="font-semibold text-sm truncate text-foreground">{lesson.title}</h1>
              {lesson.roadmapTitle && (
                <p className="text-xs text-muted-foreground truncate">{lesson.roadmapTitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge
              variant={lesson.status === 'completed' ? 'success' : lesson.status === 'in_progress' ? 'info' : 'secondary'}
              className="text-xs hidden sm:flex"
            >
              {lesson.status === 'completed' ? '✓ Completed' : lesson.status === 'in_progress' ? 'In Progress' : 'Not Started'}
            </Badge>

            <BookmarkButton
              isBookmarked={lesson.isBookmarked ?? false}
              onToggle={() => id && toggleBookmark(id)}
              loading={bookmarkPending}
              size="sm"
            />
          </div>
        </div>

        {/* Content area */}
        <ScrollArea className="flex-1">
          <div className="max-w-3xl mx-auto px-4 py-8 lg:px-8">
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Lesson meta */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground pb-2">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {lesson.estimatedMinutes} min
                </span>
                {lesson.roadmapTitle && (
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    {lesson.roadmapTitle}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {lesson.content ? (
                  <Suspense fallback={
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-4 bg-muted rounded animate-pulse" />
                      ))}
                    </div>
                  }>
                    <MarkdownRenderer content={lesson.content} />
                  </Suspense>
                ) : (
                  <div className="rounded-lg border border-dashed border-border p-8 text-center">
                    <BookOpen className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" aria-hidden="true" />
                    <p className="text-muted-foreground text-sm">Lesson content will appear here.</p>
                  </div>
                )}
              </div>

              {/* Resources */}
              {lesson.resources && lesson.resources.length > 0 && (
                <div className="space-y-3">
                  <Separator />
                  <h2 className="text-base font-semibold flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Resources
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {lesson.resources.map((r) => (
                      <ResourceCard key={r.id} resource={r} />
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation footer */}
              <div className="flex items-center justify-between gap-4 pt-6 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  asChild={!!lesson.prevLessonId}
                  disabled={!lesson.prevLessonId}
                  className="gap-1"
                >
                  {lesson.prevLessonId ? (
                    <Link to={`/dashboard/learning/lesson/${lesson.prevLessonId}`}>
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Link>
                  ) : (
                    <>
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleComplete}
                  disabled={completing || lesson.status === 'completed'}
                  className="gap-2"
                  variant={lesson.status === 'completed' ? 'outline' : 'default'}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {lesson.status === 'completed' ? 'Completed' : completing ? 'Marking...' : 'Mark Complete'}
                </Button>

                <Button
                  variant={lesson.nextLessonId ? 'outline' : 'ghost'}
                  size="sm"
                  asChild={!!lesson.nextLessonId}
                  disabled={!lesson.nextLessonId}
                  className="gap-1"
                >
                  {lesson.nextLessonId ? (
                    <Link to={`/dashboard/learning/lesson/${lesson.nextLessonId}`}>
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        </ScrollArea>
      </main>

      {/* ── Right: Quick Navigation + Progress (desktop only) ── */}
      <aside className="hidden xl:flex flex-col w-64 border-l border-border bg-card/50 shrink-0" aria-label="Lesson quick navigation">
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                In this lesson
              </h3>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p className="italic">Headings will appear here</p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Progress
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={lesson.status === 'completed' ? 'success' : 'secondary'} className="text-xs">
                    {lesson.status?.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{lesson.estimatedMinutes}m</span>
                </div>
              </div>
            </div>

            {lesson.resources && lesson.resources.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Resources ({lesson.resources.length})
                  </h3>
                  <div className="space-y-1">
                    {lesson.resources.map((r) => (
                      <a
                        key={r.id}
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-primary hover:underline py-0.5"
                      >
                        <ExternalLink className="h-3 w-3 shrink-0" />
                        <span className="truncate">{r.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </aside>
    </div>
  )
}
