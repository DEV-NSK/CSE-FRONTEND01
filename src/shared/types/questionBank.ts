// ─── FPRD-16: Question Bank Types ────────────────────────────────────────────

export interface QuestionBankTopic {
  id: string
  name: string
  slug: string
  description: string | null
  displayOrder: number
  totalProblems: number
  easy: number
  medium: number
  hard: number
}

export interface QuestionBankTopicDetail {
  topic: QuestionBankTopic
  problems: {
    easy: QuestionBankProblem[]
    medium: QuestionBankProblem[]
    hard: QuestionBankProblem[]
  }
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
}

export interface QuestionBankProblem {
  id: string
  slug: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  acceptanceRate: number
  totalSubmissions: number
  discussionCount: number
  tags: Array<{ id: string; name: string; slug: string }>
  companies: Array<{ id: string; name: string; logo?: string }>
  category: { id: string; name: string; slug: string }
  isSolved?: boolean
  isFavorite?: boolean
  points: number
  estimatedTime: number
  xp: number
}

export type TopicDifficulty = 'all' | 'easy' | 'medium' | 'hard'
export type TopicStatus = 'all' | 'solved' | 'unsolved' | 'attempted'
export type TopicSort = 'default' | 'title_asc' | 'title_desc' | 'acceptance_asc' | 'acceptance_desc'

export interface TopicFilters {
  search: string
  difficulty: TopicDifficulty
  status: TopicStatus
  companyId: string | 'all'
  tagId: string | 'all'
  sort: TopicSort
}
