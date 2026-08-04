import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  Code2,
  Map,
  Bell,
  ArrowRight,
  Play,
  CheckCircle2,
  Trophy,
  Rocket,
  Info,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/feedback/Skeleton";
import { ErrorState } from "@/shared/components/feedback/ErrorState";
import { WidgetErrorBoundary } from "@/shared/components/feedback/ErrorBoundary";
import { useAuthStore } from "@/shared/store/authStore";
import { timeAgo } from "@/shared/lib/time";
import {
  useNotificationList,
  useUnreadCount,
  useMarkNotificationRead,
} from "@/shared/hooks/useNotifications";
import {
  useContinueLearning,
  useLearningStats,
} from "@/shared/hooks/useLearning";
import { useActivity } from "@/shared/hooks/useActivity";
import type {
  NotificationType,
  AppNotification,
} from "@/shared/types/notifications";
import type { ActivityItem, ActivityType } from "@/shared/services/activity.service";

const DASHBOARD_REFETCH_MS = 5 * 60 * 1000;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const typeIconMap: Record<NotificationType, typeof Info> = {
  learning: BookOpen,
  coding: Code2,
  projects: Map,
  placement: Trophy,
  events: Bell,
  system: Info,
};

const typeColorMap: Record<NotificationType, string> = {
  learning: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  coding: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  projects: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  placement: "bg-green-500/10 text-green-600 dark:text-green-400",
  events: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  system: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
};

const fallbackTypeColor = "bg-blue-500/10 text-blue-600 dark:text-blue-400";

function getTypeIcon(n: AppNotification) {
  if (n.type && n.type in typeIconMap) return typeIconMap[n.type];
  return Info;
}

function getTypeColor(n: AppNotification) {
  if (n.type && n.type in typeColorMap) return typeColorMap[n.type];
  return fallbackTypeColor;
}

function getFirstName(fullName: string | undefined | null): string {
  if (!fullName) return "there";
  return fullName.split(" ")[0];
}

const activityIconMap: Record<ActivityType, typeof CheckCircle2> = {
  lesson_completed: BookOpen,
  quiz_passed: Trophy,
  roadmap_started: Map,
};

const activityColorMap: Record<ActivityType, string> = {
  lesson_completed: "bg-green-500/10 text-green-600 dark:text-green-400",
  quiz_passed: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  roadmap_started: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
};

function getActivityIcon(a: ActivityItem) {
  return activityIconMap[a.type] ?? CheckCircle2;
}

function getActivityColor(a: ActivityItem) {
  return activityColorMap[a.type] ?? fallbackTypeColor;
}

export function DashboardPage() {
  const { user } = useAuthStore();
  const firstName = getFirstName(user?.fullName);

  const { data: continueLearning, isLoading: continueLearningLoading } =
    useContinueLearning();
  const { data: learningStats, isLoading: learningStatsLoading } =
    useLearningStats();

  const { data: notificationsPage, isLoading: notificationsLoading } =
    useNotificationList(
      { limit: 5 },
      {
        refetchInterval: DASHBOARD_REFETCH_MS,
      },
    );

  const { data: unreadCount } = useUnreadCount();
  const { mutateAsync: markRead } = useMarkNotificationRead();

  const {
    data: activityPage,
    isLoading: activityLoading,
    isError: activityError,
    refetch: activityRefetch,
  } = useActivity({ limit: 5 });

  const roadmapTitle = continueLearning?.roadmap?.title;
  const lessonTitle = continueLearning?.lesson?.title;
  const completionPercent = continueLearning?.progress ?? 0;

  const continueLearningHref = continueLearning?.lesson?.id
    ? `/dashboard/learning/lesson/${continueLearning.lesson.id}`
    : "/dashboard/learning/continue";

  const quickActions = [
    {
      title: "Continue Learning",
      description: "Pick up where you left off",
      icon: Play,
      href: "/dashboard/learning/continue",
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      hoverColor: "hover:bg-blue-500/20",
    },
    {
      title: "Open Roadmap",
      description: "Explore Python learning path",
      icon: Map,
      href: "/dashboard/learning/roadmaps/python",
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      hoverColor: "hover:bg-emerald-500/20",
    },
    {
      title: "Coding Questions",
      description: "Solve problems and practice",
      icon: Code2,
      href: "/dashboard/coding",
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      hoverColor: "hover:bg-purple-500/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. WELCOME CARD */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="overflow-hidden border border-border shadow-sm relative">
          {/* Subtle gradient decoration */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/5 blur-3xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-secondary/5 blur-2xl -translate-x-1/3 translate-y-1/3" />
          </div>
          <CardContent className="relative p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  Hello, {firstName} 👋
                </h1>
                <p className="text-muted-foreground text-sm">
                  Welcome back to CSE Ground
                </p>
                {learningStats && learningStats.currentStreak > 0 && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-sm font-medium w-fit">
                    🔥 {learningStats.currentStreak}-day streak — keep it going!
                  </div>
                )}
              </div>
              <Button
                asChild
                className="gap-2 rounded-full shadow-md shadow-primary/20 hover:shadow-primary/30 transition-shadow"
              >
                <Link to={continueLearningHref}>
                  <Play className="h-4 w-4" aria-hidden="true" />
                  Resume Learning
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 2. PROGRESS CARD */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        aria-labelledby="progress-heading"
      >
        <Card className="border-border/60">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                </div>
                <CardTitle id="progress-heading" className="text-lg">
                  Your Progress
                </CardTitle>
              </div>
              {!continueLearningLoading && (continueLearning || learningStats) && (
                <Badge variant="secondary" className="text-xs">
                  {learningStats?.totalLessonsCompleted ?? 0} lessons done
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {continueLearningLoading ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-2 w-full rounded-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-3.5 w-12" />
                  </div>
                </div>
                <Skeleton className="h-9 w-28" />
              </div>
            ) : continueLearning ? (
              <div className="space-y-5">
                <div className="space-y-1">
                  {roadmapTitle && (
                    <div className="flex items-start gap-2">
                      <span className="text-sm font-medium text-muted-foreground shrink-0 w-20">Roadmap:</span>
                      <span className="text-sm font-semibold text-foreground">{roadmapTitle}</span>
                    </div>
                  )}
                  {lessonTitle && (
                    <div className="flex items-start gap-2">
                      <span className="text-sm font-medium text-muted-foreground shrink-0 w-20">Lesson:</span>
                      <span className="text-sm text-foreground">{lessonTitle}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Completion</span>
                    <span className="text-sm font-bold text-foreground tabular-nums">
                      {Math.round(completionPercent)}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${completionPercent}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full"
                      role="progressbar"
                      aria-valuenow={completionPercent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                </div>

                <Button asChild className="gap-2">
                  <Link to={continueLearningHref}>
                    <Play className="h-4 w-4" aria-hidden="true" />
                    Continue
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 text-center text-muted-foreground">
                <BookOpen className="h-10 w-10 mb-3 opacity-30" aria-hidden="true" />
                <p className="text-sm font-medium text-foreground">No learning in progress yet</p>
                <p className="text-xs opacity-70 mt-1 mb-4">Start the Python roadmap to track your progress.</p>
                <Button asChild size="sm" variant="default" className="gap-1.5">
                  <Link to="/dashboard/learning/roadmaps/python">
                    <Rocket className="h-3.5 w-3.5" aria-hidden="true" />
                    Start Python Roadmap
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.section>

      {/* 3. QUICK ACTIONS */}
      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        aria-labelledby="quick-actions-heading"
      >
        <h2 id="quick-actions-heading" className="text-lg font-semibold text-foreground mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <motion.div key={action.title} variants={item}>
                <Link to={action.href} className="block h-full">
                  <Card className={`h-full cursor-pointer transition-all hover:shadow-sm border-border/60 ${action.hoverColor}`}>
                    <CardContent className="p-5">
                      <div className={`w-11 h-11 rounded-lg flex items-center justify-center mb-3 ${action.color}`}>
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <h3 className="text-base font-semibold text-foreground mb-1">
                        {action.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* 4. NOTIFICATIONS CARD + 5. RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* NOTIFICATION CARD */}
        <WidgetErrorBoundary label="Recent Notifications" minHeight={200}>
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            aria-labelledby="notifications-heading"
          >
          <Card className="h-full border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle id="notifications-heading" className="text-base flex items-center gap-2">
                <Bell
                  className="h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
                Recent Notifications
                {typeof unreadCount === "number" && unreadCount > 0 && (
                  <Badge variant="destructive" className="text-[10px] h-4 px-1.5 font-semibold">
                    {unreadCount} new
                  </Badge>
                )}
              </CardTitle>
              <Button variant="ghost" size="sm" asChild className="text-xs h-7">
                <Link to="/dashboard/notifications">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {notificationsLoading ? (
                <div className="space-y-3 py-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notificationsPage?.data?.length ? (
                <ul className="space-y-1">
                  {notificationsPage.data.slice(0, 5).map((n) => {
                    const TIcon = getTypeIcon(n);
                    const tCls = getTypeColor(n);
                    return (
                      <li key={n.id}>
                        <button
                          type="button"
                          onClick={() => !n.isRead && markRead(n.id)}
                          className={`w-full text-left flex items-start gap-3 p-2.5 rounded-lg transition-colors ${
                            n.isRead
                              ? "hover:bg-accent/30"
                              : "hover:bg-accent/60 bg-accent/20 border-l-2 border-primary pl-2"
                          }`}
                        >
                          <span
                            className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${tCls}`}
                          >
                            <TIcon className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm truncate ${n.isRead ? "text-muted-foreground" : "font-medium text-foreground"}`}
                            >
                              {n.title}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {n.message}
                            </p>
                            <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                              {timeAgo(n.createdAt)}
                            </p>
                          </div>
                          {!n.isRead && (
                            <span
                              className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0"
                              aria-label="unread"
                            />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="flex flex-col items-center py-6 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mb-2 opacity-30" aria-hidden="true" />
                  <p className="text-sm font-medium text-foreground">No notifications yet</p>
                  <p className="text-xs opacity-70">Activity will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.section>
        </WidgetErrorBoundary>

        {/* RECENT ACTIVITY */}
        <WidgetErrorBoundary label="Recent Activity" minHeight={200}>
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          aria-labelledby="activity-heading"
        >
          <Card className="h-full border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle id="activity-heading" className="text-base flex items-center gap-2">
                <CheckCircle2
                  className="h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="space-y-3 py-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activityError ? (
                <ErrorState
                  title="Failed to load activity"
                  message="Please try again."
                  onRetry={() => activityRefetch()}
                  className="py-6"
                />
              ) : activityPage?.data?.length ? (
                <ul className="space-y-1">
                  {activityPage.data.map((a: ActivityItem) => {
                    const AIcon = getActivityIcon(a);
                    const aCls = getActivityColor(a);
                    return (
                      <li key={a.id}>
                        <div className="w-full flex items-start gap-3 p-2.5 rounded-lg border-l-2 border-transparent hover:border-primary/30 transition-colors">
                          <span
                            className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${aCls}`}
                          >
                            <AIcon className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {a.title}
                            </p>
                            {a.description && (
                              <p className="text-xs text-muted-foreground truncate">
                                {a.description}
                              </p>
                            )}
                            <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                              {timeAgo(a.createdAt)}
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="flex flex-col items-center py-8 text-center text-muted-foreground">
                  <Trophy className="h-10 w-10 mb-3 opacity-25" aria-hidden="true" />
                  <p className="text-sm font-medium text-foreground">No activity yet</p>
                  <p className="text-xs opacity-70 mt-1 mb-4 max-w-xs">
                    Start learning to see your milestones, completed lessons, and achievements here.
                  </p>
                  <Button asChild size="sm" className="gap-1.5">
                    <Link to="/dashboard/learning/roadmaps/python">
                      <Rocket className="h-3.5 w-3.5" aria-hidden="true" />
                      Start Python Roadmap
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.section>
        </WidgetErrorBoundary>
      </div>
    </div>
  );
}
