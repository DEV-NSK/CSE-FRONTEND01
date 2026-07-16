// ─── Analytics Types (FPRD-05) ───────────────────────────────────────────────

export interface LearningAnalytics {
  totalCompleted: number
  totalRoadmaps: number
  studyTimeHours: number
  currentStreak: number
  weeklyStudyTime: { day: string; hours: number }[]
  roadmapProgress: { name: string; progress: number }[]
  monthlyActivity: { month: string; hours: number }[]
}

export interface CodingAnalyticsSummary {
  totalSolved: number
  easySolved: number
  mediumSolved: number
  hardSolved: number
  acceptanceRate: number
  currentStreak: number
  weeklyActivity: { date: string; count: number }[]
  languageDistribution: { language: string; count: number }[]
  difficultyDistribution: { difficulty: string; solved: number; total: number }[]
}

export interface ProjectAnalytics {
  totalProjects: number
  completedTasks: number
  openTasks: number
  teamContributions: { member: string; tasks: number }[]
  taskProgress: { week: string; completed: number; opened: number }[]
}

export interface PlacementAnalytics {
  totalApplications: number
  interviews: number
  offers: number
  rejections: number
  pipelineData: { status: string; count: number }[]
  monthlyApplications: { month: string; applications: number; interviews: number }[]
}

export interface OverallAnalytics {
  learning: LearningAnalytics
  coding: CodingAnalyticsSummary
  projects: ProjectAnalytics
  placement: PlacementAnalytics
}

export interface HeatmapData {
  date: string
  count: number
}
