// ─── Course ──────────────────────────────────────────────────────────────────

export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  thumbnail?: string | null;
  status: CourseStatus;
  totalDays?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CourseFormData {
  title: string;
  slug?: string;
  description?: string;
  thumbnail?: string;
  status?: CourseStatus;
  totalDays?: number;
  startDate?: string;
  endDate?: string;
}

// ─── Enums ───────────────────────────────────────────────────────────────────

export type LearningContentStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "UNPUBLISHED"
  | "ARCHIVED";

export type LearningProgressStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED";

export type RoadmapItemState = "COMPLETED" | "CURRENT" | "UPCOMING" | "LOCKED";

// ─── LearningLevel ───────────────────────────────────────────────────────────

export interface LearningLevel {
  id: string;
  levelNumber: number;
  title: string;
  description?: string | null;
  displayOrder: number;
  isActive: boolean;
  contents?: LearningContentSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface LearningLevelFormData {
  courseId?: string;   // required for create (flat POST /admin/learning/levels)
  levelNumber: number;
  title: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

// ─── LearningContent ─────────────────────────────────────────────────────────

export interface LearningNoteImage {
  id: string;
  contentId: string;
  imageUrl: string;
  storagePath: string;
  displayOrder: number;
  createdAt: string;
}

export interface LearningContentSummary {
  id: string;
  levelId: string;
  levelNumber: number;
  dayNumber: number;
  topicName: string;
  description?: string | null;
  reelUrl: string;
  youtubeUrl?: string | null;
  status: LearningContentStatus;
  publishedAt?: string | null;
  progressStatus?: LearningProgressStatus;
}

export interface LearningContent extends LearningContentSummary {
  notes: LearningNoteImage[];
  resources?: LearningResource[];
  createdById: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface LearningResource {
  id: string;
  contentId: string;
  title: string;
  url: string;
  displayOrder: number;
  createdAt: string;
}

export interface LearningContentFormData {
  courseId?: string;   // derived from level; required on create
  levelId: string;
  dayNumber: number;
  topicName: string;
  description?: string;
  reelUrl: string;
  youtubeUrl?: string;
  resources?: Array<{ title: string; url: string }>;
  status?: LearningContentStatus;
}

// ─── LearningProgress ────────────────────────────────────────────────────────

export interface LearningProgress {
  id: string;
  userId: string;
  contentId: string;
  status: LearningProgressStatus;
  startedAt?: string | null;
  completedAt?: string | null;
  lastViewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Admin: Learning Dashboard Stats ─────────────────────────────────────────

export interface AdminLearningDashboardStats {
  totalLevels: number;
  totalLearningDays: number;
  publishedCount: number;
  draftsCount: number;
  unpublishedCount: number;
  archivedCount: number;
  currentActiveDay: {
    levelNumber: number;
    dayNumber: number;
    topicName: string;
  } | null;
  studentsStarted: number;
  studentsCompleted: number;
  totalCompletedLessons: number;
  completionRate: number;
  levelBreakdown: Array<{
    levelNumber: number;
    title: string;
    totalDays: number;
    publishedDays: number;
    studentsStarted: number;
    studentsCompleted: number;
  }>;
}

// ─── Student: Learning Dashboard ─────────────────────────────────────────────

export interface StudentLearningDashboard {
  platformCurrentDay: {
    levelNumber: number;
    dayNumber: number;
    topicName: string;
  } | null;
  studentCurrentDay: {
    levelNumber: number;
    dayNumber: number;
    topicName: string;
  } | null;
  currentLevel: {
    id: string;
    levelNumber: number;
    title: string;
    description?: string | null;
  } | null;
  currentContent: LearningContent | null;
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  levelProgress: Array<{
    levelNumber: number;
    title: string;
    completedDays: number;
    totalDays: number;
    percentage: number;
  }>;
}

// ─── Student: Roadmap ────────────────────────────────────────────────────────

export interface RoadmapDay {
  id: string;
  dayNumber: number;
  topicName: string;
  status: LearningContentStatus;
  progressStatus: LearningProgressStatus | null;
  state: RoadmapItemState;
  progress?: LearningProgress | null;
}

export interface RoadmapLevel {
  id: string;
  levelNumber: number;
  title: string;
  description?: string | null;
  isActive: boolean;
  totalDays: number;
  completedDays: number;
  days: RoadmapDay[];
}

export interface StudentRoadmap {
  levels: RoadmapLevel[];
  currentDayId: string | null;
  totalCompleted: number;
  totalAvailable: number;
}

// ─── Continue Learning ───────────────────────────────────────────────────────

export interface ContinueLearningResult {
  contentId: string;
  levelNumber: number;
  dayNumber: number;
  topicName: string;
  description?: string | null;
  progressStatus: LearningProgressStatus;
  percentageThroughDay: number;
}

// ─── Lesson Completion Result ────────────────────────────────────────────────
// NOTE: Backend completedContent only returns { id } — levelNumber/dayNumber/topicName
// must be sourced from the already-loaded content object on the frontend.

export interface LessonCompletionResult {
  completed: boolean;
  completedContent: {
    id: string;
    levelNumber?: number;
    dayNumber?: number;
    topicName?: string;
  };
  nextContent: (Partial<LearningContentSummary> & { id: string }) | null;
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
}

// ─── List/Filter Params ──────────────────────────────────────────────────────

export interface AdminLearningContentFilters {
  search?: string;
  status?: LearningContentStatus | "ALL";
  levelId?: string;
  page?: number;
  limit?: number;
}

export interface AdminLearningContentListResponse {
  data: LearningContent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Notes Upload ────────────────────────────────────────────────────────────

export interface NotesUploadResult {
  success: boolean;
  images: LearningNoteImage[];
  message?: string;
}

export interface NoteImageReorderData {
  imageId: string;
  newDisplayOrder: number;
}
