import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  Code2,
  FolderKanban,
  Briefcase,
  Bell,
  ArrowRight,
  TrendingUp,
  Award,
  Clock,
  Target,
  Info,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Skeleton } from "@/shared/components/feedback/Skeleton";
import { DashboardProjectWidget } from "@/student/components/project/DashboardProjectWidget";
import { useAuthStore } from "@/shared/store/authStore";
import { getInitials } from "@/shared/lib/utils";
import { timeAgo } from "@/shared/lib/time";
import { useOverallAnalytics } from "@/shared/hooks/useAnalytics";
import {
  useNotificationList,
  useUnreadCount,
  useMarkNotificationRead,
} from "@/shared/hooks/useNotifications";
import type {
  NotificationType,
  AppNotification,
} from "@/shared/types/notifications";

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
  projects: FolderKanban,
  placement: Briefcase,
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

export function DashboardPage() {
  const { user } = useAuthStore();

  const { data: analytics, isLoading: analyticsLoading } = useOverallAnalytics({
    refetchInterval: DASHBOARD_REFETCH_MS,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
  });

  const { data: notificationsPage, isLoading: notificationsLoading } =
    useNotificationList(
      { limit: 5 },
      {
        refetchInterval: DASHBOARD_REFETCH_MS,
        refetchOnWindowFocus: true,
      },
    );

  const { data: unreadCount } = useUnreadCount();
  const { mutateAsync: markRead } = useMarkNotificationRead();

  const learning = analytics?.learning;
  const coding = analytics?.coding;
  const projects = analytics?.projects;
  const placement = analytics?.placement;

  const learningStreak = Math.max(
    learning?.currentStreak ?? 0,
    coding?.currentStreak ?? 0,
  );
  const studyHours = learning?.studyTimeHours ?? 0;

  const statsCards = [
    {
      label: "Learning Streak",
      value: analyticsLoading ? (
        <Skeleton className="h-8 w-16 inline-block" />
      ) : (
        `${learningStreak} day${learningStreak === 1 ? "" : "s"}`
      ),
      icon: TrendingUp,
      color: "text-blue-500",
    },
    {
      label: "Problems Solved",
      value: analyticsLoading ? (
        <Skeleton className="h-8 w-16 inline-block" />
      ) : (
        String(coding?.totalSolved ?? 0)
      ),
      icon: Code2,
      color: "text-purple-500",
    },
    {
      label: "Projects Built",
      value: analyticsLoading ? (
        <Skeleton className="h-8 w-16 inline-block" />
      ) : (
        String(projects?.totalProjects ?? 0)
      ),
      icon: Award,
      color: "text-orange-500",
    },
    {
      label: "Hours Logged",
      value: analyticsLoading ? (
        <Skeleton className="h-8 w-16 inline-block" />
      ) : (
        `${studyHours}h`
      ),
      icon: Clock,
      color: "text-green-500",
    },
  ];

  const moduleCards = [
    {
      title: "Continue Learning",
      description: "Pick up where you left off",
      icon: BookOpen,
      href: "/dashboard/learning",
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      badge: analyticsLoading ? (
        <Skeleton className="h-5 w-16 inline-block" />
      ) : learning && learning.totalRoadmaps > 0 ? (
        `${learning.totalCompleted}/${learning.totalRoadmaps} done`
      ) : (
        "Start"
      ),
      stat: analyticsLoading ? (
        <Skeleton className="h-4 w-24 inline-block" />
      ) : learning ? (
        `${learning.totalCompleted} lessons`
      ) : (
        "0 lessons"
      ),
      progress: learning?.roadmapProgress?.[0]?.progress ?? 0,
    },
    {
      title: "Coding Practice",
      description: "Solve problems and improve skills",
      icon: Code2,
      href: "/dashboard/coding",
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      badge: analyticsLoading ? (
        <Skeleton className="h-5 w-16 inline-block" />
      ) : coding && coding.totalSolved > 0 ? (
        `${Math.round(coding.acceptanceRate)}% acc`
      ) : (
        "Start"
      ),
      stat: analyticsLoading ? (
        <Skeleton className="h-4 w-24 inline-block" />
      ) : coding ? (
        `${coding.totalSolved} problems`
      ) : (
        "0 problems"
      ),
      progress: coding?.totalSolved
        ? Math.min(100, Math.round(coding.totalSolved / 5))
        : 0,
    },
    {
      title: "My Projects",
      description: "Build and showcase your work",
      icon: FolderKanban,
      href: "/dashboard/projects",
      color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
      badge: analyticsLoading ? (
        <Skeleton className="h-5 w-16 inline-block" />
      ) : projects && projects.completedTasks > 0 ? (
        `${projects.completedTasks} tasks`
      ) : (
        "Start"
      ),
      stat: analyticsLoading ? (
        <Skeleton className="h-4 w-24 inline-block" />
      ) : projects ? (
        `${projects.totalProjects} projects`
      ) : (
        "0 projects"
      ),
      progress: projects?.totalTasks
        ? Math.round((projects.completedTasks / projects.totalTasks) * 100)
        : 0,
    },
    {
      title: "Placement Prep",
      description: "Get ready for your dream job",
      icon: Briefcase,
      href: "/dashboard/placement",
      color: "bg-green-500/10 text-green-600 dark:text-green-400",
      badge: analyticsLoading ? (
        <Skeleton className="h-5 w-16 inline-block" />
      ) : placement && placement.offers > 0 ? (
        `${placement.offers} offer${placement.offers > 1 ? "s" : ""}`
      ) : (
        "Start"
      ),
      stat: analyticsLoading ? (
        <Skeleton className="h-4 w-24 inline-block" />
      ) : placement ? (
        `${placement.totalApplications} applications`
      ) : (
        "0% ready"
      ),
      progress: placement?.totalApplications
        ? Math.min(
            100,
            Math.round(
              ((placement.interviews + placement.offers * 2) /
                Math.max(placement.totalApplications * 2, 1)) *
                100,
            ),
          )
        : 0,
    },
  ];

  const goals = learning?.roadmapProgress?.slice(0, 3) ?? [];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 border-2 border-primary/20">
            <AvatarImage src={user?.profileImage} alt={user?.fullName} />
            <AvatarFallback className="text-lg">
              {getInitials(user?.fullName || "U")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {user?.fullName?.split(" ")[0]}! 👋
            </h1>
            <p className="text-muted-foreground text-sm">
              {user?.college ? `${user.college} · ` : ""}
              {user?.branch || "Computer Science"}
              {user?.year ? ` · Year ${user.year}` : ""}
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

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} variants={item}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-muted-foreground font-medium">
                      {stat.label}
                    </p>
                    <Icon
                      className={`h-4 w-4 ${stat.color}`}
                      aria-hidden="true"
                    />
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Your Modules
        </h2>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {moduleCards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                variants={item}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15 }}
              >
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${card.color}`}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{card.title}</CardTitle>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {card.badge}
                      </Badge>
                    </div>
                    <CardDescription>{card.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    {card.progress > 0 && (
                      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${card.progress}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className="h-full bg-primary rounded-full"
                          role="progressbar"
                          aria-valuenow={card.progress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        {card.stat}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-7 px-2 text-xs"
                      >
                        <Link to={card.href}>
                          View <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DashboardProjectWidget />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell
                className="h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
              Recent Notifications
              {typeof unreadCount === "number" && unreadCount > 0 && (
                <Badge variant="destructive" className="text-[10px] h-4 px-1.5">
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
                {Array.from({ length: 3 }).map((_, i) => (
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
              <ul className="space-y-2">
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
                            : "hover:bg-accent/60 bg-accent/20"
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
                <p className="text-sm">No notifications yet</p>
                <p className="text-xs opacity-70">Activity will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target
                className="h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
              Goals & Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="space-y-3 py-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between">
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-3.5 w-8" />
                    </div>
                    <Skeleton className="h-1.5 w-full" />
                  </div>
                ))}
              </div>
            ) : goals.length > 0 ? (
              <ul className="space-y-3">
                {goals.map((g) => (
                  <li key={g.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate pr-2">
                        {g.name}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                        {g.progress}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${g.progress}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center py-6 text-center text-muted-foreground">
                <Target
                  className="h-8 w-8 mb-2 opacity-30"
                  aria-hidden="true"
                />
                <p className="text-sm">No goals set yet</p>
                <p className="text-xs opacity-70">
                  Start a learning roadmap to track progress
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
