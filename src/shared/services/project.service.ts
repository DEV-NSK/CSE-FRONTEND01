import axiosInstance from '@/shared/lib/axios'
import type { ApiResponse, PaginatedResponse } from '@/types'
import type {
  Project,
  ProjectListItem,
  ProjectCategory,
  ProjectTechnology,
  ProjectFilters,
  Team,
  CreateTeamPayload,
  UpdateTeamPayload,
  TeamMember,
  TeamMemberRole,
  TeamInvitation,
  SendInvitationPayload,
  Task,
  CreateTaskPayload,
  UpdateTaskPayload,
  TaskFilters,
  TaskComment,
  Milestone,
  CreateMilestonePayload,
  UpdateMilestonePayload,
  ProjectFile,
  ActivityLog,
  ProjectDashboardData,
} from '@/shared/types/project'

export const projectService = {
  // ─── Project Categories ─────────────────────────────────────────────────────

  getProjectCategories: () =>
    axiosInstance.get<ApiResponse<ProjectCategory[]>>('/project-categories'),

  // ─── Project Technologies ───────────────────────────────────────────────────

  getProjectTechnologies: () =>
    axiosInstance.get<ApiResponse<ProjectTechnology[]>>('/project-technologies'),

  // ─── Projects ───────────────────────────────────────────────────────────────

  getProjects: (filters?: ProjectFilters) =>
    axiosInstance.get<ApiResponse<PaginatedResponse<ProjectListItem>>>('/projects', {
      params: filters,
    }),

  getProjectById: (id: string) =>
    axiosInstance.get<ApiResponse<Project>>(`/projects/${id}`),

  getProjectBySlug: (slug: string) =>
    axiosInstance.get<ApiResponse<Project>>(`/projects/${slug}`),

  // ─── Teams ──────────────────────────────────────────────────────────────────

  getMyTeams: () =>
    axiosInstance.get<ApiResponse<Team[]>>('/my-teams'),

  getTeamById: (id: string) =>
    axiosInstance.get<ApiResponse<Team>>(`/teams/${id}`),

  createTeam: (payload: CreateTeamPayload) =>
    axiosInstance.post<ApiResponse<Team>>('/teams', payload),

  updateTeam: (id: string, payload: UpdateTeamPayload) =>
    axiosInstance.put<ApiResponse<Team>>(`/teams/${id}`, payload),

  deleteTeam: (id: string) =>
    axiosInstance.delete<ApiResponse<null>>(`/teams/${id}`),

  // ─── Team Members ────────────────────────────────────────────────────────────

  addTeamMember: (teamId: string, userId: string, role?: TeamMemberRole) =>
    axiosInstance.post<ApiResponse<TeamMember>>(`/teams/${teamId}/members`, { userId, role }),

  removeTeamMember: (teamId: string, memberId: string) =>
    axiosInstance.delete<ApiResponse<null>>(`/teams/${teamId}/members/${memberId}`),

  updateTeamMemberRole: (teamId: string, memberId: string, role: TeamMemberRole) =>
    axiosInstance.patch<ApiResponse<TeamMember>>(`/teams/${teamId}/members/${memberId}`, { role }),

  // ─── Invitations ─────────────────────────────────────────────────────────────

  sendInvitation: (payload: SendInvitationPayload) =>
    axiosInstance.post<ApiResponse<TeamInvitation>>('/team-invitations', payload),

  getMyInvitations: (type: 'sent' | 'received' = 'received') =>
    axiosInstance.get<ApiResponse<TeamInvitation[]>>('/team-invitations', {
      params: { type },
    }),

  respondToInvitation: (id: string, status: 'ACCEPTED' | 'REJECTED') =>
    axiosInstance.patch<ApiResponse<TeamInvitation>>(`/team-invitations/${id}`, { status }),

  // ─── Tasks ───────────────────────────────────────────────────────────────────

  getTasks: (filters?: TaskFilters) =>
    axiosInstance.get<ApiResponse<PaginatedResponse<Task>>>('/tasks', { params: filters }),

  createTask: (payload: CreateTaskPayload) =>
    axiosInstance.post<ApiResponse<Task>>('/tasks', payload),

  updateTask: (id: string, payload: UpdateTaskPayload) =>
    axiosInstance.put<ApiResponse<Task>>(`/tasks/${id}`, payload),

  deleteTask: (id: string) =>
    axiosInstance.delete<ApiResponse<null>>(`/tasks/${id}`),

  // ─── Task Comments ───────────────────────────────────────────────────────────

  getTaskComments: (taskId: string) =>
    axiosInstance.get<ApiResponse<PaginatedResponse<TaskComment>>>(`/tasks/${taskId}/comments`),

  addTaskComment: (taskId: string, content: string) =>
    axiosInstance.post<ApiResponse<TaskComment>>(`/tasks/${taskId}/comments`, { content }),

  // ─── Milestones ──────────────────────────────────────────────────────────────

  getMilestones: (params?: { projectId?: string; status?: string; page?: number; limit?: number }) =>
    axiosInstance.get<ApiResponse<PaginatedResponse<Milestone>>>('/milestones', { params }),

  createMilestone: (payload: CreateMilestonePayload) =>
    axiosInstance.post<ApiResponse<Milestone>>('/milestones', payload),

  updateMilestone: (id: string, payload: UpdateMilestonePayload) =>
    axiosInstance.put<ApiResponse<Milestone>>(`/milestones/${id}`, payload),

  deleteMilestone: (id: string) =>
    axiosInstance.delete<ApiResponse<null>>(`/milestones/${id}`),

  // ─── Project Files ───────────────────────────────────────────────────────────

  getProjectFiles: (projectId: string, params?: { page?: number; limit?: number }) =>
    axiosInstance.get<ApiResponse<PaginatedResponse<ProjectFile>>>(`/project-files/${projectId}`, {
      params,
    }),

  uploadProjectFile: (projectId: string, file: File, title: string) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', title)
    return axiosInstance.post<ApiResponse<ProjectFile>>(`/project-files/${projectId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  deleteProjectFile: (fileId: string) =>
    axiosInstance.delete<ApiResponse<null>>(`/project-files/file/${fileId}`),

  // ─── Activity ─────────────────────────────────────────────────────────────────

  getTeamActivity: (teamId: string, params?: { page?: number; limit?: number }) =>
    axiosInstance.get<ApiResponse<PaginatedResponse<ActivityLog>>>(`/teams/${teamId}/activity`, {
      params,
    }),

  // ─── Dashboard ───────────────────────────────────────────────────────────────

  getProjectDashboard: () =>
    axiosInstance.get<ApiResponse<ProjectDashboardData>>('/dashboard/projects'),
}
