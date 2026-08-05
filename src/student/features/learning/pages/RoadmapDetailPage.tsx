import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Clock, BookOpen, ArrowRight, Share2, Tag, Calendar, ChevronRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { ProgressRing } from '@/student/components/learning/ProgressRing'
import { DifficultyBadge } from '@/student/components/learning/DifficultyBadge'
import { BookmarkButton } from '@/student/components/learning/BookmarkButton'
import { PythonRoadmapVisual } from '@/student/components/learning/PythonRoadmapVisual'
import { RoadmapDetailSkeleton } from '@/student/components/learning/LearningSkeletons'
import { useRoadmap, useToggleRoadmapBookmark } from '@/shared/hooks/useLearning'
import { useAuthStore } from '@/shared/store/authStore'
import { formatDate, cn } from '@/shared/lib/utils'
import { normalizeTags } from '@/shared/utils'

// ─── Inline breadcrumb ────────────────────────────────────────────────────────
interface InlineBreadcrumbProps {
  items: { label: string; href?: string }[]
}

function InlineBreadcrumb({ items }: InlineBreadcrumbProps) {
  return (
    <nav aria-label="Page breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground mb-4 flex-wrap">
      {items.map((crumb, idx) => {
        const isLast = idx === items.length - 1
        return (
          <span key={idx} className="flex items-center gap-1">
            {idx > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />}
            {isLast || !crumb.href ? (
              <span className={cn(isLast ? 'text-foreground font-medium' : 'text-muted-foreground')}>
                {crumb.label}
              </span>
            ) : (
              <Link to={crumb.href} className="hover:text-foreground transition-colors duration-150">
                {crumb.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}

// ─── Stat row item ────────────────────────────────────────────────────────────
function StatRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function RoadmapDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const { data: roadmap, isLoading, isError, refetch } = useRoadmap(slug ?? '')
  const { mutate: toggleBookmark, isPending: bookmarkPending } = useToggleRoadmapBookmark()

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-[1400px] mx-auto">
        <InlineBreadcrumb items={[
          { label: 'Learning', href: '/dashboard/learning' },
          { label: 'Roadmaps', href: '/dashboard/learning/roadmaps' },
          { label: 'Loading...' },
        ]} />
        <div className="h-8 w-64 bg-muted rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          <RoadmapDetailSkeleton />
          <div className="h-64 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    )
  }

  if (isError || !roadmap) {
    return (
      <ErrorState
        title="Roadmap not found"
        message="This roadmap doesn't exist or has been removed."
        onRetry={() => refetch()}
      />
    )
  }

  const progress = roadmap.progress ?? 0
  const completedLessons = roadmap.completedLessons ?? 0
  const sections = roadmap.sections ?? []
  const tags = normalizeTags(roadmap.tags)

  // Find the first in-progress or not-started lesson for CTA
  let currentLessonId: string | undefined
  for (const section of sections) {
    const curr = section.lessons.find((l) => l.status === 'in_progress')
    if (curr) { currentLessonId = curr.id; break }
  }
  if (!currentLessonId) {
    for (const section of sections) {
      const first = section.lessons.find((l) => l.status !== 'completed')
      if (first) { currentLessonId = first.id; break }
    }
  }

  const handleContinue = () => {
    if (currentLessonId) navigate(`/dashboard/learning/lesson/${currentLessonId}`)
  }

  return (
    <div className="space-y-0">
      <PageHeader
        title={roadmap.title}
        breadcrumbs={[
          { label: 'Learning', href: '/dashboard/learning' },
          { label: 'Roadmaps', href: '/dashboard/learning/roadmaps' },
          { label: roadmap.title },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
        {/* ── Left column ── */}
        <div className="space-y-5">

          {/* Description card */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="shadow-sm">
              <CardContent className="p-6 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {roadmap.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  <DifficultyBadge difficulty={roadmap.difficulty} />
                  <Badge variant="outline" className="gap-1 text-xs">
                    <Clock className="h-3 w-3" />
                    {roadmap.estimatedHours}h estimated
                  </Badge>
                  <Badge variant="outline" className="gap-1 text-xs">
                    <BookOpen className="h-3 w-3" />
                    {roadmap.lessonCount} lessons
                  </Badge>
                  {roadmap.category?.name && (
                    <Badge variant="secondary" className="text-xs">{roadmap.category.name}</Badge>
                  )}
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-label="Tags" />
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Updated {formatDate(roadmap.updatedAt)}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Roadmap visualization */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
          >
            {sections.length > 0 ? (
              <PythonRoadmapVisual
                sections={sections}
                currentLessonId={currentLessonId}
                completedLessons={completedLessons}
                totalLessons={roadmap.lessonCount}
                progress={progress}
                userAvatar={user?.profileImage}
                userName={user?.fullName}
              />
            ) : (
              <Card className="shadow-sm">
                <CardContent className="py-10 text-center">
                  <p className="text-sm text-muted-foreground">No sections available yet.</p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>

        {/* ── Right: sticky progress panel ── */}
        <div className="lg:sticky lg:top-[80px] space-y-4">
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12 }}
          >
            <Card className="shadow-sm border-primary/20">
              <CardHeader className="pb-2 pt-5 px-5">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-5">
                {/* Progress ring */}
                <div className="flex flex-col items-center gap-3 py-2">
                  <ProgressRing progress={progress} size={100} strokeWidth={9} />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">
                      {completedLessons} of {roadmap.lessonCount} lessons
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">completed</p>
                    {progress === 100 && (
                      <Badge variant="success" className="mt-2">🎉 Completed!</Badge>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div>
                  <StatRow
                    label="Estimated Time"
                    value={
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        {roadmap.estimatedHours}h
                      </span>
                    }
                  />
                  <StatRow label="Sections" value={sections.length} />
                  <StatRow label="Difficulty" value={<DifficultyBadge difficulty={roadmap.difficulty} />} />
                  <StatRow label="Lessons" value={roadmap.lessonCount} />
                </div>

                {/* CTAs */}
                <div className="space-y-2 pt-1">
                  <Button
                    className="w-full gap-2"
                    onClick={handleContinue}
                    disabled={!currentLessonId}
                  >
                    {progress === 0 ? 'Start Learning' : progress === 100 ? 'Review' : 'Continue'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>

                  <div className="flex gap-2">
                    <BookmarkButton
                      isBookmarked={roadmap.isBookmarked ?? false}
                      onToggle={() => toggleBookmark(roadmap.id)}
                      loading={bookmarkPending}
                      className="flex-1"
                      label={roadmap.isBookmarked ? 'Saved' : 'Save'}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Share roadmap"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({ title: roadmap.title, url: window.location.href })
                        } else {
                          navigator.clipboard.writeText(window.location.href)
                        }
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
