import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Clock, BookOpen, ArrowRight, Share2, Tag, Calendar,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { ProgressRing } from '@/student/components/learning/ProgressRing'
import { DifficultyBadge } from '@/student/components/learning/DifficultyBadge'
import { BookmarkButton } from '@/student/components/learning/BookmarkButton'
import { RoadmapTimeline } from '@/student/components/learning/RoadmapTimeline'
import { RoadmapDetailSkeleton } from '@/student/components/learning/LearningSkeletons'
import { useRoadmap, useToggleRoadmapBookmark } from '@/shared/hooks/useLearning'
import { formatDate } from '@/shared/lib/utils'

export function RoadmapDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const { data: roadmap, isLoading, isError, refetch } = useRoadmap(slug ?? '')
  const { mutate: toggleBookmark, isPending: bookmarkPending } = useToggleRoadmapBookmark()

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="h-7 w-48 bg-muted rounded animate-pulse mb-2" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          <RoadmapDetailSkeleton />
          <div className="space-y-4">
            <div className="h-64 w-full bg-muted rounded-lg animate-pulse" />
          </div>
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

  // Find current lesson (first in_progress or first not_started)
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
    <div className="space-y-6">
      <PageHeader
        title={roadmap.title}
        breadcrumbs={[
          { label: 'Learning', href: '/dashboard/learning' },
          { label: 'Roadmaps', href: '/dashboard/learning/roadmaps' },
          { label: roadmap.title },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
        {/* ── Left: Roadmap Info + Timeline ── */}
        <div className="space-y-6">
          {/* Info card */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="p-6 space-y-4">
                <p className="text-muted-foreground text-sm leading-relaxed">{roadmap.description}</p>

                <div className="flex flex-wrap gap-3">
                  <DifficultyBadge difficulty={roadmap.difficulty} />
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {roadmap.estimatedHours}h estimated
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <BookOpen className="h-3 w-3" />
                    {roadmap.lessonCount} lessons
                  </Badge>
                  <Badge variant="outline">{roadmap.category.name}</Badge>
                </div>

                {roadmap.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-muted-foreground mt-0.5" aria-label="Tags" />
                    {roadmap.tags.map((tag) => (
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

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Learning Path</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {sections.length > 0 ? (
                  <RoadmapTimeline
                    sections={sections}
                    currentLessonId={currentLessonId}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No sections available yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ── Right: Sticky Progress Panel ── */}
        <div className="lg:sticky lg:top-20 space-y-4">
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="border-primary/20 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress ring */}
                <div className="flex flex-col items-center gap-3">
                  <ProgressRing progress={progress} size={96} strokeWidth={8} />
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">
                      {completedLessons} of {roadmap.lessonCount} lessons completed
                    </p>
                    {progress === 100 && (
                      <Badge variant="success" className="mt-1">🎉 Completed!</Badge>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Time</span>
                    <span className="font-medium flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {roadmap.estimatedHours}h
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Sections</span>
                    <span className="font-medium">{sections.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Difficulty</span>
                    <DifficultyBadge difficulty={roadmap.difficulty} />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="space-y-2">
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
