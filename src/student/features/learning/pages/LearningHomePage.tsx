import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BookOpen, ArrowRight, Clock, Target,
  Flame, Bookmark, PlayCircle, Award, ChevronDown, ChevronRight,
} from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { RoadmapCardSkeleton } from '@/student/components/learning/LearningSkeletons'
import { EmptyLearningState } from '@/student/components/learning/EmptyLearningState'
import { ProgressRing } from '@/student/components/learning/ProgressRing'
import { DifficultyBadge } from '@/student/components/learning/DifficultyBadge'
import {
  useRoadmaps,
  useLearningStats, useRecentlyViewed, useBookmarks,
} from '@/shared/hooks/useLearning'
import { useAuthStore } from '@/shared/store/authStore'
import { cn } from '@/shared/lib/utils'
import type { Roadmap } from '@/shared/types/learning'

// ─── Animation variants ───────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
}
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isPythonRoadmap = (r: { title: string; slug: string; category?: { name: string; slug: string } }) => {
  const t = r.title.toLowerCase()
  const s = r.slug.toLowerCase()
  const cn2 = r.category?.name?.toLowerCase() ?? ''
  const cs = r.category?.slug?.toLowerCase() ?? ''
  return t.includes('python') || s.includes('python') || cn2.includes('python') || cs.includes('python')
}

// ─── Stat card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string
  value: number
  suffix?: string
  icon: React.ElementType
  color: string
  bg: string
}

function StatCard({ label, value, suffix, icon: Icon, color, bg }: StatCardProps) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-150">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              {label}
            </p>
            <p className="text-3xl font-bold text-foreground tabular-nums">
              {value}
              {suffix && (
                <span className="text-lg font-semibold text-muted-foreground ml-0.5">{suffix}</span>
              )}
            </p>
          </div>
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl shrink-0', bg)}>
            <Icon className={cn('h-5 w-5', color)} aria-hidden="true" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── "Next Up" card ───────────────────────────────────────────────────────────
interface NextUpCardProps {
  index: number
  id: string
  title: string
  subtitle?: string
  hasProgress?: boolean
}

function NextUpCard({ index, id, title, subtitle, hasProgress }: NextUpCardProps) {
  return (
    <Card className="flex-none w-64 shrink-0 shadow-sm hover:shadow-md transition-all duration-150 border-border hover:border-primary/30">
      <CardContent className="p-4 flex flex-col gap-3 h-full">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold shrink-0">
            {index + 1}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">{title}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
        </div>
        <Button size="sm" asChild className={cn('gap-1.5 mt-auto', hasProgress ? 'variant-default' : 'variant-outline')}>
          <Link to={`/dashboard/learning/lesson/${id}`}>
            {hasProgress ? (
              <><ArrowRight className="h-3.5 w-3.5" />Resume</>
            ) : (
              <><PlayCircle className="h-3.5 w-3.5" />Start</>
            )}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

// ─── Module accordion ─────────────────────────────────────────────────────────
interface ModuleAccordionProps {
  sections: NonNullable<Roadmap['sections']>
}

function ModuleAccordion({ sections }: ModuleAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(sections[0]?.id ?? null)

  return (
    <div className="space-y-1">
      {sections.map((section) => {
        const completedCount = section.lessons.filter((l) => l.status === 'completed').length
        const isOpen = openId === section.id

        return (
          <div key={section.id} className="border border-border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : section.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 text-left',
                'transition-colors duration-150 hover:bg-accent/10',
                isOpen && 'bg-muted/50',
              )}
              aria-expanded={isOpen}
            >
              <motion.div
                animate={{ rotate: isOpen ? 0 : -90 }}
                transition={{ duration: 0.2 }}
                className="shrink-0"
              >
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </motion.div>
              <span className="flex-1 text-sm font-semibold text-foreground">{section.title}</span>
              <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                {completedCount}/{section.lessons.length}
              </span>
            </button>

            <motion.div
              initial={false}
              animate={isOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <ul className="divide-y divide-border">
                {section.lessons.map((lesson) => {
                  const isCompleted = lesson.status === 'completed'
                  const isInProgress = lesson.status === 'in_progress'
                  return (
                    <li key={lesson.id}>
                      <Link
                        to={`/dashboard/learning/lesson/${lesson.id}`}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent/10 transition-colors duration-150 group"
                      >
                        {isCompleted ? (
                          <span className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                            <svg className="h-3 w-3 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 12 12">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        ) : isInProgress ? (
                          <span className="h-5 w-5 rounded-full border-2 border-amber-400 bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                          </span>
                        ) : (
                          <span className="h-5 w-5 rounded-full border-2 border-border shrink-0" />
                        )}
                        <span className={cn(
                          'flex-1 truncate',
                          isCompleted ? 'text-muted-foreground' : 'text-foreground',
                        )}>
                          {lesson.title}
                        </span>
                        {lesson.estimatedMinutes > 0 && (
                          <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {lesson.estimatedMinutes}m
                          </span>
                        )}
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </motion.div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function LearningHomePage() {
  const { user, isAuthenticated } = useAuthStore()

  // Fetch data (public + authenticated guards preserved)
  const { data: roadmapsData, isLoading: roadmapsLoading } = useRoadmaps({ limit: 50 })
  const { data: stats } = useLearningStats()
  const { data: recentlyViewed } = useRecentlyViewed(4)
  const { data: bookmarks } = useBookmarks()

  const pythonRoadmaps = useMemo(
    () => roadmapsData?.data?.filter((r) => isPythonRoadmap(r)) ?? [],
    [roadmapsData],
  )
  const pythonRoadmap: Roadmap | undefined = pythonRoadmaps[0]

  const pythonRecentlyViewed = useMemo(
    () => recentlyViewed?.filter((r) => r.roadmapTitle?.toLowerCase().includes('python') ?? true) ?? [],
    [recentlyViewed],
  )
  const pythonBookmarks = useMemo(
    () =>
      bookmarks?.filter(
        (b) =>
          b.roadmapTitle?.toLowerCase().includes('python') ??
          b.title.toLowerCase().includes('python') ??
          true,
      ) ?? [],
    [bookmarks],
  )

  const statsCards: StatCardProps[] = [
    {
      label: 'Active Roadmaps',
      value: stats?.inProgressRoadmaps ?? 0,
      icon: BookOpen,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: 'Lessons Done',
      value: stats?.totalLessonsCompleted ?? 0,
      icon: Target,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      label: 'Hours Learned',
      value: stats?.totalHoursLearned ?? 0,
      suffix: 'h',
      icon: Clock,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      label: 'Day Streak',
      value: stats?.currentStreak ?? 0,
      suffix: ' days',
      icon: Flame,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-100 dark:bg-orange-900/30',
    },
  ]


  const progress = pythonRoadmap?.progress ?? 0
  const completedLessons = pythonRoadmap?.completedLessons ?? 0
  const sections = (pythonRoadmap as any)?.sections ?? []

  return (
    <div className="space-y-8">
      {/* Skip link */}
      <a
        href="#main-learning-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-2 focus:bg-background focus:text-foreground"
      >
        Skip to content
      </a>

      <PageHeader
        title="Python Learning"
        description="Master Python from scratch. Structured lessons, practice problems, and quizzes."
        breadcrumbs={[{ label: 'Learning' }]}
      />

      <div id="main-learning-content" className="space-y-8">
        {/* ── Stats ── */}
        {isAuthenticated && (
          <section aria-labelledby="stats-heading">
            <h2 id="stats-heading" className="text-base font-semibold text-foreground mb-3">
              Your Progress
            </h2>
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {statsCards.map((stat) => (
                <motion.div key={stat.label} variants={item}>
                  <StatCard {...stat} />
                </motion.div>
              ))}
            </motion.div>
          </section>
        )}

        {/* ── Python Course card ── */}
        <section aria-labelledby="course-heading">
          <h2 id="course-heading" className="text-base font-semibold text-foreground mb-3">
            Your Python Course
          </h2>

          {roadmapsLoading ? (
            <RoadmapCardSkeleton />
          ) : !pythonRoadmap ? (
            <EmptyLearningState variant="roadmaps" />
          ) : (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Left: meta */}
                    <div className="md:w-72 p-6 flex flex-col justify-center gap-3 border-b md:border-b-0 md:border-r border-border bg-muted/30">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl" role="img" aria-label="Python snake">🐍</span>
                        <div>
                          <h3 className="font-bold text-base text-foreground leading-snug">
                            {pythonRoadmap.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {pythonRoadmap.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <DifficultyBadge difficulty={pythonRoadmap.difficulty} />
                        <Badge variant="outline" className="gap-1 text-xs">
                          <Clock className="h-3 w-3" />
                          {pythonRoadmap.estimatedHours}h
                        </Badge>
                        <Badge variant="outline" className="gap-1 text-xs">
                          <BookOpen className="h-3 w-3" />
                          {pythonRoadmap.lessonCount} lessons
                        </Badge>
                      </div>
                    </div>

                    {/* Right: progress + CTAs */}
                    <div className="flex-1 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                      <div className="flex items-center gap-4">
                        <ProgressRing progress={progress} size={96} strokeWidth={8} />
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Course Progress</p>
                          <p className="text-sm font-semibold text-foreground">
                            {completedLessons} / {pythonRoadmap.lessonCount} Lessons
                          </p>
                          {progress === 100 ? (
                            <Badge variant="success" className="mt-1.5 gap-1 text-xs">
                              <Award className="h-3 w-3" /> Completed!
                            </Badge>
                          ) : progress > 0 ? (
                            <Badge variant="info" className="mt-1.5 text-xs">In Progress</Badge>
                          ) : (
                            <Badge variant="secondary" className="mt-1.5 text-xs">Not Started</Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 sm:ml-auto w-full sm:w-auto">
                        <Button asChild className="gap-2 w-full sm:min-w-[180px]">
                          <Link to={`/dashboard/learning/roadmaps/${pythonRoadmap.slug}`}>
                            <PlayCircle className="h-4 w-4" />
                            Open Course
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </section>

        {/* ── Module accordion ── */}
        {sections.length > 0 && (
          <section aria-labelledby="modules-heading">
            <h2 id="modules-heading" className="text-base font-semibold text-foreground mb-3">
              Course Modules
            </h2>
            <ModuleAccordion sections={sections} />
          </section>
        )}

        {/* ── Recently Viewed ── */}
        {isAuthenticated && pythonRecentlyViewed.length > 0 && (
          <section aria-labelledby="recent-heading">
            <div className="flex items-center justify-between mb-3">
              <h2 id="recent-heading" className="text-base font-semibold text-foreground">
                Recently Viewed
              </h2>
              <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
                <Link to="/dashboard/learning/recent">
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pythonRecentlyViewed.slice(0, 4).map((rv) => (
                <Card key={rv.id} className="hover:shadow-sm transition-shadow duration-150">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{rv.lesson.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{rv.roadmapTitle}</p>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="shrink-0 h-7 px-2 text-xs">
                      <Link to={`/dashboard/learning/lesson/${rv.lesson.id}`}>Continue</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* ── Bookmarks ── */}
        {isAuthenticated && pythonBookmarks.length > 0 && (
          <section aria-labelledby="bookmarks-heading">
            <div className="flex items-center justify-between mb-3">
              <h2
                id="bookmarks-heading"
                className="text-base font-semibold text-foreground flex items-center gap-2"
              >
                <Bookmark className="h-4 w-4" aria-hidden="true" />
                Bookmarks
              </h2>
              <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
                <Link to="/dashboard/learning/bookmarks">
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pythonBookmarks.slice(0, 3).map((bm) => (
                <Card key={bm.id} className="hover:shadow-sm transition-shadow duration-150">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                        <Bookmark className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{bm.title}</p>
                        <Badge variant="outline" className="text-xs mt-1">{bm.type}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
