// ─── Coding Platform Types (FPRD-03) ─────────────────────────────────────────

export type ProblemDifficulty = 'easy' | 'medium' | 'hard'
export type SubmissionStatus =
  | 'accepted'
  | 'wrong_answer'
  | 'time_limit_exceeded'
  | 'memory_limit_exceeded'
  | 'runtime_error'
  | 'compile_error'
  | 'pending'
  | 'running'
export type Language =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'java'
  | 'cpp'
  | 'c'
  | 'go'
  | 'rust'

// ─── Problem ─────────────────────────────────────────────────────────────────

export interface CodingTag {
  id: string
  name: string
  slug: string
}

export interface CodingCompany {
  id: string
  name: string
  logo?: string
}

export interface CodingCategory {
  id: string
  name: string
  slug: string
  description?: string
  problemCount?: number
}

export interface Problem {
  id: string
  slug: string
  title: string
  description: string
  constraints?: string
  difficulty: ProblemDifficulty
  acceptanceRate: number
  totalSubmissions: number
  tags: CodingTag[]
  companies: CodingCompany[]
  category: CodingCategory
  examples: ProblemExample[]
  isSolved?: boolean
  isFavorite?: boolean
  discussionCount?: number
  createdAt: string
  updatedAt: string
}

export interface ProblemExample {
  id: string
  input: string
  output: string
  explanation?: string
}

export interface ProblemListItem {
  id: string
  slug: string
  title: string
  difficulty: ProblemDifficulty
  acceptanceRate: number
  totalSubmissions: number
  tags: CodingTag[]
  companies: CodingCompany[]
  category: CodingCategory
  isSolved?: boolean
  isFavorite?: boolean
  discussionCount?: number
}

// ─── Test Cases ───────────────────────────────────────────────────────────────

export interface TestCase {
  id: string
  input: string
  expectedOutput: string
  isHidden: boolean
}

// ─── Code Template ────────────────────────────────────────────────────────────

export interface CodeTemplate {
  id: string
  language: Language
  code: string
}

// ─── Submission ───────────────────────────────────────────────────────────────

export interface Submission {
  id: string
  problemId: string
  problemTitle?: string
  problemSlug?: string
  language: Language
  code: string
  status: SubmissionStatus
  runtime?: number // ms
  memory?: number // KB
  passedTestCases?: number
  totalTestCases?: number
  failedTestCase?: {
    input: string
    expectedOutput: string
    actualOutput: string
  }
  errorMessage?: string
  submittedAt: string
}

export interface RunResult {
  status: SubmissionStatus
  output?: string
  expectedOutput?: string
  runtime?: number
  memory?: number
  passedTestCases?: number
  totalTestCases?: number
  errorMessage?: string
  testCaseResults?: TestCaseResult[]
}

export interface TestCaseResult {
  input: string
  expectedOutput: string
  actualOutput: string
  passed: boolean
  runtime?: number
}

// ─── Favorites ────────────────────────────────────────────────────────────────

export interface FavoriteProblem {
  id: string
  problem: ProblemListItem
  addedAt: string
}

// ─── Daily Challenge ──────────────────────────────────────────────────────────

export interface DailyChallenge {
  id: string
  date: string
  problem: ProblemListItem
  rewardXp: number
  isSolved?: boolean
  expiresAt: string
}

export interface PreviousChallenge {
  id: string
  date: string
  problem: ProblemListItem
  rewardXp: number
  isSolved?: boolean
}

// ─── Discussions ──────────────────────────────────────────────────────────────

export interface DiscussionAuthor {
  id: string
  name: string
  avatar?: string
  role: 'student' | 'admin' | 'instructor'
}

export interface DiscussionReply {
  id: string
  content: string
  author: DiscussionAuthor
  createdAt: string
  updatedAt: string
}

export interface Discussion {
  id: string
  problemId: string
  title: string
  content: string
  author: DiscussionAuthor
  replies: DiscussionReply[]
  replyCount: number
  createdAt: string
  updatedAt: string
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface CodingStats {
  totalSolved: number
  easySolved: number
  mediumSolved: number
  hardSolved: number
  totalSubmissions: number
  acceptedSubmissions: number
  acceptanceRate: number
  currentStreak: number
  longestStreak: number
  favoriteLanguage: Language | null
}

export interface WeeklyActivity {
  date: string
  submissions: number
  solved: number
}

export interface SubmissionTrend {
  month: string
  accepted: number
  total: number
}

export interface DifficultyDistribution {
  difficulty: ProblemDifficulty
  solved: number
  total: number
}

export interface LanguageUsage {
  language: Language
  count: number
  percentage: number
}

export interface CodingAnalytics {
  stats: CodingStats
  weeklyActivity: WeeklyActivity[]
  submissionTrend: SubmissionTrend[]
  difficultyDistribution: DifficultyDistribution[]
  languageUsage: LanguageUsage[]
}

// ─── Filters ─────────────────────────────────────────────────────────────────

export interface ProblemFilters {
  search: string
  difficulty: ProblemDifficulty | 'all'
  categoryId: string | 'all'
  tagIds: string[]
  companyId: string | 'all'
  status: 'all' | 'solved' | 'unsolved'
  page: number
  limit: number
}

export interface SubmissionFilters {
  search: string
  status: SubmissionStatus | 'all'
  language: Language | 'all'
  page: number
  limit: number
}
