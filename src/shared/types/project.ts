// ─── Project Hub & Team Collaboration Types (FPRD-04) ────────────────────────

export type ProjectDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
export type TeamStatus = 'OPEN' | 'FULL' | 'CLOSED' | 'COMPLETED'
export type TeamMemberRole = 'OWNER' | 'LEADER' | 'DEVELOPER' | 'DESIGNER' | 'RESEARCHER' | 'TESTER'
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
export type ActivityAction =
  | 'TEAM_CREATED'
  | 'MEMBER_JOINED'
  | 'TASK_ASSIGNED'
  | 'TASK_COMPLETED'
  | 'MILESTONE_COMPLETED'
  | 'FILE_UPLOADED'
  | 'COMMENT_ADDED'
  | 'TASK_UPDATED'
  | 'MEMBER_REMOVED'
  | 'INVITATION_SENT'
  | 'INVITATION_ACCEPTED'

// ─── Project Category ─────────────────────────────────────────────────────────

export interface ProjectCategory {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  displayOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ─── Project Technology ───────────────────────────────────────────────────────

export interface ProjectTechnology {
  id: string
  name: string
  slug: string
  icon?: string
}

// ─── Project ──────────────────────────────────────────────────────────────────

export interface Project {
  id: string
  categoryId: string
  title: string
  slug: string
  description?: string
  overview?: string
  difficulty: ProjectDifficulty
  estimatedDuration?: string
  thumbnail?: string
  githubRepository?: string
  liveDemo?: string
  documentationUrl?: string
  requirements?: string
  learningOutcomes?: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
  category: ProjectCategory
  technologies: { technology: ProjectTechnology }[]
  teams?: Team[]
  milestones?: Milestone[]
  _count?: { teams: number }
}

export interface ProjectListItem {
  id: string
  categoryId: string
  title: string
  slug: string
  description?: string
  difficulty: ProjectDifficulty
  estimatedDuration?: string
  thumbnail?: string
  isPublished: boolean
  createdAt: string
  category: ProjectCategory
  technologies: { technology: ProjectTechnology }[]
  _count?: { teams: number }
}

export interface ProjectFilters {
  search?: string
  categoryId?: string
  difficulty?: ProjectDifficulty | ''
  technologyId?: string
  isPublished?: boolean
  page?: number
  limit?: number
}

// ─── Team ─────────────────────────────────────────────────────────────────────

export interface TeamMemberUser {
  id: string
  fullName: string
  email: string
  profileImage?: string
  branch?: string
  year?: number
}

export interface TeamMember {
  id: string
  teamId: string
  userId: string
  role: TeamMemberRole
  joinedAt: string
  user: TeamMemberUser
}

export interface Team {
  id: string
  projectId: string
  name: string
  ownerId: string
  maxMembers: number
  status: TeamStatus
  createdAt: string
  updatedAt: string
  project?: Project
  owner?: TeamMemberUser
  members?: TeamMember[]
  _count?: { members: number; tasks: number }
}

export interface CreateTeamPayload {
  projectId: string
  name: string
  maxMembers?: number
}

export interface UpdateTeamPayload {
  name?: string
  maxMembers?: number
  status?: TeamStatus
}

// ─── Team Invitation ──────────────────────────────────────────────────────────

export interface TeamInvitation {
  id: string
  teamId: string
  senderId: string
  receiverId: string
  status: InvitationStatus
  expiresAt: string
  createdAt: string
  updatedAt: string
  team?: {
    id: string
    name: string
    project?: { title: string; slug: string }
  }
  sender?: TeamMemberUser
  receiver?: TeamMemberUser
}

export interface SendInvitationPayload {
  teamId: string
  receiverId: string
}

// ─── Task ─────────────────────────────────────────────────────────────────────

export interface Task {
  id: string
  teamId: string
  assignedTo?: string
  title: string
  description?: string
  priority: TaskPriority
  status: TaskStatus
  dueDate?: string
  estimatedHours?: number
  createdAt: string
  updatedAt: string
  assignee?: TeamMemberUser
  _count?: { comments: number }
}

export interface CreateTaskPayload {
  teamId: string
  title: string
  description?: string
  priority?: TaskPriority
  status?: TaskStatus
  dueDate?: string
  estimatedHours?: number
  assignedTo?: string
}

export interface UpdateTaskPayload {
  title?: string
  description?: string
  priority?: TaskPriority
  status?: TaskStatus
  dueDate?: string | null
  estimatedHours?: number | null
  assignedTo?: string | null
}

export interface TaskFilters {
  teamId?: string
  assignedTo?: string
  status?: TaskStatus
  priority?: TaskPriority
  search?: string
  page?: number
  limit?: number
}

// ─── Task Comment ─────────────────────────────────────────────────────────────

export interface TaskComment {
  id: string
  taskId: string
  userId: string
  content: string
  createdAt: string
  updatedAt: string
  user: TeamMemberUser
}

// ─── Milestone ────────────────────────────────────────────────────────────────

export interface Milestone {
  id: string
  projectId: string
  title: string
  description?: string
  dueDate?: string
  status: MilestoneStatus
  completionPercentage: number
  createdAt: string
  updatedAt: string
}

export interface CreateMilestonePayload {
  projectId: string
  title: string
  description?: string
  dueDate?: string
  status?: MilestoneStatus
  completionPercentage?: number
}

export interface UpdateMilestonePayload {
  title?: string
  description?: string
  dueDate?: string | null
  status?: MilestoneStatus
  completionPercentage?: number
}

// ─── Project File ─────────────────────────────────────────────────────────────

export interface ProjectFile {
  id: string
  projectId: string
  uploadedBy: string
  title: string
  fileUrl: string
  fileType: string
  uploadedAt: string
  uploader?: TeamMemberUser
}

// ─── Activity Log ─────────────────────────────────────────────────────────────

export interface ActivityLog {
  id: string
  teamId: string
  userId: string
  action: ActivityAction
  metadata?: Record<string, unknown>
  createdAt: string
  user?: TeamMemberUser
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface ProjectDashboardData {
  activeTeams: Team[]
  pendingTasks: Task[]
  pendingInvitations: TeamInvitation[]
  upcomingMilestones: Milestone[]
  recentActivity: ActivityLog[]
  stats: {
    totalTeams: number
    totalTasks: number
    completedTasks: number
    pendingInvitations: number
  }
}
