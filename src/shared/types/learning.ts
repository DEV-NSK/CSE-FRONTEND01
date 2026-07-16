// ─── Learning Domain Types ───────────────────────────────────────────────────

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'
export type ResourceType = 'video' | 'article' | 'pdf' | 'link' | 'quiz'
export type LessonStatus = 'not_started' | 'in_progress' | 'completed'
export type BookmarkType = 'roadmap' | 'lesson' | 'resource'
export type ViewMode = 'grid' | 'list'

// ─── Category ────────────────────────────────────────────────────────────────

export interface LearningCategory {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  roadmapCount: number
  progress?: number // 0–100
  createdAt: string
  updatedAt: string
}

// ─── Roadmap ─────────────────────────────────────────────────────────────────

export interface Roadmap {
  id: string
  slug: string
  title: string
  description: string
  category: LearningCategory
  difficulty: Difficulty
  estimatedHours: number
  lessonCount: number
  isPublished: boolean
  thumbnail?: string
  tags: string[]
  progress?: number // 0–100
  completedLessons?: number
  isEnrolled?: boolean
  isBookmarked?: boolean
  createdAt: string
  updatedAt: string
}

// ─── Section ─────────────────────────────────────────────────────────────────

export interface RoadmapSection {
  id: string
  title: string
  description?: string
  order: number
  lessons: Lesson[]
  completedLessons?: number
}

// ─── Lesson ──────────────────────────────────────────────────────────────────

export interface Lesson {
  id: string
  title: string
  slug: string
  description?: string
  content?: string // markdown
  order: number
  estimatedMinutes: number
  status?: LessonStatus
  isBookmarked?: boolean
  resources?: Resource[]
  roadmapId?: string
  sectionId?: string
  roadmapTitle?: string
  nextLessonId?: string
  prevLessonId?: string
  createdAt: string
  updatedAt: string
}

// ─── Resource ────────────────────────────────────────────────────────────────

export interface Resource {
  id: string
  title: string
  description?: string
  type: ResourceType
  url: string
  duration?: number // minutes
  author?: string
  thumbnail?: string
  isBookmarked?: boolean
  createdAt: string
  updatedAt: string
}

// ─── Progress ────────────────────────────────────────────────────────────────

export interface LearningProgress {
  roadmapId: string
  completedLessons: number
  totalLessons: number
  percentage: number
  lastLessonId?: string
  lastActivityAt?: string
}

export interface LearningStats {
  totalRoadmaps: number
  completedRoadmaps: number
  inProgressRoadmaps: number
  totalLessonsCompleted: number
  totalHoursLearned: number
  currentStreak: number
  longestStreak: number
  bookmarksCount: number
}

// ─── Bookmark ────────────────────────────────────────────────────────────────

export interface Bookmark {
  id: string
  type: BookmarkType
  itemId: string
  title: string
  description?: string
  thumbnail?: string
  roadmapTitle?: string
  createdAt: string
}

// ─── Recently Viewed ─────────────────────────────────────────────────────────

export interface RecentlyViewed {
  id: string
  lesson: Lesson
  roadmapTitle?: string
  viewedAt: string
}

// ─── Search ──────────────────────────────────────────────────────────────────

export interface SearchResults {
  categories: LearningCategory[]
  roadmaps: Roadmap[]
  lessons: Lesson[]
  total: number
  query: string
}

// ─── Continue Learning ───────────────────────────────────────────────────────

export interface ContinueLearning {
  roadmap: Roadmap
  lesson: Lesson
  progress: number
  lastActivityAt: string
}

// ─── Filters ─────────────────────────────────────────────────────────────────

export interface RoadmapFilters {
  search: string
  difficulty: Difficulty | 'all'
  categoryId: string | 'all'
  status: 'all' | 'completed' | 'in_progress' | 'not_started'
  page: number
  limit: number
}

export interface LessonFilters {
  search: string
  status: 'all' | 'completed' | 'incomplete'
}

export interface BookmarkFilters {
  search: string
  sort: 'newest' | 'oldest'
  type: BookmarkType | 'all'
}
