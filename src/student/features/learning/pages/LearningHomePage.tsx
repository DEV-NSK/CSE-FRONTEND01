import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BookOpen, ArrowRight, TrendingUp, Clock, Target,
  Flame, Award, Bookmark, Search, LayoutGrid,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Input } from '@/shared/components/ui/input'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { CategoryCard, RoadmapCard } from '@/student/components/learning/LearningCard'
import { ContinueLearningCard } from '@/student/components/learning/ContinueLearningCard'
import { CategoryCardSkeleton, RoadmapCardSkeleton } from '@/student/components/learning/LearningSkeletons'
import { EmptyLearningState } from '@/student/components/learning/EmptyLearningState'
import {
  useCategories, useRoadmaps, useContinueLearning,
  useLearningStats, useRecentlyViewed, useBookmarks,
} from '@/shared/hooks/useLearning'
import { useAuthStore } from '@/shared/store/authStore'
import { formatDate, debounce } from '@/shared/lib/utils'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
}
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

export function LearningHomePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [searchValue, setSearchValue] = useState('')

  const { data: categories, isLoading: categoriesLoading, isError: categoriesError } = useCategories()
  const { data: roadmapsData, isLoading: roadmapsLoading } = useRoadmaps({ limit: 4 })
  const { data: continueLearning } = useContinueLearning()
  const { data: stats } = useLearningStats()
  const { data: recentlyViewed } = useRecentlyViewed(4)
  const { data: bookmarks } = useBookmarks()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSearch = useCallback(
    debounce((q: string) => {
      if (q.trim().length >= 2) navigate(`/dashboard/learning/search?q=${encodeURIComponent(q.trim())}`)
    }, 300),
    [navigate]
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
        title="Learning"
        description="Browse roadmaps, track your progress, and level up your skills."
        breadcrumbs={[{ label: 'Learning' }]}
      />

      {/* Skip to content */}
      <a href="#main-learning-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-2 focus:bg-background focus:text-foreground">
        Skip to content
      </a>

      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/90 to-secondary/80 p-8 text-white"
      >
        <div className="absolute inset-0 opacity-10" aria-hidden="true"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl font-bold mb-2">
            Welcome back, {user?.name?.split(' ')[0]}! 📚
          </h2>
          <p className="text-white/80 mb-6 text-sm">
            {continueLearning
              ? `You're making great progress on "${continueLearning.roadmap.title}". Keep going!`
              : 'Start your learning journey today. Pick a roadmap and begin building your skills.'}
          </p>

          {/* Search bar */}
          <form onSubmit={onSearchSubmit} role="search" aria-label="Search learning content">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60 pointer-events-none" aria-hidden="true" />
              <input
                type="search"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search roadmaps, lessons, topics..."
                aria-label="Search"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/20 border border-white/30 text-white placeholder:text-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur"
              />
            </div>
          </form>
        </div>
      </motion.div>

      <div id="main-learning-content" className="space-y-8">
        {/* Continue Learning */}
        {continueLearning && (
          <section aria-labelledby="continue-heading">
            <div className="flex items-center justify-between mb-4">
              <h2 id="continue-heading" className="text-lg font-semibold text-foreground">Continue Learning</h2>
            </div>
            <ContinueLearningCard data={continueLearning} />
          </section>
        )}

        {/* Learning Stats */}
        <section aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="text-lg font-semibold text-foreground mb-4">Your Progress</h2>
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                        {stat.value}{stat.suffix ?? ''}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </section>

        {/* Categories */}
        <section aria-labelledby="categories-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="categories-heading" className="text-lg font-semibold text-foreground">Browse Categories</h2>
            <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
              <Link to="/dashboard/learning/categories">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {categoriesError ? (
            <ErrorState title="Couldn't load categories" message="Please refresh the page." />
          ) : categoriesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => <CategoryCardSkeleton key={i} />)}
            </div>
          ) : !categories?.length ? (
            <EmptyLearningState variant="categories" />
          ) : (
            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.slice(0, 6).map((cat) => (
                <motion.div key={cat.id} variants={item}>
                  <CategoryCard category={cat} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>

        {/* Popular Roadmaps */}
        <section aria-labelledby="roadmaps-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="roadmaps-heading" className="text-lg font-semibold text-foreground">Popular Roadmaps</h2>
            <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
              <Link to="/dashboard/learning/roadmaps">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {roadmapsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => <RoadmapCardSkeleton key={i} />)}
            </div>
          ) : !roadmapsData?.data?.length ? (
            <EmptyLearningState variant="roadmaps" />
          ) : (
            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {roadmapsData.data.map((roadmap) => (
                <motion.div key={roadmap.id} variants={item}>
                  <RoadmapCard roadmap={roadmap} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>

        {/* Recently Viewed */}
        {recentlyViewed && recentlyViewed.length > 0 && (
          <section aria-labelledby="recent-heading">
            <div className="flex items-center justify-between mb-4">
              <h2 id="recent-heading" className="text-lg font-semibold text-foreground">Recently Viewed</h2>
              <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
                <Link to="/dashboard/learning/recent">
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recentlyViewed.slice(0, 4).map((item) => (
                <Card key={item.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.lesson.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.roadmapTitle}</p>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="shrink-0 h-7 px-2 text-xs">
                      <Link to={`/dashboard/learning/lesson/${item.lesson.id}`}>Continue</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Bookmarks Preview */}
        {bookmarks && bookmarks.length > 0 && (
          <section aria-labelledby="bookmarks-heading">
            <div className="flex items-center justify-between mb-4">
              <h2 id="bookmarks-heading" className="text-lg font-semibold text-foreground flex items-center gap-2">
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
              {bookmarks.slice(0, 3).map((bm) => (
                <Card key={bm.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                        <Bookmark className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{bm.title}</p>
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
