import { useState, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BookOpen, ArrowRight, Clock, Target,
  Flame, Bookmark, Search, PlayCircle, Award,
} from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { ContinueLearningCard } from '@/student/components/learning/ContinueLearningCard'
import { RoadmapCardSkeleton } from '@/student/components/learning/LearningSkeletons'
import { EmptyLearningState } from '@/student/components/learning/EmptyLearningState'
import { ProgressRing } from '@/student/components/learning/ProgressRing'
import { DifficultyBadge } from '@/student/components/learning/DifficultyBadge'
import {
  useRoadmaps, useContinueLearning,
  useLearningStats, useRecentlyViewed, useBookmarks,
} from '@/shared/hooks/useLearning'
import { useAuthStore } from '@/shared/store/authStore'
import { debounce } from '@/shared/lib/utils'
import type { Roadmap } from '@/shared/types/learning'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
}
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

const isPythonRoadmap = (r: { title: string; slug: string; category?: { name: string; slug: string } }) => {
  const t = r.title.toLowerCase()
  const s = r.slug.toLowerCase()
  const cn = r.category?.name?.toLowerCase() ?? ''
  const cs = r.category?.slug?.toLowerCase() ?? ''
  return t.includes('python') || s.includes('python') || cn.includes('python') || cs.includes('python')
}

export function LearningHomePage() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const [searchValue, setSearchValue] = useState('')

  // Categories & roadmaps are public — always fetch
  const { data: roadmapsData, isLoading: roadmapsLoading } = useRoadmaps({ limit: 50 })

  // These queries require authentication — `enabled` prevents 401 floods for unauthenticated users
  const { data: continueLearning } = useContinueLearning()
  const { data: stats } = useLearningStats()
  const { data: recentlyViewed } = useRecentlyViewed(4)
  const { data: bookmarks } = useBookmarks()

  const pythonRoadmaps = useMemo(
    () => roadmapsData?.data?.filter((r) => isPythonRoadmap(r)) ?? [],
    [roadmapsData],
  )
  const pythonRoadmap: Roadmap | undefined = pythonRoadmaps[0]

  const pythonContinueLearning = useMemo(() => {
    if (!continueLearning) return null
    if (isPythonRoadmap(continueLearning.roadmap)) return continueLearning
    return null
  }, [continueLearning])

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSearch = useCallback(
    debounce((q: string) => {
      if (q.trim().length >= 2)
        navigate(`/dashboard/learning/search?q=${encodeURIComponent(q.trim())}`)
    }, 300),
    [navigate],
  )

  const onSearchChange = (val: string) => {
    setSearchValue(val)
    handleSearch(val)
  }

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim().length >= 2) {
      navigate(`/dashboard/learning/search?q=${encodeURIComponent(searchValue.trim())}`)
    }
  }

  const statsCards = [
    { label: 'Roadmaps', value: stats?.inProgressRoadmaps ?? 0, suffix: ' active', icon: BookOpen, color: 'text-blue-500' },
    { label: 'Lessons Done', value: stats?.totalLessonsCompleted ?? 0, icon: Target, color: 'text-green-500' },
    { label: 'Hours Learned', value: stats?.totalHoursLearned ?? 0, suffix: 'h', icon: Clock, color: 'text-purple-500' },
    { label: 'Streak', value: stats?.currentStreak ?? 0, suffix: ' days', icon: Flame, color: 'text-orange-500' },
  ]

  return (
    <div className="space-y-8">
      <PageHeader
        title="Python Learning"
        description="Master Python from scratch. Structured lessons, practice problems, and quizzes to become a Python pro."
        breadcrumbs={[{ label: 'Learning' }]}
      />

      {/* Skip to content */}
      <a
        href="#main-learning-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-2 focus:bg-background focus:text-foreground"
      >
        Skip to content
      </a>

      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-yellow-500 via-blue-500 to-indigo-600 p-8 md:p-12 text-white"
      >
        <div
          className="absolute inset-0 opacity-10"
          aria-hidden="true"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative z-10 max-w-3xl">
          <Badge className="mb-4 bg-white/20 text-white border-white/30">🐍 Python Programming</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Welcome back, {user?.fullName?.split(' ')[0] ?? 'Student'}!
          </h2>
          <p className="text-white/90 mb-6 text-base">
            {pythonContinueLearning
              ? `You're ${pythonContinueLearning.progress}% through the Python course. Keep building!`
              : 'Complete Python learning path — from basics to advanced. Start your journey now.'}
          </p>

          {/* Search bar */}
          <form
            onSubmit={onSearchSubmit}
            role="search"
            aria-label="Search learning content"
            className="mb-6"
          >
            <div className="relative max-w-lg">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search Python lessons: Variables, Functions, Loops..."
                aria-label="Search"
                className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder:text-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur"
              />
            </div>
          </form>

          <div className="flex flex-wrap gap-3">
            {pythonRoadmap ? (
              <Button
                size="lg"
                asChild
                className="bg-white text-blue-600 hover:bg-white/90 gap-2 shadow-lg"
              >
                <Link to={`/dashboard/learning/roadmaps/${pythonRoadmap.slug}`}>
                  <PlayCircle className="h-5 w-5" />
                  Open Python Course
                </Link>
              </Button>
            ) : (
              <Button
                size="lg"
                asChild
                className="bg-white text-blue-600 hover:bg-white/90 gap-2 shadow-lg"
              >
                <Link to="/dashboard/learning/roadmaps/python">
                  <PlayCircle className="h-5 w-5" />
                  Open Python Course
                </Link>
              </Button>
            )}
            {pythonContinueLearning && (
              <Button
                size="lg"
                variant="outline"
                asChild
                className="bg-white/10 border-white/40 text-white hover:bg-white/20 gap-2"
              >
                <Link to={`/dashboard/learning/lesson/${pythonContinueLearning.lesson.id}`}>
                  <ArrowRight className="h-5 w-5" />
                  Continue Learning
                </Link>
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      <div id="main-learning-content" className="space-y-8">
        {/* Continue Learning */}
        {pythonContinueLearning && (
          <section aria-labelledby="continue-heading">
            <div className="flex items-center justify-between mb-4">
              <h2 id="continue-heading" className="text-lg font-semibold text-foreground">
                Continue Learning
              </h2>
            </div>
            <ContinueLearningCard data={pythonContinueLearning} />
          </section>
        )}

        {/* Learning Stats — only shown when authenticated */}
        {isAuthenticated && (
          <section aria-labelledby="stats-heading">
            <h2 id="stats-heading" className="text-lg font-semibold text-foreground mb-4">
              Your Progress
            </h2>
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {statsCards.map((stat) => {
                const Icon = stat.icon
                return (
                  <motion.div key={stat.label} variants={item}>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                          <Icon className={`h-4 w-4 ${stat.color}`} aria-hidden="true" />
                        </div>
                        <p className="text-2xl font-bold">
                          {stat.value}
                          {stat.suffix ?? ''}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </motion.div>
          </section>
        )}

        {/* Python Course Card - Featured */}
        <section aria-labelledby="course-heading">
          <h2 id="course-heading" className="text-lg font-semibold text-foreground mb-4">
            Your Python Course
          </h2>

          {roadmapsLoading ? (
            <div className="grid grid-cols-1 gap-4">
              <RoadmapCardSkeleton />
            </div>
          ) : !pythonRoadmap ? (
            <EmptyLearningState variant="roadmaps" />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl overflow-hidden border border-border shadow-sm bg-gradient-to-br from-card via-card to-primary/[0.02]"
            >
              <div className="flex flex-col md:flex-row">
                {/* Left visual */}
                <div className="md:w-80 p-6 md:p-8 flex flex-col justify-center bg-gradient-to-br from-yellow-50 via-blue-50 to-indigo-50 dark:from-yellow-950/20 dark:via-blue-950/20 dark:to-indigo-950/20">
                  <div className="text-6xl mb-4">🐍</div>
                  <h3 className="text-2xl font-bold mb-2">{pythonRoadmap.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{pythonRoadmap.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <DifficultyBadge difficulty={pythonRoadmap.difficulty} />
                    <Badge variant="outline" className="gap-1">
                      <Clock className="h-3 w-3" />
                      {pythonRoadmap.estimatedHours}h
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <BookOpen className="h-3 w-3" />
                      {pythonRoadmap.lessonCount} lessons
                    </Badge>
                  </div>
                </div>

                {/* Right progress + CTA */}
                <div className="flex-1 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
                  <div className="flex items-center gap-5">
                    <ProgressRing
                      progress={pythonRoadmap.progress ?? 0}
                      size={120}
                      strokeWidth={10}
                    />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Course Progress</p>
                      <p className="text-lg font-semibold">
                        {pythonRoadmap.completedLessons ?? 0} / {pythonRoadmap.lessonCount} Lessons
                      </p>
                      {pythonRoadmap.progress === 100 ? (
                        <Badge variant="success" className="mt-2 gap-1">
                          <Award className="h-3 w-3" /> Completed! Certificate Coming Soon
                        </Badge>
                      ) : (pythonRoadmap.progress ?? 0) > 0 ? (
                        <Badge variant="info" className="mt-2">
                          In Progress
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="mt-2">
                          Not Started
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 flex md:flex-col items-stretch md:items-end gap-3">
                    <Button
                      size="lg"
                      asChild
                      className="gap-2 flex-1 md:flex-none md:min-w-[200px]"
                    >
                      <Link to={`/dashboard/learning/roadmaps/${pythonRoadmap.slug}`}>
                        <PlayCircle className="h-5 w-5" />
                        Open Course
                      </Link>
                    </Button>
                    {pythonContinueLearning && (
                      <Button
                        variant="outline"
                        size="lg"
                        asChild
                        className="gap-2 flex-1 md:flex-none md:min-w-[200px]"
                      >
                        <Link
                          to={`/dashboard/learning/lesson/${pythonContinueLearning.lesson.id}`}
                        >
                          <ArrowRight className="h-5 w-5" />
                          Resume
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </section>

        {/* Recently Viewed — only shown when authenticated and data exists */}
        {isAuthenticated && pythonRecentlyViewed.length > 0 && (
          <section aria-labelledby="recent-heading">
            <div className="flex items-center justify-between mb-4">
              <h2 id="recent-heading" className="text-lg font-semibold text-foreground">
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
                <Card key={rv.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{rv.lesson.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{rv.roadmapTitle}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="shrink-0 h-7 px-2 text-xs"
                    >
                      <Link to={`/dashboard/learning/lesson/${rv.lesson.id}`}>Continue</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Bookmarks Preview — only shown when authenticated and data exists */}
        {isAuthenticated && pythonBookmarks.length > 0 && (
          <section aria-labelledby="bookmarks-heading">
            <div className="flex items-center justify-between mb-4">
              <h2
                id="bookmarks-heading"
                className="text-lg font-semibold text-foreground flex items-center gap-2"
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
                <Card key={bm.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                        <Bookmark
                          className="h-4 w-4 text-amber-600 dark:text-amber-400"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{bm.title}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {bm.type}
                        </Badge>
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
