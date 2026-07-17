// ─── FPRD-09 Admin Analytics Types ───────────────────────────────────────────

export interface DashboardOverview {
  users: {
    total: number
    newToday: number
    newThisMonth: number
    growthPct: number
    students: { total: number; active: number; inactive: number; newToday: number }
    managers: { total: number; active: number; pendingInvitations: number }
    mentors: { total: number }
    superAdmins: number
  }
  activity: {
    onlineToday: number
    activeYesterday: number
    activeLast7: number
    activeLast30: number
  }
  learning: {
    totalRoadmaps: number
    publishedRoadmaps: number
    draftRoadmaps: number
    archivedRoadmaps: number
    totalLessons: number
    publishedLessons: number
    totalResources: number
    mostViewedRoadmap: string | null
  }
  coding: {
    totalProblems: number
    easyProblems: number
    mediumProblems: number
    hardProblems: number
    solvedToday: number
    submissionsToday: number
  }
  projects: {
    total: number
    published: number
    teams: number
    technologies: number
    categories: number
  }
  placement: {
    companies: number
    jobs: number
    internships: number
    applications: number
    offered: number
  }
  events: {
    upcoming: number
    completed: number
    registrations: number
    today: number
  }
  notifications: {
    total: number
    unread: number
    readRate: number
  }
}

export interface UserAnalyticsData {
  newestUsers: {
    id: string
    fullName: string
    email: string
    role: string
    createdAt: string
    collegeName: string | null
    isVerified: boolean
  }[]
  recentLogins: {
    id: string
    fullName: string
    email: string
    role: string
    lastLoginAt: string | null
  }[]
  recentFailedAttempts: {
    id: string
    action: string
    createdAt: string
    ipAddress: string | null
    module: string | null
  }[]
  stats: {
    failedLoginsToday: number
    lockedAccounts: number
    totalVerified: number
    totalUnverified: number
  }
}

export interface ChartDataPoint {
  label: string
  newUsers?: number
  activeUsers?: number
  students?: number
  managers?: number
  lessons?: number
  completions?: number
  submissions?: number
  accepted?: number
  projects?: number
  applications?: number
  offered?: number
  events?: number
  registrations?: number
}

export interface ChartsData {
  period: string
  labels: string[]
  userGrowth: ChartDataPoint[]
  learningActivity: ChartDataPoint[]
  codingActivity: ChartDataPoint[]
  projectActivity: ChartDataPoint[]
  placementActivity: ChartDataPoint[]
  eventActivity: ChartDataPoint[]
}

export interface UsageAnalytics {
  avgSessionTimeMinutes: number
  avgDailyActiveUsers: number
  peakDay: string
  recentMetrics: {
    date: string
    activeUsers: number
    newUsers: number
    codingSubmissions: number
  }[]
}

export interface ApiAnalytics {
  totalRequestsToday: number
  successRate: number
  errorRate: number
  warningCount: number
  apiRequestsSnapshot: number
  recentLogs: {
    id: string
    level: string
    module: string
    message: string
    createdAt: string
  }[]
}

export interface DatabaseAnalytics {
  dbSize: string
  connections: number
  tableStats: {
    table: string
    rows: number
    deadRows?: number
    seqScans?: number
  }[]
  summary: {
    totalUsers: number
    totalSubmissions: number
    totalLessons: number
    totalEvents: number
  }
}

export interface SystemHealth {
  cpu: { percent: number; cores: number; loadAvg: number }
  memory: { percent: number; totalMb: number; usedMb: number; freeMb: number }
  services: { name: string; status: string; latencyMs: number }[]
  storage: { usedGb: number }
  uptime: number
}

export interface ManagerAnalytics {
  totalManagers: number
  pendingInvitations: number
  permissionBreakdown: { module: string; count: number }[]
  recentActivity: {
    id: string
    performer: string
    email: string
    action: string
    module: string | null
    entity: string | null
    createdAt: string
  }[]
  actionSummary: Record<string, number>
}

export interface LiveActivityItem {
  id: string
  action: string
  performer: string
  email: string
  role: string
  module: string | null
  entity: string | null
  entityId: string | null
  ipAddress: string | null
  createdAt: string
}
