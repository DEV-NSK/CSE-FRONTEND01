import { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Code2, ArrowRight, Target, Flame, TrendingUp, Award,
  CheckCircle2, Search, BookOpen,
} from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { ProblemCard } from '@/student/components/coding/ProblemCard'
import { ProblemCardSkeleton } from '@/student/components/coding/CodingSkeletons'
import { DailyChallengeCard } from '@/student/components/coding/DailyChallengeCard'
import { CodingDifficultyBadge } from '@/student/components/coding/DifficultyBadge'
import {
  useRecommendedProblems,
  useRecentlySolved,
  useContinueSolving,
  useFavorites,
  useCodingAnalytics,
} from '@/shared/hooks/useCoding'
import { useAuthStore } from '@/shared/store/authStore'
import { debounce } from '@/shared/lib/utils'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

export function CodingHomePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [searchValue, setSearchValue] = useState('')

  const { data: recommended, isLoading: recLoading, isError: recError } = useRecommendedProblems(6)
  const { data: recentlySolved } = useRecentlySolved(5)
  const { data: continueSolving } = useContinueSolving(3)
  const { data: favoritesData } = useFavorites({ limit: 4 })
  const { data: analytics } = useCodingAnalytics()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSearch = useCallback(
    debounce((q: string) => {
      if (q.trim().length >= 2)
        navigate(`/dashboard/coding/problems?search=${encodeURIComponent(q.trim())}`)
    }, 300),
    [navigate]
  )

  const onSearchChange = (val: string) => {
    setSearchValue(val)
    handleSearch(val)
  }

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim().length >= 1)
      navigate(`/dashboard/coding/problems?search=${encodeURIComponent(searchValue.trim())}`)
  }

  const stats = analytics?.stats

  const statsCards = [
    {
      label: 'Problems Solved',
      value: stats?.totalSolved ?? 0,
      icon: Target,
      color: 'text-green-500',
      sub: `${stats?.easySolved ?? 0}E / ${stats?.mediumSolved ?? 0}M / ${stats?.hardSolved ?? 0}H`,
    },
    {
      label: 'Acceptance Rate',
      value: `${stats?.acceptanceRate?.toFixed(1) ?? 0}%`,
      icon: TrendingUp,
      color: 'text-blue-500',
    },
    {
      label: 'Current Streak',
      value: stats?.currentStreak ?? 0,
      suffix: ' days',
      icon: Flame,
      color: 'text-orange-500',
    },
    {
      label: 'Longest Streak',
      value: stats?.longestStreak ?? 0,
      suffix: ' days',
      icon: Award,
      color: 'text-purple-500',
    },
  ]

  return (
    <div className="space-y-8">
      <PageHeader
        title="Coding"
        description="Practice problems, track your progress, and sharpen your coding skills."
        breadcrumbs={[{ label: 'Coding' }]}
      />

      {/* Skip to main content */}
      <a
        href="#main-coding-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-2 focus:bg-background focus:text-foreground"
      >
        Skip to content
      </a>

      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/90 to-accent/70 p-8 text-white"
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
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Code2 className="h-6 w-6" aria-hidden="true" />
            Welcome back, {user?.name?.split(' ')[0]}! 🚀
          </h2>
          <p className="text-white/80 mb-6 text-sm">
            {continueSolving && continueSolving.length > 0
              ? `You have ${continueSolving.length} problem${continueSolving.length > 1 ? 's' : ''} in progress. Keep going!`
              : 'Start solving problems and build your algorithmic thinking skills.'}
          </p>

          {/* Search */}
          <form onSubmit={onSearchSubmit} role="search" aria-label="Search problems">
            <div className="relative max-w-md">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search problems by title, tag, company..."
                aria-label="Search"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/20 border border-white/30 text-white placeholder:text-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur"
              />
            </div>
          </form>
        </div>
      </motion.div>

      <div id="main-coding-content" className="space-y-8">
        {/* Daily Challenge */}
        <section aria-labelledby="daily-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="daily-heading" className="text-lg font-semibold text-foreground">
              Daily Challenge
            </h2>
            <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
              <Link to="/dashboard/coding/daily">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <DailyChallengeCard />
        </section>

        {/* Continue Solving */}
        {continueSolving && continueSolving.length > 0 && (
          <section aria-labelledby="continue-heading">
            <div className="flex items-center justify-between mb-4">
              <h2 id="continue-heading" className="text-lg font-semibold text-foreground">
                Continue Solving
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {continueSolving.map((prob) => (
                <Card key={prob.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Code2 className="h-4 w-4 text-primary" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{prob.title}</p>
                      <CodingDifficultyBadge difficulty={prob.difficulty} className="mt-0.5" />
                    </div>
                    <Button variant="ghost" size="sm" asChild className="shrink-0 h-7 px-2 text-xs">
                      <Link to={`/dashboard/coding/problems/${prob.slug}`}>Continue</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Coding Statistics */}
        <section aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="text-lg font-semibold text-foreground mb-4">
            Coding Statistics
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
                        {stat.suffix && (
                          <span className="text-sm font-normal text-muted-foreground">
                            {stat.suffix}
                          </span>
                        )}
                      </p>
                      {stat.sub && <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </section>

        {/* Recently Solved */}
        {recentlySolved && recentlySolved.length > 0 && (
          <section aria-labelledby="recent-solved-heading">
            <div className="flex items-center justify-between mb-4">
              <h2 id="recent-solved-heading" className="text-lg font-semibold text-foreground">
                Recently Solved
              </h2>
              <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
                <Link to="/dashboard/coding/submissions">
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentlySolved.slice(0, 5).map((prob) => (
                <Card key={prob.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-3 flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/dashboard/coding/problems/${prob.slug}`}
                        className="text-sm font-medium hover:text-primary transition-colors truncate block"
                      >
                        {prob.title}
                      </Link>
                      <CodingDifficultyBadge difficulty={prob.difficulty} className="mt-0.5" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Recommended Problems */}
        <section aria-labelledby="recommended-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="recommended-heading" className="text-lg font-semibold text-foreground">
              Recommended Problems
            </h2>
            <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
              <Link to="/dashboard/coding/problems">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {recError ? (
            <ErrorState title="Couldn't load problems" message="Please refresh the page." />
          ) : recLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <ProblemCardSkeleton key={i} />
              ))}
            </div>
          ) : !recommended?.length ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No recommendations yet. Start solving!</p>
                <Button size="sm" className="mt-4" asChild>
                  <Link to="/dashboard/coding/problems">Browse Problems</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {recommended.map((prob) => (
                <motion.div key={prob.id} variants={item}>
                  <ProblemCard problem={prob} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>

        {/* Favorite Problems */}
        {favoritesData && favoritesData.data && favoritesData.data.length > 0 && (
          <section aria-labelledby="favorites-heading">
            <div className="flex items-center justify-between mb-4">
              <h2 id="favorites-heading" className="text-lg font-semibold text-foreground">
                Favorite Problems
              </h2>
              <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
                <Link to="/dashboard/coding/favorites">
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoritesData.data.slice(0, 3).map((fav) => (
                <ProblemCard key={fav.id} problem={fav.problem} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
