import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BookOpen, Code2, FolderKanban, Briefcase, Bell,
  ArrowRight, TrendingUp, Award, Clock, Target,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { DashboardProjectWidget } from '@/student/components/project/DashboardProjectWidget'
import { useAuthStore } from '@/shared/store/authStore'
import { getInitials } from '@/shared/lib/utils'

const placeholderCards = [
  {
    title: 'Continue Learning',
    description: 'Pick up where you left off',
    icon: BookOpen,
    href: '/dashboard/learning',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    badge: 'Coming soon',
    stat: '0 courses',
  },
  {
    title: 'Coding Practice',
    description: 'Solve problems and improve skills',
    icon: Code2,
    href: '/dashboard/coding',
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    badge: 'Coming soon',
    stat: '0 problems',
  },
  {
    title: 'My Projects',
    description: 'Build and showcase your work',
    icon: FolderKanban,
    href: '/dashboard/projects',
    color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    badge: 'Coming soon',
    stat: '0 projects',
  },
  {
    title: 'Placement Prep',
    description: 'Get ready for your dream job',
    icon: Briefcase,
    href: '/dashboard/placement',
    color: 'bg-green-500/10 text-green-600 dark:text-green-400',
    badge: 'Coming soon',
    stat: '0% ready',
  },
]

const statsCards = [
  { label: 'Learning Streak', value: '0 days', icon: TrendingUp, color: 'text-blue-500' },
  { label: 'Problems Solved', value: '0', icon: Code2, color: 'text-purple-500' },
  { label: 'Projects Built', value: '0', icon: Award, color: 'text-orange-500' },
  { label: 'Hours Logged', value: '0h', icon: Clock, color: 'text-green-500' },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

export function DashboardPage() {
  const { user } = useAuthStore()

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 border-2 border-primary/20">
            <AvatarImage src={user?.profileImage} alt={user?.fullName} />
            <AvatarFallback className="text-lg">{getInitials(user?.fullName || 'U')}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {user?.fullName?.split(' ')[0]}! 👋
            </h1>
            <p className="text-muted-foreground text-sm">
              {user?.college ? `${user.college} · ` : ''}
              {user?.branch || 'Computer Science'}
              {user?.year ? ` · Year ${user.year}` : ''}
            </p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/dashboard/profile/edit" className="gap-2">
            Complete Profile
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </motion.div>

      {/* Stats overview */}
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
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                    <Icon className={`h-4 w-4 ${stat.color}`} aria-hidden="true" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Module cards */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Your Modules</h2>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {placeholderCards.map((card) => {
            const Icon = card.icon
            return (
              <motion.div key={card.title} variants={item} whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${card.color}`}>
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{card.title}</CardTitle>
                      <Badge variant="secondary" className="text-xs shrink-0">{card.badge}</Badge>
                    </div>
                    <CardDescription>{card.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">{card.stat}</span>
                      <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-xs">
                        <Link to={card.href}>View <ArrowRight className="h-3 w-3 ml-1" /></Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* Notifications & Goals placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Project Hub Widget */}
        <DashboardProjectWidget />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              Recent Notifications
            </CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-xs h-7">
              <Link to="/dashboard/notifications">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center py-6 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-30" aria-hidden="true" />
              <p className="text-sm">No notifications yet</p>
              <p className="text-xs opacity-70">Activity will appear here</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              Goals & Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center py-6 text-center text-muted-foreground">
              <Target className="h-8 w-8 mb-2 opacity-30" aria-hidden="true" />
              <p className="text-sm">No goals set yet</p>
              <p className="text-xs opacity-70">Set goals in your profile settings</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
